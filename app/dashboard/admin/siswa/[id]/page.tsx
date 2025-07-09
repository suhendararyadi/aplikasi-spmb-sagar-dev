import { createServerClient } from "@/lib/pocketbase/server";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import PocketBase, { ClientResponseError } from 'pocketbase'; // PERBAIKAN: Impor tipe error
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UpdateStatusForm } from "@/components/update-status-form";

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
    status_kelulusan?: string | null;
    jalur_pendaftaran?: string | null;
};

interface PageProps {
    params: { id: string; };
}

// Pemetaan dari singkatan ke nama jurusan lengkap
const majorMap: { [key: string]: string } = {
    'DPIB': 'Desain Pemodelan dan Informasi Bangunan (DPIB)',
    'TEI': 'Teknik Elektronika Industri (TEI)',
    'TITL': 'Teknik Instalasi Tenaga Listrik (TITL)',
    'TKRO': 'Teknik Kendaraan Ringan Otomotif (TKRO)',
    'TKJ': 'Teknik Jaringan Komputer dan Telekomunikasi (TKJ)',
    'DKV': 'Desain Komunikasi Visual (DKV)',
    'Proses Pemetaan': 'Dalam Proses Pemetaan',
};

const getMajorFullName = (abbreviation: string | undefined | null) => {
    if (!abbreviation) return 'Informasi tidak tersedia';
    return majorMap[abbreviation] || abbreviation;
};

// Fungsi ini sekarang mengambil data dari kedua collection
async function getStudentData(id: string) {
    const pb = await createServerClient();
    if (!pb.authStore.isValid || pb.authStore.model?.role !== 'admin') {
        redirect('/auth/login');
    }
    try {
        // Langkah 1: Ambil data utama dari collection 'users'
        const studentProfile: Profile = await pb.collection('users').getOne(id);

        // Langkah 2: Ambil data status kelulusan dari collection 'status_kelulusan'
        try {
            const kelulusanRecord = await pb.collection('status_kelulusan').getFirstListItem(`nomor_pendaftaran = "${studentProfile.registration_number}"`);
            // Gabungkan status kelulusan ke profil siswa
            studentProfile.status_kelulusan = kelulusanRecord.status;
        } catch (kelulusanError) {
            // PERBAIKAN: Gunakan tipe yang lebih spesifik untuk menangani error
            if (kelulusanError instanceof ClientResponseError) {
                // Jika tidak ditemukan (404), itu bukan error fatal.
                if (kelulusanError.status !== 404) {
                    console.error("Error fetching public kelulusan status:", kelulusanError);
                }
            } else {
                 console.error("An unexpected error occurred:", kelulusanError);
            }
        }

        return studentProfile;
    } catch (error) {
        console.error("Gagal mengambil profil siswa:", error);
        notFound();
    }
}

function DataRow({ label, value, children }: { label: string; value?: string | null; children?: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <Label className="text-sm text-muted-foreground">{label}</Label>
            <div className="font-semibold text-base">{children || value || "-"}</div>
        </div>
    );
}

export default async function StudentProfilePage({ params }: PageProps) {
    const student = await getStudentData(params.id);
    
    const getFileUrl = (filename: string) => {
        return new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL!).files.getURL(student, filename);
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
                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Data Diri</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <DataRow label="Nama Lengkap" value={student.name} />
                            <DataRow label="Nomor Pendaftaran" value={student.registration_number} />
                            <DataRow label="Asal Sekolah" value={student.school_origin} />
                            <DataRow label="Jalur Pendaftaran" value={student.jalur_pendaftaran} />
                        </div>
                    </section>
                    
                    <section>
                         <h3 className="font-semibold text-lg border-b pb-2 mb-4">Status Pendaftaran</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <DataRow label="Jalur Masuk" value={student.entry_path} />
                            <DataRow label="Program Keahlian Diterima" value={getMajorFullName(student.accepted_major)} />
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

                    <section>
                        <h3 className="font-semibold text-lg border-b pb-2 mb-4">Manajemen Admin</h3>
                        <div className="mb-4">
                            <DataRow label="Status Kelulusan Saat Ini">
                                <Badge 
                                    variant={
                                        student.status_kelulusan === 'LULUS' ? 'default' :
                                        student.status_kelulusan === 'TIDAK LULUS' ? 'destructive' : 'secondary'
                                    }
                                >
                                    {student.status_kelulusan || 'Belum Ditentukan'}
                                </Badge>
                            </DataRow>
                        </div>
                        <div className="p-4 bg-muted/50 rounded-lg">
                           <p className="text-sm text-muted-foreground mb-4">Ubah data administratif untuk siswa ini.</p>
                           <UpdateStatusForm 
                                studentId={student.id} 
                                currentStatus={student.status_kelulusan} 
                                currentJalurPendaftaran={student.jalur_pendaftaran}
                           />
                        </div>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}
