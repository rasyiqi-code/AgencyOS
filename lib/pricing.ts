export type ProjectComplexity = 'low' | 'medium' | 'high';

export interface QuoteParams {
    complexity: ProjectComplexity;
    pages: number;
    features: {
        auth: boolean;
        payment: boolean;
        cms: boolean;
        ai: boolean;
        realtime: boolean;
    };
}

export const pricingConfig = {
    baseRate: 5_000_000, // Setup, Repo, Deployment
    pageRate: 1_000_000, // Per static/dynamic page
    featureRates: {
        auth: 2_500_000, // Stack Auth / NextAuth integration
        payment: 3_500_000, // Midtrans / Stripe
        cms: 2_000_000, // Admin Dashboard / CRUD
        ai: 5_000_000, // OpenAI / Gemini integration
        realtime: 3_000_000, // WebSockets / Polling
    },
    multipliers: {
        low: 1,
        medium: 1.5,
        high: 2.2, // Enterprise grade
    }
};

export function calculateProjectQuote(params: QuoteParams) {
    let subtotal = pricingConfig.baseRate;

    // Add Page Costs
    subtotal += (params.pages * pricingConfig.pageRate);

    // Add Feature Costs
    if (params.features.auth) subtotal += pricingConfig.featureRates.auth;
    if (params.features.payment) subtotal += pricingConfig.featureRates.payment;
    if (params.features.cms) subtotal += pricingConfig.featureRates.cms;
    if (params.features.ai) subtotal += pricingConfig.featureRates.ai;
    if (params.features.realtime) subtotal += pricingConfig.featureRates.realtime;

    // Apply Complexity Multiplier
    const multiplier = pricingConfig.multipliers[params.complexity];
    const total = Math.round(subtotal * multiplier);

    // Calculate Duration Estimate (Weeks)
    // Base 2 weeks + 0.5 week per feature + 0.2 week per page
    let durationWeeks = 2;
    const featureCount = Object.values(params.features).filter(Boolean).length;
    durationWeeks += (featureCount * 0.5);
    durationWeeks += (params.pages * 0.2);

    // Apply multiplier to duration too, but less aggressively
    durationWeeks = Math.ceil(durationWeeks * (multiplier * 0.8));

    return {
        totalPrice: total,
        formattedPrice: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total),
        estimatedDuration: durationWeeks,
        breakdown: {
            base: pricingConfig.baseRate,
            features: subtotal - pricingConfig.baseRate - (params.pages * pricingConfig.pageRate),
            pages: params.pages * pricingConfig.pageRate,
            multiplier: multiplier
        }
    };
}
