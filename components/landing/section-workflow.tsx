import { WorkflowContent } from "@/components/landing/workflow-content";

export async function Workflow() {
    return (
        <section id="workflow" className="py-24 bg-zinc-950 border-y border-white/5">
            <WorkflowContent />
        </section>
    );
}
