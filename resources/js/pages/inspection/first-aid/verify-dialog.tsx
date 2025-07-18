'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SharedData } from '@/types';
import { router, usePage } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { type InspectionFirstAidData } from './columns';

interface InspectionVerifyDialogProps {
    inspection: InspectionFirstAidData;
}

export default function InspectionVerifyDialog({ inspection }: InspectionVerifyDialogProps) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage<SharedData>().props;

    // Logika untuk menampilkan tombol verifikasi:
    // 1. Status inspeksi harus 'Pending'.
    // 2. Pengguna yang login harus memiliki peran 'Validator'.
    const canVerify = inspection.status?.name === 'Pending' && auth.user?.role === 'Validator';

    // Jika pengguna tidak bisa verifikasi, jangan tampilkan tombol sama sekali.
    if (!canVerify) {
        return null;
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const payload = {
            status: formData.get('status'),
            notes: formData.get('notes'), // Tambahan jika validator perlu memberi catatan
        };

        // Menggunakan route 'inspections.validate' yang sudah kita definisikan
        router.patch(route('inspections.validate', inspection.id), payload, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                toast.success('Laporan inspeksi berhasil diverifikasi.');
            },
            onError: (errors) => {
                // Menampilkan error jika ada dari backend
                const errorMessages = Object.values(errors).join(' ');
                toast.error(`Gagal verifikasi: ${errorMessages}`);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full">Verifikasi Laporan</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Verifikasi Laporan Inspeksi</DialogTitle>
                    <DialogDescription>
                        Setujui atau tolak laporan inspeksi P3K ini. Aksi ini tidak dapat diubah.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="status">Status Verifikasi</Label>
                        <select
                            id="status"
                            name="status"
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            required
                        >
                            <option value="">Pilih status</option>
                            <option value="approved">Setuju (Approve)</option>
                            <option value="rejected">Tolak (Reject)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Catatan (Opsional)</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            placeholder="Tambahkan catatan jika diperlukan..."
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit">Kirim Verifikasi</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}