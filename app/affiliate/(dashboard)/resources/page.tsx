
"use client";

import { useEffect, useState } from "react";
import { Copy, Download, Code, Check, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface MarketingAsset {
    id: string;
    type: 'banner' | 'copy' | 'widget';
    title: string;
    content?: string;
    imageUrl?: string;
    category?: string;
}

export default function MarketingKitPage() {
    const [assets, setAssets] = useState<MarketingAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [referralCode, setReferralCode] = useState<string>("");
    const [agencyName, setAgencyName] = useState<string>("Agency OS");

    // Fetch user profile and settings
    useEffect(() => {
        // Fetch agency name from public endpoint
        fetch("/api/public/agency-info").then(res => res.json()).then(data => {
            if (data.AGENCY_NAME) setAgencyName(data.AGENCY_NAME);
        }).catch(() => { });

        // We can fetch from session or dedicated endpoint
        fetch("/api/marketing/affiliate/stats").then(res => {
            if (res.ok) return res.json();
            return null;
        }).then(data => {
            if (data && data.referralCode) setReferralCode(data.referralCode);
        }).catch(err => console.error(err));

        // Fetch assets
        fetch("/api/marketing/assets").then(res => {
            if (res.ok) return res.json();
            return [];
        }).then(data => setAssets(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const processContent = (content: string) => {
        // Replace {{REF_CODE}} or {{REF_LINK}}
        const refLink = `${window.location.origin}?ref=${referralCode}`;
        let processed = content.replace(/{{REF_CODE}}/g, referralCode);
        processed = processed.replace(/{{REF_LINK}}/g, refLink);
        return processed;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard!");
    };

    const downloadImage = (url: string, filename: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Filter helper
    const getAssets = (type: string) => assets.filter(a => a.type === type);

    if (loading) return <div className="p-8 text-zinc-500">Loading assets...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Marketing Kit</h1>
                <p className="text-zinc-400">Official assets to help you promote and earn commission.</p>
            </div>

            <Tabs defaultValue="copy" className="w-full">
                <TabsList className="bg-zinc-900 border border-zinc-800">
                    <TabsTrigger value="copy">Copywriting</TabsTrigger>
                    <TabsTrigger value="banner">Banners</TabsTrigger>
                    <TabsTrigger value="banner_widget">Banner Ads</TabsTrigger>
                    <TabsTrigger value="widget">Widgets</TabsTrigger>
                </TabsList>

                {/* Copywriting Tab */}
                <TabsContent value="copy" className="mt-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {getAssets('copy').map(asset => {
                            const finalContent = processContent(asset.content || "");
                            return (
                                <Card key={asset.id} className="bg-zinc-900 border-zinc-800">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="text-xs bg-black border-zinc-800 text-zinc-400">{asset.category || "General"}</Badge>
                                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(finalContent)}>
                                                <Copy className="w-4 h-4 mr-2" /> Copy
                                            </Button>
                                        </div>
                                        <CardTitle className="text-base text-white mt-2">{asset.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center justify-between text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                                            <span>Live Preview</span>
                                            <span className="text-blue-500">Variables Processed</span>
                                        </div>
                                        <div className="bg-zinc-950 p-5 rounded-lg text-sm text-zinc-300 font-sans border border-zinc-800 leading-relaxed min-h-[100px]">
                                            {finalContent}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {getAssets('copy').length === 0 && <div className="text-zinc-500 col-span-full text-center py-10">No copywriting assets available.</div>}
                    </div>
                </TabsContent>

                {/* Banners Tab */}
                <TabsContent value="banner" className="mt-6 space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {getAssets('banner').map(asset => (
                            <Card key={asset.id} className="bg-zinc-900 border-zinc-800 overflow-hidden">
                                <div className="aspect-video bg-black relative group">
                                    <img src={asset.imageUrl || ""} alt={asset.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => downloadImage(asset.imageUrl || "", `banner-${asset.id}.png`)}>
                                            <Download className="w-4 h-4 mr-2" /> Download
                                        </Button>
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <Badge variant="outline" className="text-[10px] bg-black border-zinc-800 text-zinc-400">{asset.category || "Social"}</Badge>
                                    </div>
                                    <h3 className="font-medium text-white line-clamp-1" title={asset.title}>{asset.title}</h3>

                                    <div className="mt-4 pt-4 border-t border-zinc-800/50">
                                        <p className="text-xs text-zinc-500 mb-2">Embed Code (HTML)</p>
                                        <div className="flex bg-black rounded border border-zinc-800 p-1">
                                            <code className="text-[10px] text-zinc-400 font-mono flex-1 overflow-hidden whitespace-nowrap px-2 py-1">
                                                {`<a href="${window.location.origin}?ref=${referralCode}"><img src="${asset.imageUrl}" alt="${asset.title}" /></a>`}
                                            </code>
                                            <button onClick={() => copyToClipboard(`<a href="${window.location.origin}?ref=${referralCode}"><img src="${asset.imageUrl}" alt="${asset.title}" /></a>`)} className="p-1 hover:text-white text-zinc-500">
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {getAssets('banner').length === 0 && <div className="text-zinc-500 col-span-full text-center py-10">No banners available.</div>}
                    </div>
                </TabsContent>

                {/* Banner Ads Tab */}
                <TabsContent value="banner_widget" className="mt-6 space-y-4">
                    <div className="grid gap-6">
                        {getAssets('banner_widget').map(asset => (
                            <Card key={asset.id} className="bg-zinc-900 border-zinc-800 border-l-4 border-l-purple-600">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <ImageIcon className="w-5 h-5 text-purple-500" />
                                            Banner Ad Widget: {asset.title}
                                        </CardTitle>
                                        <Badge variant="outline" className="bg-purple-900/20 text-purple-400 border-purple-800">Dynamic</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="aspect-[3/1] bg-black/50 rounded-lg overflow-hidden border border-zinc-800">
                                        <img src={asset.imageUrl} alt={asset.title} className="w-full h-full object-cover" />
                                    </div>
                                    <p className="text-sm text-zinc-400">
                                        This banner will automatically update if the admin changes the official artwork.
                                        Copy the code below to embed this specific banner on your site.
                                    </p>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-zinc-500 font-mono">Embed Script</span>
                                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`<script src="${window.location.origin}/widgets/banner-ad.js" data-host="${window.location.origin}" data-id="${asset.id}" data-ref="${referralCode}"></script>`)}>
                                                <Copy className="w-4 h-4 mr-2" /> Copy
                                            </Button>
                                        </div>
                                        <div className="bg-black p-3 rounded-lg border border-zinc-800 font-mono text-xs text-purple-400 overflow-x-auto">
                                            {`<script src="${window.location.origin}/widgets/banner-ad.js" data-host="${window.location.origin}" data-id="${asset.id}" data-ref="${referralCode}"></script>`}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {getAssets('banner_widget').length === 0 && <div className="text-zinc-500 py-10 text-center">No managed banner ads available yet.</div>}
                    </div>
                </TabsContent>

                {/* Widgets Tab */}
                <TabsContent value="widget" className="mt-6 space-y-4">
                    {/* Built-in Default Widget Section */}
                    <Card className="bg-zinc-900 border-zinc-800 border-l-4 border-l-blue-600">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-600 hover:bg-blue-600">Built-in</Badge>
                                    Floating Affiliate Badge
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-zinc-400">
                                This is a smart floating badge that appears at the bottom-right of any website.
                                It's designed to be non-intrusive yet effective for conversion.
                            </p>

                            <div className="bg-black/50 p-4 rounded-lg border border-zinc-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Preview Behavior</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-zinc-950 border border-zinc-800 rounded-full px-4 py-2 flex items-center gap-3 shadow-lg">
                                        <span className="text-xs text-white">Powered by <strong>{agencyName}</strong></span>
                                        <span className="bg-white text-black text-[10px] font-bold px-2 py-1 rounded-full">Learn More</span>
                                    </div>
                                    <span className="text-xs text-zinc-600">← This will float on the guest's site.</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500 font-mono">Quick Embed Code</span>
                                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`<script src="${window.location.origin}/widgets/affiliate-badge.js" data-ref="${referralCode}" data-name="${agencyName}"></script>`)}>
                                        <Copy className="w-4 h-4 mr-2" /> Copy Code
                                    </Button>
                                </div>
                                <div className="bg-black p-4 rounded-lg border border-zinc-800 font-mono text-xs text-blue-400 overflow-x-auto whitespace-pre">
                                    {`<script 
  src="${window.location.origin}/widgets/affiliate-badge.js" 
  data-ref="${referralCode}"
  data-name="${agencyName}"
></script>`}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-zinc-800"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-950 px-2 text-zinc-500 font-medium">Custom Admin Widgets</span></div>
                    </div>

                    <div className="grid gap-6">

                        {getAssets('widget').map(asset => {
                            const finalContent = processContent(asset.content || "");
                            return (
                                <Card key={asset.id} className="bg-zinc-900 border-zinc-800">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <Code className="w-5 h-5 text-blue-500" />
                                            {asset.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-2">
                                                <ImageIcon className="w-3 h-3" /> Preview Behavior
                                            </div>
                                            <div className="bg-zinc-950 p-6 rounded-lg border border-zinc-800/50 flex items-center justify-center min-h-[120px]">
                                                <div className="text-center space-y-2">
                                                    <Code className="w-8 h-8 text-blue-900 mx-auto opacity-40" />
                                                    <p className="text-xs text-zinc-600 max-w-[200px]">This custom widget will render dynamically based on the provided script.</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-zinc-500 font-mono">Embed Code</span>
                                                <Button size="sm" variant="ghost" onClick={() => copyToClipboard(finalContent)}>
                                                    <Copy className="w-4 h-4 mr-2" /> Copy Code
                                                </Button>
                                            </div>
                                            <div className="bg-black p-4 rounded-lg border border-zinc-800 font-mono text-xs text-green-400 overflow-x-auto whitespace-pre">
                                                {finalContent}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                        {getAssets('widget').length === 0 && <div className="text-zinc-500 py-10 text-center">No widgets available.</div>}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
