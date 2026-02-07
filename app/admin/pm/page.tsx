
import { canManageProjects } from "@/lib/shared/auth-helpers";
import { ProjectDashboardView } from "@/components/admin/views/project-view";
import { redirect } from "next/navigation";


export default async function ProjectManagerDashboardPage() {
    // Permission Check
    const hasAccess = await canManageProjects();

    if (!hasAccess) {
        redirect('/dashboard');
    }

    return (
        <div className="flex flex-col gap-4">
            <ProjectDashboardView />
        </div>
    );
}
