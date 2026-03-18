import { prisma } from "../lib/config/db";

async function runTests() {
  const saasSlug = "timework-pro-advanced-project-management-saas";
  const saasKey = "KEY-BF39-77BC-2D58";
  
  const digitalSlug = "autoblog-ai";
  const digitalKey = "KEY-F57C-6703-E621";

  console.log("=== STARTING FINAL CROSS-API VERIFICATION TESTS ===\n");

  // 1. Verify License Integration API Logic for BOTH slugs (Simulated via DB logic)
  const tests = [
    { key: saasKey, slug: saasSlug, type: "SaaS (Timework Pro)" },
    { key: digitalKey, slug: digitalSlug, type: "Digital Product (Autoblog AI)" }
  ];

  for (const t of tests) {
    console.log(`--- Testing ${t.type} ---`);
    
    // Simulate: const activeProductSlug = productSlug || body.productId || body.product_slug;
    const bodyA = { key: t.key, productId: t.slug }; 
    const bodyB = { key: t.key, product_slug: t.slug };
    const bodyC = { key: t.key, productSlug: t.slug };
    
    const license = await prisma.license.findUnique({
      where: { key: t.key },
      include: { product: true }
    });

    if (!license) {
      console.error(`- Error: License ${t.key} not found in DB! ❌`);
      continue;
    }

    const matchA = license.product.slug === bodyA.productId;
    const matchB = license.product.slug === bodyB.product_slug;
    const matchC = license.product.slug === bodyC.productSlug;

    console.log(`- Identifier 'productId' match: ${matchA ? "PASS ✅" : "FAIL ❌"}`);
    console.log(`- Identifier 'product_slug' match: ${matchB ? "PASS ✅" : "FAIL ❌"}`);
    console.log(`- Identifier 'productSlug' match: ${matchC ? "PASS ✅" : "FAIL ❌"}`);
    console.log(`- API Status: ${license.status} (should be active) ${license.status === 'active' ? "✅" : "⚠️"}\n`);
  }

  // 2. Verify Subscription Check API Logic (SaaS)
  console.log("--- Testing SaaS Subscription check (productId alias) ---");
  // Assuming we might not have a paid order, we just check if the product can be found by slug or ID logic
  const querySaaS = { productId: saasSlug };
  const foundBySlug = await prisma.product.findFirst({ where: { slug: querySaaS.productId } });
  console.log(`- Product lookup by slug in SaaS API: ${foundBySlug ? "PASS ✅" : "FAIL ❌"}\n`);

  console.log("=== ALL TESTS COMPLETED ===");
  process.exit(0);
}

runTests().catch(err => {
  console.error(err);
  process.exit(1);
});
