"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { submitTestimonial } from "@/app/actions/testimonials";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface SubmitTestimonialFormProps {
    agencyName: string;
    userAvatar?: string | null;
    userName?: string | null;
}

export function SubmitTestimonialForm({ agencyName, userAvatar, userName }: SubmitTestimonialFormProps) {
    const [isPending, startTransition] = useTransition();
    const [submitted, setSubmitted] = useState(false);
    const t = useTranslations("Testimonials");

    async function onSubmit(formData: FormData) {
        const name = formData.get("name") as string;
        const role = formData.get("role") as string;
        const content = formData.get("content") as string;

        if (!name || !role || !content) {
            toast.error(t("submit.toastFillAll"));
            return;
        }

        startTransition(async () => {
            try {
                const result = await submitTestimonial(formData);

                if (result.success) {
                    setSubmitted(true);
                    toast.success(t("submit.toastSuccess"));
                } else {
                    toast.error(t("submit.toastError"));
                }
            } catch {
                toast.error(t("submit.toastFail"));
            }
        });
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
                <Card className="max-w-md w-full bg-zinc-900/50 border-white/10 text-center">
                    <CardContent className="pt-10 pb-8 space-y-6">
                        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-white">{t("submit.thankYou")}</h1>
                            <p className="text-zinc-400">
                                {t("submit.successDesc")}
                            </p>
                        </div>
                        <Button
                            onClick={() => window.location.href = '/'}
                            className="bg-white text-black hover:bg-zinc-200 w-full"
                        >
                            {t("submit.returnHome")}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 sm:p-6 relative">


            <div className="max-w-md w-full space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold font-heading tracking-tight sm:text-4xl text-white">{t("submit.title")}</h1>
                    <p className="text-zinc-400 text-sm sm:text-base">
                        {t("submit.subtitle", { brand: agencyName })}
                    </p>
                </div>

                <form action={onSubmit} className="space-y-6">
                    {userAvatar && (
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <Image
                                    src={userAvatar}
                                    alt="Profile"
                                    width={72}
                                    height={72}
                                    className="w-[72px] h-[72px] rounded-full border-2 border-white/10 object-cover"
                                />
                                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-0.5 border-2 border-black">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-zinc-400 text-[11px] uppercase tracking-widest font-bold pl-1">{t("submit.fullName")}</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={userName || ""}
                                placeholder={t("submit.placeholderName")}
                                className="bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-white/20 h-11 rounded-xl transition-all hover:bg-white/10"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="role" className="text-zinc-400 text-[11px] uppercase tracking-widest font-bold pl-1">{t("submit.roleCompany")}</Label>
                            <Input
                                id="role"
                                name="role"
                                placeholder={t("submit.placeholderRole")}
                                className="bg-white/5 border-white/5 text-white placeholder:text-white/20 focus:border-white/20 h-11 rounded-xl transition-all hover:bg-white/10"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="content" className="text-zinc-400 text-[11px] uppercase tracking-widest font-bold pl-1">{t("submit.yourTestimonial")}</Label>
                        <Textarea
                            id="content"
                            name="content"
                            placeholder={t("submit.placeholderContent", { brand: agencyName })}
                            className="bg-white/5 border-white/5 min-h-[140px] text-white placeholder:text-white/20 focus:border-white/20 resize-none text-base rounded-xl transition-all hover:bg-white/10"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        size="lg"
                        className="w-full bg-white text-black hover:bg-zinc-200 h-11 rounded-full font-bold text-sm tracking-wide"
                    >
                        {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {t("submit.submitButton")}
                    </Button>
                </form>
            </div>
        </div >
    );
}
