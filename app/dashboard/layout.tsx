import Link from "next/link";
import { UserButton } from "@stackframe/stack";
import { LayoutDashboard, PlusCircle, Settings, Shield } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
                <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
                    <Link
                        href="/dashboard"
                        className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
                    >
                        <LayoutDashboard className="h-4 w-4 transition-all group-hover:scale-110" />
                        <span className="sr-only">Dashboard</span>
                    </Link>
                    <Link
                        href="/dashboard/new"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                        <PlusCircle className="h-5 w-5" />
                        <span className="sr-only">New Project</span>
                    </Link>
                    <Link
                        href="/dashboard/admin"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                        <Shield className="h-5 w-5" />
                        <span className="sr-only">Admin</span>
                    </Link>
                </nav>
                <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
                    <Link
                        href="/dashboard/settings"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                    >
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                    </Link>
                </nav>
            </aside>
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <div className="ml-auto flex items-center gap-2">
                        <UserButton />
                    </div>
                </header>
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
