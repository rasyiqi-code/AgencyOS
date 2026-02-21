'use client';

/**
 * Global Error Boundary — menangkap error yang tidak tertangkap di layout.tsx.
 * Ini termasuk error dari StackProvider/Stack Auth API.
 * Ditampilkan sebagai fallback minimal agar user tidak melihat halaman kosong.
 */
export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en" className="dark">
            <body style={{
                backgroundColor: '#000',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                fontFamily: 'Inter, system-ui, sans-serif',
                margin: 0,
                padding: '1rem',
            }}>
                <div style={{ textAlign: 'center', maxWidth: '480px' }}>
                    {/* Icon warning */}
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>

                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        marginBottom: '0.75rem',
                        color: '#FFB800',
                    }}>
                        Terjadi Gangguan Sementara
                    </h2>

                    <p style={{
                        color: '#aaa',
                        lineHeight: 1.6,
                        marginBottom: '1.5rem',
                    }}>
                        Sedang ada masalah pada layanan autentikasi. Silakan coba lagi
                        dalam beberapa saat.
                    </p>

                    {/* Tampilkan digest untuk debugging */}
                    {error.digest && (
                        <p style={{
                            color: '#555',
                            fontSize: '0.75rem',
                            marginBottom: '1rem',
                        }}>
                            Error Digest: {error.digest}
                        </p>
                    )}

                    <button
                        onClick={reset}
                        style={{
                            backgroundColor: '#FFB800',
                            color: '#000',
                            border: 'none',
                            padding: '0.75rem 2rem',
                            borderRadius: '0.5rem',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'opacity 0.2s',
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')}
                        onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                        Coba Lagi
                    </button>
                </div>
            </body>
        </html>
    );
}
