// PERHATIAN: Perbarui file ini di `app/dashboard/admin/layout.tsx`.
// Perubahan: Menambahkan link navigasi untuk "Manajemen Pengguna".

import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { School, UserPlus } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        {/* --- HEADER KHUSUS ADMIN --- */}
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
            <Link href={"/dashboard/admin"} className="flex items-center gap-2 font-semibold hover:text-primary transition-colors">
              <School className="h-6 w-6 text-primary" />
              <span className="hidden sm:inline">Admin Panel - SMKN 9 Garut</span>
            </Link>
            <div className="flex items-center gap-2 md:gap-4">
                {/* --- NAVIGASI BARU --- */}
                {/* <Link href="/dashboard/admin" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="hidden md:inline">Dashboard</span>
                </Link> */}
                <Link href="/dashboard/admin/user-management" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    <span className="hidden md:inline">Manajemen Pengguna</span>
                </Link>
                {/* --- AKHIR NAVIGASI --- */}
                <AuthButton />
            </div>
          </div>
        </nav>
        
        <div className="w-full max-w-7xl mx-auto py-10 px-5">
            {children}
        </div>

        {/* --- FOOTER --- */}
        <footer className="w-full border-t border-t-foreground/10 mt-auto">
            <div className="max-w-7xl mx-auto flex items-center justify-between text-center text-xs gap-8 py-8 px-5">
                <p className="text-muted-foreground">
                    &copy; {new Date().getFullYear()} Panitia SPMB SMKN 9 Garut.
                    <span className="hidden sm:inline"> | Dibuat dengan ❤️ oleh Suhendar Aryadi</span>
                </p>
                <ThemeSwitcher />
            </div>
        </footer>
      </div>
    </main>
  );
}
