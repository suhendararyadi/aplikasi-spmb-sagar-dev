// PERHATIAN: Perbarui file `components/login-form.tsx` Anda dengan kode ini.
// Perubahan: Menambahkan notifikasi sukses saat login berhasil.

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
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react"; // Import ikon

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [participantNumber, setParticipantNumber] = useState("");
  const [password, setPassword] = useState("");
  // State notifikasi digabung untuk error dan sukses
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setMessage(null); // Reset pesan setiap kali login dicoba

    try {
      const email = `${participantNumber}@smknegeri9garut.sch.id`;

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // Tampilkan pesan sukses sebelum redirect
      setMessage({ type: 'success', text: 'Login berhasil! Anda akan segera diarahkan.' });
      
      // Beri jeda 1.5 detik agar pengguna bisa membaca pesan
      setTimeout(() => {
          router.push("/dashboard/siswa");
      }, 1500);

    } catch (error: unknown) {
      // Atur pesan error jika login gagal
      if (error instanceof Error && error.message.includes("Invalid login credentials")) {
        setMessage({ type: 'error', text: "Nomor Peserta atau Password salah. Silakan coba lagi." });
      } else if (error instanceof Error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'error', text: "Terjadi kesalahan. Silakan coba beberapa saat lagi." });
      }
      setIsLoading(false); // Hentikan loading hanya jika ada error
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
                  type="text"
                  placeholder="Contoh: 199208242020121012"
                  required
                  value={participantNumber}
                  onChange={(e) => setParticipantNumber(e.target.value)}
                  disabled={isLoading} // Nonaktifkan input saat loading
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
                  disabled={isLoading} // Nonaktifkan input saat loading
                />
              </div>

              {/* Tampilkan pesan notifikasi berdasarkan tipenya */}
              {message && (
                <div className={cn(
                  "p-3 rounded-md flex items-center gap-3 text-sm",
                  message.type === 'error' && "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300",
                  message.type === 'success' && "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                )}>
                  {message.type === 'error' && <AlertTriangle className="h-5 w-5"/>}
                  {message.type === 'success' && <CheckCircle className="h-5 w-5"/>}
                  <span>{message.text}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {/* Tampilkan ikon loading saat memproses */}
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {message?.type === 'success' ? 'Berhasil...' : isLoading ? 'Memverifikasi...' : 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
