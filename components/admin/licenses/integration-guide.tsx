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
import { BookOpen, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

export function LicenseIntegrationGuide() {
    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const origin = mounted ? window.location.origin : "https://your-domain.com";

    useEffect(() => {
        // Use timeout to avoid "setState in effect" warning (synchronous update)
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
    // AgencyOS URL (Auto-detected)
    private $api_url = '${origin}/api/public/verify-license'; 
    private $product_slug;
    private $option_name;

    public function __construct( $product_slug ) {
        $this->product_slug = $product_slug;
        $this->option_name = 'agencyos_license_' . $product_slug;

        add_action( 'admin_menu', [ $this, 'register_license_menu' ] );
        add_action( 'admin_init', [ $this, 'register_settings' ] );
        
        // Daily check or on update
        if ( ! get_transient( $this->option_name . '_check' ) ) {
            $this->validate_license();
        }
    }

    public function register_license_menu() {
        add_theme_page(
            'Theme License',
            'Theme License',
            'manage_options',
            $this->product_slug . '-license',
            [ $this, 'render_license_page' ]
        );
    }

    public function register_settings() {
        register_setting( $this->product_slug . '_license_group', $this->option_name );
    }

    public function render_license_page() {
        $license_key = get_option( $this->option_name );
        $status = get_option( $this->option_name . '_status' );
        ?>
        <div class="wrap">
            <h1>Activate Your Theme</h1>
            <form method="post" action="options.php">
                <?php settings_fields( $this->product_slug . '_license_group' ); ?>
                <?php do_settings_sections( $this->product_slug . '_license_group' ); ?>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">License Key</th>
                        <td>
                            <input type="text" 
                                name="<?php echo esc_attr( $this->option_name ); ?>" 
                                value="<?php echo esc_attr( $license_key ); ?>" 
                                class="regular-text" />
                        </td>
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
            'body' => json_encode([
                'key' => $key,
                'productSlug' => $this->product_slug,
                'device' => $domain
            ]),
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

    const usageCode = `require_once get_template_directory() . '/includes/class-agencyos-license.php';

// Initialize with your product SLUG
$license_checker = new AgencyOS_License_Checker( 'my-awesome-theme' );

// Protect features
function my_theme_premium_feature() {
    global $license_checker;
    
    if ( ! $license_checker->is_active() ) {
        return "Please activate license.";
    }
    
    // ... Premium code ...
}`;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    Integration Guide
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 bg-zinc-950 border-zinc-800 text-zinc-100">
                <DialogHeader className="p-6 pb-2 border-b border-zinc-800">
                    <DialogTitle className="text-xl">WordPress Integration Guide</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        How to connect your WordPress themes/plugins to the AgencyOS License Server.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-8">
                        {/* Section 1 */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-brand-yellow">1. API Endpoint</h3>
                            <div className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 font-mono text-sm relative group">
                                <div className="flex items-center gap-2 mb-2 text-zinc-500 text-xs uppercase tracking-wider">
                                    <span className="bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded">POST</span>
                                    <span>verify-license</span>
                                </div>
                                <div className="text-zinc-300">
                                    {origin}/api/public/verify-license
                                </div>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-brand-yellow">2. PHP Helper Class</h3>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 gap-2 text-zinc-400 hover:text-white"
                                    onClick={() => copyToClipboard(phpCode, 'php')}
                                >
                                    {copied === 'php' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    {copied === 'php' ? 'Copied' : 'Copy Code'}
                                </Button>
                            </div>
                            <p className="text-sm text-zinc-400 mb-2">
                                Save this as <code>includes/class-agencyos-license.php</code> in your theme/plugin.
                            </p>
                            <div className="relative">
                                <pre className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 overflow-x-auto text-sm font-mono leading-relaxed text-zinc-300">
                                    {phpCode}
                                </pre>
                            </div>
                        </div>

                        {/* Section 3 */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-brand-yellow">3. Implementation</h3>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 gap-2 text-zinc-400 hover:text-white"
                                    onClick={() => copyToClipboard(usageCode, 'usage')}
                                >
                                    {copied === 'usage' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    {copied === 'usage' ? 'Copied' : 'Copy Code'}
                                </Button>
                            </div>
                            <p className="text-sm text-zinc-400 mb-2">
                                Add this to your <code>functions.php</code> to initialize the checker.
                            </p>
                            <div className="relative">
                                <pre className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 overflow-x-auto text-sm font-mono leading-relaxed text-zinc-300">
                                    {usageCode}
                                </pre>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
