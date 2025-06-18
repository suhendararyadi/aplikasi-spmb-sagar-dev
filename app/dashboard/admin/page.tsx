// PERHATIAN: Perbarui file `app/dashboard/admin/page.tsx` Anda dengan kode ini.
// Perubahan: Memfilter data agar admin tidak termasuk dalam laporan siswa.

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserCheck, UserX, Percent } from "lucide-react";
import { StudentDataTable } from "@/components/student-data-table";
import { SupabaseClient } from "@supabase/supabase-js";

// Fungsi terisolasi untuk mengambil data, sekarang sudah aman dari rekursi.
async function getAdminDashboardData(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/dashboard/siswa');
  }

  // Saat mengambil semua data profil, kita filter untuk hanya mengambil yang rolenya 'siswa'.
  const { data: studentProfiles, error: allProfilesError } = await supabase
    .from("profiles")
    .select("*")
    .eq('role', 'siswa'); // Hanya ambil profil dengan peran 'siswa'

  if (allProfilesError) {
    throw new Error(`Gagal mengambil data siswa: ${allProfilesError.message}`);
  }

  // Perhitungan statistik sekarang hanya berdasarkan data siswa.
  const totalStudents = studentProfiles.length;
  const completedRegistrations = studentProfiles.filter(p => p.status === 'selesai').length;
  const pendingRegistrations = totalStudents - completedRegistrations;
  const completionPercentage = totalStudents > 0 ? ((completedRegistrations / totalStudents) * 100).toFixed(1) : "0";
  
  return {
    profiles: studentProfiles, // Kirim hanya data siswa ke komponen tabel
    stats: {
      totalStudents,
      completedRegistrations,
      pendingRegistrations,
      completionPercentage,
    },
  };
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  try {
    const { profiles, stats } = await getAdminDashboardData(supabase);

    return (
      <div className="w-full flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>

        {/* Bagian Kartu Statistik */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Total siswa yang harus daftar ulang</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sudah Daftar Ulang</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedRegistrations}</div>
              <p className="text-xs text-muted-foreground">Siswa yang telah mengisi formulir</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Belum Daftar Ulang</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRegistrations}</div>
              <p className="text-xs text-muted-foreground">Siswa yang belum mengisi formulir</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Persentase Selesai</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionPercentage}%</div>
              <p className="text-xs text-muted-foreground">Dari total pendaftar</p>
            </CardContent>
          </Card>
        </div>

        {/* Bagian Tabel Data Siswa */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Rekapan Data Siswa</h2>
          <StudentDataTable data={profiles} />
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof Error) {
        // --- PERBAIKAN WARNING ESLINT DI SINI ---
        // Menggunakan type assertion yang lebih aman daripada 'any'.
        // Ini memberitahu TypeScript bahwa objek 'error' mungkin memiliki properti 'digest'.
        const errorWithDigest = error as Error & { digest?: string };
        if (errorWithDigest.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        // --- AKHIR PERBAIKAN ---
        return <div>Terjadi kesalahan: {error.message}</div>;
    }
    return <div>Terjadi kesalahan yang tidak diketahui.</div>;
  }
}
