import { Settings2 } from "lucide-react";
import { SystemNav } from "@/components/admin/system-nav";

export default function AdminSettingsPage() {
    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold tracking-widest text-zinc-500 uppercase">System Configuration</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                        General Settings
                        <Settings2 className="w-6 h-6 text-zinc-600" />
                    </h1>
                    <p className="text-zinc-400 mt-2 text-sm max-w-lg">
                        Manage global system parameters and default behaviors.
                    </p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">

                {/* Left Column: Context/Navigation */}
                <div className="lg:col-span-1 space-y-4">
                    <SystemNav />
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-2 space-y-6">

                    <div className="rounded-xl border border-white/5 bg-zinc-900/40 p-12 text-center">
                        <Settings2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-zinc-300">No General Settings</h3>
                        <p className="text-zinc-500 mt-2 max-w-sm mx-auto text-sm">
                            Global configurations will appear here. Please use the sidebar to manage Payment, Cloud Storage, or AI Keys.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
