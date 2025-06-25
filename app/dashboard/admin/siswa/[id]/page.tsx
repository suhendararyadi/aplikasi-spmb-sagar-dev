import { createServerClient } from "@/lib/pocketbase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import PocketBase from 'pocketbase';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Tipe untuk data profil lengkap dari PocketBase
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
    email?: string | null;
    created?: string | null;
    updated?: string | null;
    role?: 'admin' | 'siswa';
};

// PERBAIKAN: Definisikan tipe props untuk halaman dinamis secara eksplisit.
interface PageProps {
    params: {
        id: string;
    };
}

// Fungsi untuk mengambil data siswa berdasarkan ID
async function getStudentData(id: string) {
    const pb = await createServerClient();
    
    // Pastikan hanya admin yang bisa mengakses halaman ini
    if (!pb.authStore.isValid || pb.authStore.model?.role !== 'admin') {
        redirect('/auth/login');
    }

    try {
        const studentProfile: Profile = await pb.collection('users').getOne(id);
        return studentProfile;
    } catch (error) {
        // Jika siswa dengan ID tersebut tidak ditemukan, tampilkan halaman 404
        console.error("Gagal mengambil profil siswa:", error);
        notFound();
    }
}

// Komponen helper untuk menampilkan baris data agar rapi
function DataRow({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">{label}</Label>
            <div className="font-semibold text-base">{children || value || "-"}</div>
        </div>
    );
}

// PERBAIKAN: Gunakan tipe PageProps yang sudah didefinisikan.
export default async function StudentProfilePage({ params }: PageProps) {
    const student = await getStudentData(params.id);
    
    const getFileUrl = (filename: string) => {
        // Gunakan instance pb baru agar tidak ada state yang tercampur
        return new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!).getFileUrl(student, filename);
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
             <div className="mb-6">
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/admin">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Dashboard
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Profil Detail Siswa</CardTitle>
                    <CardDescription>
                        Berikut adalah data lengkap dan dokumen yang telah diisi oleh siswa.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Bagian Data Diri */}
                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Data Diri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <DataRow label="Nama Lengkap" value={student.name} />
                            <DataRow label="Nomor Pendaftaran" value={student.registration_number} />
                            <DataRow label="Asal Sekolah" value={student.school_origin} />
                            <DataRow label="Email (Sistem)" value={student.email} />
                        </div>
                    </section>
                    
                    {/* Bagian Data Pendaftaran */}
                    <section>
                         <h3 className="font-semibold text-lg border-b pb-2 mb-4">Status Pendaftaran</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <DataRow label="Jalur Masuk" value={student.entry_path} />
                            <DataRow label="Program Keahlian Diterima" value={student.accepted_major} />
                            <DataRow label="Status Formulir">
                                <Badge variant={student.status === 'selesai' ? 'default' : 'secondary'}>
                                    {student.status === 'selesai' ? 'Selesai Mengisi' : 'Belum Mengisi'}
                                </Badge>
                            </DataRow>
                            <DataRow label="Konfirmasi Melanjutkan">
                                {student.is_reconfirm === true && <span className="flex items-center gap-2 text-green-600 font-semibold"><CheckCircle size={16}/> Ya, Melanjutkan</span>}
                                {student.is_reconfirm === false && <span className="flex items-center gap-2 text-red-600 font-semibold"><XCircle size={16}/> Tidak Melanjutkan</span>}
                                {student.is_reconfirm === null && <span>-</span>}
                            </DataRow>
                            {student.is_reconfirm === false && (
                                <DataRow label="Alasan Tidak Melanjutkan" value={student.rejection_reason} />
                            )}
                         </div>
                    </section>

                    {/* Bagian Dokumen */}
                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Dokumen Terunggah</h3>
                        <DataRow label="Surat Pernyataan">
                            {student.surat_pernyataan ? (
                                <Button asChild variant="outline" size="sm" className="w-fit">
                                    <a href={getFileUrl(student.surat_pernyataan)} target="_blank" rel="noopener noreferrer">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Lihat/Unduh Dokumen
                                    </a>
                                </Button>
                            ) : (
                                <p className="text-muted-foreground italic">Siswa belum mengunggah dokumen.</p>
                            )}
                        </DataRow>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
