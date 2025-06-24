"use client";

import { createClient } from "@/lib/pocketbase/client"; // PERBAIKAN: Impor dari helper PocketBase
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    // Gunakan client dari PocketBase
    const pb = createClient();
    
    // PERBAIKAN: Logika logout untuk PocketBase adalah dengan membersihkan authStore
    pb.authStore.clear();

    // Arahkan ke halaman utama setelah keluar
    router.push("/");
    // Refresh halaman untuk memastikan server mengenali perubahan sesi
    router.refresh();
  };

  return (
    <Button variant="ghost" size="sm" onClick={logout}>
        <LogOut className="mr-0 sm:mr-2 h-4 w-4"/>
        <span className="hidden sm:inline">Keluar</span>
    </Button>
  );
}
