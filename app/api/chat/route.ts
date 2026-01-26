import { consultantFlow } from '../../genkit';

export const maxDuration = 60;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const stream = new ReadableStream({
        async start(controller) {
            try {
                // Call the flow with streaming enabled
                const { stream } = await consultantFlow.stream({ messages });

                if (stream) {
                    for await (const chunk of stream) {
                        controller.enqueue(chunk);
                    }
                }
            } catch (error) {
                console.error("Genkit Stream Error:", error);
                controller.error(error);
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}
