import { type NextRequest, NextResponse } from "next/server";
import PocketBase from 'pocketbase';

export async function middleware(request: NextRequest) {
  console.log(`\n--- [MIDDLEWARE] Request untuk: ${request.nextUrl.pathname} ---`);

  const response = NextResponse.next();
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!);

  const cookie = request.cookies.get("pb_auth");
  console.log(`DEBUG: Cookie 'pb_auth' dari browser: ${cookie ? 'Ditemukan' : 'Tidak Ditemukan'}`);
  
  if (cookie) {
    // PERBAIKAN: Rekonstruksi string cookie agar sesuai dengan yang diharapkan oleh `loadFromCookie`.
    // Format yang benar adalah "pb_auth=TOKEN_VALUE".
    pb.authStore.loadFromCookie(`${cookie.name}=${cookie.value}`);
  }

  // DEBUG: Cek status authStore SEBELUM refresh
  console.log(`DEBUG: Status Awal - isValid: ${pb.authStore.isValid}, user role: ${pb.authStore.model?.role}`);

  try {
    if (pb.authStore.isValid) {
      console.log("DEBUG: Mencoba refresh token...");
      await pb.collection('users').authRefresh();
      console.log("DEBUG: Refresh token berhasil.");
    }
  } catch (err) {
    console.error("DEBUG: Refresh token GAGAL, membersihkan sesi.", err);
    pb.authStore.clear();
  }
  
  const isLoggedIn = pb.authStore.isValid;
  const userRole = pb.authStore.model?.role;
  const { pathname } = request.nextUrl;
  console.log(`DEBUG: Status Akhir - isLoggedIn: ${isLoggedIn}, user role: ${userRole}`);
  console.log(`DEBUG: Tujuan Pathname: ${pathname}`);

  const isAuthPage = pathname.startsWith('/auth');
  const isPublicPage = pathname === '/';

  if (isLoggedIn && isAuthPage) {
    const dashboardUrl = userRole === 'admin' ? '/dashboard/admin' : '/dashboard/siswa';
    console.log(`DEBUG: REDIRECT -> User sudah login, mengarahkan ke ${dashboardUrl}`);
    const url = new URL(dashboardUrl, request.url);
    const redirectResponse = NextResponse.redirect(url);
    redirectResponse.headers.set('set-cookie', pb.authStore.exportToCookie());
    return redirectResponse;
  }

  if (!isLoggedIn && !isAuthPage && !isPublicPage) {
    console.log(`DEBUG: REDIRECT -> User belum login, mengarahkan ke /auth/login`);
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  console.log("DEBUG: LANJUTKAN -> Tidak ada redirect, melanjutkan ke halaman tujuan.");
  response.headers.set('set-cookie', pb.authStore.exportToCookie());
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
