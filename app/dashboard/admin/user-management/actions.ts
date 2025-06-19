'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Definisikan tipe untuk state form agar lebih aman
interface FormState {
  error?: {
    message: string;
  } | null;
  data?: {
    user: object | null;
  } | null;
}

export async function addUser(prevState: FormState, formData: FormData): Promise<FormState> {
    const fullName = formData.get('fullName') as string;
    const registrationNumber = formData.get('registrationNumber') as string;

    if (!fullName || !registrationNumber) {
        return { error: { message: 'Nama lengkap dan nomor pendaftaran harus diisi.' } };
    }
    
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
        return { error: { message: 'Kunci layanan Supabase tidak dikonfigurasi di server.' } };
    }

    const cookieStore = await cookies();

    // Buat klien Supabase khusus dengan hak akses admin
    const supabaseAdmin = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                      cookieStore.set({ name, value, ...options });
                    } catch { // --- PERBAIKAN WARNING: Gunakan blok catch kosong ---
                      // The `set` method was called from a Server Action.
                      // This can be ignored if you have middleware refreshing
                      // user sessions.
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                      cookieStore.set({ name, value: '', ...options });
                    } catch { // --- PERBAIKAN WARNING: Gunakan blok catch kosong ---
                      // The `remove` method was called from a Server Action.
                      // This can be ignored if you have middleware refreshing
                      // user sessions.
                    }
                },
            },
        }
    );

    const email = `${registrationNumber}@smknegeri9garut.sch.id`;
    const password = registrationNumber; // Password disamakan dengan nomor pendaftaran

    // Gunakan auth.admin untuk membuat user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true, // Langsung konfirmasi emailnya
        user_metadata: {
            full_name: fullName,
            registration_number: registrationNumber,
        },
    });

    if (error) {
        console.error("Error creating user:", error);
        return { error: { message: `Gagal membuat pengguna: ${error.message}` } };
    }
    
    // Revalidasi path agar data di dashboard admin (tabel) diperbarui
    revalidatePath('/dashboard/admin');

    return { data: { user: data.user } };
}
