'use server';

import { createServerClient } from "@/lib/pocketbase/server";
import { revalidatePath } from "next/cache";
import { ClientResponseError } from "pocketbase";

type ActionResult = {
    error?: string;
    success?: string;
}

// Action ini akan menangani update status kelulusan
export async function updateStatusKelulusan(studentId: string, prevState: ActionResult, formData: FormData): Promise<ActionResult> {
    const pb = await createServerClient();

    // Validasi sesi admin
    if (!pb.authStore.isValid || pb.authStore.model?.role !== 'admin') {
        return { error: 'Akses ditolak.' };
    }

    const newStatus = formData.get('status_kelulusan') as string;
    if (!newStatus) {
        return { error: 'Status kelulusan harus dipilih.' };
    }

    try {
        // Langkah 1: Update data master di collection 'users'
        const updatedUser = await pb.collection('users').update(studentId, {
            'status_kelulusan': newStatus,
        });

        // Data yang akan dipublikasikan
        const publicData = {
            nomor_pendaftaran: updatedUser.registration_number,
            nama_lengkap: updatedUser.name,
            status: newStatus,
            jurusan_diterima: updatedUser.accepted_major,
        };

        // Langkah 2: Logika "Upsert" untuk collection publik 'status_kelulusan'
        try {
            // Coba cari record yang sudah ada
            const existingPublicRecord = await pb.collection('status_kelulusan').getFirstListItem(`nomor_pendaftaran = "${updatedUser.registration_number}"`);
            // Jika ada, update
            await pb.collection('status_kelulusan').update(existingPublicRecord.id, publicData);
        } catch (error) {
            // PERBAIKAN: Gunakan tipe yang lebih spesifik
            if (error instanceof ClientResponseError && error.status === 404) {
                // Jika tidak ada (error 404), buat baru
                await pb.collection('status_kelulusan').create(publicData);
            } else {
                throw error; // Lemparkan error lain jika bukan 404
            }
        }

        // Revalidasi path agar data di halaman profil langsung terupdate
        revalidatePath(`/dashboard/admin/siswa/${studentId}`);
        return { success: 'Status kelulusan berhasil diperbarui!' };

    } catch (error) {
        // PERBAIKAN: Gunakan tipe yang lebih spesifik
        console.error("Gagal update status:", error);
        if (error instanceof ClientResponseError) {
            return { error: `Terjadi kesalahan: ${error.originalError}` };
        }
        return { error: `Terjadi kesalahan tak terduga.` };
    }
}
