"use client";

import { CreditCard, CheckCircle2 } from "lucide-react";

export function CheckoutProgress({ currentStep }: { currentStep: 1 | 2 }) {
    const steps = [
        { id: 1, label: "Pembayaran", icon: CreditCard },
        { id: 2, label: "Selesai", icon: CheckCircle2 }
    ];

    return (
        <div className="max-w-xl mx-auto mb-10 md:mb-14 px-4">
            <div className="relative flex items-center justify-between">
                {/* Connecting Line Container */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-zinc-800/80 rounded-full z-0">
                    <div 
                        className="h-full bg-gradient-to-r from-brand-yellow to-lime-500 rounded-full transition-all duration-1000 ease-in-out" 
                        style={{ width: `${currentStep === 2 ? '100%' : '0%'}` }}
                    />
                </div>

                {steps.map((step, index) => {
                    const isActive = currentStep >= step.id;
                    const StepIcon = step.icon;
                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
                            {/* Circle */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700 border ${
                                isActive 
                                ? 'bg-gradient-to-br from-brand-yellow to-lime-400 text-black border-transparent shadow-[0_0_25px_rgba(254,215,0,0.35)] scale-110' 
                                : 'bg-zinc-950 text-zinc-500 border-zinc-800'
                            }`}>
                                <StepIcon className="w-5 h-5" />
                            </div>
                            
                            {/* Label */}
                            <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 text-center leading-none ${
                                isActive ? 'text-brand-yellow' : 'text-zinc-500'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
