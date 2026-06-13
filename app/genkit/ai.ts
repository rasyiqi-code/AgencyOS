import { prisma } from '@/lib/config/db';
import { unstable_cache } from 'next/cache';
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// Inisialisasi dasar genkit
export const ai = genkit({
    plugins: [googleAI({ apiKey: false })],
});

interface NvidiaMessage {
    role: string;
    content: string;
}

interface NvidiaMessagePart {
    text?: string;
    [key: string]: unknown;
}

interface NvidiaMessageInput {
    role: string;
    content: string | NvidiaMessagePart[];
}

interface GenerateOptionsInput {
    messages?: NvidiaMessageInput[];
    prompt?: string;
    output?: {
        schema?: Record<string, unknown> | unknown;
    };
    [key: string]: unknown;
}

interface NvidiaChoiceMessage {
    content?: string;
}

interface NvidiaChoice {
    message?: NvidiaChoiceMessage;
}

interface NvidiaResponseData {
    choices?: NvidiaChoice[];
}

export const isAIConfigured = unstable_cache(
    async () => {
        try {
            const key = await prisma.systemKey.findFirst({
                where: { isActive: true, provider: { in: ['google', 'nvidia'] } }
            });
            return !!key;
        } catch {
            return false;
        }
    },
    ["is-ai-configured"],
    { tags: ["system-keys"], revalidate: 3600 }
);

export const getActiveAIConfig = unstable_cache(
    async () => {
        const key = await prisma.systemKey.findFirst({
            where: { isActive: true, provider: { in: ['google', 'nvidia'] } }
        });

        if (!key) throw new Error("AI is not configured.");

        return {
            apiKey: key.key,
            model: key.modelId || (key.provider === 'nvidia' ? 'google/diffusiongemma-26b-a4b-it' : 'gemini-1.5-flash'),
            provider: key.provider
        };
    },
    ["active-ai-config"],
    { tags: ["system-keys"], revalidate: 3600 }
);

// Helper to check provider at runtime
async function getRuntimeProvider() {
    try {
        const config = await getActiveAIConfig();
        return config;
    } catch {
        return null;
    }
}

// Interceptor helper untuk NVIDIA NIM
async function invokeNvidiaNim(options: GenerateOptionsInput, stream: boolean) {
    const config = await getActiveAIConfig();
    const invokeUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
    
    const messages: NvidiaMessage[] = [];
    
    // Input messages mapping
    if (options.messages) {
        for (const msg of options.messages) {
            let contentStr = "";
            if (typeof msg.content === 'string') {
                contentStr = msg.content;
            } else if (Array.isArray(msg.content)) {
                contentStr = msg.content.map((c) => c.text || "").join("\n");
            }
            const role = msg.role === 'model' ? 'assistant' : msg.role;
            messages.push({ role, content: contentStr });
        }
    }
    
    if (options.prompt) {
        messages.push({ role: 'user', content: options.prompt });
    }
    
    // Inject JSON Schema guidance if needed
    if (options.output?.schema && messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        lastMsg.content += `\n\nIMPORTANT: You MUST respond ONLY with a raw JSON object matching this schema: ${JSON.stringify(options.output.schema)}. Do not include markdown code block formatting (such as \`\`\`json) in the response. Just output valid raw JSON.`;
    }

    const headers = {
        "Authorization": `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Accept": stream ? "text/event-stream" : "application/json"
    };

    const payload = {
        model: config.model,
        messages: messages,
        max_tokens: 4096,
        temperature: 0.70,
        top_p: 0.95,
        stream: stream,
        ...(config.model.includes("thinking") ? { chat_template_kwargs: { enable_thinking: true } } : {})
    };

    const response = await fetch(invokeUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NVIDIA NIM API Error: ${response.statusText} - ${errorText}`);
    }

    return response;
}

// Simpan method asli dari instance ai
const originalGenerate = ai.generate.bind(ai);
const originalGenerateStream = ai.generateStream.bind(ai);

// Override generate method
ai.generate = (async (options: GenerateOptionsInput) => {
    const config = await getRuntimeProvider();
    if (config?.provider === 'nvidia') {
        const response = await invokeNvidiaNim(options, false);
        const data = await response.json() as NvidiaResponseData;
        const rawText = data.choices?.[0]?.message?.content || "";
        
        // Clean markdown blocks if present
        let cleanedText = rawText.trim();
        if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.substring(7);
        } else if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.substring(3);
        }
        if (cleanedText.endsWith("```")) {
            cleanedText = cleanedText.substring(0, cleanedText.length - 3);
        }
        cleanedText = cleanedText.trim();

        if (options.output?.schema) {
            try {
                const parsed = JSON.parse(cleanedText) as unknown;
                return {
                    output: parsed,
                    text: cleanedText
                };
            } catch (parseError) {
                console.error("Failed to parse Nvidia JSON response:", cleanedText, parseError);
                throw new Error("Model returned invalid JSON structure matching the schema.");
            }
        }

        return {
            text: rawText,
            output: rawText
        };
    }
    
    return originalGenerate(options as Parameters<typeof originalGenerate>[0]);
}) as unknown as typeof originalGenerate;

// Override generateStream method
ai.generateStream = (async (options: GenerateOptionsInput) => {
    const config = await getRuntimeProvider();
    if (config?.provider === 'nvidia') {
        const response = await invokeNvidiaNim(options, true);
        
        // Create a custom AsyncIterable stream compatible with Genkit structure
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        const streamGenerator = async function* () {
            let buffer = "";
            while (true) {
                const { done, value } = await reader!.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                
                for (const line of lines) {
                    const cleanLine = line.trim();
                    if (cleanLine.startsWith("data: ")) {
                        const dataStr = cleanLine.substring(6);
                        if (dataStr === "[DONE]") continue;
                        try {
                            const parsed = JSON.parse(dataStr) as { choices?: Array<{ delta?: { content?: string } }> };
                            const chunkText = parsed.choices?.[0]?.delta?.content || "";
                            if (chunkText) {
                                yield { text: chunkText };
                            }
                        } catch {
                            // Skip parsing error on incomplete stream lines
                        }
                    }
                }
            }
        };

        return {
            stream: streamGenerator()
        };
    }
    
    return originalGenerateStream(options as Parameters<typeof originalGenerateStream>[0]);
}) as unknown as typeof originalGenerateStream;
