"use client";

import { useEffect, useState } from "react";
import { useHexclaveApp, useUser } from "@hexclave/tanstack-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Lock, ArrowLeft, ShieldAlert, Chrome, Github } from "lucide-react";

export function CustomSignInPage() {
  const hexclaveApp = useHexclaveApp();
  const user = useUser({ includeRestricted: true });
  const project = hexclaveApp.useProject();

  // State untuk form login biasa
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [credentialLoading, setCredentialLoading] = useState(false);
  const [credentialError, setCredentialError] = useState<string | null>(null);

  // State untuk alur Magic Link / OTP
  const [magicEmail, setMagicEmail] = useState("");
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicError, setMagicError] = useState<string | null>(null);
  const [otpState, setOtpState] = useState<null | { nonce: string }>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  // State untuk loading OAuth/Passkey
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  // Redirect pintar jika user sudah masuk
  useEffect(() => {
    if (user) {
      if (user.isRestricted) {
        void hexclaveApp.redirectToOnboarding({ replace: true });
      } else {
        void hexclaveApp.redirectToAfterSignIn({ replace: true });
      }
    }
  }, [user, hexclaveApp]);

  // Tampilkan loading saat redirect sedang berlangsung
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,184,0,0.08),transparent_50%)] pointer-events-none" />
        <div className="flex flex-col items-center gap-4 text-center z-10 px-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#FFB800]" />
          <p className="text-zinc-400 font-medium">Mengalihkan halaman...</p>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:text-white" onClick={() => hexclaveApp.redirectToHome()}>
              Kembali ke Beranda
            </Button>
            <Button variant="secondary" className="bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white" onClick={() => hexclaveApp.redirectToSignOut()}>
              Keluar Akun
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Submit login Email + Password
  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setCredentialLoading(true);
    setCredentialError(null);

    try {
      const result = await hexclaveApp.signInWithCredential({ email, password });
      if (result.status === "error") {
        if (result.error.errorCode === "EMAIL_PASSWORD_MISMATCH") {
          setCredentialError("Email atau password tidak cocok.");
        } else {
          setCredentialError(result.error.humanReadableMessage || "Gagal masuk. Silakan coba lagi.");
        }
      }
    } catch (err) {
      setCredentialError("Terjadi kesalahan sistem. Coba beberapa saat lagi.");
    } finally {
      setCredentialLoading(false);
    }
  };

  // Kirim link magic/OTP ke email
  const handleMagicLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!magicEmail) return;

    setMagicLoading(true);
    setMagicError(null);

    try {
      const result = await hexclaveApp.sendMagicLinkEmail(magicEmail);
      if (result.status === "error") {
        setMagicError(result.error.humanReadableMessage || "Gagal mengirim kode OTP.");
      } else {
        setOtpState({ nonce: result.data.nonce });
      }
    } catch (err) {
      setMagicError("Terjadi kesalahan sistem saat mengirim kode OTP.");
    } finally {
      setMagicLoading(false);
    }
  };

  // Verifikasi OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !otpState) return;

    setOtpLoading(true);
    setOtpError(null);

    try {
      const result = await hexclaveApp.signInWithMagicLink(otpCode + otpState.nonce);
      if (result.status === "error") {
        if (result.error.errorCode === "VERIFICATION_CODE_ERROR") {
          setOtpError("Kode OTP yang Anda masukkan salah atau kedaluwarsa.");
        } else {
          setOtpError(result.error.humanReadableMessage || "Gagal memverifikasi kode OTP.");
        }
      }
    } catch (err) {
      setOtpError("Terjadi kesalahan sistem saat verifikasi OTP.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Login via OAuth (Google, Github, dsb)
  const handleOAuthSignIn = async (providerId: string) => {
    setOauthLoading(providerId);
    try {
      await hexclaveApp.signInWithOAuth(providerId);
    } catch (err) {
      console.error(`Gagal login dengan ${providerId}:`, err);
      setOauthLoading(null);
    }
  };

  // Login via Passkey
  const handlePasskeySignIn = async () => {
    setPasskeyLoading(true);
    try {
      const result = await hexclaveApp.signInWithPasskey();
      if (result.status === "error") {
        alert(result.error.humanReadableMessage || "Gagal masuk menggunakan Passkey.");
      }
    } catch (err) {
      console.error("Gagal login dengan Passkey:", err);
    } finally {
      setPasskeyLoading(false);
    }
  };

  const hasOAuthProviders = project.config.oauthProviders.length > 0;
  const hasPasskey = project.config.passkeyEnabled;
  const hasCredential = project.config.credentialEnabled;
  const hasMagicLink = project.config.magicLinkEnabled;
  const showSeparator = (hasCredential || hasMagicLink) && (hasOAuthProviders || hasPasskey);
  const hasAnyAuthMethod = hasOAuthProviders || hasCredential || hasMagicLink || hasPasskey;

  // Dapatkan ikon penyedia OAuth secara estetik
  const getProviderIcon = (providerId: string) => {
    const norm = providerId.toLowerCase();
    if (norm.includes("google")) return <Chrome className="h-4 w-4 text-[#EA4335]" />;
    if (norm.includes("github")) return <Github className="h-4 w-4 text-white" />;
    return <Mail className="h-4 w-4" />;
  };

  // Rendering tampilan verifikasi OTP
  if (otpState) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white relative overflow-hidden px-4">
        {/* Latar Belakang Desain Premium */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,184,0,0.06),transparent_60%)] pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FFB800]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <Card className="w-full max-w-md bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/80 shadow-2xl relative z-10">
          <CardHeader className="space-y-1">
            <button 
              type="button" 
              onClick={() => setOtpState(null)} 
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-xs transition-colors mb-3 cursor-pointer w-fit"
            >
              <ArrowLeft className="h-3 w-3" /> Kembali ke Halaman Masuk
            </button>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Masukkan Kode OTP</CardTitle>
            <CardDescription className="text-zinc-400">
              Kami telah mengirimkan kode verifikasi 6 digit ke email Anda. Silakan ketik kode tersebut di bawah.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-zinc-300 font-medium">Kode OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="------"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="bg-zinc-900/60 border-zinc-800 text-center tracking-widest text-lg font-bold text-white placeholder:text-zinc-700 focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] h-11"
                  required
                />
                {otpError && (
                  <div className="flex items-center gap-2 text-red-400 text-xs mt-1 animate-pulse">
                    <ShieldAlert className="h-3 w-3 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={otpLoading || otpCode.length < 6}
                className="w-full bg-[#FFB800] hover:bg-[#FFB800]/90 text-black font-semibold h-11 transition-all"
              >
                {otpLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-black" /> Memverifikasi...
                  </span>
                ) : (
                  "Verifikasi & Masuk"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white relative overflow-hidden px-4">
      {/* Latar Belakang Aksen AgencyOS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,184,0,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#FFB800]/5 rounded-full blur-[140px] pointer-events-none" />

      <Card className="w-full max-w-md bg-zinc-950/60 backdrop-blur-xl border border-zinc-800/80 shadow-2xl relative z-10">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <span className="text-xl font-bold tracking-wider text-[#FFB800]">AGENCY<span className="text-white">OS</span></span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Masuk ke Akun Anda</CardTitle>
          {project.config.signUpEnabled && (
            <CardDescription className="text-zinc-400">
              Belum punya akun?{" "}
              <a
                href={hexclaveApp.urls.signUp}
                onClick={async (e) => {
                  e.preventDefault();
                  await hexclaveApp.redirectToSignUp();
                }}
                className="text-[#FFB800] hover:underline transition-all font-medium"
              >
                Daftar sekarang
              </a>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Bagian OAuth & Passkey */}
          {(hasOAuthProviders || hasPasskey) && (
            <div className="flex flex-col gap-2">
              {project.config.oauthProviders.map((provider) => (
                <Button
                  key={provider.id}
                  variant="outline"
                  disabled={oauthLoading !== null || passkeyLoading}
                  onClick={() => handleOAuthSignIn(provider.id)}
                  className="border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-white flex items-center justify-center gap-3 h-10 w-full transition-all"
                >
                  {oauthLoading === provider.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    getProviderIcon(provider.id)
                  )}
                  <span>Masuk dengan {provider.id.charAt(0).toUpperCase() + provider.id.slice(1)}</span>
                </Button>
              ))}

              {hasPasskey && (
                <Button
                  variant="outline"
                  disabled={oauthLoading !== null || passkeyLoading}
                  onClick={handlePasskeySignIn}
                  className="border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-white flex items-center justify-center gap-3 h-10 w-full transition-all"
                >
                  {passkeyLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Lock className="h-4 w-4 text-[#FFB800]" />
                  )}
                  <span>Masuk dengan Passkey</span>
                </Button>
              )}
            </div>
          )}

          {showSeparator && (
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative bg-[#09090b] px-3 text-xs text-zinc-500 uppercase tracking-widest">Atau</span>
            </div>
          )}

          {/* Form Login Kredensial / Magic Link */}
          {hasCredential || hasMagicLink ? (
            <Tabs defaultValue={hasCredential ? "password" : "magic-link"} className="w-full">
              {hasCredential && hasMagicLink && (
                <TabsList className="grid w-full grid-cols-2 bg-zinc-900/60 p-1 border border-zinc-800 rounded-lg mb-4">
                  <TabsTrigger value="password" className="text-zinc-400 data-[state=active]:bg-zinc-950 data-[state=active]:text-white">Kata Sandi</TabsTrigger>
                  <TabsTrigger value="magic-link" className="text-zinc-400 data-[state=active]:bg-zinc-950 data-[state=active]:text-white">Email OTP</TabsTrigger>
                </TabsList>
              )}

              {/* Form Kredensial (Email + Password) */}
              {hasCredential && (
                <TabsContent value="password">
                  <form onSubmit={handleCredentialSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-zinc-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-zinc-900/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] h-10"
                        required
                      />
                      {credentialError && (
                        <div className="flex items-center gap-2 text-red-400 text-xs mt-1">
                          <ShieldAlert className="h-3 w-3 shrink-0" />
                          <span>{credentialError}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-zinc-300">Kata Sandi</Label>
                        <button
                          type="button"
                          onClick={async () => await hexclaveApp.redirectToForgotPassword()}
                          className="text-xs text-[#FFB800] hover:underline cursor-pointer transition-all"
                        >
                          Lupa kata sandi?
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-zinc-900/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] h-10"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={credentialLoading}
                      className="w-full bg-[#FFB800] hover:bg-[#FFB800]/90 text-black font-semibold h-11 transition-all mt-2"
                    >
                      {credentialLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-black" /> Memproses...
                        </span>
                      ) : (
                        "Masuk"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              )}

              {/* Form Magic Link (Email OTP) */}
              {hasMagicLink && (
                <TabsContent value="magic-link">
                  <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="magic-link-email" className="text-zinc-300">Email</Label>
                      <Input
                        id="magic-link-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={magicEmail}
                        onChange={(e) => setMagicEmail(e.target.value)}
                        className="bg-zinc-900/40 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-[#FFB800] focus:ring-1 focus:ring-[#FFB800] h-10"
                        required
                      />
                      {magicError && (
                        <div className="flex items-center gap-2 text-red-400 text-xs mt-1">
                          <ShieldAlert className="h-3 w-3 shrink-0" />
                          <span>{magicError}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={magicLoading}
                      className="w-full bg-[#FFB800] hover:bg-[#FFB800]/90 text-black font-semibold h-11 transition-all mt-2"
                    >
                      {magicLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-black" /> Mengirim...
                        </span>
                      ) : (
                        "Kirim Kode OTP"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              )}
            </Tabs>
          ) : null}

          {!hasAnyAuthMethod && (
            <div className="flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-lg p-6 text-center text-red-400 space-y-2">
              <ShieldAlert className="h-8 w-8" />
              <p className="text-sm font-semibold">Metode Autentikasi Nonaktif</p>
              <p className="text-xs text-zinc-500">Tidak ada metode autentikasi yang diaktifkan untuk proyek ini.</p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
