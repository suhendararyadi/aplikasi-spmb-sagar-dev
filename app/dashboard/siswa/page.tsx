import { createServerClient } from "@/lib/pocketbase/server"; // PERBAIKAN: Path impor diubah
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
        <CardHeader>
          <CardTitle className="text-2xl">Formulir Pendaftaran Ulang</CardTitle>
          <CardDescription>
            Selamat datang, <strong>{userProfile.name || "Siswa"}</strong>. 
            Silakan lengkapi atau periksa kembali data di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StudentReregistrationForm profile={userProfile} />
        </CardContent>
      </Card>
    </div>
  );
}
