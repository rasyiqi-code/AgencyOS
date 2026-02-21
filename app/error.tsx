'use client';

/**
 * Error Boundary untuk halaman di bawah root layout.
 * Menangkap error dari Server Components (termasuk Stack Auth failures)
 * tanpa me-crash seluruh layout.
 */
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex items-center justify-center min-h-[60vh] px-4">
            <div className="text-center max-w-md">
                {/* Icon warning */}
                <div className="text-5xl mb-4">⚠️</div>

                <h2 className="text-xl font-bold text-[#FFB800] mb-3">
                    Terjadi Gangguan Sementara
                </h2>

                <p className="text-gray-400 leading-relaxed mb-6">
                    Halaman ini mengalami masalah. Silakan coba muat ulang halaman.
                </p>

                {/* Digest untuk debugging */}
                {error.digest && (
                    <p className="text-gray-600 text-xs mb-4">
                        Error Digest: {error.digest}
                    </p>
                )}

                <button
                    onClick={reset}
                    className="bg-[#FFB800] text-black font-semibold px-6 py-3 rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                >
                    Coba Lagi
                </button>
            </div>
        </div>
    );
}
