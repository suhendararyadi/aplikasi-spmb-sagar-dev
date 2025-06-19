// PERHATIAN: Buat struktur folder dan file baru ini:
// `app/dashboard/admin/user-management/page.tsx`

import { AddUserForm } from "@/components/add-user-form";

export default function UserManagementPage() {
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Manajemen Pengguna</h1>
        <p className="text-muted-foreground">
          Tambah, edit, atau kelola akun pengguna dari halaman ini.
        </p>
      </div>
      
      {/* Kita akan meletakkan form tambah pengguna di sini */}
      <div className="max-w-xl">
        <AddUserForm />
      </div>

      {/* Nanti kita bisa menambahkan tabel daftar pengguna di sini */}
    </div>
  );
}
