// PERHATIAN: Perbarui file ini. Sekarang form ini menggunakan Server Action.

'use client';

// Gunakan hook dari 'react-dom' untuk stabilitas
import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createInitialUser } from '@/app/auth/sign-up/actions'; // Impor action baru
import { Loader2, AlertCircle } from 'lucide-react';

const initialState = { error: null, successMessage: null };

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
  const [state, formAction] = useFormState(createInitialUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.successMessage) {
      alert(state.successMessage + " Anda akan diarahkan ke halaman login.");
      router.push("/auth/login");
    }
  }, [state, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Buat Akun Admin Pertama</CardTitle>
          <CardDescription>Gunakan form ini untuk mendaftarkan akun admin awal.</CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} action={formAction}>
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
              
              {state.error && (
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
