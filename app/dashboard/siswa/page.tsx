// PERHATIAN: Buat file ini di `app/dashboard/siswa/page.tsx`.
// Hapus file page.tsx yang lama di `app/protected/` atau `app/dashboard/`.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { StudentReregistrationForm } from "@/components/student-reregistration-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function StudentDashboardPage() {
  const supabase = await createClient();

  // 1. Ambil data user yang sedang login
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Jika tidak ada user, redirect ke halaman login
  if (userError || !user) {
    redirect("/auth/login");
  }

  // 2. Ambil data profil siswa dari tabel 'profiles' yang baru kita buat
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id) // Cocokkan berdasarkan ID user yang login
    .single(); // Kita mengharapkan hanya satu hasil

  // Menangani error saat mengambil profil.
  // Kode 'PGRST116' adalah kode standar Supabase jika tidak ada baris ditemukan.
  // Ini bukan error fatal, mungkin terjadi jika trigger belum sempat berjalan.
  if (profileError && profileError.code !== 'PGRST116') {
    console.error("Error fetching profile:", profileError);
    return <div>Error: Gagal memuat data Anda. Silakan hubungi admin.</div>;
  }
  
  // 3. Menyiapkan data untuk dikirim ke komponen form.
  // Jika profil belum ada di database, kita gunakan data dari metadata user.
  const userProfile = profile || {
    id: user.id,
    full_name: user.user_metadata?.full_name || 'Nama Siswa',
    registration_number: user.user_metadata?.registration_number || user.email,
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Formulir Pendaftaran Ulang</CardTitle>
          <CardDescription>
            Selamat datang, <strong>{userProfile.full_name || "Siswa"}</strong>. 
            Silakan lengkapi atau periksa kembali data di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 4. Render komponen form dan kirim data profil sebagai props */}
          <StudentReregistrationForm profile={userProfile} />
        </CardContent>
      </Card>
    </div>
  );
}
