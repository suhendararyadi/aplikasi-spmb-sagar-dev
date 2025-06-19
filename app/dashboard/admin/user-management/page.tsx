// PERHATIAN: Perbarui file ini di `app/dashboard/admin/user-management/page.tsx`.
// Sekarang halaman ini akan menampilkan kedua form (manual dan impor).

import { AddUserForm } from "@/components/add-user-form";
import { ImportUsersCard } from "@/components/import-users-card";
//import { Separator } from "@/components/ui/separator";

export default function UserManagementPage() {
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">
          Tambah pengguna secara manual satu per satu, atau impor dari file CSV untuk data massal.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <AddUserForm />
        <ImportUsersCard />
      </div>
    </div>
  );
}
