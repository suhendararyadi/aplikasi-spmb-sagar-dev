'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction() {
    // Hapus cookie otentikasi dari sisi server.
    cookies().delete('pb_auth');
    
    // Lakukan redirect dari sisi server ke halaman utama.
    redirect('/');
}
