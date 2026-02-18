"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, Package, Globe, Layers } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    type: string;
    description?: string | null;
}

interface Service {
    id: string;
    title: string;
    price: number;
    description?: string;
}

interface AffiliateLinksManagerProps {
    referralCode: string;
    products: Product[];
    services: Service[];
    baseUrl?: string;
}

export function AffiliateLinksManager({
    referralCode,
    products,
    services,
    baseUrl = "https://agencyos.dev"
}: AffiliateLinksManagerProps) {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Helper to generate link
    const getLink = (path: string) => {
        const url = new URL(path, baseUrl);
        url.searchParams.set("ref", referralCode);
        return url.toString();
    };

    // Helper to copy to clipboard
    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Link copied to clipboard!");

        setTimeout(() => {
            setCopiedId(null);
        }, 2000);
    };

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur">
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="text-xl font-bold text-white">Affiliate Links</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Generate and share specific links to earn commissions.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="bg-zinc-950/50 border border-zinc-800 p-1 mb-6">
                        <TabsTrigger value="general" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                            <Globe className="w-4 h-4 mr-2" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="products" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                            <Package className="w-4 h-4 mr-2" />
                            Products ({products.length})
                        </TabsTrigger>
                        <TabsTrigger value="services" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
                            <Layers className="w-4 h-4 mr-2" />
                            Services ({services.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="p-4 rounded-lg bg-zinc-950/30 border border-dashed border-zinc-800">
                            <h3 className="text-sm font-medium text-zinc-200 mb-2">Homepage Referral</h3>
                            <p className="text-xs text-zinc-500 mb-4">
                                Direct visitors to the main landing page. Best for general audience.
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={getLink("/")}
                                    className="bg-zinc-900/50 border-zinc-700 font-mono text-zinc-400"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(getLink("/"), "general")}
                                    className="border-zinc-700 hover:bg-zinc-800"
                                >
                                    {copiedId === "general" ? (
                                        <Check className="h-4 w-4 text-emerald-500" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-zinc-400" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Products Tab */}
                    <TabsContent value="products" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid gap-4">
                            {products.length > 0 ? (
                                products.map((product) => {
                                    const link = getLink(`/products/${product.slug}`);
                                    return (
                                        <div key={product.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-zinc-950/30 border border-zinc-800 hover:border-zinc-700 transition-all">
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-zinc-200">{product.name}</h3>
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-zinc-700 text-zinc-400">
                                                        ${product.price}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-zinc-500 line-clamp-1">
                                                    {product.description || "No description available."}
                                                </p>
                                                <div className="flex items-center gap-2 pt-1">
                                                    <Link href={link} target="_blank" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                                        Preview <ExternalLink className="h-3 w-3" />
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <Input
                                                    readOnly
                                                    value={link}
                                                    className="bg-zinc-900/50 border-zinc-700 font-mono text-xs text-zinc-400 h-9 min-w-[200px]"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => copyToClipboard(link, product.id)}
                                                    className="border-zinc-700 hover:bg-zinc-800 h-9 w-9 shrink-0"
                                                >
                                                    {copiedId === product.id ? (
                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="h-4 w-4 text-zinc-400" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                                    No products available for promotion.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Services Tab */}
                    <TabsContent value="services" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid gap-4">
                            {services.length > 0 ? (
                                services.map((service) => {
                                    // Assuming service detail page is /services/[id] or just checkout link
                                    // For now, let's point to /services/[id] if it exists, or just append query param if not
                                    // Assuming standard route: /services
                                    const link = getLink(`/services`); // Or specific service page if exists

                                    return (
                                        <div key={service.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg bg-zinc-950/30 border border-zinc-800 hover:border-zinc-700 transition-all">
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium text-zinc-200">{service.title}</h3>
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-zinc-700 text-zinc-400">
                                                        ${service.price}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-zinc-500 line-clamp-1">
                                                    {service.description || "No description available."}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                                <Input
                                                    readOnly
                                                    value={link}
                                                    className="bg-zinc-900/50 border-zinc-700 font-mono text-xs text-zinc-400 h-9 min-w-[200px]"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => copyToClipboard(link, service.id)}
                                                    className="border-zinc-700 hover:bg-zinc-800 h-9 w-9 shrink-0"
                                                >
                                                    {copiedId === service.id ? (
                                                        <Check className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <Copy className="h-4 w-4 text-zinc-400" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
                                    No services available for promotion.
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
