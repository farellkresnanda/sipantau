'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormEvent, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { SharedData } from '@/types';

interface ValidatorVerifyFirstAidDialogProps {
    inspection: {
        uuid: string;
        approval_status_code: string;
    };
}

export default function ValidatorVerifyFirstAidDialog({ inspection }: ValidatorVerifyFirstAidDialogProps) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const role = auth.role;

    const isValidator = role === 'Validator';
    const isAlreadyVerified = ['SAP', 'SRE'].includes(inspection.approval_status_code);

    if (!isValidator || isAlreadyVerified) return null;

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const finalFormData = new FormData();
        const approvalStatus = formData.get('approval_status');
        const noteValidator = formData.get('note_validator');

        if (!approvalStatus) {
            toast.error('Status verifikasi harus dipilih.');
            return;
        }

        finalFormData.set('approval_status', approvalStatus);
        finalFormData.set('note_validator', noteValidator?.toString() || '');

        router.post(route('inspection.first-aid.verify', inspection.uuid), finalFormData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setOpen(false);
                toast.success('Inspeksi P3K berhasil diverifikasi.');
            },
            onError: (errors) => {
                toast.error('Gagal verifikasi: ' + (errors?.message || 'Terjadi kesalahan.'));
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button">Verifikasi</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Verifikasi Inspeksi P3K</DialogTitle>
                    <DialogDescription>
                        Form ini hanya untuk Validator dalam memverifikasi hasil inspeksi P3K.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="approval_status">Status Verifikasi</Label>
                        <select
                            id="approval_status"
                            name="approval_status"
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            required
                        >
                            <option value="">Pilih status</option>
                            <option value="SAP">Setuju</option>
                            <option value="SRE">Tolak</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note_validator">Catatan</Label>
                        <textarea
                            id="note_validator"
                            name="note_validator"
                            rows={3}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            placeholder="Tuliskan catatan tambahan jika diperlukan"
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </DialogTrigger>
                        <Button type="submit">Verifikasi</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
