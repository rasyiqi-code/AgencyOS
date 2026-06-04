const NUM_FILES = 20;
const keysToDelete = Array.from({ length: NUM_FILES }, (_, i) => `file_${i}.jpg`);

// Mock fetch
global.fetch = async (url, options) => {
    // simulate network latency
    await new Promise(resolve => setTimeout(resolve, 50));
    return { ok: true } as any;
};

async function sequentialDelete() {
    let successCount = 0;
    let failCount = 0;
    const start = performance.now();
    for (const key of keysToDelete) {
        const encodedKey = encodeURIComponent(key);
        const res = await fetch(`/api/storage/media/${encodedKey}`, {
            method: "DELETE",
        });
        if (res.ok) successCount++;
        else failCount++;
    }
    const end = performance.now();
    console.log(`Sequential delete took ${end - start} ms`);
}

async function concurrentDelete() {
    let successCount = 0;
    let failCount = 0;
    const start = performance.now();
    await Promise.all(
        keysToDelete.map(async (key) => {
            const encodedKey = encodeURIComponent(key);
            try {
                const res = await fetch(`/api/storage/media/${encodedKey}`, {
                    method: "DELETE",
                });
                if (res.ok) successCount++;
                else failCount++;
            } catch {
                failCount++;
            }
        })
    );
    const end = performance.now();
    console.log(`Concurrent delete took ${end - start} ms`);
}

async function run() {
    await sequentialDelete();
    await concurrentDelete();
}

run();
