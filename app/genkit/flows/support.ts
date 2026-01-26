import { z } from 'genkit';
import { ai, getDynamicAI } from '../ai';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export const supportFlow = ai.defineFlow(
    {
        name: 'supportFlow',
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
        const systemPrompt = `You are **CredibleSupport**, the AI Customer Service Agent for Agency OS.
    
    **Your Mission**: 
    Assist visitors (Clients or Developers) in navigating the platform. Be helpful, concise, and enthusiasm about the "Hybrid Agency" model.

    **Key Knowledge**:
    1.  **For Clients**: 
        *   They want to build software. 
        *   Direct them to **"/price-calculator"** to start a Project Brief.
        *   Explain value: "AI Speed + Human Security".
    2.  **For Developers (Talent)**:
        *   They want work.
        *   Direct them to **"/squad"** to view the Mission Board.
        *   Explain model: "Pick up ticket -> Code -> Get Paid".
    3.  **General**:
        *   We are NOT a pure AI wrapper; we have real senior devs verifying code.
        *   If asked for pricing, mention our "Transparent Quote Calculator".

    **Tone**: Professional, friendly, and efficient. Keep answers short (under 3 sentences) unless asked for details.
    `;

        const typedMessages = messages as Message[];

        const historyMessages = typedMessages.slice(0, -1).map((m) => ({
            role: (m.role === 'assistant' ? 'model' : m.role) as 'user' | 'model' | 'system',
            content: [{ text: m.content }],
        }));

        const { stream } = await (await getDynamicAI()).generateStream({
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
