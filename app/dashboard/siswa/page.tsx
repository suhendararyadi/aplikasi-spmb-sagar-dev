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

export default async function StudentDashboardPage() {
  const pb = await createServerClient();

  if (!pb.authStore.isValid || !pb.authStore.model) {
    redirect("/auth/login");
  }

  const userProfile = await pb.collection('users').getOne(pb.authStore.model.id);

  if (!userProfile) {
    pb.authStore.clear();
    redirect('/auth/login?error=Profil tidak ditemukan');
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
          {/* Tombol Cetak hanya muncul jika status 'selesai' */}
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
