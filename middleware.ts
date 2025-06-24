import { type NextRequest, NextResponse } from "next/server";
import PocketBase from 'pocketbase';

export async function middleware(request: NextRequest) {
  // Buat instance PocketBase baru untuk setiap request
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!);

  // Muat sesi dari cookie yang dikirim oleh browser
  const cookie = request.cookies.get("pb_auth");
  if (cookie) {
    pb.authStore.loadFromCookie(cookie.value);
  }

  try {
    // Verifikasi dan refresh token jika ada dan valid
    if (pb.authStore.isValid) {
      await pb.collection('users').authRefresh();
    }
  } catch {
    // Jika refresh gagal (token tidak valid), bersihkan sesi
    pb.authStore.clear();
  }

  // Periksa status login dan peran pengguna
  const isLoggedIn = pb.authStore.isValid;
  const userRole = pb.authStore.model?.role;
  const { pathname } = request.nextUrl;

  // Definisikan halaman-halaman otentikasi dan publik
  const isAuthPage = pathname.startsWith('/auth');
  const isPublicPage = pathname === '/';
  
  // --- LOGIKA PENGALIHAN (REDIRECT) ---

  // 1. Jika user SUDAH LOGIN dan mencoba akses halaman login/register -> Arahkan ke dashboard
  if (isLoggedIn && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = userRole === 'admin' ? '/dashboard/admin' : '/dashboard/siswa';
    const response = NextResponse.redirect(url);
    // Lampirkan cookie yang diperbarui ke header response redirect
    response.headers.set('set-cookie', pb.authStore.exportToCookie());
    return response;
  }

  // 2. Jika user BELUM LOGIN dan mencoba akses halaman yang dilindungi -> Arahkan ke login
  if (!isLoggedIn && !isAuthPage && !isPublicPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }
  
  // 3. Untuk semua kasus lain (lanjutkan navigasi)
  // Buat response untuk melanjutkan
  const response = NextResponse.next();
  // Selalu lampirkan cookie yang diperbarui ke response untuk menjaga sesi tetap aktif
  response.headers.set('set-cookie', pb.authStore.exportToCookie());
  return response;
}

export const config = {
  matcher: [
    // Jalankan middleware untuk semua path kecuali file statis dan API
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
