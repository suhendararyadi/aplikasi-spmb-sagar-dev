// PERHATIAN: Perbarui file ini di `components/auth-button.tsx`.
// Perubahan: Menambahkan tombol "Dashboard" saat pengguna sudah login.

import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { LayoutDashboard } from "lucide-react"; // Impor ikon baru

export async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Jika ada user, kita perlu memeriksa perannya untuk menentukan tujuan dashboard.
  let displayName = user?.email; // Fallback jika profil tidak ditemukan
  let dashboardUrl = "/dashboard/siswa"; // Default ke dashboard siswa

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, role') // Ambil nama dan peran
      .eq('id', user.id)
      .single();
      
    if (profile) {
      // Ambil bagian pertama dari nama jika terlalu panjang
      displayName = profile.full_name?.split(' ')[0] || user.email;
      // Tentukan URL dashboard berdasarkan peran
      if (profile.role === 'admin') {
        dashboardUrl = "/dashboard/admin";
      }
    }
  }

  return user ? (
    <div className="flex items-center gap-2 md:gap-4">
      {/* Tombol Dashboard Baru */}
      <Button asChild size="sm">
        <Link href={dashboardUrl} className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
        </Link>
      </Button>
      
      {/* Grup Sapaan dan Logout */}
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-muted-foreground">|</span>
        <span className="hidden sm:inline">Halo, {displayName}!</span>
        <LogoutButton />
      </div>
    </div>
  ) : (
    <Button asChild size="sm" variant={"outline"}>
      <Link href="/auth/login">Login</Link>
    </Button>
  );
}
