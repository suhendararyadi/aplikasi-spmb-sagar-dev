import { type NextRequest, NextResponse } from "next/server";
import { handleSession } from "@/lib/pocketbase/server"; // PERBAIKAN: Path impor diubah

export async function middleware(request: NextRequest) {
  const { response, pb } = await handleSession(request);

  // Jika user tidak valid (tidak login) dan mencoba mengakses halaman yang dilindungi
  if (!pb.authStore.isValid && !request.nextUrl.pathname.startsWith('/auth') && request.nextUrl.pathname !== '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login'; // Arahkan ke halaman login
    return NextResponse.redirect(url);
  }

  // Jika user sudah login dan mencoba mengakses halaman login/register
  if (pb.authStore.isValid && request.nextUrl.pathname.startsWith('/auth')) {
     const role = pb.authStore.model?.role || 'siswa';
     const dashboardUrl = role === 'admin' ? '/dashboard/admin' : '/dashboard/siswa';
     const url = request.nextUrl.clone();
     url.pathname = dashboardUrl;
     return NextResponse.redirect(url);
  }

  // Lanjutkan request seperti biasa, sambil mengirim cookie yang sudah di-update
  const nextResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Salin cookie dari response helper ke response akhir
  nextResponse.headers.set('set-cookie', response.headers.get('set-cookie') || '');

  return nextResponse;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
