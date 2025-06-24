'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logoutAction() {
    // PERBAIKAN: Dapatkan cookie store dengan 'await' terlebih dahulu.
    const cookieStore = await cookies();
    
    // Hapus cookie otentikasi dari sisi server.
    cookieStore.delete('pb_auth');
    
    // Lakukan redirect dari sisi server ke halaman utama.
    redirect('/');
}
