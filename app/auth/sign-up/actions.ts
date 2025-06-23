// PERHATIAN: Buat file baru ini di lokasi yang ditentukan.

'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Definisikan tipe untuk state form
interface SignUpFormState {
  error?: { message: string } | null;
  successMessage?: string | null;
}

export async function createInitialUser(prevState: SignUpFormState, formData: FormData): Promise<SignUpFormState> {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) return { error: { message: 'Kunci layanan Supabase tidak dikonfigurasi.' } };

    const cookieStore = await cookies();
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    );

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const registrationNumber = formData.get('registrationNumber') as string;

    if (!email || !password || !fullName || !registrationNumber) {
        return { error: { message: 'Semua kolom wajib diisi.' } };
    }

    // Langkah 1: Buat user di Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        user_metadata: { full_name: fullName, registration_number: registrationNumber },
    });

    if (authError) {
        return { error: { message: `Gagal membuat akun: ${authError.message}` } };
    }

    // Langkah 2 (Kunci Solusi): Konfirmasi email pengguna secara manual
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
        authData.user.id,
        { email_confirm: true } // Langsung set status terkonfirmasi
    );

    if (confirmError) {
        // Jika gagal konfirmasi, hapus user yang sudah terbuat
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return { error: { message: `Gagal konfirmasi pengguna: ${confirmError.message}` } };
    }

    // Trigger akan menangani pembuatan profil dasar.
    
    return { successMessage: 'Akun berhasil dibuat dan langsung aktif!' };
}
