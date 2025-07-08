'use server';

import PocketBase, { ClientResponseError } from 'pocketbase';

export type KelulusanResult = {
    nama_lengkap: string;
    nomor_pendaftaran: string;
    status: 'LULUS' | 'TIDAK LULUS' | 'PROSES SELEKSI';
    jurusan_diterima: string;
    jalur_pendaftaran?: string;
} | {
    error: string;
};

// Fungsi helper untuk mengambil jadwal pengumuman
async function getAnnouncementTime(pb: PocketBase) {
    try {
        const settings = await pb.collection('pengaturan_app').getFirstListItem('');
        return new Date(settings.waktu_pengumuman);
    } catch {
        // Jika gagal, anggap pengumuman selalu terbuka agar tidak memblokir total
        return new Date(0); 
    }
}

export async function checkKelulusan(nomorPendaftaran: string): Promise<KelulusanResult> {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!);
    
    // PERBAIKAN: Cek waktu pengumuman terlebih dahulu
    const announcementTime = await getAnnouncementTime(pb);
    if (new Date() < announcementTime) {
        return { error: 'Pengumuman belum dibuka. Silakan cek kembali sesuai jadwal.' };
    }

    if (!nomorPendaftaran) {
        return { error: 'Nomor pendaftaran tidak boleh kosong.' };
    }

    try {
        const record = await pb.collection('status_kelulusan').getFirstListItem(
            `nomor_pendaftaran = "${nomorPendaftaran}"`
        );

        return {
            nama_lengkap: record.nama_lengkap,
            nomor_pendaftaran: record.nomor_pendaftaran,
            status: record.status,
            jurusan_diterima: record.jurusan_diterima,
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
