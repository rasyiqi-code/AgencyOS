
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function uploadFileMock(file: any, path: string) {
    // simulate 100ms delay to represent network latency
    await new Promise(resolve => setTimeout(resolve, 100));
    return `https://example.com/${path}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sequential(files: any[], projectId: string) {
    const start = performance.now();
    const uploadedUrls: string[] = [];
    for (const file of files) {
        if (file.size > 0 && file.name !== 'undefined') {
            try {
                const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const path = `projects/${projectId}/daily-updates/${Date.now()}-${safeName}`;
                const url = await uploadFileMock(file, path);
                uploadedUrls.push(url);
            } catch (uploadError) {
                console.error("Failed to upload file:", file.name, uploadError);
            }
        }
    }
    const end = performance.now();
    return end - start;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function parallel(files: any[], projectId: string) {
    const start = performance.now();
    const uploadPromises = files.map(async (file) => {
        if (file.size > 0 && file.name !== 'undefined') {
            try {
                const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                // Use a slightly more robust path generation to avoid potential collisions in parallel
                // although Date.now() might still be same, safeName usually differs or we can add index
                const path = `projects/${projectId}/daily-updates/${Date.now()}-${safeName}`;
                return await uploadFileMock(file, path);
            } catch (uploadError) {
                console.error("Failed to upload file:", file.name, uploadError);
                return null;
            }
        }
        return null;
    });

    const results = await Promise.all(uploadPromises);
    const uploadedUrls = results.filter((url): url is string => url !== null);
    const end = performance.now();
    return end - start;
}

async function run() {
    const files = [
        { size: 10, name: 'file1.jpg' },
        { size: 10, name: 'file2.jpg' },
        { size: 10, name: 'file3.jpg' },
        { size: 10, name: 'file4.jpg' },
        { size: 10, name: 'file5.jpg' },
    ];
    const projectId = 'test-project';

    console.log(`Running benchmark with ${files.length} files...`);

    const seqTime = await sequential(files, projectId);
    console.log(`Sequential: ${seqTime.toFixed(2)}ms`);

    const parTime = await parallel(files, projectId);
    console.log(`Parallel: ${parTime.toFixed(2)}ms`);

    const improvement = ((seqTime - parTime) / seqTime) * 100;
    console.log(`Improvement: ${improvement.toFixed(2)}%`);
}

run();
