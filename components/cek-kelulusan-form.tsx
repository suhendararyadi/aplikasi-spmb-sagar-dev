'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { checkKelulusan, type KelulusanResult } from '@/app/actions';
import { Loader2, Search, PartyPopper, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

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

// PERBAIKAN: Buat pemetaan baru untuk link WhatsApp
const whatsAppLinks: { [key: string]: string } = {
    'TEI': 'https://bit.ly/TEISagar',
    'TITL': 'https://bit.ly/TITLSagar',
    'TKRO': 'https://bit.ly/TKROSagar',
    'DPIB': 'https://bit.ly/DPIBSagar',
    'DKV': 'https://bit.ly/DKVSagar',
    'TKJ': 'https://bit.ly/3IGxSRp'
};

// Fungsi helper untuk mendapatkan nama lengkap jurusan
const getMajorFullName = (abbreviation: string | undefined) => {
    if (!abbreviation) return 'Informasi tidak tersedia';
    return majorMap[abbreviation] || abbreviation;
};


export function CekKelulusanForm() {
    const [nomorPendaftaran, setNomorPendaftaran] = useState('');
    const [result, setResult] = useState<KelulusanResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setResult(null);
        const searchResult = await checkKelulusan(nomorPendaftaran);
        setResult(searchResult);
        setIsLoading(false);
    };

    return (
        <Card className="w-full max-w-lg mx-auto">
            <CardHeader>
                <CardTitle>Cek Status Kelulusan</CardTitle>
                <CardDescription>
                    Masukkan nomor pendaftaran Anda untuk melihat hasil seleksi pendaftaran.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="flex items-end gap-4">
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="nomorPendaftaran">Nomor Pendaftaran</Label>
                        <Input
                            id="nomorPendaftaran"
                            value={nomorPendaftaran}
                            onChange={(e) => setNomorPendaftaran(e.target.value)}
                            placeholder="Contoh: 20253861-11-2-XXXX"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isLoading} className="min-w-[100px]">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="mr-2 h-4 w-4" /> Cek</>}
                    </Button>
                </form>

                {result && (
                    <div className="mt-6">
                        {'error' in result ? (
                            <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md flex items-center gap-3">
                                <AlertCircle className="h-6 w-6"/>
                                <div>
                                    <h3 className="font-bold">Informasi</h3>
                                    <p>{result.error}</p>
                                </div>
                            </div>
                        ) : (
                            <div className={`p-6 rounded-lg border-2 ${
                                result.status === 'LULUS' ? 'border-green-500 bg-green-50' :
                                result.status === 'TIDAK LULUS' ? 'border-red-500 bg-red-50' :
                                'border-blue-500 bg-blue-50'
                            }`}>
                                <div className="flex items-center gap-4 mb-4">
                                    {result.status === 'LULUS' && <PartyPopper className="h-10 w-10 text-green-600" />}
                                    {result.status === 'TIDAK LULUS' && <XCircle className="h-10 w-10 text-red-600" />}
                                    <div>
                                        <p className="font-semibold">{result.nama_lengkap}</p>
                                        <p className="text-sm text-muted-foreground">{result.nomor_pendaftaran}</p>
                                    </div>
                                </div>
                                {result.status === 'LULUS' && (
                                    <>
                                        <h3 className="text-xl font-bold text-green-700">SELAMAT, ANDA DINYATAKAN LULUS!</h3>
                                        {result.jalur_pendaftaran && (
                                            <p className="mt-2">Melalui jalur pendaftaran: <strong className="text-green-800">{result.jalur_pendaftaran}</strong>.</p>
                                        )}
                                        <p className="mt-1">Anda diterima di Program Keahlian: <strong className="text-green-800">{getMajorFullName(result.jurusan_diterima)}</strong>.</p>
                                        
                                        {/* PERBAIKAN: Menampilkan instruksi & tombol grup WA */}
                                        <div className="mt-4 pt-4 border-t border-green-200">
                                            <p className="text-sm">
                                                Langkah selanjutnya adalah bergabung ke grup WhatsApp jurusan Anda untuk mendapatkan informasi mengenai jadwal dan persyaratan daftar ulang.
                                            </p>
                                            <Button asChild className="mt-3 w-full sm:w-auto">
                                                <Link href={whatsAppLinks[result.jurusan_diterima] || '#'} target="_blank">
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    Gabung Grup WA Jurusan
                                                </Link>
                                            </Button>
                                        </div>
                                    </>
                                )}
                                {result.status === 'TIDAK LULUS' && (
                                    <>
                                        <h3 className="text-xl font-bold text-red-700">MOHON MAAF</h3>
                                        <p className="mt-2">Berdasarkan hasil seleksi, Anda dinyatakan <strong>TIDAK LULUS</strong>. Tetap semangat dan jangan berkecil hati. Silahkan melanjutkan mendaftar di sekolah Swasta terdekat.</p>
                                    </>
                                )}
                                {result.status === 'PROSES SELEKSI' && (
                                    <>
                                        <h3 className="text-xl font-bold text-blue-700">STATUS: PROSES SELEKSI</h3>
                                        <p className="mt-2">Data Anda sudah kami terima. Hasil kelulusan akan diumumkan pada tanggal yang telah ditentukan. Mohon cek kembali secara berkala.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
