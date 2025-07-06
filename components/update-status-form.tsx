'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { updateStatusKelulusan } from '@/app/dashboard/admin/siswa/[id]/actions';
import { Loader2 } from 'lucide-react';

type UpdateStatusFormProps = {
    studentId: string;
    currentStatus: string | null | undefined;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan Status
        </Button>
    );
}

export function UpdateStatusForm({ studentId, currentStatus }: UpdateStatusFormProps) {
    // Bind studentId ke server action
    const updateStatusWithId = updateStatusKelulusan.bind(null, studentId);
    const [state, formAction] = useActionState(updateStatusWithId, { success: undefined, error: undefined });

    useEffect(() => {
        if (state?.success) {
            alert(state.success); // Atau gunakan notifikasi toast
        }
        if (state?.error) {
            alert(`Error: ${state.error}`);
        }
    }, [state]);

    return (
        <form action={formAction} className="flex items-center gap-4">
            <Select name="status_kelulusan" defaultValue={currentStatus || 'PROSES SELEKSI'} required>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Pilih status kelulusan..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="PROSES SELEKSI">Proses Seleksi</SelectItem>
                    <SelectItem value="LULUS">Lulus</SelectItem>
                    <SelectItem value="TIDAK LULUS">Tidak Lulus</SelectItem>
                </SelectContent>
            </Select>
            <SubmitButton />
        </form>
    );
}
