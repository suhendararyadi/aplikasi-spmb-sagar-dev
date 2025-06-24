"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useFormStatus } from "react-dom";
// PERBAIKAN: Impor Server Action dari file terpisah
import { logoutAction } from "@/app/auth/actions";

// Komponen kecil untuk menampilkan teks dan ikon di dalam tombol
function ButtonContent() {
    // Hook ini memberikan status 'pending' saat form sedang disubmit
    const { pending } = useFormStatus();

    return (
        <>
            <LogOut className="mr-0 sm:mr-2 h-4 w-4"/>
            <span className="hidden sm:inline">
                {pending ? "Keluar..." : "Keluar"}
            </span>
        </>
    );
}


export function LogoutButton() {
  return (
    // Tombol logout sekarang ada di dalam form yang memanggil Server Action
    <form action={logoutAction}>
      <Button variant="ghost" size="sm" type="submit">
          <ButtonContent />
      </Button>
    </form>
  );
}
