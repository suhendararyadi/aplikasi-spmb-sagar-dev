import { createServerClient } from "@/lib/pocketbase/server";
import { redirect } from "next/navigation";
import { StudentReregistrationForm } from "@/components/student-reregistration-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Printer } from "lucide-react";
import { TidakLulusInfo } from "@/components/tidak-lulus-info";
import { ClientResponseError } from "pocketbase"; // PERBAIKAN: Impor tipe error spesifik

// Tipe untuk data profil lengkap dari PocketBase
type Profile = {
    id: string;
    collectionId: string;
    name?: string | null;
    registration_number?: string | null;
    school_origin?: string | null;
    entry_path?: string | null;
    accepted_major?: string | null;
    is_reconfirm?: boolean | null;
    rejection_reason?: string | null;
    status?: string | null;
    surat_pernyataan?: string | null;
    jalur_pendaftaran?: string | null;
    status_kelulusan?: 'LULUS' | 'TIDAK LULUS' | 'PROSES SELEKSI' | null;
};

// Fungsi untuk mengambil data siswa yang sudah digabung
async function getStudentData() {
    const pb = await createServerClient();
    if (!pb.authStore.isValid || !pb.authStore.model) redirect('/auth/login');
    
    try {
        const studentProfile: Profile = await pb.collection('users').getOne(pb.authStore.model.id);

        try {
            const kelulusanRecord = await pb.collection('status_kelulusan').getFirstListItem(`nomor_pendaftaran = "${studentProfile.registration_number}"`);
            studentProfile.status_kelulusan = kelulusanRecord.status;
        } catch (kelulusanError) {
            // PERBAIKAN: Gunakan tipe yang lebih spesifik untuk menangani error
            if (kelulusanError instanceof ClientResponseError) {
                // Jika tidak ditemukan (404), itu bukan error fatal.
                if (kelulusanError.status !== 404) {
                    console.error("Error fetching kelulusan status:", kelulusanError);
                }
            } else {
                // Tangani error lain jika perlu
                console.error("An unexpected error occurred while fetching kelulusan status:", kelulusanError);
            }
        }
        
        return studentProfile;
    } catch (error) {
        console.error("Gagal mengambil profil siswa:", error);
        redirect('/auth/login?error=data_not_found');
    }
}

export default async function StudentDashboardPage() {
  const userProfile = await getStudentData();

  if (userProfile.status_kelulusan === 'TIDAK LULUS') {
    return <TidakLulusInfo name={userProfile.name} />;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Formulir Pendaftaran Ulang</CardTitle>
            <CardDescription>
              Selamat datang, <strong>{userProfile.name || "Siswa"}</strong>. 
              Silakan lengkapi atau periksa kembali data di bawah ini.
            </CardDescription>
          </div>
          {userProfile.status === 'selesai' && (
            <Button asChild>
              <Link href="/dashboard/siswa/cetak">
                <Printer className="mr-2 h-4 w-4" />
                Cetak Kartu Bukti
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <StudentReregistrationForm profile={userProfile} />
        </CardContent>
      </Card>
    </div>
  );
}
