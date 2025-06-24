import { createServerClient } from "@/lib/pocketbase/server";
// import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, UserCheck, UserX, Percent } from "lucide-react";
import { StudentDataTable } from "@/components/student-data-table";

// PERBAIKAN KUNCI: Menambahkan baris ini akan memaksa halaman untuk selalu
// dirender secara dinamis, memastikan data yang diambil selalu yang terbaru.
export const revalidate = 0;

// Tipe untuk data profil dari PocketBase
type Profile = {
  id: string;
  name: string | null;
  registration_number: string | null;
  role: 'admin' | 'siswa';
  status: 'belum_mengisi' | 'selesai';
  school_origin: string | null;
  entry_path: string | null;
  accepted_major: string | null;
  is_reconfirm: boolean | null;
};

// Fungsi ini sekarang akan selalu mengambil data baru setiap kali halaman diakses.
async function getAdminDashboardData() {
  const pb = await createServerClient();

  const studentProfiles: Profile[] = await pb.collection('users').getFullList({
    filter: 'role = "siswa"',
    // Menambahkan sorting agar data lebih teratur
    sort: '-created', 
  });
  
  const totalStudents = studentProfiles.length;
  const completedRegistrations = studentProfiles.filter(p => p.status === 'selesai').length;
  const pendingRegistrations = totalStudents - completedRegistrations;
  const completionPercentage = totalStudents > 0 ? ((completedRegistrations / totalStudents) * 100).toFixed(1) : "0";
  
  return {
    profiles: studentProfiles,
    stats: {
      totalStudents,
      completedRegistrations,
      pendingRegistrations,
      completionPercentage,
    },
  };
}

export default async function AdminDashboardPage() {
  // Middleware sudah menangani otentikasi, jadi kita bisa langsung memanggil fungsi data.
  const { profiles, stats } = await getAdminDashboardData();

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
}
