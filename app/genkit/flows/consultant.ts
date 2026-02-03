import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const consultantFlow = ai.defineFlow(
    {
        name: 'consultantFlow',
        inputSchema: z.object({
            messages: z.array(
                z.object({
                    role: z.enum(['user', 'assistant', 'system']),
                    content: z.string(),
                })
            ),
        }),
        streamSchema: z.string(),
        outputSchema: z.string(),
    },
    async ({ messages }, { sendChunk }) => {
        const { apiKey, model } = await getActiveAIConfig();

        let systemPrompt = `You are **CredibleBot**, an **Estimate Manager** at Crediblemark.
    Your SOLE GOAL is to help the client adjust their project scope and update the cost estimate accordingly.
    
    **Your Behavior:**
    1.  **Listen & Act**: The client will tell you what features they want to add, remove, or change.
    2.  **Clarify Only If Needed**: If a request is ambiguous (e.g., "add payments" -> ask "Stripe or Paypal?"), ask a short clarifying question.
    3.  **Execute Updates**: As soon as you understand the request, output the \`update_estimate\` JSON action.
    4.  **Be Concise**: Do NOT provide long technical explanations or architectural advice. Just confirm the change and the impact on the estimate.
    
    **Example Interaction:**
    User: "I need a mobile app too."
    You: "Understood. I've added the mobile app screens (React Native) to the estimate. This will add ~120 hours."
    [JSON Action]

    **SPECIAL INSTRUCTIONS FOR QUOTE REFINEMENT:**
    If the user asks to modify the project scope (e.g., "Add a mobile app", "Remove the admin panel", "Add dark mode"), you MUST output a JSON block with the \`update_estimate\` action.
    
    JSON Format:
    \`\`\`json
    {
      "type": "update_estimate",
      "reason": "Explain why (e.g., 'Removed Admin Auth as requested, added Social Login')",
      "additions": {
        "screens": [ { "title": "...", "description": "...", "hours": 8 } ],
        "apis": [ { "title": "...", "description": "...", "hours": 4 } ]
      },
      "removals": {
        "screens": ["Exact Title of Screen to Remove"],
        "apis": ["Exact Title of API to Remove"]
      }
    }
    \`\`\`

    IMPORTANT: 
    1. Only include *NEW* or *MODIFIED* items in the list. The system will merge them. 
    2. If removing, mention it in the "reason" but currently the system supports adding/appending best. (For MVP, just output the full new specific items to add).
    3. Always keep the JSON inside \`\`\`json blocks.
    `;

        const typedMessages = messages as Message[];

        // Extract detailed context from frontend system messages
        const incomingSystemMessages = typedMessages.filter((m) => m.role === 'system');
        if (incomingSystemMessages.length > 0) {
            systemPrompt += "\n\n**Additional Context Provided:**\n" + incomingSystemMessages.map((m) => m.content).join("\n");
        }

        // Filter out system messages from history
        const historyMessages = typedMessages.slice(0, -1)
            .filter((m) => m.role !== 'system')
            .map((m) => ({
                role: (m.role === 'assistant' ? 'model' : m.role) as 'user' | 'model' | 'system',
                content: [{ text: m.content }],
            }));

        // Ensure history starts with a user message (Gemini requirement)
        while (historyMessages.length > 0 && historyMessages[0].role !== 'user') {
            historyMessages.shift();
        }

        // Set dynamic API key for this request execution
        process.env.GOOGLE_GENAI_API_KEY = apiKey;

        const { stream } = await ai.generateStream({
            model: `googleai/${model}`,
            messages: [
                { role: 'system', content: [{ text: systemPrompt }] },
                ...historyMessages,
            ],
            prompt: typedMessages[typedMessages.length - 1].content,
        });

        let fullText = '';
        for await (const chunk of stream) {
            const chunkText = chunk.text;
            if (sendChunk) sendChunk(chunkText);
            fullText += chunkText;
        }

        return fullText;
    }
);
