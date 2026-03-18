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
import { BookOpen, Copy, Check, Smartphone, Globe, Terminal, Code2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LicenseIntegrationGuide() {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const origin = mounted ? window.location.origin : "https://your-domain.com";

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        toast.success("Code copied to clipboard");
        setTimeout(() => setCopied(null), 2000);
    };

    const phpCode = `<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class AgencyOS_License_Checker {
    private $api_url = '${origin}/api/public/verify-license'; 
    private $productSlug;
    private $option_name;

    public function __construct( $productSlug ) {
        $this->productSlug = $productSlug;
        $this->option_name = 'agencyos_license_' . $productSlug;

        add_action( 'admin_menu', [ $this, 'register_license_menu' ] );
        add_action( 'admin_init', [ $this, 'register_settings' ] );
        
        if ( ! get_transient( $this->option_name . '_check' ) ) {
            $this->validate_license();
        }
    }

    public function register_license_menu() {
        add_theme_page('Theme License', 'Theme License', 'manage_options', $this->productSlug . '-license', [ $this, 'render_license_page' ]);
    }

    public function register_settings() {
        register_setting( $this->productSlug . '_license_group', $this->option_name );
    }

    public function render_license_page() {
        $license_key = get_option( $this->option_name );
        $status = get_option( $this->option_name . '_status' );
        ?>
        <div class="wrap">
            <h1>Activate Your Product</h1>
            <form method="post" action="options.php">
                <?php settings_fields( $this->productSlug . '_license_group' ); ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">License Key</th>
                        <td><input type="text" name="<?php echo esc_attr( $this->option_name ); ?>" value="<?php echo esc_attr( $license_key ); ?>" class="regular-text" /></td>
                    </tr>
                    <tr valign="top">
                        <th scope="row">Status</th>
                        <td>
                            <?php if ( $status === 'active' ) : ?>
                                <span style="color: green; font-weight: bold;">ACTIVE</span>
                            <?php else : ?>
                                <span style="color: red; font-weight: bold;">INACTIVE</span>
                            <?php endif; ?>
                        </td>
                    </tr>
                </table>
                <?php submit_button( 'Save & Activate' ); ?>
            </form>
        </div>
        <?php
    }

    public function validate_license() {
        $key = get_option( $this->option_name );
        if ( empty( $key ) ) return;
        $domain = parse_url( site_url(), PHP_URL_HOST );

        $response = wp_remote_post( $this->api_url, [
            'body' => json_encode(['key' => $key, 'productSlug' => $this->productSlug, 'domain' => $domain]),
            'headers' => [ 'Content-Type' => 'application/json' ],
            'timeout' => 15
        ]);

        if ( is_wp_error( $response ) ) return;
        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( isset( $body['valid'] ) && $body['valid'] === true ) {
            update_option( $this->option_name . '_status', 'active' );
            set_transient( $this->option_name . '_check', 'valid', DAY_IN_SECONDS );
        } else {
            update_option( $this->option_name . '_status', 'invalid' );
            delete_transient( $this->option_name . '_check' );
        }
    }

    public function is_active() {
        return get_option( $this->option_name . '_status' ) === 'active';
    }
}`;

    const kotlinCode = `// Use Retrofit or OkHttp for network requests
// Body request: { "key": "...", "productSlug": "...", "machineId": "..." }

suspend fun verifyLicense(key: String, productSlug: String, deviceId: String): Boolean {
    val url = URL("${origin}/api/public/verify-license")
    val connection = url.openConnection() as HttpURLConnection
    
    return try {
        connection.requestMethod = "POST"
        connection.setRequestProperty("Content-Type", "application/json")
        connection.doOutput = true
        
        val body = """{"key": "$key", "productSlug": "$productSlug", "machineId": "$deviceId"}"""
        connection.outputStream.use { it.write(body.toByteArray()) }
        
        val response = connection.inputStream.bufferedReader().readText()
        val isValid = response.contains("\\"valid\\":true")
        isValid
    } catch (e: Exception) {
        false
    } finally {
        connection.disconnect()
    }
}`;

    const nodeCode = `const verifyLicense = async (key, productSlug, machineId) => {
  try {
    const response = await fetch('${origin}/api/public/verify-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, productSlug, machineId })
    });
    
    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error('License verification failed:', error);
    return false;
  }
};`;

    const curlCode = `curl -X POST ${origin}/api/public/verify-license \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "YOUR_LICENSE_KEY",
    "productSlug": "your-product-slug",
    "machineId": "unique-device-id"
  }'`;

    const pythonCode = `import requests

def verify_license(key, productSlug, machineId):
    url = "${origin}/api/public/verify-license"
    payload = {
        "key": key,
        "productSlug": productSlug,
        "machineId": machineId
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()
        return data.get("valid", False)
    except Exception as e:
        print(f"License verification failed: {e}")
        return False`;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="h-9 md:h-10 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl px-4 md:px-5 border-white/5 bg-white/5 hover:bg-white/10 gap-2">
                    <BookOpen className="w-4 h-4" />
                    Integration Guide
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 bg-zinc-950 border-white/5 text-zinc-100 shadow-2xl overflow-hidden rounded-2xl">
                <DialogHeader className="p-6 pb-2 border-b border-white/5 bg-white/[0.02]">
                    <DialogTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">License Integration</DialogTitle>
                    <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-1">
                        Connect your applications to the AgencyOS License Server.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="wordpress" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 border-b border-white/5 bg-white/[0.01]">
                        <TabsList className="bg-transparent h-12 gap-6">
                            <TabsTrigger value="wordpress" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-yellow data-[state=active]:border-b-2 border-brand-yellow rounded-none px-0 h-12 text-[10px] font-black uppercase tracking-widest gap-2">
                                <Globe className="w-3.5 h-3.5" /> WordPress
                            </TabsTrigger>
                            <TabsTrigger value="android" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-yellow data-[state=active]:border-b-2 border-brand-yellow rounded-none px-0 h-12 text-[10px] font-black uppercase tracking-widest gap-2">
                                <Smartphone className="w-3.5 h-3.5" /> Android
                            </TabsTrigger>
                            <TabsTrigger value="nodejs" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-yellow data-[state=active]:border-b-2 border-brand-yellow rounded-none px-0 h-12 text-[10px] font-black uppercase tracking-widest gap-2">
                                <Code2 className="w-3.5 h-3.5" /> Node.js
                            </TabsTrigger>
                            <TabsTrigger value="python" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-yellow data-[state=active]:border-b-2 border-brand-yellow rounded-none px-0 h-12 text-[10px] font-black uppercase tracking-widest gap-2">
                                <Code2 className="w-3.5 h-3.5" /> Python
                            </TabsTrigger>
                            <TabsTrigger value="rest" className="data-[state=active]:bg-transparent data-[state=active]:text-brand-yellow data-[state=active]:border-b-2 border-brand-yellow rounded-none px-0 h-12 text-[10px] font-black uppercase tracking-widest gap-2">
                                <Terminal className="w-3.5 h-3.5" /> REST API
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-6">
                            <TabsContent value="wordpress" className="mt-0 space-y-6">
                                <Section title="1. API Endpoint" origin={origin} />
                                <CodeSection 
                                    title="2. PHP Helper Class" 
                                    code={phpCode} 
                                    lang="php" 
                                    copied={copied} 
                                    onCopy={copyToClipboard}
                                    description="Save as includes/class-agencyos-license.php"
                                />
                            </TabsContent>

                            <TabsContent value="android" className="mt-0 space-y-6">
                                <Section title="1. API Endpoint" origin={origin} />
                                <CodeSection 
                                    title="2. Kotlin Implementation" 
                                    code={kotlinCode} 
                                    lang="kotlin" 
                                    copied={copied} 
                                    onCopy={copyToClipboard}
                                    description="Core verification logic using HttpURLConnection"
                                />
                            </TabsContent>

                            <TabsContent value="nodejs" className="mt-0 space-y-6">
                                <Section title="1. API Endpoint" origin={origin} />
                                <CodeSection 
                                    title="2. Javascript Implementation" 
                                    code={nodeCode} 
                                    lang="javascript" 
                                    copied={copied} 
                                    onCopy={copyToClipboard}
                                    description="Using modern Fetch API"
                                />
                            </TabsContent>

                            <TabsContent value="python" className="mt-0 space-y-6">
                                <Section title="1. API Endpoint" origin={origin} />
                                <CodeSection 
                                    title="2. Python Implementation" 
                                    code={pythonCode} 
                                    lang="python" 
                                    copied={copied} 
                                    onCopy={copyToClipboard}
                                    description="Using the requests library"
                                />
                            </TabsContent>

                            <TabsContent value="rest" className="mt-0 space-y-6">
                                <Section title="1. API cURL" origin={origin} />
                                <CodeSection 
                                    title="2. Generic Call" 
                                    code={curlCode} 
                                    lang="bash" 
                                    copied={copied} 
                                    onCopy={copyToClipboard}
                                    description="Test your integration via terminal"
                                />
                            </TabsContent>
                        </div>
                    </ScrollArea>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

function Section({ title, origin }: { title: string; origin: string }) {
    return (
        <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-brand-yellow px-1 border-l-2 border-brand-yellow">{title}</h3>
            <div className="bg-black/40 p-5 rounded-2xl border border-white/5 font-mono text-[11px] relative group shadow-inner">
                <div className="flex items-center gap-2 mb-3 text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                    <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded-lg border border-green-500/10">POST</span>
                    <span>verify-license</span>
                </div>
                <div className="text-zinc-400 select-all font-bold">
                    {origin}/api/public/verify-license
                </div>
            </div>
        </div>
    );
}

interface CodeSectionProps {
    title: string;
    code: string;
    lang: string;
    copied: string | null;
    onCopy: (text: string, id: string) => void;
    description: string;
}

function CodeSection({ title, code, lang, copied, onCopy, description }: CodeSectionProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-yellow px-1 border-l-2 border-brand-yellow">{title}</h3>
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 gap-2 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 rounded-lg"
                    onClick={() => onCopy(code, lang)}
                >
                    {copied === lang ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === lang ? 'Copied' : 'Copy Code'}
                </Button>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-zinc-500 mb-2">
                {description}
            </p>
            <div className="relative group">
                <pre className="bg-black/40 p-6 rounded-2xl border border-white/5 overflow-x-auto text-[11px] font-mono leading-relaxed text-zinc-400 custom-scrollbar shadow-inner">
                    {code}
                </pre>
            </div>
        </div>
    );
}
