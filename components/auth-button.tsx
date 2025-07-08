import Link from "next/link";
import { Button } from "./ui/button";
import { createServerClient } from "@/lib/pocketbase/server";
import { LogoutButton } from "./logout-button";
import { LayoutDashboard } from "lucide-react";

// Terima prop 'disabled'
export async function AuthButton({ disabled = false }: { disabled?: boolean }) {
  const pb = await createServerClient();
  const user = pb.authStore.model;

  return user ? (
    <div className="flex items-center gap-2 md:gap-4">
      <Button asChild size="sm">
        <Link href={user.role === 'admin' ? '/dashboard/admin' : '/dashboard/siswa'} className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
        </Link>
      </Button>
      
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline text-muted-foreground">|</span>
        <span className="hidden sm:inline">Halo, {user.name?.split(' ')[0]}!</span>
        <LogoutButton />
      </div>
    </div>
  ) : (
    // Terapkan prop 'disabled' ke tombol login
    <Button asChild size="sm" variant={"outline"} disabled={disabled}>
      <Link href="/auth/login" aria-disabled={disabled} className={disabled ? "pointer-events-none" : ""}>
        Login
      </Link>
    </Button>
  );
}
