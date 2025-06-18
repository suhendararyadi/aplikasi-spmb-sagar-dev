// PERHATIAN: Perbarui file `components/login-form.tsx` Anda dengan kode ini.
// Perubahan utama: Login menggunakan Nomor Peserta, bukan email, dan menghapus link sign-up.

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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  // State diubah dari 'email' menjadi 'participantNumber' untuk kejelasan.
  const [participantNumber, setParticipantNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // --- PERUBAHAN DI SINI ---
      // Domain disesuaikan dengan contoh yang Anda berikan.
      // Pastikan domain ini sama dengan yang digunakan saat membuat user di database.
      const email = `${participantNumber}@smknegeri9garut.sch.id`;
      // -------------------------

      const { error } = await supabase.auth.signInWithPassword({
        email, // Gunakan email yang sudah diformat
        password,
      });
      if (error) throw error;
      
      router.push("/dashboard/siswa");

    } catch (error: unknown) {
      // Memberikan pesan error yang lebih ramah
      if (error instanceof Error && error.message.includes("Invalid login credentials")) {
        setError("Nomor Peserta atau Password salah. Silakan coba lagi.");
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Terjadi kesalahan. Silakan coba beberapa saat lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login Siswa</CardTitle>
          <CardDescription>
            Masukkan Nomor Peserta dan Password Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="participantNumber">Nomor Peserta</Label>
                <Input
                  id="participantNumber"
                  type="text" // Diubah dari "email" menjadi "text"
                  placeholder="Contoh: 199208242020121012"
                  required
                  value={participantNumber}
                  onChange={(e) => setParticipantNumber(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Lupa password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password Anda"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
            {/* Link untuk Sign Up sudah dihapus */}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
