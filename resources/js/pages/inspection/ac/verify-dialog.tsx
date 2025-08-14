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
import { Textarea } from '@/components/ui/textarea';
import { FormEvent, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { showToast } from '@/components/ui/toast';
import type { PageProps } from '@/types';

// Tipe untuk user dengan roles
type UserWithRoles = {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
};

// Tipe props halaman yang lebih spesifik
interface PagePropsWithUser extends PageProps {
    auth: PageProps['auth'] & {
        user: UserWithRoles;
    };
}

// Tipe props yang diterima oleh komponen dialog ini
interface ValidatorVerifyDialogProps {
    inspection: {
        uuid: string;
        approval_status_code: 'SOP' | 'SAP' | 'SRE';
    };
}

export default function ValidatorVerifyDialog({ inspection }: ValidatorVerifyDialogProps) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage<PagePropsWithUser>().props;

    // [REVISI] Menggunakan optional chaining (?.) untuk mencegah error jika 'roles' tidak ada.
    const isValidator = auth.user?.roles?.some(role => role.name === 'Validator');
    const canVerify = inspection.approval_status_code === 'SOP';

    if (!isValidator || !canVerify) {
        return null; // Jangan render apapun jika tidak memenuhi syarat
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const approvalStatus = formData.get('approval_status');
        const noteValidator = formData.get('note_validator');

        if (!approvalStatus) {
            showToast({ type: 'error', message: 'Status verifikasi harus dipilih.' });
            return;
        }
        
        // Kirim data ke controller verify
        router.post(route('inspection.ac.verify', inspection.uuid), {
            approval_status: approvalStatus,
            note_validator: noteValidator,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                showToast({ type: 'success', message: 'Inspeksi AC berhasil diverifikasi.' });
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).join(' ');
                showToast({ type: 'error', message: `Gagal verifikasi: ${errorMessages}` });
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
                    <DialogTitle>Verifikasi Inspeksi AC</DialogTitle>
                    <DialogDescription>
                        Form ini digunakan oleh Validator untuk menyetujui atau menolak hasil inspeksi AC.
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
                            <option value="SAP">Setuju (Approved)</option>
                            <option value="SRE">Tolak (Rejected)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note_validator">Catatan Validator</Label>
                        <Textarea
                            id="note_validator"
                            name="note_validator"
                            rows={3}
                            placeholder="Tuliskan catatan tambahan jika diperlukan (wajib jika ditolak)"
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit">Verifikasi</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
