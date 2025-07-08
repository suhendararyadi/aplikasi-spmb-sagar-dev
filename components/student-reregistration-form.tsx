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
import { Separator } from "@/components/ui/separator";

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
    jalur_pendaftaran?: string | null;
};

const pb = createClient();

// Komponen helper untuk menampilkan baris data sebagai teks informasi
function DataRowDisplay({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-muted-foreground">{label}</Label>
            <p className="font-medium text-base p-3 bg-muted/50 rounded-md border h-9 flex items-center">{value || "-"}</p>
        </div>
    );
}


// Komponen untuk menampilkan ringkasan data yang sudah di-submit
const SubmittedDataSummary = ({ profile, onEdit }: { profile: Profile, onEdit: () => void }) => {
  
  const getFileUrl = () => {
    if (!profile.surat_pernyataan) return "#";
    return pb.files.getURL(profile, profile.surat_pernyataan);
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
          <DataRowDisplay label="Nomor Pendaftaran" value={profile.registration_number} />
          <DataRowDisplay label="Nama Lengkap" value={profile.name} />
          <DataRowDisplay label="Asal Sekolah" value={profile.school_origin} />
          <DataRowDisplay label="Jalur Pendaftaran" value={profile.jalur_pendaftaran} />
          <DataRowDisplay label="Jalur Masuk" value={profile.entry_path} />
          <DataRowDisplay label="Program Keahlian" value={profile.accepted_major} />
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
    
    // State hanya untuk field yang bisa diubah oleh siswa
    const [isReconfirm, setIsReconfirm] = useState(profile.is_reconfirm?.toString() || '');
    const [rejectionReason, setRejectionReason] = useState(profile.rejection_reason || '');
    const [pernyataanFile, setPernyataanFile] = useState<File | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{type: 'error' | 'success', message: string} | null>(null);

    const getFileUrl = () => {
      if (!profile.surat_pernyataan) return "#";
      return pb.files.getURL(profile, profile.surat_pernyataan);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setNotification(null);

        if (!isReconfirm || (!pernyataanFile && !profile.surat_pernyataan) ) {
          setNotification({type: 'error', message: "Harap isi Konfirmasi Melanjutkan dan unggah Surat Pernyataan."});
          setIsLoading(false);
          return;
        }

        const formData = new FormData();
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
            {/* PERUBAHAN: Data ditampilkan sebagai teks, bukan form input */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Data Penerimaan Anda</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DataRowDisplay label="Nomor Pendaftaran" value={profile.registration_number} />
                    <DataRowDisplay label="Nama Lengkap" value={profile.name} />
                    <DataRowDisplay label="Asal Sekolah" value={profile.school_origin} />
                    <DataRowDisplay label="Jalur Pendaftaran" value={profile.jalur_pendaftaran} />
                    <DataRowDisplay label="Jalur Masuk" value={profile.entry_path} />
                    <DataRowDisplay label="Diterima di Program Keahlian" value={profile.accepted_major} />
                </div>
            </div>

            <Separator />

            {/* Bagian ini tetap berupa form yang bisa diisi */}
            <div className="space-y-6">
                <h3 className="font-semibold text-lg">Konfirmasi Pendaftaran Ulang</h3>
                <div className="space-y-3">
                    <Label>Apakah Anda bersedia melanjutkan proses pendaftaran ulang?</Label>
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
                  <Label htmlFor="surat_pernyataan">Unggah Dokumen Surat Pernyataan</Label>
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
