'use server';

import PocketBase, { ClientResponseError } from 'pocketbase';

// Definisikan tipe untuk hasil yang akan dikembalikan
export type KelulusanResult = {
    nama_lengkap: string;
    nomor_pendaftaran: string;
    status: 'LULUS' | 'TIDAK LULUS' | 'PROSES SELEKSI';
    jurusan_diterima: string;
    // PERUBAHAN: Tambahkan field baru
    jalur_pendaftaran?: string;
} | {
    error: string;
};

export async function checkKelulusan(nomorPendaftaran: string): Promise<KelulusanResult> {
    if (!nomorPendaftaran) {
        return { error: 'Nomor pendaftaran tidak boleh kosong.' };
    }

    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!);

    try {
        const record = await pb.collection('status_kelulusan').getFirstListItem(
            `nomor_pendaftaran = "${nomorPendaftaran}"`
        );

        return {
            nama_lengkap: record.nama_lengkap,
            nomor_pendaftaran: record.nomor_pendaftaran,
            status: record.status,
            jurusan_diterima: record.jurusan_diterima,
            // PERUBAHAN: Kembalikan field baru
            jalur_pendaftaran: record.jalur_pendaftaran,
        };
    } catch (error) { 
        if (error instanceof ClientResponseError && error.status === 404) {
            return { error: 'Nomor pendaftaran tidak ditemukan atau hasil seleksi belum diumumkan.' };
        }
        console.error("Error checking kelulusan:", error);
        return { error: 'Terjadi kesalahan pada server. Silakan coba lagi.' };
    }
}
