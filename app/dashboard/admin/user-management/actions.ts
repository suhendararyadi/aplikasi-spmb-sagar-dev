'use server';

import { ClientResponseError } from 'pocketbase';
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
    const jalurPendaftaran = formData.get('jalur_pendaftaran') as string;
    const acceptedMajor = formData.get('acceptedMajor') as string;

    if (!registrationNumber || !fullName) {
        return { error: { message: 'Nomor Pendaftaran dan Nama Lengkap wajib diisi.' } };
    }

    const userData = {
        email: `${registrationNumber}@smknegeri9garut.sch.id`,
        password: registrationNumber,
        passwordConfirm: registrationNumber,
        emailVisibility: false,
        name: fullName,
        registration_number: registrationNumber,
        school_origin: formData.get('schoolOrigin') as string,
        jalur_pendaftaran: jalurPendaftaran,
        entry_path: formData.get('entryPath') as string,
        accepted_major: acceptedMajor,
        role: "siswa",
        status: "belum_mengisi",
        username: registrationNumber,
        status_kelulusan: "PROSES SELEKSI", // Set default status
    };

    try {
        // Langkah 1: Buat user di collection utama 'users'
        await pb.collection('users').create(userData);

        // PERBAIKAN: Langkah 2 - Buat juga record di 'status_kelulusan'
        const publicData = {
            nomor_pendaftaran: registrationNumber,
            nama_lengkap: fullName,
            status: "PROSES SELEKSI",
            jurusan_diterima: acceptedMajor,
            jalur_pendaftaran: jalurPendaftaran,
        };
        await pb.collection('status_kelulusan').create(publicData);

    } catch (err) {
        if (err instanceof ClientResponseError) {
             const responseData = err.data.data;
             let detailedError = "Gagal membuat record.";
             if (responseData) {
                const fieldErrors = Object.keys(responseData).map(key => `${key}: ${responseData[key].message}`).join(', ');
                if (fieldErrors) detailedError = `Validasi Gagal -> ${fieldErrors}`;
             }
             return { error: { message: `Gagal membuat akun. ${detailedError}` }};
        }
        return { error: { message: `Terjadi kesalahan tak terduga: ${(err as Error).message}` }};
    }

    revalidatePath('/dashboard/admin', 'layout');
    revalidatePath('/dashboard/admin/user-management');
    
    return { successMessage: 'Pengguna berhasil ditambahkan dan status kelulusan awal telah dibuat!' };
}

type ImportedStudent = {
    registration_number: string;
    full_name: string;
    school_origin: string;
    jalur_pendaftaran: string;
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
        const userData = {
            email: `${user.registration_number}@smknegeri9garut.sch.id`,
            password: user.registration_number,
            passwordConfirm: user.registration_number,
            emailVisibility: false,
            name: user.full_name,
            registration_number: user.registration_number,
            school_origin: user.school_origin,
            jalur_pendaftaran: user.jalur_pendaftaran,
            entry_path: user.entry_path,
            accepted_major: user.accepted_major,
            role: "siswa",
            status: "belum_mengisi",
            username: user.registration_number,
            status_kelulusan: "PROSES SELEKSI",
        };

        try {
            // Buat user di collection 'users'
            await pb.collection('users').create(userData);

            // PERBAIKAN: Buat juga record di 'status_kelulusan' untuk impor massal
            const publicData = {
                nomor_pendaftaran: user.registration_number,
                nama_lengkap: user.full_name,
                status: "PROSES SELEKSI",
                jurusan_diterima: user.accepted_major,
                jalur_pendaftaran: user.jalur_pendaftaran,
            };
            await pb.collection('status_kelulusan').create(publicData);

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
        revalidatePath('/dashboard/admin', 'layout');
        revalidatePath('/dashboard/admin/user-management');
    }

    return { successCount, errorCount, errors };
}
