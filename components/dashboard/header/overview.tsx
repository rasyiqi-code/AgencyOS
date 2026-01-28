import { NotificationPopover } from "./notification-popover";

export function OverviewHeader({ user }: { user: { displayName?: string | null } | null | undefined }) {
    const hours = new Date().getHours();
    const greeting = hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                    {greeting}, {user?.displayName || "Architect"}.
                </h1>
                <p className="text-zinc-400 mt-1 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    All systems operational. ready for command.
                </p>
            </div>

            <div className="flex items-center gap-3">
                <NotificationPopover />
            </div>
        </div>
    );
}
