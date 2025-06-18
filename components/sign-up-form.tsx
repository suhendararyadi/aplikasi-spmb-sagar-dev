// PERHATIAN: Perbarui file `components/sign-up-form.tsx` Anda dengan kode ini.
// Tujuannya adalah untuk membuat user uji coba melalui UI.

"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
//import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // State baru untuk menampung data yang akan menjadi metadata
  const [fullName, setFullName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // Modifikasi di sini: tambahkan 'data' ke dalam 'options'
      // untuk menyimpan metadata saat registrasi.
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            registration_number: registrationNumber,
          },
          // Arahkan email konfirmasi ke halaman yang benar
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });
      if (error) throw error;
      // Alih-alih redirect, cukup tampilkan pesan sukses
      alert("User berhasil dibuat! Cek email untuk konfirmasi, lalu nonaktifkan kembali fitur sign-up di Supabase.");
      router.push("/auth/login");

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Buat User Uji Coba</CardTitle>
          <CardDescription>Gunakan form ini untuk membuat user, lalu nonaktifkan kembali.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-4">
              {/* Tambahkan input untuk Full Name dan Registration Number */}
              <div className="grid gap-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName" type="text" placeholder="Nama Siswa Uji Coba" required
                  value={fullName} onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="registrationNumber">Nomor Peserta</Label>
                <Input
                  id="registrationNumber" type="text" placeholder="Contoh: 199208242020121012" required
                  value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)}
                />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="email">Email (Nomor Peserta + Domain)</Label>
                <Input
                  id="email" type="email" placeholder="contoh@sekolah.id" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password" type="password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Membuat Akun..." : "Buat Akun Uji Coba"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
