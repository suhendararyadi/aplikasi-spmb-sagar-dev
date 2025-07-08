'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createClient } from "@/lib/pocketbase/client";
import { CheckCircle, Edit, AlertTriangle, Loader2, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator"; // PERBAIKAN: Tambahkan impor ini

// Tipe Profile sekarang menyertakan field untuk file
type Profile = {
    id: string;
    collectionId: string;
    name?: string | null;
    registration_number?: string | null;
    school_origin?: string | null;
    entry_path?: string | null;
    accepted_major?: string | null;
    is_reconfirm?: boolean | null;
    rejection_reason?: string | null;
    status?: string | null;
    surat_pernyataan?: string | null;
};

const pb = createClient();

// Komponen untuk menampilkan ringkasan data yang sudah di-submit
const SubmittedDataSummary = ({ profile, onEdit }: { profile: Profile, onEdit: () => void }) => {
  
  const getFileUrl = () => {
    if (!profile.surat_pernyataan) return "#";
    return pb.files.getURL(profile, profile.surat_pernyataan); // Menggunakan getURL yang baru
  }

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
          <div><Label className="text-muted-foreground">Nama Lengkap</Label><p className="font-semibold">{profile.name}</p></div>
          <div><Label className="text-muted-foreground">Asal Sekolah</Label><p className="font-semibold">{profile.school_origin}</p></div>
          <div><Label className="text-muted-foreground">Jalur Masuk</Label><p className="font-semibold">{profile.entry_path}</p></div>
          <div><Label className="text-muted-foreground">Program Keahlian</Label><p className="font-semibold">{profile.accepted_major}</p></div>
          <div><Label className="text-muted-foreground">Konfirmasi Melanjutkan</Label><p className="font-semibold">{profile.is_reconfirm ? 'Ya, Melanjutkan' : 'Tidak'}</p></div>
          {profile.is_reconfirm === false && (
            <div><Label className="text-muted-foreground">Alasan Tidak Melanjutkan</Label><p className="font-semibold">{profile.rejection_reason}</p></div>
          )}
          {profile.surat_pernyataan && (
             <div><Label className="text-muted-foreground">Surat Pernyataan</Label><p><a href={getFileUrl()} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-2"><FileText size={16}/>Lihat Dokumen</a></p></div>
          )}
        </div>
      </div>

      <div className="text-center pt-4">
        <Button onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" /> Ubah Data Konfirmasi
        </Button>
      </div>
    </div>
  );
};


export function StudentReregistrationForm({ profile }: { profile: Profile }) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(profile.status !== 'selesai');
    
    // State yang bisa diubah oleh siswa
    const [isReconfirm, setIsReconfirm] = useState(profile.is_reconfirm?.toString() || '');
    const [rejectionReason, setRejectionReason] = useState(profile.rejection_reason || '');
    const [pernyataanFile, setPernyataanFile] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{type: 'error' | 'success', message: string} | null>(null);

    const getFileUrl = () => {
      if (!profile.surat_pernyataan) return "#";
      return pb.files.getURL(profile, profile.surat_pernyataan); // Menggunakan getURL yang baru
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification(null);

        // Validasi hanya untuk field yang bisa diisi siswa
        if (!isReconfirm || (!pernyataanFile && !profile.surat_pernyataan) ) {
          setNotification({type: 'error', message: "Harap isi Konfirmasi Melanjutkan dan unggah Surat Pernyataan."});
          setIsLoading(false);
          return;
        }

        const formData = new FormData();
        // Hanya kirim data yang bisa diubah oleh siswa
        formData.append('is_reconfirm', isReconfirm);
        formData.append('rejection_reason', isReconfirm === 'false' ? rejectionReason : '');
        formData.append('status', 'selesai');
        if (pernyataanFile) {
          formData.append('surat_pernyataan', pernyataanFile);
        }

        try {
            const userId = pb.authStore.model?.id;
            if (!userId) throw new Error("Sesi tidak valid. Silakan login ulang.");
            
            await pb.collection('users').update(userId, formData);

            setNotification({type: 'success', message: 'Data berhasil disimpan!'});
            setTimeout(() => {
                setIsEditing(false);
                router.refresh();
            }, 1500);

        } catch (error) {
            console.error("Error updating profile:", error);
            setNotification({type: 'error', message: `Gagal menyimpan data: ${(error as Error).message}`});
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
                    <Input id="fullName" value={profile.name || ''} readOnly disabled className="bg-muted/50" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="schoolOrigin">Asal Sekolah</Label>
                <Input id="schoolOrigin" value={profile.school_origin || ''} readOnly disabled className="bg-muted/50"/>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="entryPath">Jalur Masuk</Label>
                    <Input id="entryPath" value={profile.entry_path || ''} readOnly disabled className="bg-muted/50"/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="acceptedMajor">Diterima di Program Keahlian</Label>
                    <Input id="acceptedMajor" value={profile.accepted_major || ''} readOnly disabled className="bg-muted/50"/>
                </div>
            </div>

            <Separator />

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
            
            <div className="space-y-3">
              <Label htmlFor="surat_pernyataan">Dokumen Surat Pernyataan</Label>
              <Input 
                id="surat_pernyataan" 
                type="file" 
                accept=".pdf, .jpg, .jpeg, .png"
                onChange={(e) => setPernyataanFile(e.target.files ? e.target.files[0] : null)}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Unggah file PDF atau Gambar (JPG, PNG). Maksimal 5MB.
              </p>
              {profile.surat_pernyataan && !pernyataanFile && (
                <div className="text-sm flex items-center gap-2 text-green-600">
                  <FileText size={16} />
                  <span>File sudah terunggah: </span>
                  <a href={getFileUrl()} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">{profile.surat_pernyataan}</a>
                </div>
              )}
            </div>
            
            {notification && (
              <div className={`p-3 rounded-md flex items-center gap-3 text-sm ${notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300'}`}>
                {notification.type === 'error' ? <AlertTriangle className="h-5 w-5"/> : <CheckCircle className="h-5 w-5"/>}
                <span>{notification.message}</span>
              </div>
            )}

            <div className="flex justify-end gap-4">
              {profile.status === 'selesai' && isEditing && (
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>Batal</Button>
              )}
              <Button type="submit" className="min-w-[120px]" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? 'Menyimpan...' : 'Simpan Data'}
              </Button>
            </div>
        </form>
    )
}
