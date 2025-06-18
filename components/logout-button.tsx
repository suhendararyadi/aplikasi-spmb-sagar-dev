// PERHATIAN: Perbarui file `components/logout-button.tsx`.
// Perubahan: Teks diubah, ikon ditambahkan, dan redirect ke halaman utama.

"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/"); // Arahkan ke halaman utama setelah keluar
  };

  return (
    <Button variant="ghost" size="sm" onClick={logout}>
        <LogOut className="mr-0 sm:mr-2 h-4 w-4"/>
        <span className="hidden sm:inline">Keluar</span>
    </Button>
  );
}
