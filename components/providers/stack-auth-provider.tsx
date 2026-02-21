'use client';

import React, { type ComponentProps } from 'react';
import { StackProvider, StackTheme } from '@stackframe/stack';

/**
 * Wrapper resilient untuk StackProvider.
 * Menangkap error yang terjadi saat StackProvider mencoba fetch user data
 * dari Stack Auth API dan menampilkan children tanpa auth context jika gagal.
 *
 * Ini mencegah seluruh aplikasi crash ketika Stack Auth API mengalami masalah,
 * sementara halaman publik tetap bisa diakses.
 */

interface Props {
    /** Tipe app diambil langsung dari StackProvider agar selalu sinkron */
    app: ComponentProps<typeof StackProvider>['app'];
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary khusus untuk StackProvider.
 * Jika StackProvider gagal (misal: Stack Auth API 404/500),
 * children tetap di-render tanpa auth context.
 */
export class ResilientStackProvider extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error(
            '[ResilientStackProvider] Stack Auth initialization failed:',
            error.message
        );
        console.error('[ResilientStackProvider] Error info:', errorInfo);
    }

    render(): React.ReactNode {
        // Jika StackProvider error, render children tanpa auth context
        if (this.state.hasError) {
            return (
                <>
                    {this.props.children}
                    {/* Banner notifikasi bahwa auth sedang bermasalah */}
                    <div
                        style={{
                            position: 'fixed',
                            bottom: '1rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #333',
                            borderRadius: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.875rem',
                            color: '#FFB800',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        }}
                    >
                        <span>⚠️</span>
                        <span>Layanan autentikasi sedang gangguan. Fitur login mungkin terbatas.</span>
                    </div>
                </>
            );
        }

        // Normal: render dengan StackProvider + StackTheme
        return (
            <StackProvider app={this.props.app}>
                <StackTheme>
                    {this.props.children}
                </StackTheme>
            </StackProvider>
        );
    }
}
