// PERHATIAN: Perbarui file `components/auth-button.tsx`.
// Perubahan: Mengambil nama lengkap siswa, mengubah teks, dan menghapus tombol Sign Up.

import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // --- LOGIKA BARU: Ambil nama lengkap dari tabel profiles ---
  let displayName = user?.email; // Fallback jika profil tidak ditemukan
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();
    if (profile?.full_name) {
      // Ambil bagian pertama dari nama jika terlalu panjang
      displayName = profile.full_name.split(' ')[0];
    }
  }
  // --- AKHIR LOGIKA BARU ---

  return user ? (
    <div className="flex items-center gap-2">
      <span className="hidden sm:inline">Halo, {displayName}!</span>
      <LogoutButton />
    </div>
  ) : (
    <Button asChild size="sm" variant={"outline"}>
      <Link href="/auth/login">Login</Link>
    </Button>
  );
}
