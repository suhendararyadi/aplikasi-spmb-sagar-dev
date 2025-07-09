'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { checkKelulusan, type KelulusanResult } from '@/app/actions';
import { Loader2, Search, PartyPopper, XCircle, AlertCircle } from 'lucide-react';

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
                                        {/* PERBAIKAN: Hanya tampilkan jika datanya ada */}
                                        {result.jalur_pendaftaran && (
                                            <p className="mt-2">Melalui jalur pendaftaran: <strong className="text-green-800">{result.jalur_pendaftaran}</strong>.</p>
                                        )}
                                        <p className="mt-1">Anda diterima di Program Keahlian: <strong className="text-green-800">{result.jurusan_diterima}</strong>.</p>
                                        <p className="text-sm mt-2">Silakan lanjutkan ke tahap Daftar Ulang mulai tanggal 10-11 Juli 2025 dengan datang langsung ke SMKN 9 Garut dan membawa materai 10 rb. 
                                            Jika pada waktu yang telah ditentukan siswa yang dinyatakan lolos tidak daftar ulang maka di anggap mengundurkan diri.</p>
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
