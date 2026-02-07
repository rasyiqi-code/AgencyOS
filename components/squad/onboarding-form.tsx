"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type CreateSquadProfileInput } from "@/lib/server/squad";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SquadOnboardingFormProps {
    user: {
        id: string;
        email?: string | null;
        displayName?: string | null;
    };
}

export function SquadOnboardingForm({ user }: SquadOnboardingFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState<CreateSquadProfileInput>({
        userId: user.id,
        email: user.email || "",
        name: user.displayName || "",
        skills: [],
        yearsOfExp: 0,
        bio: "",
        linkedin: "",
        github: "",
        portfolio: ""
    });

    const [skillInput, setSkillInput] = useState("");

    const handleSkillAdd = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && skillInput.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData((prev: CreateSquadProfileInput) => ({
                    ...prev,
                    skills: [...prev.skills, skillInput.trim()]
                }));
            }
            setSkillInput("");
        }
    };

    const removeSkill = (skill: string) => {
        setFormData((prev: CreateSquadProfileInput) => ({
            ...prev,
            skills: prev.skills.filter((s: string) => s !== skill)
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/squad/profile", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Welcome to the Squad!");
                router.push("/squad");
            } else {
                toast.error(result.error || "Failed to create profile");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-zinc-500">STEP {step} OF 2</span>
                    <span className="text-xs font-mono text-green-500">
                        {step === 1 ? "IDENTITY_VERIFICATION" : "SKILL_ASSESSMENT"}
                    </span>
                </div>
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{ width: `${(step / 2) * 100}%` }}
                    />
                </div>
            </div>

            {step === 1 && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Codename / Full Name</Label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Neo Anderson"
                            className="bg-black/50 border-zinc-700 focus:border-green-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Contact Email</Label>
                        <Input
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="bg-black/50 border-zinc-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Bio / Introduction</Label>
                        <Textarea
                            value={formData.bio || ""}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Tell us about your expertise..."
                            className="bg-black/50 border-zinc-700 min-h-[100px]"
                        />
                    </div>

                    <Button
                        onClick={() => setStep(2)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        disabled={!formData.name || !formData.email}
                    >
                        Proceed to Skill Verification
                    </Button>
                </div>
            )}

            {step === 2 && (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label>Years of Experience</Label>
                        <Input
                            type="number"
                            value={formData.yearsOfExp}
                            onChange={e => setFormData({ ...formData, yearsOfExp: parseInt(e.target.value) || 0 })}
                            className="bg-black/50 border-zinc-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Core Skills (Press Enter to add)</Label>
                        <Input
                            value={skillInput}
                            onChange={e => setSkillInput(e.target.value)}
                            onKeyDown={handleSkillAdd}
                            placeholder="e.g. React, Solidity, Rust"
                            className="bg-black/50 border-zinc-700"
                        />
                        <div className="flex flex-wrap gap-2 mt-2">
                            {formData.skills.map((skill: string) => (
                                <span
                                    key={skill}
                                    className="px-2 py-1 bg-green-500/10 border border-green-500/30 text-green-500 text-xs rounded-md flex items-center gap-1"
                                >
                                    {skill}
                                    <button onClick={() => removeSkill(skill)} className="hover:text-red-400">×</button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>GitHub URL</Label>
                            <Input
                                value={formData.github || ""}
                                onChange={e => setFormData({ ...formData, github: e.target.value })}
                                placeholder="https://github.com/..."
                                className="bg-black/50 border-zinc-700"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>LinkedIn URL</Label>
                            <Input
                                value={formData.linkedin || ""}
                                onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                                placeholder="https://linkedin.com/in/..."
                                className="bg-black/50 border-zinc-700"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setStep(1)}
                            className="w-full border-zinc-700 text-zinc-400"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                            Initialize Profile
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
