'use server';

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';

/**
 * Membuat instance PocketBase untuk Server Component, Route Handler, atau Server Action.
 * Secara otomatis memuat token otentikasi dari cookie.
 * @returns {Promise<PocketBase>} Instance PocketBase yang sudah terautentikasi (jika user login).
 */
export async function createServerClient() {
    const cookieStore = await cookies();
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!);

    const authCookie = cookieStore.get('pb_auth');

    if (authCookie) {
        pb.authStore.loadFromCookie(`${authCookie.name}=${authCookie.value}`);
    }
    
    try {
        if(pb.authStore.isValid && pb.authStore.token) {
           await pb.collection('users').authRefresh();
        }
    // PERBAIKAN: Hapus variabel '_' yang tidak digunakan dari blok catch.
    } catch {
        // Jika refresh token gagal, bersihkan authStore.
        pb.authStore.clear();
    }

    return pb;
}
