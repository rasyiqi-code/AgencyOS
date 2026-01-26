export function ExpertProfile() {
    return (
        <section className="py-24 bg-black">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12 max-w-5xl mx-auto rounded-3xl bg-zinc-900/30 border border-white/5 p-8 md:p-12">
                    <div className="shrink-0 text-center">
                        <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-white/10 mx-auto mb-4 bg-zinc-800">
                            {/* Placeholder for Expert Photo */}
                            <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                                FOTO ANDA
                            </div>
                        </div>
                        <h3 className="text-white font-bold text-lg">Rasyiqi</h3>
                        <p className="text-indigo-400 text-sm">Senior Fullstack Developer</p>
                    </div>

                    <div className="flex-1 space-y-6 text-center md:text-left">
                        <h2 className="text-3xl font-bold text-white">
                            &ldquo;Satu Otak Manusia, Didukung Kecerdasan Mesin.&rdquo;
                        </h2>
                        <div className="space-y-4 text-zinc-400 leading-relaxed">
                            <p>
                                Banyak klien bertanya: &apos;Apakah kodenya dibuat oleh robot?&apos;
                            </p>
                            <p>
                                Jawabannya: <strong>AI adalah tukang batu, saya Arsiteknya.</strong>
                            </p>
                            <p>
                                Saya menggunakan AI untuk menghilangkan pekerjaan membosankan (boilerplate, CSS, admin), sehingga saya bisa fokus 100% pada logika bisnis, keamanan data, dan performa aplikasi Anda.
                            </p>
                            <p className="text-white font-medium pt-2">
                                Hasilnya? Kualitas Enterprise Agency, dengan kecepatan dan harga Freelancer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
