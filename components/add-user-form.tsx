'use client';

// Menggunakan hook dari 'react' dan 'react-dom'
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';

import { addUser } from '@/app/dashboard/admin/user-management/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const initialState = {
  successMessage: null,
  error: null,
  data: null,
};

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
  const [state, formAction] = useActionState(addUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.successMessage) {
      alert(state.successMessage);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tambah Pengguna Baru (Manual)</CardTitle>
        <CardDescription>
          Buat akun siswa baru. Siswa akan melakukan konfirmasi pendaftaran setelah login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Nomor Pendaftaran</Label>
              <Input id="registrationNumber" name="registrationNumber" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input id="fullName" name="fullName" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schoolOrigin">Asal Sekolah</Label>
            <Input id="schoolOrigin" name="schoolOrigin" required />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="jalurPendaftaran">Jalur Pendaftaran</Label>
            <Select name="jalur_pendaftaran" required>
                <SelectTrigger><SelectValue placeholder="Pilih jalur pendaftaran..." /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="SPMB">SPMB</SelectItem>
                    <SelectItem value="PAPS">PAPS</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="entryPath">Jalur Masuk</Label>
                <Select name="entryPath" required>
                    <SelectTrigger><SelectValue placeholder="Pilih jalur..." /></SelectTrigger>
                    <SelectContent>
                        {/* Opsi yang sudah diperbarui ada di sini */}
                        <SelectItem value="Anak Guru">Anak Guru</SelectItem>
                        <SelectItem value="Mutasi">Mutasi</SelectItem>
                        <SelectItem value="KETM">KETM</SelectItem>
                        <SelectItem value="Domisili Terdekat">Domisili Terdekat</SelectItem>
                        <SelectItem value="Persiapan Kelas Industri">Persiapan Kelas Industri</SelectItem>
                        <SelectItem value="PRESTASI NILAI RAPOR">Prestasi Nilai Rapor</SelectItem>
                        <SelectItem value="Bina Lingkungan Geografis Terdekat">Bina Lingkungan Geografis Terdekat</SelectItem>
                        <SelectItem value="KEJUARAAN AKADEMIK">Kejuaraan Akademik</SelectItem>
                        <SelectItem value="KEJUARAAN NON AKADEMIK">Kejuaraan Non Akademik</SelectItem>
                        <SelectItem value="KEPEMIMPINAN">Kepemimpinan</SelectItem>
                        <SelectItem value="PANTI">Panti</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="acceptedMajor">Program Keahlian</Label>
                <Select name="acceptedMajor" required>
                    <SelectTrigger><SelectValue placeholder="Pilih jurusan..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Dalam Proses Pemetaan">Dalam Proses Pemetaan</SelectItem>
                        <SelectItem value="DPIB">DPIB</SelectItem>
                        <SelectItem value="TEI">TEI</SelectItem>
                        <SelectItem value="TITL">TITL</SelectItem>
                        <SelectItem value="TKRO">TKRO</SelectItem>
                        <SelectItem value="TKJ">TKJ</SelectItem>
                        <SelectItem value="DKV">DKV</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>

          {state?.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-center gap-3 text-sm">
                <AlertCircle className="h-5 w-5"/>
                <span>{state.error.message}</span>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
