import { createServerClient } from "@/lib/pocketbase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// PERBAIKAN: Hapus impor 'Printer' yang tidak digunakan
import { ArrowLeft } from "lucide-react";
// PERBAIKAN: Impor PrintButton dari path yang benar
import { PrintButton } from "@/components/print-button";

// Tipe untuk data profil lengkap dari PocketBase
type Profile = {
    id: string;
    collectionId: string;
    name?: string | null;
    registration_number?: string | null;
    school_origin?: string | null;
    entry_path?: string | null;
    accepted_major?: string | null;
    created?: string | null;
    // PERBAIKAN: Tambahkan properti 'status' yang hilang ke tipe Profile
    status?: 'belum_mengisi' | 'selesai' | null;
};

// Fungsi untuk mengambil data siswa yang sedang login
async function getStudentData() {
    const pb = await createServerClient();
    
    if (!pb.authStore.isValid || !pb.authStore.model) {
        redirect('/auth/login');
    }

    try {
        const studentProfile: Profile = await pb.collection('users').getOne(pb.authStore.model.id);
        // Pastikan siswa sudah selesai mendaftar sebelum bisa mencetak
        if (studentProfile.status !== 'selesai') {
            redirect('/dashboard/siswa'); 
        }
        return studentProfile;
    } catch (error) {
        console.error("Gagal mengambil profil siswa:", error);
        redirect('/dashboard/siswa?error=data_not_found');
    }
}

// Komponen helper untuk menampilkan baris data
function DataRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-medium text-sm text-gray-800">{value || "-"}</p>
        </div>
    );
}

export default async function CetakKartuPage() {
    const student = await getStudentData();
    // PERBAIKAN: Hapus instance PocketBase yang tidak digunakan
    
    return (
        <div className="bg-gray-100 min-h-screen py-10 px-4 print:bg-white print:p-0">
            {/* Tombol Aksi - Akan disembunyikan saat mencetak */}
            <div className="max-w-md mx-auto mb-6 flex justify-between print:hidden">
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/siswa">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali
                    </Link>
                </Button>
                <PrintButton />
            </div>

            {/* Kartu Bukti Pendaftaran */}
            <div id="kartu-pendaftaran" className="max-w-md mx-auto bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-center text-gray-800">BUKTI PENDAFTARAN ULANG</h2>
                    <p className="text-sm text-center text-gray-600">SMKN 9 GARUT - TAHUN AJARAN 2025/2026</p>
                </div>
                <div className="p-6 space-y-4">
                    <DataRow label="Nomor Pendaftaran" value={student.registration_number} />
                    <DataRow label="Nama Lengkap" value={student.name} />
                    <DataRow label="Asal Sekolah" value={student.school_origin} />
                    <DataRow label="Jalur Masuk" value={student.entry_path} />
                    <DataRow label="Diterima di Program Keahlian" value={student.accepted_major} />
                    <DataRow 
                        label="Tanggal Daftar Ulang" 
                        value={student.created ? new Date(student.created).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'} 
                    />
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                    <p><strong>Perhatian:</strong></p>
                    <ul className="list-disc pl-5 mt-1">
                        <li>Simpan kartu ini sebagai bukti telah melakukan pendaftaran ulang.</li>
                        <li>Informasi selanjutnya akan diumumkan melalui website sekolah.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
