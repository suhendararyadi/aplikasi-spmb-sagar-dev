'use server';

import PocketBase, { ClientResponseError } from 'pocketbase';
import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/pocketbase/server';

interface FormState {
  error?: { message: string } | null;
  data?: object | null;
  successMessage?: string | null;
}

export async function addUser(prevState: FormState, formData: FormData): Promise<FormState> {
    const pb = await createServerClient();

    if (!pb.authStore.isValid || pb.authStore.model?.role !== 'admin') {
      return { error: { message: 'Akses ditolak. Anda bukan admin.' } };
    }

    const registrationNumber = formData.get('registrationNumber') as string;
    const fullName = formData.get('fullName') as string;

    if (!registrationNumber || !fullName) {
        return { error: { message: 'Nomor Pendaftaran dan Nama Lengkap wajib diisi.' } };
    }

    const data = {
        email: `${registrationNumber}@smknegeri9garut.sch.id`,
        password: registrationNumber,
        passwordConfirm: registrationNumber,
        emailVisibility: false,
        name: fullName,
        registration_number: registrationNumber,
        school_origin: formData.get('schoolOrigin') as string,
        entry_path: formData.get('entryPath') as string,
        accepted_major: formData.get('acceptedMajor') as string,
        role: "siswa",
        status: "belum_mengisi",
        username: registrationNumber 
    };

    try {
        await pb.collection('users').create(data);
    } catch (err) {
        if (err instanceof ClientResponseError) {
             const responseData = err.data.data;
             let detailedError = "Gagal membuat record.";
             if (responseData) {
                const fieldErrors = Object.keys(responseData).map(key => {
                    return `${key}: ${responseData[key].message}`;
                }).join(', ');

                if (fieldErrors) {
                    detailedError = `Validasi Gagal -> ${fieldErrors}`;
                }
             }
             return { error: { message: `Gagal membuat akun. ${detailedError}` }};
        }
        return { error: { message: `Terjadi kesalahan tak terduga: ${(err as Error).message}` }};
    }

    // PERBAIKAN: Revalidasi 'layout' untuk memastikan data di dashboard admin diperbarui.
    revalidatePath('/dashboard/admin', 'layout');
    revalidatePath('/dashboard/admin/user-management');
    
    return { successMessage: 'Pengguna berhasil ditambahkan!' };
}

type ImportedStudent = {
    registration_number: string;
    full_name: string;
    school_origin: string;
    entry_path: string;
    accepted_major: string;
};

export async function importUsers(users: ImportedStudent[]): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
    const pb = await createServerClient();
    
    if (!pb.authStore.isValid || pb.authStore.model?.role !== 'admin') {
      throw new Error('Akses ditolak. Anda bukan admin.');
    }
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const user of users) {
        const data = {
            email: `${user.registration_number}@smknegeri9garut.sch.id`,
            password: user.registration_number,
            passwordConfirm: user.registration_number,
            emailVisibility: false,
            name: user.full_name,
            registration_number: user.registration_number,
            school_origin: user.school_origin,
            entry_path: user.entry_path,
            accepted_major: user.accepted_major,
            role: "siswa",
            status: "belum_mengisi",
            username: user.registration_number
        };

        try {
            await pb.collection('users').create(data);
            successCount++;
        } catch (e) {
            errorCount++;
            if (e instanceof ClientResponseError) {
                const responseData = e.data.data;
                let detailedError = "Gagal membuat record.";
                if (responseData) {
                    const fieldErrors = Object.keys(responseData).map(key => `${key}: ${responseData[key].message}`).join(', ');
                    if (fieldErrors) detailedError = `Validasi Gagal -> ${fieldErrors}`;
                }
                errors.push(`Gagal impor no. pendaftaran ${user.registration_number}: ${detailedError}`);
            } else {
                 errors.push(`Gagal impor no. pendaftaran ${user.registration_number}: ${(e as Error).message}`);
            }
        }
    }

    if (successCount > 0) {
        // PERBAIKAN: Revalidasi 'layout' untuk memastikan data di dashboard admin diperbarui.
        revalidatePath('/dashboard/admin', 'layout');
        revalidatePath('/dashboard/admin/user-management');
    }

    return { successCount, errorCount, errors };
}
