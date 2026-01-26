/* eslint-disable @typescript-eslint/no-explicit-any */
export function toReadableStream(
    response: any,
    options?: {
        transform?: (chunk: any) => any;
        errorRef?: { current?: { message: string } };
    }
) {
    return new ReadableStream({
        async start(controller) {
            function enqueue(data: any) {
                const out = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(new TextEncoder().encode(out));
            }

            try {
                for await (const chunk of response.stream) {
                    let messagePayload;
                    if (options?.transform) {
                        messagePayload = options.transform(chunk);
                    } else if (typeof chunk === 'string') {
                        messagePayload = { content: [{ text: chunk }] };
                    } else if (chunk && typeof chunk.toJSON === 'function') {
                        messagePayload = { ...chunk.toJSON(), output: chunk.output };
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
