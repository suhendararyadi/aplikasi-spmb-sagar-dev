'use server';

import PocketBase from 'pocketbase';
import { cookies } from 'next/headers';
import { type NextRequest } from 'next/server';

/**
 * Membuat instance PocketBase untuk Server Component, Route Handler, atau Server Action.
 * Secara otomatis memuat token otentikasi dari cookie.
 * @returns {Promise<PocketBase>} Instance PocketBase yang sudah terautentikasi (jika user login).
 */
export async function createServerClient() {
    // PERBAIKAN: Tambahkan 'await' di sini
    const cookieStore = await cookies();
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!);

    // Ambil cookie otentikasi dari request yang masuk.
    const authCookie = cookieStore.get('pb_auth');

    // Muat token dari cookie ke dalam instance PocketBase.
    if (authCookie) {
        pb.authStore.loadFromCookie(authCookie.value);
    }
    
    // Secara opsional, coba refresh token jika sudah mau expired.
    try {
        if(pb.authStore.isValid && pb.authStore.token) {
           await pb.collection('users').authRefresh();
        }
    } catch (_) {
        // Jika refresh token gagal, bersihkan authStore.
        pb.authStore.clear();
    }

    return pb;
}

/**
 * Fungsi helper untuk middleware, menangani sesi dan cookie.
 * @param {NextRequest} request - Object request yang masuk.
 * @returns {Promise<{response: Response, pb: PocketBase}>} Mengembalikan response dan instance pb.
 */
export async function handleSession(request: NextRequest) {
    const response = new Response();
    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!);

    const authCookie = request.cookies.get('pb_auth');
    if (authCookie) {
        pb.authStore.loadFromCookie(authCookie.value);
    }

    try {
        if (pb.authStore.isValid && pb.authStore.token) {
            await pb.collection('users').authRefresh();
        }
    } catch (_) {
        pb.authStore.clear();
    }

    response.headers.append('set-cookie', pb.authStore.exportToCookie());

    return { response, pb };
}
