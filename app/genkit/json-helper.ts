/**
 * Helper utilitas untuk membersihkan dan menormalisasi JSON response dari AI.
 * Terutama digunakan untuk menangani respon tidak konsisten dari model open-source/Nvidia NIM.
 */

/**
 * Membersihkan noise sintaksis JSON yang sering dihasilkan oleh LLM.
 */
export function cleanBrokenJson(text: string): string {
    let clean = text.trim();
    
    // Hapus markdown code block wrapper jika ada
    clean = clean.replace(/^```json\s*/i, '');
    clean = clean.replace(/^```\s*/, '');
    clean = clean.replace(/```$/, '');
    clean = clean.trim();
    
    // Hapus tanda hubung liar yang kadang muncul sebelum kurung penutup, e.g. -}, atau -]
    clean = clean.replace(/-\s*([}\],])/g, '$1');
    
    // Hapus koma gantung (trailing comma) sebelum kurung penutup
    // e.g. ,} -> } atau ,] -> ]
    clean = clean.replace(/,\s*([}\]])/g, '$1');
    
    return clean;
}

/**
 * Menormalisasi struktur JSON agar sesuai dengan skema yang didefinisikan di Genkit flow.
 */
export function normalizeJsonOutput(parsed: any): any {
    if (typeof parsed !== 'object' || parsed === null) {
        return parsed;
    }
    
    // Salin objek agar tidak merubah aslinya secara langsung
    const data = { ...parsed };
    
    // 1. Normalisasi features & features_id jika model mengembalikan array of object
    if (Array.isArray(data.features)) {
        const firstItem = data.features[0];
        if (firstItem && typeof firstItem === 'object') {
            const enFeatures: string[] = [];
            const idFeatures: string[] = [];
            
            for (const item of data.features) {
                if (item && typeof item === 'object') {
                    // Ambil nilai bahasa Inggris
                    const enVal = item.feature || item.text || item.name || JSON.stringify(item);
                    // Ambil nilai bahasa Indonesia
                    const idVal = item.feature_id || item.text_id || item.name_id || enVal;
                    enFeatures.push(String(enVal));
                    idFeatures.push(String(idVal));
                } else {
                    enFeatures.push(String(item));
                    idFeatures.push(String(item));
                }
            }
            
            data.features = enFeatures;
            
            // Isi features_id jika belum diisi atau kosong
            if (!data.features_id || !Array.isArray(data.features_id) || data.features_id.length === 0) {
                data.features_id = idFeatures;
            }
        }
    }
    
    // 2. Normalisasi addons
    if (Array.isArray(data.addons)) {
        data.addons = data.addons.map((addon: any) => {
            if (typeof addon !== 'object' || addon === null) return addon;
            const newAddon = { ...addon };
            
            // Petakan recommended_price ke price jika ada recommended_price tetapi price tidak didefinisikan
            if (newAddon.price === undefined && newAddon.recommended_price !== undefined) {
                newAddon.price = Number(newAddon.recommended_price);
            }
            
            // Pastikan price adalah tipe number
            if (newAddon.price !== undefined) {
                newAddon.price = Number(newAddon.price);
            }
            
            // Samakan currency add-on dengan currency utama jika tidak ada
            if (!newAddon.currency && data.currency) {
                newAddon.currency = data.currency;
            }
            
            // Pastikan enum interval add-on bernilai valid
            if (newAddon.interval) {
                const lower = String(newAddon.interval).toLowerCase();
                if (lower === 'onetime' || lower === 'one-time' || lower === 'one_time') {
                    newAddon.interval = 'one_time';
                } else if (lower === 'monthly' || lower === 'month') {
                    newAddon.interval = 'monthly';
                } else if (lower === 'yearly' || lower === 'year') {
                    newAddon.interval = 'yearly';
                }
            } else {
                newAddon.interval = 'one_time';
            }
            
            // Hapus field recommended_price cadangan agar struktur clean
            delete newAddon.recommended_price;
            
            return newAddon;
        });
    }
    
    // 3. Normalisasi field harga utama
    if (data.recommended_price !== undefined) {
        data.recommended_price = Number(data.recommended_price);
    }
    if (data.original_price !== undefined && data.original_price !== null) {
        data.original_price = Number(data.original_price);
    }
    
    // 4. Normalisasi enum interval utama
    if (data.interval) {
        const lower = String(data.interval).toLowerCase();
        if (lower === 'onetime' || lower === 'one-time' || lower === 'one_time') {
            data.interval = 'one_time';
        } else if (lower === 'monthly' || lower === 'month') {
            data.interval = 'monthly';
        } else if (lower === 'yearly' || lower === 'year') {
            data.interval = 'yearly';
        }
    }
    
    // 5. Normalisasi enum currency utama
    if (data.currency) {
        const upper = String(data.currency).toUpperCase();
        if (upper === 'USD' || upper === 'IDR') {
            data.currency = upper;
        }
    }
    
    // 6. Normalisasi enum priceType utama
    if (data.priceType) {
        const upper = String(data.priceType).toUpperCase();
        if (upper === 'FIXED' || upper === 'STARTING_AT') {
            data.priceType = upper;
        }
    }
    
    return data;
}
