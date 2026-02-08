"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

interface ProfileEditFormProps {
    profile: {
        userId: string;
        name: string;
        email: string;
        bio?: string | null;
        skills: string[];
        yearsOfExp: number;
        linkedin?: string | null;
        github?: string | null;
        portfolio?: string | null;
    };
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: profile.name,
        bio: profile.bio || "",
        yearsOfExp: profile.yearsOfExp,
        linkedin: profile.linkedin || "",
        github: profile.github || "",
        portfolio: profile.portfolio || "",
        skills: profile.skills || []
    });

    const [skillInput, setSkillInput] = useState("");

    const handleSkillAdd = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && skillInput.trim()) {
            e.preventDefault();
            if (!formData.skills.includes(skillInput.trim())) {
                setFormData(prev => ({
                    ...prev,
                    skills: [...prev.skills, skillInput.trim()]
                }));
            }
            setSkillInput("");
        }
    };

    const removeSkill = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/squad/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                toast.success("Profile updated successfully!");
                router.refresh();
                router.push("/squad/profile");
            } else {
                toast.error(result.error || "Failed to update profile");
            }
        } catch {
            toast.error("An unexpected error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Full Name / Codename</Label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="bg-black/50 border-zinc-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Years of Experience</Label>
                        <Input
                            type="number"
                            value={formData.yearsOfExp}
                            onChange={e => setFormData({ ...formData, yearsOfExp: parseInt(e.target.value) || 0 })}
                            className="bg-black/50 border-zinc-700"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Bio / Introduction</Label>
                    <Textarea
                        value={formData.bio}
                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="bg-black/50 border-zinc-700 min-h-[100px]"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Skills (Press Enter to add)</Label>
                    <Input
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillAdd}
                        placeholder="e.g. React, Node.js"
                        className="bg-black/50 border-zinc-700"
                    />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.skills.map(skill => (
                            <span
                                key={skill}
                                className="px-2 py-1 bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs rounded-md flex items-center gap-1"
                            >
                                {skill}
                                <button type="button" onClick={() => removeSkill(skill)} className="hover:text-white">×</button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label>GitHub URL</Label>
                        <Input
                            value={formData.github}
                            onChange={e => setFormData({ ...formData, github: e.target.value })}
                            placeholder="https://github.com/..."
                            className="bg-black/50 border-zinc-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>LinkedIn URL</Label>
                        <Input
                            value={formData.linkedin}
                            onChange={e => setFormData({ ...formData, linkedin: e.target.value })}
                            placeholder="https://linkedin.com/in/..."
                            className="bg-black/50 border-zinc-700"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Portfolio URL</Label>
                        <Input
                            value={formData.portfolio}
                            onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                            placeholder="https://..."
                            className="bg-black/50 border-zinc-700"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <Button variant="outline" onClick={() => router.back()} className="border-zinc-700 text-zinc-400">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading} className="bg-brand-yellow text-black hover:bg-brand-yellow/90 font-bold">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
