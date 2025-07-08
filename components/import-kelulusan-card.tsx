'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { importKelulusanStatus } from '@/app/dashboard/admin/user-management/actions';
import { AlertCircle, CheckCircle, Loader2, Upload } from 'lucide-react';

// Tipe data yang diharapkan dari file CSV
type KelulusanData = {
    registration_number: string;
    status_kelulusan: 'LULUS' | 'TIDAK LULUS' | 'PROSES SELEKSI';
};

type ImportResult = {
    successCount: number;
    errorCount: number;
    errors: string[];
} | null;

export function ImportKelulusanCard() {
    const [parsedData, setParsedData] = useState<KelulusanData[]>([]);
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ImportResult>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setResult(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const requiredColumns = ['registration_number', 'status_kelulusan'];
                const fileColumns = results.meta.fields || [];
                const hasAllColumns = requiredColumns.every(col => fileColumns.includes(col));

                if (!hasAllColumns) {
                    alert(`Error: File CSV harus memiliki kolom: ${requiredColumns.join(', ')}`);
                    setParsedData([]);
                    return;
                }
                setParsedData(results.data as KelulusanData[]);
            },
        });
    };
    
    const handleImport = async () => {
        if (parsedData.length === 0) {
            alert('Tidak ada data untuk diimpor.');
            return;
        }
        setIsLoading(true);
        const importResult = await importKelulusanStatus(parsedData);
        setResult(importResult);
        setIsLoading(false);
        setParsedData([]);
        setFileName('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Impor Status Kelulusan</CardTitle>
                <CardDescription>
                    Unggah file CSV untuk memperbarui status kelulusan banyak siswa sekaligus. File harus memiliki kolom: 
                    <code className="text-xs font-mono bg-muted p-1 rounded mx-1">registration_number</code> dan
                    <code className="text-xs font-mono bg-muted p-1 rounded mx-1">status_kelulusan</code>.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="kelulusanCsvFile">Pilih File CSV Kelulusan</Label>
                    <Input id="kelulusanCsvFile" type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef}/>
                </div>
                
                {parsedData.length > 0 && (
                     <div className="text-sm font-medium text-center bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                        {/* PERBAIKAN: Menampilkan nama file yang diunggah */}
                        Ditemukan <strong>{parsedData.length}</strong> baris data dari file <span className="font-bold">{fileName}</span>. Klik tombol di bawah untuk memulai proses impor.
                    </div>
                )}

                <Button onClick={handleImport} disabled={isLoading || parsedData.length === 0} className="w-full">
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    {isLoading ? 'Mengimpor...' : `Impor ${parsedData.length > 0 ? parsedData.length : ''} Status Kelulusan`}
                </Button>

                {result && (
                    <div className="space-y-2 pt-4">
                        <h4 className="font-semibold">Hasil Impor Status:</h4>
                        {result.successCount > 0 && <div className="text-green-600 flex items-center gap-2"><CheckCircle size={16}/>{result.successCount} status siswa berhasil diperbarui.</div>}
                        {result.errorCount > 0 && (
                            <div className="text-red-600">
                                <p className="flex items-center gap-2"><AlertCircle size={16}/>{result.errorCount} status gagal diperbarui.</p>
                                <ul className="text-xs list-disc pl-5 mt-2 max-h-40 overflow-auto">
                                    {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
