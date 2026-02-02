import { z } from 'genkit';
import { ai, getActiveAIConfig } from '../ai';
import { prisma } from '@/lib/db';

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
        const { model } = await getActiveAIConfig();

        // Fetch Dynamic Services from DB
        const services = await prisma.service.findMany({
            where: { isActive: true },
            select: { title: true, description: true, price: true, currency: true }
        });

        const serviceList = services.map(s => `- **${s.title}**: ${s.description} (Mulai dari ${s.currency} ${s.price})`).join('\n');

        const systemPrompt = `You are **CredibleSupport**, a world-class High-Performance Sales Negotiator and Expert Marketer at Agency OS. 
    Your goal is to be helpful BUT ALSO to guide users toward "Closing" (starting a project or booking a service).

    **CRITICAL RULES**:
    1. **Language Sync**: ALWAYS respond in the SAME LANGUAGE as the user's last message.
    2. **Active Links**: Use Markdown links for navigation. 
       - Always point to **[Price Calculator](/price-calculator)** for custom quotes.
       - Always point to **[Squad Board](/squad)** for developer opportunities.
    3. **Tone**: Persuasive, professional, high-energy, and authoritative. Speak like a senior partner who wants to help the client's business grow, not just a chatbot.
    4. **The Closing Mindset**: If a user shows interest, encourage them to "Get an Instant Quote" via the link.

    **Current Available Services & Pricing**:
    ${serviceList}
    *(Note: For complex custom builds, always direct them to the Quote Calculator)*

    **Your Knowledge Base**:
    - **Hybrid Model**: We combine AI speed with Human Senior Dev verification. 100% security, 2x speed.
    - **Pricing**: Transparent as listed above.
    - **Links**: 
      - Dashboard: [/dashboard](/dashboard)
      - Services: [/services](/services)
      - Pricing: [/price-calculator](/price-calculator)

    **Response Style**:
    - Keep it punchy (max 3-4 sentences).
    - Use bolding for emphasis on value.
    - Always end with a subtle "Call to Action" if appropriate.
    `;

        const typedMessages = messages as Message[];

        const historyMessages = typedMessages.slice(0, -1).map((m) => ({
            role: (m.role === 'assistant' ? 'model' : m.role) as 'user' | 'model' | 'system',
            content: [{ text: m.content }],
        }));

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
