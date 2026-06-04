import { HexclaveServerApp } from "@hexclave/next";

export const hexclaveServerApp = new HexclaveServerApp({
    tokenStore: "nextjs-cookie",
});
