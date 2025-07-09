import { AuthButton } from "@/components/auth-button";
import { SpmbHero } from "@/components/spmb-hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";
import { School, Timer } from "lucide-react";
import { CekKelulusanForm } from "@/components/cek-kelulusan-form";
import { CountdownTimer } from "@/components/countdown-timer";
// PERBAIKAN: Impor PocketBase secara langsung, bukan dari helper client.
import PocketBase from "pocketbase";

// Fungsi untuk mengambil data pengaturan dari server
async function getAppSettings() {
  // PERBAIKAN: Buat instance PocketBase baru yang aman untuk server.
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!);
  try {
    const settings = await pb.collection('pengaturan_app').getFirstListItem('');
    const announcementTime = new Date(settings.waktu_pengumuman);
    const isAnnouncementOpen = new Date() >= announcementTime;
    return { announcementTime, isAnnouncementOpen };
  } catch {
    // Jika gagal mengambil pengaturan, anggap semua sudah terbuka
    return { announcementTime: new Date(0), isAnnouncementOpen: true };
  }
}

export default async function Home() {
  const { announcementTime, isAnnouncementOpen } = await getAppSettings();

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
            <AuthButton disabled={!isAnnouncementOpen} />
          </div>
        </nav>
        {/* --- AKHIR HEADER --- */}

        <div className="w-full max-w-5xl px-5 flex flex-col items-center">
          <SpmbHero />
          
          <section id="main-content" className="w-full pb-20 -mt-10 md:-mt-16">
            {isAnnouncementOpen ? (
              // Jika waktu pengumuman sudah tiba, tampilkan form
              <CekKelulusanForm />
            ) : (
              // Jika belum, tampilkan countdown
              <div className="text-center max-w-2xl mx-auto">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <Timer className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-bold tracking-tight">PENGUMUMAN AKAN DIBUKA DALAM</h2>
                </div>
                <CountdownTimer targetDate={announcementTime.toISOString()} />
              </div>
            )}
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
      </div>
    </main>
  );
}
