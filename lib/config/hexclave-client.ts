import { HexclaveClientApp } from "@hexclave/tanstack-start";

// Client app — berjalan di browser; tidak mengekspos secret key server
export const hexclaveClientApp = new HexclaveClientApp({
    projectId: import.meta.env.VITE_STACK_PROJECT_ID || import.meta.env.VITE_HEXCLAVE_PROJECT_ID || import.meta.env.NEXT_PUBLIC_HEXCLAVE_PROJECT_ID || process.env.HEXCLAVE_PROJECT_ID,
    publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || import.meta.env.VITE_HEXCLAVE_PUBLISHABLE_CLIENT_KEY || import.meta.env.NEXT_PUBLIC_HEXCLAVE_PUBLISHABLE_CLIENT_KEY || process.env.HEXCLAVE_PUBLISHABLE_CLIENT_KEY,
    tokenStore: "cookie",
    redirectMethod: "window",
    urls: {
        default: {
            // Menggunakan handler-component agar halaman auth dirender secara lokal oleh komponen <HexclaveHandler>
            type: "handler-component",
        },
        signIn: {
            type: "custom",
            url: "/handler/sign-in",
            version: 1,
        },
    },
});
