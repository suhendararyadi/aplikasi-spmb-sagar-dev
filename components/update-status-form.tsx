'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { updateStatusKelulusan } from '@/app/dashboard/admin/siswa/[id]/actions';
import { Loader2 } from 'lucide-react';
import { Label } from './ui/label';

type UpdateStatusFormProps = {
    studentId: string;
    currentStatus: string | null | undefined;
    currentJalurPendaftaran: string | null | undefined;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="self-end">
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Perubahan
        </Button>
    );
}

export function UpdateStatusForm({ studentId, currentStatus, currentJalurPendaftaran }: UpdateStatusFormProps) {
    const updateStatusWithId = updateStatusKelulusan.bind(null, studentId);
    const [state, formAction] = useActionState(updateStatusWithId, { success: undefined, error: undefined });

    useEffect(() => {
        if (state?.success) {
            alert(state.success);
        }
        if (state?.error) {
            alert(`Error: ${state.error}`);
        }
    }, [state]);

    return (
        <form action={formAction} className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-full sm:w-auto flex-1 space-y-2">
                <Label>Status Kelulusan</Label>
                <Select name="status_kelulusan" defaultValue={currentStatus || 'PROSES SELEKSI'} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih status kelulusan..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="PROSES SELEKSI">Proses Seleksi</SelectItem>
                        <SelectItem value="LULUS">Lulus</SelectItem>
                        <SelectItem value="TIDAK LULUS">Tidak Lulus</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            
            <div className="w-full sm:w-auto flex-1 space-y-2">
                <Label>Jalur Pendaftaran</Label>
                <Select name="jalur_pendaftaran" defaultValue={currentJalurPendaftaran || ''} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih jalur pendaftaran..." />
                    </SelectTrigger>
                    <SelectContent>
                        {/* PERUBAHAN DI SINI */}
                        <SelectItem value="SPMB">SPMB</SelectItem>
                        <SelectItem value="PAPS">PAPS</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <SubmitButton />
        </form>
    );
}
