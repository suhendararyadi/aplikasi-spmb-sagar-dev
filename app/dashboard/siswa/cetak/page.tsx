import { createServerClient } from "@/lib/pocketbase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { PrintButton } from "@/components/print-button";
import { QRCodeDisplay } from "@/components/qr-code"; // Impor komponen baru

// Tipe data profil yang lengkap, sekarang mencakup semua detail
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
    created?: string | null;
    status?: 'belum_mengisi' | 'selesai' | null;
};

// Fungsi untuk mengambil data siswa
async function getStudentData() {
    const pb = await createServerClient();
    if (!pb.authStore.isValid || !pb.authStore.model) redirect('/auth/login');
    try {
        const studentProfile: Profile = await pb.collection('users').getOne(pb.authStore.model.id);
        if (studentProfile.status !== 'selesai') redirect('/dashboard/siswa'); 
        return studentProfile;
    } catch (error) {
        console.error("Gagal mengambil profil siswa:", error);
        redirect('/dashboard/siswa?error=data_not_found');
    }
}

// Komponen helper untuk menampilkan baris data
function DataRow({ label, value, children }: { label: string; value?: string | null, children?: React.ReactNode }) {
    return (
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <div className="font-medium text-sm text-gray-800">{children || value || "-"}</div>
        </div>
    );
}

export default async function CetakKartuPage() {
    const student = await getStudentData();

    // Data yang akan di-encode ke dalam QR Code.
    // Ini adalah URL unik ke halaman profil siswa yang bisa diakses admin.
    const qrCodeValue = `${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/dashboard/admin/siswa/${student.id}`;

    return (
        <div className="bg-gray-100 min-h-screen py-10 px-4">
            <div className="max-w-md mx-auto mb-6 flex justify-between">
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/siswa">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Link>
                </Button>
                <PrintButton />
            </div>

            <div id="kartu-pendaftaran" className="max-w-md mx-auto bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-center text-gray-800">BUKTI PENDAFTARAN ULANG</h2>
                    <p className="text-sm text-center text-gray-600">SMKN 9 GARUT - TAHUN AJARAN 2025/2026</p>
                </div>
                {/* REVISI: Menggunakan layout grid untuk tata letak yang lebih baik */}
                <div className="grid grid-cols-3 gap-4 items-start p-6">
                    {/* Kolom Kiri untuk Data Utama */}
                    <div className="col-span-2 space-y-4">
                        <DataRow label="Nomor Pendaftaran" value={student.registration_number} />
                        <DataRow label="Nama Lengkap" value={student.name} />
                        <DataRow label="Asal Sekolah" value={student.school_origin} />
                        <DataRow label="Jalur Masuk" value={student.entry_path} />
                        <DataRow label="Diterima di Program Keahlian" value={student.accepted_major} />
                        <DataRow label="Konfirmasi Melanjutkan">
                            {student.is_reconfirm === true && <span className="flex items-center gap-2 text-green-600"><CheckCircle size={16}/> Ya</span>}
                            {student.is_reconfirm === false && <span className="flex items-center gap-2 text-red-600"><XCircle size={16}/> Tidak</span>}
                        </DataRow>
                        {/* PERBAIKAN: Menampilkan alasan jika siswa tidak melanjutkan */}
                        {student.is_reconfirm === false && student.rejection_reason && (
                            <DataRow label="Alasan Tidak Melanjutkan" value={student.rejection_reason} />
                        )}
                        <DataRow 
                            label="Tanggal Daftar Ulang" 
                            value={student.created ? new Date(student.created).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'} 
                        />
                    </div>
                    {/* Kolom Kanan untuk QR Code */}
                    <div className="col-span-1 flex flex-col items-center justify-center pt-2">
                        <QRCodeDisplay value={qrCodeValue} />
                        <p className="text-xs text-center text-gray-400 mt-2">Scan untuk Validasi</p>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                    <p><strong>Perhatian:</strong> Simpan kartu ini sebagai bukti telah melakukan pendaftaran ulang.</p>
                </div>
            </div>
        </div>
    );
}
