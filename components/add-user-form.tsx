'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { addUser } from '@/app/dashboard/admin/user-management/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

// State awal untuk form
const initialState = {
  error: null,
  data: null,
};

// Komponen tombol submit dengan status loading
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" aria-disabled={pending} disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Menambahkan...' : 'Tambah Pengguna'}
    </Button>
  );
}

export function AddUserForm() {
  const [state, formAction] = useFormState(addUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Efek untuk menampilkan notifikasi setelah form di-submit
  useEffect(() => {
    if (state?.data) {
      alert('Pengguna berhasil ditambahkan!');
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Pengguna Baru</CardTitle>
        <CardDescription>
          Buat akun siswa baru. Password akan secara otomatis disamakan dengan Nomor Pendaftaran.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nama Lengkap</Label>
            <Input id="fullName" name="fullName" placeholder="Contoh: Budi Santoso" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Nomor Pendaftaran</Label>
            <Input id="registrationNumber" name="registrationNumber" placeholder="Contoh: 2025123456" required />
          </div>

          {/* Menampilkan pesan error jika ada */}
          {state?.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-center gap-3 text-sm">
                <AlertCircle className="h-5 w-5"/>
                <span>{state.error.message}</span>
            </div>
          )}

          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
