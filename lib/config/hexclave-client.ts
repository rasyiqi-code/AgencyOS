import { HexclaveClientApp } from "@hexclave/tanstack-start";

// Client app — berjalan di browser; tidak mengekspos secret key server
export const hexclaveClientApp = new HexclaveClientApp({
    projectId: import.meta.env.VITE_STACK_PROJECT_ID || import.meta.env.VITE_HEXCLAVE_PROJECT_ID || import.meta.env.NEXT_PUBLIC_HEXCLAVE_PROJECT_ID || process.env.HEXCLAVE_PROJECT_ID,
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
