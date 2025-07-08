'use client';

import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { importUsers } from '@/app/dashboard/admin/user-management/actions';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

type ImportedStudent = {
    registration_number: string;
    full_name: string;
    school_origin: string;
    // Tambahkan kolom baru
    jalur_pendaftaran: string;
    entry_path: string;
    accepted_major: string;
};

type ImportResult = {
    successCount: number;
    errorCount: number;
    errors: string[];
} | null;

export function ImportUsersCard() {
    const [parsedData, setParsedData] = useState<ImportedStudent[]>([]);
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
                // PERBAIKAN: Tambahkan 'jalur_pendaftaran' ke kolom yang wajib ada
                const requiredColumns = ['registration_number', 'full_name', 'school_origin', 'jalur_pendaftaran', 'entry_path', 'accepted_major'];
                const fileColumns = results.meta.fields || [];
                const hasAllColumns = requiredColumns.every(col => fileColumns.includes(col));

                if (!hasAllColumns) {
                    alert(`Error: File CSV harus memiliki kolom: ${requiredColumns.join(', ')}`);
                    setParsedData([]);
                    return;
                }
                setParsedData(results.data as ImportedStudent[]);
            },
        });
    };
    
    const handleImport = async () => {
        if (parsedData.length === 0) {
            alert('Tidak ada data untuk diimpor.');
            return;
        }
        setIsLoading(true);
        const importResult = await importUsers(parsedData);
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
                <CardTitle>Impor Pengguna dari CSV</CardTitle>
                <CardDescription>
                    {/* PERBAIKAN: Perbarui deskripsi untuk menyertakan kolom baru */}
                    Unggah file CSV untuk membuat banyak akun siswa sekaligus. Pastikan file memiliki kolom: 
                    <code className="text-xs font-mono bg-muted p-1 rounded mx-1">registration_number</code>,
                    <code className="text-xs font-mono bg-muted p-1 rounded mx-1">full_name</code>,
                    <code className="text-xs font-mono bg-muted p-1 rounded mx-1">school_origin</code>,
                    <code className="text-xs font-mono bg-muted p-1 rounded mx-1">jalur_pendaftaran</code>,
                    <code className="text-xs font-mono bg-muted p-1 rounded mx-1">entry_path</code>,
                    <code className="text-xs font-mono bg-muted p-1 rounded mx-1">accepted_major</code>.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="csvFile">Pilih File CSV</Label>
                    <Input id="csvFile" type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef}/>
                </div>
                
                {parsedData.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-sm font-medium">Pratinjau Data dari <span className="font-bold">{fileName}</span> ({parsedData.length} baris ditemukan):</p>
                        <div className="rounded-md border max-h-60 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>No. Pendaftaran</TableHead>
                                        <TableHead>Nama Lengkap</TableHead>
                                        <TableHead>Jalur Pendaftaran</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedData.slice(0, 5).map((row, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{row.registration_number}</TableCell>
                                            <TableCell>{row.full_name}</TableCell>
                                            <TableCell>{row.jalur_pendaftaran}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Button onClick={handleImport} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Konfirmasi dan Impor {parsedData.length} Pengguna
                        </Button>
                    </div>
                )}

                {result && (
                    <div className="space-y-2 pt-4">
                        <h4 className="font-semibold">Hasil Impor:</h4>
                        {result.successCount > 0 && <div className="text-green-600 flex items-center gap-2"><CheckCircle size={16}/>{result.successCount} pengguna berhasil diimpor.</div>}
                        {result.errorCount > 0 && (
                            <div className="text-red-600">
                                <p className="flex items-center gap-2"><AlertCircle size={16}/>{result.errorCount} pengguna gagal diimpor.</p>
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
