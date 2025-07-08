import { AddUserForm } from "@/components/add-user-form";
import { ImportUsersCard } from "@/components/import-users-card";
import { ImportKelulusanCard } from "@/components/import-kelulusan-card"; // Impor komponen baru
import { Separator } from "@/components/ui/separator";

export const runtime = 'edge';

export default function UserManagementPage() {
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">
          Gunakan form di bawah ini untuk mengelola data pendaftar.
        </p>
      </div>
      
      {/* Bagian untuk membuat user baru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <AddUserForm />
        <ImportUsersCard />
      </div>

      <Separator className="my-4" />

      {/* Bagian baru untuk update status kelulusan */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">Update Status Kelulusan</h2>
        <p className="text-muted-foreground">
          Impor data kelulusan dari file CSV untuk mengumumkan hasil seleksi secara massal.
        </p>
      </div>
      <div className="max-w-lg">
        <ImportKelulusanCard />
      </div>
    </div>
  );
}
