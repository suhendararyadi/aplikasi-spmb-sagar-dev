"use client";

import { createClient } from "@/lib/pocketbase/client";
import { cn } from "@/lib/utils";
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
// PERBAIKAN: Hapus impor useRouter karena tidak lagi digunakan.
// import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [participantNumber, setParticipantNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // PERBAIKAN: Hapus deklarasi router yang tidak digunakan.
  // const router = useRouter(); 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const pb = createClient();
    setIsLoading(true);
    setMessage(null);

    try {
      const identity = participantNumber;
      const authData = await pb.collection('users').authWithPassword(identity, password);

      document.cookie = pb.authStore.exportToCookie({ httpOnly: false });

      setMessage({ type: 'success', text: 'Login berhasil! Mengarahkan ke dashboard...' });

      const targetUrl = authData.record.role === 'admin' ? '/dashboard/admin' : '/dashboard/siswa';
      
      window.location.href = targetUrl;

    } catch (error: unknown) {
      // PERBAIKAN: Gunakan variabel error untuk logging agar tidak ada peringatan.
      // Ini juga sangat membantu untuk debugging di masa depan.
      console.error("Login failed:", error);
      setMessage({ type: 'error', text: "Nomor Peserta atau Password salah. Silakan coba lagi." });
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
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
                  placeholder="Contoh: 20253861-11-2-XXXX"
                  required
                  value={participantNumber}
                  onChange={(e) => setParticipantNumber(e.target.value)}
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>

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
