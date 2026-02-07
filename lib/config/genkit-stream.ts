interface StreamResponse {
    stream: AsyncIterable<unknown>;
    response?: Promise<unknown>;
    output?: Promise<unknown>;
}

export function toReadableStream(
    response: StreamResponse,
    options?: {
        transform?: (chunk: unknown) => unknown;
        errorRef?: { current?: { message: string } };
    }
) {
    return new ReadableStream({
        async start(controller) {
            function enqueue(data: { message?: unknown; result?: { output: unknown }; error?: { message: string } }) {
                const out = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(new TextEncoder().encode(out));
            }

            try {
                for await (const chunk of response.stream) {
                    let messagePayload: unknown;
                    if (options?.transform) {
                        messagePayload = options.transform(chunk);
                    } else if (typeof chunk === 'string') {
                        messagePayload = { content: [{ text: chunk }] };
                    } else if (chunk && typeof (chunk as { toJSON?: () => unknown }).toJSON === 'function') {
                        const jsonChunk = chunk as { toJSON: () => Record<string, unknown>; output?: unknown };
                        messagePayload = { ...jsonChunk.toJSON(), output: jsonChunk.output };
                    } else {
                        messagePayload = chunk;
                    }

                    enqueue({
                        message: messagePayload,
                    });
                }

                const result = await (response.response || response.output);

                enqueue({
                    result: {
                        output: result,
                    },
                });
            } catch (e) {
                console.error((e as Error).stack);
                enqueue({ error: { message: (e as Error).message } });
            } finally {
                setTimeout(() => {
                    controller.close();
                }, 100);
            }
        },
    });
}
