"use client";

export function CheckoutProgress({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {

    const steps = [
        { id: 1, label: "Ringkasan" },
        { id: 2, label: "Pembayaran" },
        { id: 3, label: "Verifikasi" },
        { id: 4, label: "Selesai" }
    ];

    return (
        <div className="max-w-4xl mx-auto mb-8 md:mb-12">
            <div className="flex items-center justify-between px-2">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex flex-1 items-center last:flex-none">
                        {/* Step Circle & Label */}
                        <div className="flex flex-col items-center gap-2 md:gap-3 relative z-10">
                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-all duration-500 ${
                                currentStep >= step.id 
                                ? 'bg-brand-yellow text-black shadow-[0_0_20px_rgba(254,215,0,0.4)]' 
                                : 'bg-zinc-800 text-zinc-500 border border-white/5'
                            }`}>
                                {step.id}
                            </div>
                            <span className={`text-[7px] md:text-[10px] font-bold uppercase tracking-tighter md:tracking-[0.2em] transition-colors duration-500 text-center max-w-[60px] md:max-w-none leading-none ${
                                currentStep >= step.id ? 'text-brand-yellow' : 'text-zinc-500'
                            }`}>
                                {step.label}
                            </span>
                        </div>

                        {/* Line to next step */}
                        {index < steps.length - 1 && (
                            <div className="flex-1 h-[1px] md:h-[2px] mx-1 md:mx-4 mt-[-24px] md:mt-[-32px] bg-zinc-800 relative overflow-hidden">
                                <div 
                                    className="absolute inset-0 bg-brand-yellow transition-transform duration-1000 ease-in-out" 
                                    style={{ transform: `translateX(${currentStep > step.id ? '0%' : '-100%'})` }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
