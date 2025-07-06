'use server';

// PERBAIKAN: Impor PocketBase dan tipe error yang spesifik.
import PocketBase, { ClientResponseError } from 'pocketbase';

// Definisikan tipe untuk hasil yang akan dikembalikan
export type KelulusanResult = {
    nama_lengkap: string;
    nomor_pendaftaran: string;
    status: 'LULUS' | 'TIDAK LULUS' | 'PROSES SELEKSI';
    jurusan_diterima: string;
} | {
    error: string;
};

export async function checkKelulusan(nomorPendaftaran: string): Promise<KelulusanResult> {
    if (!nomorPendaftaran) {
        return { error: 'Nomor pendaftaran tidak boleh kosong.' };
    }

    // Buat instance PocketBase baru yang aman untuk server.
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!);

    try {
        // Cari di collection 'status_kelulusan' yang publik
        const record = await pb.collection('status_kelulusan').getFirstListItem(
            `nomor_pendaftaran = "${nomorPendaftaran}"`
        );

        return {
            nama_lengkap: record.nama_lengkap,
            nomor_pendaftaran: record.nomor_pendaftaran,
            status: record.status,
            jurusan_diterima: record.jurusan_diterima,
        };
    } catch (error) { 
        // PERBAIKAN: Tangani error dengan tipe yang lebih spesifik daripada 'any'.
        // PocketBase akan melempar ClientResponseError jika record tidak ditemukan.
        if (error instanceof ClientResponseError && error.status === 404) {
            return { error: 'Nomor pendaftaran tidak ditemukan atau hasil seleksi belum diumumkan.' };
        }
        console.error("Error checking kelulusan:", error);
        return { error: 'Terjadi kesalahan pada server. Silakan coba lagi.' };
    }
}
