import { AuthButton } from "@/components/auth-button";
import { SpmbHero } from "@/components/spmb-hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { School } from "lucide-react";
import { CekKelulusanForm } from "@/components/cek-kelulusan-form";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col items-center">
        {/* --- HEADER --- */}
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <Link href={"/"} className="flex items-center gap-2 font-semibold hover:text-primary transition-colors">
              <School className="h-6 w-6 text-primary" />
              <span>SPMB SMKN 9 Garut</span>
            </Link>
            <AuthButton />
          </div>
        </nav>
        {/* --- AKHIR HEADER --- */}

        {/* PERBAIKAN: Tata letak konten utama diatur ulang */}
        <div className="w-full max-w-5xl px-5 flex flex-col items-center">
          {/* Bagian Judul dan Deskripsi */}
          <SpmbHero />
          
          {/* Bagian Cek Kelulusan dipindahkan ke atas */}
          <section id="cek-kelulusan" className="w-full pb-20 -mt-10 md:-mt-16">
            <CekKelulusanForm />
          </section>
        </div>
        
        {/* --- FOOTER --- */}
        <footer className="w-full border-t border-t-foreground/10 mt-auto">
            <div className="max-w-5xl mx-auto flex items-center justify-between text-center text-xs gap-8 py-8 px-5">
                <p className="text-muted-foreground">
                    &copy; {new Date().getFullYear()} Panitia SPMB SMKN 9 Garut
                </p>
                <ThemeSwitcher />
            </div>
        </footer>
        {/* --- AKHIR FOOTER --- */}
      </div>
    </main>
  );
}
