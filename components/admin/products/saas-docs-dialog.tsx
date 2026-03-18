"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen, Copy, Key, Share2, Layers, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function SaaSDocsDialog() {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Code copied to clipboard!");
    };

    const webhookExample = `{
  "event": "subscription.activated",
  "data": {
    "orderId": "ORD-12345",
    "email": "customer@example.com",
    "productId": "premium-saas-slug", // Ini adalah Product Slug dari dashboard Admin
    "productName": "Enterprise Cloud Toolkit",
    "amount": 49.00,
    "currency": "USD",
    "timestamp": "2024-03-18T15:30:00Z"
  }
}`;

    const nextjsExample = `// app/actions/subscription.ts (Server Action)
"use server";

export async function checkAccess(email: string) {
  const response = await fetch(
    \`https://your-agency-os.com/api/v1/subscription/check?email=\${email}&productId=YOUR_PRODUCT_SLUG\`,
    {
      headers: {
        'Authorization': \`Bearer \${process.env.AGENCY_OS_API_KEY}\`,
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    }
  );
  
  const data = await response.json();
  return data.active === true;
}`;

    const nodeJsExample = `const axios = require('axios');

async function verifySubscription(email, productSlug) {
  try {
    const response = await axios.get('https://your-agency-os.com/api/v1/subscription/check', {
      params: { email, productId: productSlug }, // Gunakan slug produk di sini
      headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
    });
    
    return response.data.active;
  } catch (error) {
    console.error('Verification failed', error);
    return false;
  }
}`;

    const vueExample = `<script setup>
import { ref } from 'vue'

const isSubscribed = ref(false)

async function checkStatus() {
  const res = await fetch(\`https://your-agency-os.com/api/v1/subscription/check?email=\${user.email}&productId=YOUR_PRODUCT_SLUG\`, {
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
  })
  const data = await res.json()
  isSubscribed.value = data.active
}
</script>`;

    const flutterExample = `import 'package:http/http.dart' as http;
import 'dart:convert';

Future<bool> checkSubscription(String email, String productSlug) async {
  final response = await http.get(
    Uri.parse('https://your-agency-os.com/api/v1/subscription/check?email=$email&productId=$productSlug'),
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body)['active'] == true;
  }
  return false;
}`;

    const phpExample = `<?php
$apiKey = "YOUR_AGENCY_OS_API_KEY";
$url = "https://your-agency-os.com/api/v1/subscription/check?" . http_build_query([
    "email" => "customer@example.com",
    "productId" => "YOUR_PRODUCT_SLUG" // Gunakan slug produk
]);

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer " . $apiKey]);

$response = curl_exec($ch);
$data = json_decode($response, true);

if ($data["active"]) {
    echo "Access Granted for " . $data["productName"];
}
?>`;

    const pythonExample = `import requests

api_key = "YOUR_AGENCY_OS_API_KEY"
headers = { "Authorization": f"Bearer {api_key}" }
params = { "email": "customer@example.com", "productId": "YOUR_PRODUCT_SLUG" }

response = requests.get("https://your-agency-os.com/api/v1/subscription/check", params=params, headers=headers)

if response.json().get("active"):
    print(f"Access granted for {response.json().get('productName')}")`;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="h-9 md:h-10 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl px-4 md:px-5 bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-brand-yellow transition-all"
                >
                    <BookOpen className="w-4 h-4 mr-2" />
                    SaaS Integration
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-zinc-950 border-white/5 text-white max-h-[90vh] overflow-y-auto scrollbar-custom p-0 gap-0">
                <div className="p-8 border-b border-white/5 bg-gradient-to-br from-brand-yellow/10 to-transparent">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-white">
                            <BookOpen className="w-8 h-8 text-brand-yellow" />
                            Integrasi SaaS
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400 font-medium text-sm mt-2 max-w-xl">
                            Pelajari cara menghubungkan produk SaaS eksternal Anda dengan workflow pembayaran dan aktivasi AgencyOS secara otomatis.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-12">
                    {/* Flow Diagram / Steps */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                            <div className="w-8 h-8 rounded-full bg-brand-yellow text-black flex items-center justify-center font-black text-sm">1</div>
                            <h4 className="font-bold text-white text-sm">Automasi Cloud</h4>
                            <p className="text-xs text-zinc-500">User membeli produk di AgencyOS.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                            <div className="w-8 h-8 rounded-full bg-brand-yellow text-black flex items-center justify-center font-black text-sm">2</div>
                            <h4 className="font-bold text-white text-sm">Webhook POST</h4>
                            <p className="text-xs text-zinc-500">Sistem mengirim POST request ke URL SaaS Anda.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                            <div className="w-8 h-8 rounded-full bg-brand-yellow text-black flex items-center justify-center font-black text-sm">3</div>
                            <h4 className="font-bold text-white text-sm">Akses Instan</h4>
                            <p className="text-xs text-zinc-500">SaaS Anda mengaktifkan akses untuk user tersebut.</p>
                        </div>
                    </section>

                    {/* Webhook Payload Section */}
                    <section className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-brand-yellow" />
                                Outgoing Webhook
                            </h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                AgencyOS mengirimkan JSON payload ke <code className="text-white">externalWebhookUrl</code> yang Anda atur di Catalog Produk.
                            </p>
                        </div>
                        <div className="group relative">
                            <pre className="bg-black/50 p-6 rounded-2xl border border-white/5 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre">
                                {webhookExample}
                            </pre>
                            <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-10 w-10 bg-white/5 text-white opacity-0 group-hover:opacity-100 transition-all" onClick={() => copyToClipboard(webhookExample)}>
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] p-4 bg-white/5 rounded-xl border border-white/5">
                            <ul className="space-y-2 text-zinc-400">
                                <li><code className="text-emerald-400">orderId</code>: ID unik transaksi AgencyOS.</li>
                                <li><code className="text-emerald-400">email</code>: Email pembeli (User identifier).</li>
                            </ul>
                            <ul className="space-y-2 text-zinc-400">
                                <li><code className="text-emerald-400">productId</code>: Slug unik produk di Dashboard Admin.</li>
                                <li><code className="text-emerald-400">licenseKey</code>: Lisensi yang digenerate (opsional).</li>
                            </ul>
                        </div>
                    </section>

                    {/* API Verification */}
                    <section className="space-y-4">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black italic uppercase tracking-tight text-white flex items-center gap-2">
                                <Key className="w-5 h-5 text-brand-yellow" />
                                API Verification
                            </h3>
                            <p className="text-sm text-zinc-400 leading-relaxed">
                                SaaS Anda dapat memanggil API ini kapan saja untuk memverifikasi apakah user masih memiliki akses aktif ke produk/slug tertentu.
                            </p>
                        </div>

                        <Tabs defaultValue="nextjs" className="w-full">
                            <TabsList className="bg-white/5 p-1 rounded-xl h-auto flex flex-wrap gap-1 border border-white/10 overflow-x-auto justify-start mb-4">
                                <TabsTrigger value="nextjs" className="data-[state=active]:bg-brand-yellow data-[state=active]:text-black text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-lg">Next.js</TabsTrigger>
                                <TabsTrigger value="node" className="data-[state=active]:bg-brand-yellow data-[state=active]:text-black text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-lg">Node.js</TabsTrigger>
                                <TabsTrigger value="vue" className="data-[state=active]:bg-brand-yellow data-[state=active]:text-black text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-lg">Vue.js</TabsTrigger>
                                <TabsTrigger value="flutter" className="data-[state=active]:bg-brand-yellow data-[state=active]:text-black text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-lg">Flutter</TabsTrigger>
                                <TabsTrigger value="php" className="data-[state=active]:bg-brand-yellow data-[state=active]:text-black text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-lg">PHP</TabsTrigger>
                                <TabsTrigger value="python" className="data-[state=active]:bg-brand-yellow data-[state=active]:text-black text-[10px] uppercase font-black tracking-widest px-4 py-2 rounded-lg">Python</TabsTrigger>
                            </TabsList>

                            <TabsContent value="nextjs" className="mt-0">
                                <div className="group relative">
                                    <pre className="bg-black/50 p-4 rounded-xl border border-white/5 text-[11px] font-mono text-blue-400 overflow-x-auto whitespace-pre">
                                        {nextjsExample}
                                    </pre>
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 bg-white/5 text-white opacity-0 group-hover:opacity-100 transition-all" onClick={() => copyToClipboard(nextjsExample)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="node" className="mt-0">
                                <div className="group relative">
                                    <pre className="bg-black/50 p-4 rounded-xl border border-white/5 text-[11px] font-mono text-blue-400 overflow-x-auto whitespace-pre">
                                        {nodeJsExample}
                                    </pre>
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 bg-white/5 text-white opacity-0 group-hover:opacity-100 transition-all" onClick={() => copyToClipboard(nodeJsExample)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="vue" className="mt-0">
                                <div className="group relative">
                                    <pre className="bg-black/50 p-4 rounded-xl border border-white/5 text-[11px] font-mono text-emerald-400 overflow-x-auto whitespace-pre">
                                        {vueExample}
                                    </pre>
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 bg-white/5 text-white opacity-0 group-hover:opacity-100 transition-all" onClick={() => copyToClipboard(vueExample)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="flutter" className="mt-0">
                                <div className="group relative">
                                    <pre className="bg-black/50 p-4 rounded-xl border border-white/5 text-[11px] font-mono text-blue-400 overflow-x-auto whitespace-pre">
                                        {flutterExample}
                                    </pre>
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 bg-white/5 text-white opacity-0 group-hover:opacity-100 transition-all" onClick={() => copyToClipboard(flutterExample)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="php" className="mt-0">
                                <div className="group relative">
                                    <pre className="bg-black/50 p-4 rounded-xl border border-white/5 text-[11px] font-mono text-indigo-400 overflow-x-auto whitespace-pre">
                                        {phpExample}
                                    </pre>
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 bg-white/5 text-white opacity-0 group-hover:opacity-100 transition-all" onClick={() => copyToClipboard(phpExample)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TabsContent>
                            <TabsContent value="python" className="mt-0">
                                <div className="group relative">
                                    <pre className="bg-black/50 p-4 rounded-xl border border-white/5 text-[11px] font-mono text-brand-yellow overflow-x-auto whitespace-pre">
                                        {pythonExample}
                                    </pre>
                                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 bg-white/5 text-white opacity-0 group-hover:opacity-100 transition-all" onClick={() => copyToClipboard(pythonExample)}>
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </section>

                    {/* Product Slug Mapping Section */}
                    <section className="p-8 rounded-3xl bg-brand-yellow/5 border border-brand-yellow/10 space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Layers className="w-5 h-5 text-brand-yellow" />
                            <h4 className="text-sm font-black uppercase tracking-widest text-brand-yellow">Product Slug Mapping</h4>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed md:text-sm">
                            Gunakan <code className="text-white">Product Slug</code> di dalam kode SaaS Anda untuk menentukan fitur mana yang harus diaktifkan. Anda bisa mendapatkan slug ini dari kolom &quot;Slug&quot; di daftar Produk Admin.
                        </p>
                        <pre className="bg-black/50 p-5 rounded-2xl text-[10px] md:text-xs font-mono text-zinc-500 overflow-x-auto border border-white/5">
{`// Contoh mapping fitur berdasarkan SLUG di sisi SaaS
const FEATURES = {
  "starter-kit": { "storage": "10GB", "users": 1 },
  "premium-tier": { "storage": "unlimited", "users": 10 }
};

const userFeatures = FEATURES[payload.productId]; // productId berisi SLUG`}
                        </pre>
                    </section>

                    {/* Security Alert */}
                    <section className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex gap-4">
                        <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
                        <div>
                            <h5 className="text-sm font-bold text-red-400 uppercase tracking-tight">Security Note</h5>
                            <p className="text-xs text-red-400/70 mt-1 leading-relaxed">
                                Jangan pernah membagikan <code className="bg-red-400/20 px-1 rounded">AGENCY_OS_API_KEY</code> di sisi client (frontend). Selalu lakukan verifikasi status langganan dari server-side SaaS Anda.
                            </p>
                        </div>
                    </section>
                </div>

                <div className="p-8 border-t border-white/5 bg-zinc-900/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10">
                            <AlertCircle className="w-5 h-5 text-zinc-400" />
                        </div>
                        <p className="text-xs text-zinc-400 font-medium max-w-xs">
                            Butuh bantuan integrasi custom? Hubungi tim support engineering AgencyOS.
                        </p>
                    </div>
                    <Link
                        href="/contact"
                        className="w-full md:w-auto px-6 py-3 rounded-xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-brand-yellow transition-colors text-center"
                    >
                        Hubungi Kami
                    </Link>
                </div>
            </DialogContent>
        </Dialog>
    );
}
