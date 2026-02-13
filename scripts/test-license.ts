
const BASE_URL = "http://localhost:3000";

async function main() {
    console.log("🚀 Starting License Verification Test...");

    // 1. Create a Product (simulate Admin)
    console.log("\n1️⃣  Creating Product...");
    const productRes = await fetch(`${BASE_URL}/api/admin/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Test Plugin",
            slug: "test-plugin-" + Date.now(),
            price: 100,
            type: "plugin",
            isActive: true
        })
    });

    if (!productRes.ok) {
        console.error("Failed to create product", await productRes.text());
        process.exit(1);
    }
    const product = await productRes.json();
    console.log("✅ Product Created:", product.name, product.id);

    // 2. Generate License (simulate Admin)
    console.log("\n2️⃣  Generating License...");
    const licenseRes = await fetch(`${BASE_URL}/api/admin/licenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            productId: product.id,
            maxActivations: 2,
            status: 'active'
        })
    });

    if (!licenseRes.ok) {
        console.error("Failed to generate license", await licenseRes.text());
        process.exit(1);
    }
    const license = await licenseRes.json();
    console.log("✅ License Generated:", license.key);

    // 3. Verify License (Valid)
    console.log("\n3️⃣  Verifying License (Device A)...");
    const verifyRes1 = await fetch(`${BASE_URL}/api/public/verify-license`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            key: license.key,
            machineId: "device-a"
        })
    });
    const verifyData1 = await verifyRes1.json();
    console.log("Result:", verifyData1);
    if (!verifyData1.valid) {
        console.error("❌ Verification failed when it should succeed");
        process.exit(1);
    }
    console.log("✅ Verification Successful");

    // 4. Verify License (Valid - 2nd Device)
    console.log("\n4️⃣  Verifying License (Device B)...");
    const verifyRes2 = await fetch(`${BASE_URL}/api/public/verify-license`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            key: license.key,
            machineId: "device-b"
        })
    });
    const verifyData2 = await verifyRes2.json();
    console.log("Result:", verifyData2);
    if (!verifyData2.valid) {
        console.error("❌ Verification failed when it should succeed");
        process.exit(1);
    }
    console.log("✅ Verification Successful");

    // 5. Verify License (Invalid - Max Activations)
    console.log("\n5️⃣  Verifying License (Device C - Should Fail)...");
    const verifyRes3 = await fetch(`${BASE_URL}/api/public/verify-license`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            key: license.key,
            machineId: "device-c"
        })
    });
    const verifyData3 = await verifyRes3.json();
    console.log("Result:", verifyData3);
    if (verifyData3.valid) {
        console.error("❌ Verification succeeded when it should fail");
        process.exit(1);
    }
    console.log("✅ Verification Properly Rejected (Max Activations)");

    console.log("\n🎉 All tests passed!");
}

main().catch(console.error);
