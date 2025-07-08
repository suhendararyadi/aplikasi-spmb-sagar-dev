'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

interface TidakLulusInfoProps {
    name: string | null | undefined;
}

export function TidakLulusInfo({ name }: TidakLulusInfoProps) {
    return (
        <Card className="w-full max-w-2xl mx-auto border-red-200 dark:border-red-900">
            <CardHeader className="text-center">
                <div className="mx-auto bg-red-100 dark:bg-red-900/30 p-3 rounded-full w-fit">
                    <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle className="text-2xl pt-4">PENGUMUMAN KELULUSAN</CardTitle>
                <CardDescription>
                    Untuk Calon Peserta Didik: <strong>{name || "Siswa"}</strong>
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
                <p className="text-lg">
                    Dengan berat hati kami sampaikan bahwa berdasarkan hasil seleksi, Anda dinyatakan:
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/20 py-3 px-6 rounded-lg inline-block">
                    TIDAK LULUS
                </p>
                <p className="text-muted-foreground text-sm pt-4">
                    Terima kasih atas partisipasi Anda dalam proses seleksi SPMB SMKN 9 Garut.
                    <br />
                    Tetap semangat dan jangan berkecil hati, teruslah berusaha untuk meraih cita-cita Anda.
                </p>
            </CardContent>
        </Card>
    );
}
