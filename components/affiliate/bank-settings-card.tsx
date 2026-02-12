"use client";

import { useState } from "react";
// import { updateBankDetails } from "@/app/actions/affiliate"; // REMOVED
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Save, Pencil, X } from "lucide-react";

interface BankSettingsProps {
    initialData?: {
        bankName?: string;
        accountNumber?: string;
        accountHolder?: string;
    } | null;
}

export function BankSettingsCard({ initialData }: BankSettingsProps) {
    const hasData = !!(initialData?.bankName && initialData?.accountNumber);
    const [isEditing, setIsEditing] = useState(!hasData);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        bankName: initialData?.bankName || "",
        accountNumber: initialData?.accountNumber || "",
        accountHolder: initialData?.accountHolder || ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/affiliate/bank", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error("Failed to save");

            toast.success("Bank details saved successfully");
            setIsEditing(false); // Lock after save
        } catch (error) {
            console.error(error);
            toast.error("Failed to save details");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            bankName: initialData?.bankName || "",
            accountNumber: initialData?.accountNumber || "",
            accountHolder: initialData?.accountHolder || ""
        });
        setIsEditing(false);
    }

    return (
        <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div className="space-y-1.5">
                    <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                        Bank Information
                    </CardTitle>
                    <CardDescription>
                        Where should we send your payouts?
                    </CardDescription>
                </div>
                {!isEditing && (
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="text-zinc-400 hover:text-white">
                        <Pencil className="w-4 h-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                            id="bankName"
                            name="bankName"
                            placeholder="e.g. BCA, Mandiri, Wise"
                            value={formData.bankName}
                            onChange={handleChange}
                            className="bg-zinc-950/50 border-zinc-800 disabled:opacity-75 disabled:cursor-not-allowed"
                            required
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                            id="accountNumber"
                            name="accountNumber"
                            placeholder="e.g. 1234567890"
                            value={formData.accountNumber}
                            onChange={handleChange}
                            className="bg-zinc-950/50 border-zinc-800 disabled:opacity-75 disabled:cursor-not-allowed"
                            required
                            disabled={!isEditing}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="accountHolder">Account Holder Name</Label>
                        <Input
                            id="accountHolder"
                            name="accountHolder"
                            placeholder="Full Name as on Bank Account"
                            value={formData.accountHolder}
                            onChange={handleChange}
                            className="bg-zinc-950/50 border-zinc-800 disabled:opacity-75 disabled:cursor-not-allowed"
                            required
                            disabled={!isEditing}
                        />
                    </div>

                    {isEditing && (
                        <div className="pt-2 flex gap-2">
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 font-medium">
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Details
                                    </>
                                )}
                            </Button>
                            {hasData && (
                                <Button type="button" variant="outline" onClick={handleCancel} disabled={loading} className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                            )}
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
