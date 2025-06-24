'use client';

// Impor hook yang diperlukan dari 'react' dan 'react-dom'
import { useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// PERBAIKAN: Hapus impor untuk action yang sudah tidak ada
// import { createInitialUser } from '@/app/auth/sign-up/actions'; 
import { Loader2, AlertCircle } from 'lucide-react';

// Definisikan tipe untuk state form
type FormState = {
  error?: { message: string } | null;
  successMessage?: string | null;
};

const initialState: FormState = { error: null, successMessage: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Mendaftarkan..." : "Buat Akun Admin"}
    </Button>
  );
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  // PERBAIKAN: Karena action sudah tidak ada, kita ganti 'useActionState' dengan 'useState'
  // Ini akan membuat form tidak melakukan apa-apa saat disubmit, tapi menghilangkan error.
  const [state, setState] = useState<FormState>(initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.successMessage) {
      alert(state.successMessage + " Anda akan diarahkan ke halaman login.");
      router.push("/auth/login");
    }
  }, [state, router]);

  // Placeholder untuk fungsi submit karena action sudah dihapus
  const handleFormSubmit = () => {
    setState({ error: { message: "Fungsionalitas pendaftaran via form ini telah dinonaktifkan. Silakan buat admin melalui UI PocketBase." } });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Buat Akun Admin Pertama</CardTitle>
          <CardDescription>Gunakan form ini untuk mendaftarkan akun admin awal.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* PERBAIKAN: Hapus properti 'action' dari form */}
          <form ref={formRef} action={handleFormSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nama Lengkap Admin</Label>
                <Input id="fullName" name="fullName" placeholder="Admin Sekolah" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="registrationNumber">Nomor Registrasi (cth: admin01)</Label>
                <Input id="registrationNumber" name="registrationNumber" placeholder="admin01" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="admin@sekolah.id" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              
              {/* PERBAIKAN: Akses state.error dengan aman */}
              {state?.error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
                  <AlertCircle size={16}/>
                  <p className="text-sm">{state.error.message}</p>
                </div>
              )}
              
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
