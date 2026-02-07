import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/lib/config/stack";

export default async function Handler(props: { params: Promise<Record<string, string | string[] | undefined>>, searchParams: Promise<Record<string, string | string[] | undefined>> }) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    console.log("HANDLER PARAMS:", params);
    console.log("HANDLER SEARCH PARAMS:", searchParams);
    return <StackHandler fullPage app={stackServerApp} routeProps={{ params, searchParams }} />;
}
