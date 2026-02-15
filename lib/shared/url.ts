export function getAppUrl() {
    if (process.env.APP_URL) {
        return process.env.APP_URL;
    }

    if (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
