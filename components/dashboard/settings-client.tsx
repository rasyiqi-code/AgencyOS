"use client";

import React, { useState, useEffect } from "react";
import { useSafeUser } from "@/hooks/use-safe-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, User, Upload, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function SettingsClient() {
    const { user } = useSafeUser();
    const [displayName, setDisplayName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Sinkronisasi data nama pengguna saat berhasil dimuat
    useEffect(() => {
        if (user?.displayName) {
            setDisplayName(user.displayName);
        }
    }, [user]);

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-yellow" />
            </div>
        );
    }

    // Fungsi untuk mengubah nama tampilan profil
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!displayName.trim()) {
            toast.error("Nama tampilan tidak boleh kosong");
            return;
        }

        setIsSaving(true);
        try {
            await user.update({ displayName });
            toast.success("Profil berhasil diperbarui!");
        } catch (error) {
            console.error("Gagal memperbarui profil:", error);
            toast.error("Gagal memperbarui nama profil.");
        } finally {
            setIsSaving(false);
        }
    };

    // Helper untuk mengubah file menjadi Base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });
    };

    // Fungsi untuk mengunggah dan memperbarui foto profil
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi tipe file
        if (!file.type.startsWith("image/")) {
            toast.error("Berkas harus berupa gambar.");
            return;
        }

        // Validasi ukuran berkas (maksimal 2MB untuk base64)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ukuran gambar terlalu besar. Maksimal 2MB.");
            return;
        }

        setIsUploading(true);
        try {
            const base64Image = await fileToBase64(file);
            await user.update({ profileImageUrl: base64Image });
            toast.success("Foto profil berhasil diperbarui!");
        } catch (error) {
            console.error("Gagal mengunggah foto profil:", error);
            toast.error("Gagal mengunggah foto profil.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="grid gap-6">
            {/* Profil Kustom Premium */}
            <div className="space-y-6 pb-8 border-b border-white/5">
                <div className="space-y-1">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-white uppercase tracking-tight">
                        <User className="w-5 h-5 text-brand-yellow" /> Profil Pengguna
                    </h2>
                    <p className="text-zinc-500 text-xs font-medium">
                        Kelola data profil Anda secara aman.
                    </p>
                </div>
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
                        {/* Editor Foto Profil */}
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-full bg-brand-yellow/10 flex items-center justify-center text-3xl font-black text-brand-yellow border border-brand-yellow/30 overflow-hidden">
                                {user.profileImageUrl ? (
                                    <img
                                        src={user.profileImageUrl}
                                        alt={user.displayName || "Avatar"}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user.displayName?.charAt(0) || user.primaryEmail?.charAt(0) || "U"
                                )}
                            </div>
                            
                            <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer border border-brand-yellow/20">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    disabled={isUploading}
                                    className="hidden"
                                />
                                {isUploading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-brand-yellow" />
                                ) : (
                                    <Upload className="w-5 h-5 text-brand-yellow" />
                                )}
                            </label>
                        </div>

                        <div className="space-y-1 text-center sm:text-left flex-1">
                            <h3 className="font-extrabold text-xl text-white tracking-tight">
                                {user.displayName || "Pengguna"}
                            </h3>
                            <p className="text-sm text-zinc-400 font-mono">
                                {user.primaryEmail}
                            </p>
                        </div>
                    </div>

                    {/* Formulir Update Profil */}
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-wider text-zinc-500">
                                Nama Tampilan
                            </label>
                            <Input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="bg-black/40 border-white/5 text-white focus-visible:ring-brand-yellow focus-visible:border-brand-yellow/50 rounded-xl h-11"
                                placeholder="Masukkan nama tampilan Anda"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-brand-yellow hover:bg-yellow-400 text-black font-extrabold px-6 rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(254,215,0,0.15)] active:scale-[0.98]"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    "Simpan Perubahan"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Keamanan & Akun */}
            <div className="space-y-6 pb-8 border-b border-white/5">
                <div className="space-y-1">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-white uppercase tracking-tight">
                        <KeyRound className="w-5 h-5 text-brand-yellow" /> Keamanan & Akun
                    </h2>
                    <p className="text-zinc-500 text-xs font-medium">
                        Atur verifikasi dua langkah, ubah kata sandi, dan kelola sesi aktif.
                    </p>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        Untuk menjaga keamanan akun Anda, konfigurasi sensitif seperti penggantian kata sandi dan pengaturan otentikasi multi-faktor dikelola di portal keamanan terverifikasi kami.
                    </p>
                    <div className="flex justify-start">
                        <Link href="/handler/account-settings#emails" passHref>
                            <Button
                                variant="outline"
                                className="border-white/10 hover:border-brand-yellow/30 hover:bg-brand-yellow/5 hover:text-white transition-all duration-300 text-zinc-300 rounded-xl"
                            >
                                Buka Pengaturan Keamanan
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Notifikasi */}
            <div className="space-y-6">
                <div className="space-y-1">
                    <h2 className="flex items-center gap-2 text-lg font-bold text-white uppercase tracking-tight">
                        <Bell className="w-5 h-5 text-brand-yellow" /> Notifikasi
                    </h2>
                    <p className="text-zinc-500 text-xs font-medium">
                        Konfigurasi cara Anda menerima pembaruan proyek.
                    </p>
                </div>
                <div>
                    <div className="flex items-center justify-between py-3 border-b border-white/5">
                        <span className="text-sm text-zinc-300 font-semibold">Alerts via Email</span>
                        <span className="text-xs text-brand-yellow font-extrabold tracking-widest uppercase">AKTIF</span>
                    </div>
                    <div className="flex items-center justify-between py-3 pt-4">
                        <span className="text-sm text-zinc-300 font-semibold">Pembaruan Proyek Harian</span>
                        <span className="text-xs text-brand-yellow font-extrabold tracking-widest uppercase">AKTIF</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
