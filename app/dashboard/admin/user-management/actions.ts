'use server';

import PocketBase, { ClientResponseError } from 'pocketbase';
import { revalidatePath } from 'next/cache';

// Definisikan tipe untuk state form
interface FormState {
  error?: { message: string } | null;
  data?: object | null;
  successMessage?: string | null;
}

// Fungsi helper untuk mendapatkan instance PB sebagai admin
async function getAdminPb() {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!);
    await pb.admins.authWithPassword(
        process.env.POCKETBASE_ADMIN_EMAIL!,
        process.env.POCKETBASE_ADMIN_PASSWORD!
    );
    return pb;
}

// Fungsi untuk menambah SATU pengguna
export async function addUser(prevState: FormState, formData: FormData): Promise<FormState> {
    const pb = await getAdminPb();

    const registrationNumber = formData.get('registrationNumber') as string;
    const fullName = formData.get('fullName') as string;

    if (!registrationNumber || !fullName) {
        return { error: { message: 'Nomor Pendaftaran dan Nama Lengkap wajib diisi.' } };
    }

    const data = {
        "email": `${registrationNumber}@smknegeri9garut.sch.id`,
        "password": registrationNumber,
        "passwordConfirm": registrationNumber,
        "emailVisibility": false,
        "name": fullName,
        "registration_number": registrationNumber,
        "school_origin": formData.get('schoolOrigin') as string,
        "entry_path": formData.get('entryPath') as string,
        "accepted_major": formData.get('acceptedMajor') as string,
        "role": "siswa",
        "status": "belum_mengisi"
    };

    try {
        await pb.collection('users').create(data);
    } catch (err) {
        // PERBAIKAN: Gunakan 'ClientResponseError' untuk menangani error dari PocketBase secara aman.
        if (err instanceof ClientResponseError) {
             const responseData = err.data.data;
             // Ambil pesan error yang lebih spesifik jika ada (misal: email sudah ada)
             const specificMessage = responseData?.email?.message || responseData?.username?.message || err.message;
             return { error: { message: `Gagal membuat akun: ${specificMessage}` }};
        }
        return { error: { message: `Terjadi kesalahan tak terduga: ${(err as Error).message}` }};
    }

    revalidatePath('/dashboard/admin/user-management');
    revalidatePath('/dashboard/admin');
    return { successMessage: 'Pengguna berhasil ditambahkan!' };
}

// Definisikan tipe untuk data siswa yang diimpor
type ImportedStudent = {
    registration_number: string;
    full_name: string;
    school_origin: string;
    entry_path: string;
    accepted_major: string;
};

// Fungsi untuk impor massal
export async function importUsers(users: ImportedStudent[]): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
    const pb = await getAdminPb();
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const user of users) {
        const data = {
            "email": `${user.registration_number}@smknegeri9garut.sch.id`,
            "password": user.registration_number,
            "passwordConfirm": user.registration_number,
            "emailVisibility": false,
            "name": user.full_name,
            "registration_number": user.registration_number,
            "school_origin": user.school_origin,
            "entry_path": user.entry_path,
            "accepted_major": user.accepted_major,
            "role": "siswa",
            "status": "belum_mengisi"
        };

        try {
            await pb.collection('users').create(data);
            successCount++;
        } catch (e) {
            errorCount++;
            // PERBAIKAN: Lakukan hal yang sama untuk impor massal.
            if (e instanceof ClientResponseError) {
                const errorMessage = e.data?.data?.email?.message || e.message;
                errors.push(`Gagal impor no. pendaftaran ${user.registration_number}: ${errorMessage}`);
            } else {
                 errors.push(`Gagal impor no. pendaftaran ${user.registration_number}: ${(e as Error).message}`);
            }
        }
    }

    if (successCount > 0) {
        revalidatePath('/dashboard/admin');
        revalidatePath('/dashboard/admin/user-management');
    }

    return { successCount, errorCount, errors };
}
