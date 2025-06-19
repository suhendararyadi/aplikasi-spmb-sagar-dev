// PERHATIAN: Perbarui file ini di dalam direktori `components/`.
// Kode ini sekarang menangani status "selesai" dan mode "edit".

'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Edit, AlertTriangle, Loader2 } from "lucide-react";

// Definisikan tipe (TypeScript) untuk props 'profile' agar kode lebih aman dan mudah dibaca.
type Profile = {
    id: string;
    full_name?: string | null;
    registration_number?: string | null;
    school_origin?: string | null;
    entry_path?: string | null;
    accepted_major?: string | null;
    is_reconfirm?: boolean | null;
    rejection_reason?: string | null;
    status?: string | null;
};

// Komponen baru untuk menampilkan ringkasan data yang sudah di-submit
const SubmittedDataSummary = ({ profile, onEdit }: { profile: Profile, onEdit: () => void }) => {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-4">
        <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500" />
        <div>
          <h3 className="font-bold text-lg text-green-800 dark:text-green-200">Pendaftaran Ulang Selesai</h3>
          <p className="text-green-700 dark:text-green-300 mt-1">
            Terima kasih, data Anda telah kami terima.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-lg border-b pb-2">Ringkasan Data Anda</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div><Label className="text-muted-foreground">Nomor Pendaftaran</Label><p className="font-semibold">{profile.registration_number}</p></div>
          <div><Label className="text-muted-foreground">Nama Lengkap</Label><p className="font-semibold">{profile.full_name}</p></div>
          <div><Label className="text-muted-foreground">Asal Sekolah</Label><p className="font-semibold">{profile.school_origin}</p></div>
          <div><Label className="text-muted-foreground">Jalur Masuk</Label><p className="font-semibold">{profile.entry_path}</p></div>
          <div><Label className="text-muted-foreground">Program Keahlian</Label><p className="font-semibold">{profile.accepted_major}</p></div>
          <div><Label className="text-muted-foreground">Konfirmasi Melanjutkan</Label><p className="font-semibold">{profile.is_reconfirm ? 'Ya, Melanjutkan' : 'Tidak'}</p></div>
          {profile.is_reconfirm === false && (
            <div><Label className="text-muted-foreground">Alasan Tidak Melanjutkan</Label><p className="font-semibold">{profile.rejection_reason}</p></div>
          )}
        </div>
      </div>

      <div className="text-center pt-4">
        <Button onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" /> Ubah Data
        </Button>
      </div>
    </div>
  );
};


export function StudentReregistrationForm({ profile }: { profile: Profile }) {
    const router = useRouter();
    const supabase = createClient();

    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState(profile.full_name || '');
    const [schoolOrigin, setSchoolOrigin] = useState(profile.school_origin || '');
    const [entryPath, setEntryPath] = useState(profile.entry_path || '');
    const [acceptedMajor, setAcceptedMajor] = useState(profile.accepted_major || '');
    const [isReconfirm, setIsReconfirm] = useState(profile.is_reconfirm?.toString() || '');
    const [rejectionReason, setRejectionReason] = useState(profile.rejection_reason || '');
    
    const [isLoading, setIsLoading] = useState(false);
    // --- PERUBAHAN: Gunakan satu state untuk notifikasi ---
    const [notification, setNotification] = useState<{type: 'error' | 'success', message: string} | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification(null);

        if (!entryPath || !acceptedMajor || !isReconfirm || !schoolOrigin) {
          setNotification({type: 'error', message: "Harap isi semua kolom yang wajib diisi (Asal Sekolah, Jalur Masuk, Program Keahlian, dan Konfirmasi)."});
          setIsLoading(false);
          return;
        }

        const dataToUpdate = {
            id: profile.id,
            full_name: fullName,
            school_origin: schoolOrigin,
            entry_path: entryPath,
            accepted_major: acceptedMajor,
            is_reconfirm: isReconfirm === 'true',
            rejection_reason: isReconfirm === 'false' ? rejectionReason : null,
            status: 'selesai',
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabase.from('profiles').update(dataToUpdate).eq('id', profile.id);

        if (error) {
            console.error("Error updating profile:", error);
            setNotification({type: 'error', message: `Gagal menyimpan data: ${error.message}`});
        } else {
            setNotification({type: 'success', message: 'Data berhasil disimpan!'});
            // Beri jeda agar notifikasi terlihat sebelum refresh
            setTimeout(() => {
                setIsEditing(false);
                router.refresh();
            }, 1500);
        }

        setIsLoading(false);
    };

    if (profile.status === 'selesai' && !isEditing) {
      return <SubmittedDataSummary profile={profile} onEdit={() => setIsEditing(true)} />;
    }
    
    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Nomor Pendaftaran</Label>
                    <Input id="registrationNumber" value={profile.registration_number || ''} readOnly disabled className="bg-muted/50"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="fullName">Nama Lengkap</Label>
                    <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isLoading} />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="schoolOrigin">Asal Sekolah</Label>
                <Input id="schoolOrigin" placeholder="Contoh: SMPN 1 CIGUGUR" value={schoolOrigin} onChange={(e) => setSchoolOrigin(e.target.value)} required disabled={isLoading}/>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="entryPath">Jalur Masuk</Label>
                     <Select name="entryPath" onValueChange={setEntryPath} value={entryPath} required disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih jalur masuk" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Anak Guru">Anak Guru</SelectItem>
                            <SelectItem value="Mutasi">Mutasi</SelectItem>
                            <SelectItem value="KETM">KETM</SelectItem>
                            <SelectItem value="Domisili Terdekat">Domisili Terdekat</SelectItem>
                            <SelectItem value="Persiapan Kelas Industri">Persiapan Kelas Industri</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="acceptedMajor">Diterima di Program Keahlian</Label>
                    <Select name="acceptedMajor" onValueChange={setAcceptedMajor} value={acceptedMajor} required disabled={isLoading}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih program keahlian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="DPIB">Desain Pemodelan dan Informasi Bangunan (DPIB)</SelectItem>
                            <SelectItem value="TEI">Teknik Elektronika Industri (TEI)</SelectItem>
                            <SelectItem value="TITL">Teknik Instalasi Tenaga Listrik (TITL)</SelectItem>
                            <SelectItem value="TKRO">Teknik Kendaraan Ringan Otomotif (TKRO)</SelectItem>
                            <SelectItem value="TKJ">Teknik Jaringan Komputer dan Telekomunikasi (TKJ)</SelectItem>
                            <SelectItem value="DKV">Desain Komunikasi Visual (DKV)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-3">
                <Label>Konfirmasi kesiapan melanjutkan / daftar ulang</Label>
                <RadioGroup value={isReconfirm} onValueChange={setIsReconfirm} className="flex items-center gap-6" required disabled={isLoading}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="reconfirm-yes" />
                        <Label htmlFor="reconfirm-yes">Ya, saya akan melanjutkan</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="reconfirm-no" />
                        <Label htmlFor="reconfirm-no">Tidak</Label>
                    </div>
                </RadioGroup>
            </div>
            
            {isReconfirm === 'false' && (
                <div className="space-y-2">
                    <Label htmlFor="rejectionReason">Berikan Alasan Anda</Label>
                    <Textarea 
                        id="rejectionReason" 
                        placeholder="Contoh: Diterima di sekolah lain" 
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        required={isReconfirm === 'false'}
                        disabled={isLoading}
                    />
                </div>
            )}
            
            {notification && (
              <div className={`p-3 rounded-md flex items-center gap-3 text-sm ${notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'}`}>
                {notification.type === 'error' ? <AlertTriangle className="h-5 w-5"/> : <CheckCircle className="h-5 w-5"/>}
                <span>{notification.message}</span>
              </div>
            )}

            <div className="flex justify-end gap-4">
              {isEditing && (
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                  Batal
                </Button>
              )}
              <Button type="submit" className="min-w-[120px]" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Menyimpan...' : 'Simpan Data'}
              </Button>
            </div>
        </form>
    )
}
