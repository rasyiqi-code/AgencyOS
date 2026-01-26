import { Bot, LayoutDashboard, Zap, Shield } from "lucide-react";

const features = [
    {
        title: "AI Project Consultant",
        description: "An intelligent agent that interviews clients and generates detailed briefs automatically.",
        icon: Bot,
        className: "md:col-span-2",
        bgClass: "bg-blue-500/10",
        textClass: "text-blue-500",
    },
    {
        title: "Real-time Dashboard",
        description: "Clients can track progress, view updates, and approve milestones in real-time.",
        icon: LayoutDashboard,
        className: "md:col-span-1",
        bgClass: "bg-indigo-500/10",
        textClass: "text-indigo-500",
    },
    {
        title: "Automated Workflows",
        description: "Triggers actions based on project status changes. Zero manual overhead.",
        icon: Zap,
        className: "md:col-span-1",
        bgClass: "bg-orange-500/10",
        textClass: "text-orange-500",
    },
    {
        title: "Secure & Scalable",
        description: "Built on enterprise-grade infrastructure. Your data is encrypted and safe.",
        icon: Shield,
        className: "md:col-span-2",
        bgClass: "bg-green-500/10",
        textClass: "text-green-500",
    },
];

export function BentoGrid() {
    return (
        <section className="py-20 bg-black/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                        Everything You Need
                    </h2>
                    <p className="text-zinc-400 max-w-2xl mx-auto">
                        Powerful features designed to help you run your agency like a well-oiled machine.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className={`group relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/50 p-8 hover:bg-zinc-900 transition-colors ${feature.className}`}
                        >
                            <div className={`mb-4 w-12 h-12 rounded-lg ${feature.bgClass} flex items-center justify-center ${feature.textClass}`}>
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                            <p className="text-zinc-400 leading-relaxed text-sm">
                                {feature.description}
                            </p>

                            {/* Hover Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
