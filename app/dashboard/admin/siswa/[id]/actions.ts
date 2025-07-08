'use server';

import { createServerClient } from "@/lib/pocketbase/server";
import { revalidatePath } from "next/cache";
import { ClientResponseError } from "pocketbase";

type ActionResult = {
    error?: string;
    success?: string;
}

export async function updateStatusKelulusan(studentId: string, prevState: ActionResult, formData: FormData): Promise<ActionResult> {
    const pb = await createServerClient();

    if (!pb.authStore.isValid || pb.authStore.model?.role !== 'admin') {
        return { error: 'Akses ditolak.' };
    }

    const newStatus = formData.get('status_kelulusan') as string;
    const newJalurPendaftaran = formData.get('jalur_pendaftaran') as string;

    // PERBAIKAN: Ganti tipe 'any' dengan tipe yang lebih spesifik.
    // Karena kita hanya menyimpan string, kita bisa gunakan 'string'.
    const dataToUpdate: { [key: string]: string } = {};

    if (newStatus) {
        dataToUpdate.status_kelulusan = newStatus;
    }
    if (newJalurPendaftaran) {
        dataToUpdate.jalur_pendaftaran = newJalurPendaftaran;
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return { error: 'Tidak ada data yang diubah.' };
    }

    try {
        const updatedUser = await pb.collection('users').update(studentId, dataToUpdate);

        if (newStatus) {
            const publicData = {
                nomor_pendaftaran: updatedUser.registration_number,
                nama_lengkap: updatedUser.name,
                status: newStatus,
                jurusan_diterima: updatedUser.accepted_major,
                jalur_pendaftaran: updatedUser.jalur_pendaftaran,
            };

            try {
                const existingPublicRecord = await pb.collection('status_kelulusan').getFirstListItem(`nomor_pendaftaran = "${updatedUser.registration_number}"`);
                await pb.collection('status_kelulusan').update(existingPublicRecord.id, publicData);
            } catch (error) {
                if (error instanceof ClientResponseError && error.status === 404) {
                    await pb.collection('status_kelulusan').create(publicData);
                } else {
                    throw error;
                }
            }
        }

        revalidatePath(`/dashboard/admin/siswa/${studentId}`);
        return { success: 'Data siswa berhasil diperbarui!' };

    } catch (error) {
        console.error("Gagal update status:", error);
        if (error instanceof ClientResponseError) {
            return { error: `Terjadi kesalahan: ${error.message}` };
        }
        if (error instanceof Error) {
            return { error: `Terjadi kesalahan tak terduga: ${error.message}` };
        }
        return { error: `Terjadi kesalahan tak terduga.` };
    }
}
