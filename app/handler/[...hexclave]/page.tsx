import { HexclaveHandler } from "@hexclave/next";
import { hexclaveServerApp } from "@/lib/config/hexclave";

export default async function Handler(props: { params: Promise<Record<string, string | string[] | undefined>>, searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    return <HexclaveHandler fullPage app={hexclaveServerApp} routeProps={{ params, searchParams }} />;
}
