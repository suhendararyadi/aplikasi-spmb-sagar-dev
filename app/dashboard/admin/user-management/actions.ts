'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Definisikan tipe untuk state form
interface FormState {
  error?: { message: string } | null;
  data?: object | null;
  successMessage?: string | null;
}

// Fungsi untuk menambah SATU pengguna dengan data lengkap
export async function addUser(prevState: FormState, formData: FormData): Promise<FormState> {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) return { error: { message: 'Kunci layanan Supabase tidak dikonfigurasi.' } };
    
    const cookieStore = await cookies();
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const registrationNumber = formData.get('registrationNumber') as string;
    const fullName = formData.get('fullName') as string;
    const schoolOrigin = formData.get('schoolOrigin') as string;
    const entryPath = formData.get('entryPath') as string;
    const acceptedMajor = formData.get('acceptedMajor') as string;

    if (!registrationNumber || !fullName) {
        return { error: { message: 'Nomor Pendaftaran dan Nama Lengkap wajib diisi.' } };
    }

    // Langkah 1: Buat user di Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: `${registrationNumber}@smknegeri9garut.sch.id`,
        password: registrationNumber,
        email_confirm: true,
        user_metadata: { full_name: fullName, registration_number: registrationNumber },
    });

    if (authError) {
        return { error: { message: `Gagal membuat akun: ${authError.message}` } };
    }

    // --- PERBAIKAN LOGIKA: Gunakan .upsert() daripada .insert() ---
    // Ini akan meng-update baris yang sudah dibuat oleh trigger, atau membuat baru jika belum ada.
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: authData.user.id, // Kunci utama untuk dicocokkan
            registration_number: registrationNumber,
            full_name: fullName,
            school_origin: schoolOrigin,
            entry_path: entryPath,
            accepted_major: acceptedMajor,
        });

    if (profileError) {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return { error: { message: `Gagal menyimpan profil: ${profileError.message}` } };
    }

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

export async function importUsers(users: ImportedStudent[]): Promise<{ successCount: number; errorCount: number; errors: string[] }> {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) throw new Error('Kunci layanan Supabase tidak dikonfigurasi.');

    // --- PERBAIKAN DI SINI: Tambahkan 'await' ---
    const cookieStore = await cookies();
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try { cookieStore.set({ name, value, ...options }); } catch {}
                },
                remove(name: string, options: CookieOptions) {
                    try { cookieStore.set({ name, value: '', ...options }); } catch {}
                },
            },
        }
    );
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const user of users) {
        try {
            // Langkah 1: Buat user di Supabase Auth
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email: `${user.registration_number}@smknegeri9garut.sch.id`,
                password: user.registration_number,
                email_confirm: true,
                user_metadata: {
                    full_name: user.full_name,
                    registration_number: user.registration_number,
                },
            });
            
            if (authError) throw new Error(`Gagal buat akun Auth: ${authError.message}`);

            // --- PERBAIKAN LOGIKA: Gunakan .upsert() daripada .insert() ---
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: authData.user.id,
                    registration_number: user.registration_number,
                    full_name: user.full_name,
                    school_origin: user.school_origin,
                    entry_path: user.entry_path,
                    accepted_major: user.accepted_major,
                });

            if (profileError) throw new Error(`Gagal simpan profil: ${profileError.message}`);

            successCount++;
        } catch (e) {
            errorCount++;
            errors.push(`Gagal impor no. pendaftaran ${user.registration_number}: ${(e as Error).message}`);
        }
    }

    if (successCount > 0) {
        revalidatePath('/dashboard/admin');
    }

    return { successCount, errorCount, errors };
}
