'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FormEvent, type Dispatch, type SetStateAction } from 'react';
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

// [REVISI] Tipe props yang diterima oleh komponen
// Ditambahkan 'open' dan 'onOpenChange' agar bisa dikontrol dari luar.
interface ValidatorVerifyDialogProps {
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
    inspection: {
        uuid: string;
    };
}

export default function ValidatorVerifyDialog({ open, onOpenChange, inspection }: ValidatorVerifyDialogProps) {
    // [DIHAPUS] State internal tidak lagi diperlukan, karena dikontrol oleh parent.
    // const [open, setOpen] = useState(false);

    const { auth } = usePage<PagePropsWithUser>().props;
    const isValidator = auth.user?.roles?.some(role => role.name === 'Validator');

    // Jika user bukan validator, komponen tidak melakukan apa-apa.
    // Pengecekan status ('SOP') sudah dilakukan di parent sebelum menampilkan tombol.
    if (!isValidator) {
        return null;
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

        router.post(route('inspection.ac.verify', inspection.uuid), {
            approval_status: approvalStatus,
            note_validator: noteValidator,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // [REVISI] Gunakan onOpenChange untuk menutup dialog.
                onOpenChange(false);
                showToast({ type: 'success', message: 'Inspeksi AC berhasil diverifikasi.' });
            },
            onError: (errors) => {
                const errorMessages = Object.values(errors).join(' ');
                showToast({ type: 'error', message: `Gagal verifikasi: ${errorMessages}` });
            },
        });
    };

    return (
        // [REVISI] Props 'open' dan 'onOpenChange' diteruskan ke Dialog.
        // DialogTrigger dihapus karena tombol pemicu ada di komponen parent.
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                            <option value="SAP">Setuju</option>
                            <option value="SRE">Tolak</option>
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
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Batal
                        </Button>
                        <Button type="submit">Verifikasi</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}