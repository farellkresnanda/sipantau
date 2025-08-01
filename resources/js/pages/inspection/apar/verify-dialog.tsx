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
import { router, usePage, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { SharedData } from '@/types';

interface VerifyAparDialogProps {
    inspection: {
        uuid: string;
        approval_status_code: string; // 'SAP', 'SRE', or other statuses
    };
    hasBeenVerified?: boolean;
    canVerifyNow?: boolean;
}

export default function VerifyAparDialog({ inspection }: VerifyAparDialogProps) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const role = auth.role

    // Hanya  yang bisa lihat tombol
    if (role !== 'Validator') return null;
    const hasBeenVerified = inspection.approval_status_code === 'SAP' || inspection.approval_status_code === 'SRE';

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        const payload: Record<string, any> = {
            approval_status: formData.get('approval_status'),
            note: formData.get('note'),
        };

        const finalFormData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                finalFormData.set(key, value);
            }
        });

        router.post(`/inspection/apar/verify/${inspection.uuid}`, finalFormData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setOpen(false);
                toast.success('APAR Inspection approved successfully.');
            },
            onError: (errors) => {
                toast.error('Gagal verifikasi: ' + (errors?.message || 'Terjadi kesalahan'));
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="flex gap-2">
                    {!hasBeenVerified && (
                        <>
                            <Link href="/inspection/apar">
                                <Button variant="outline">Kembali</Button>
                            </Link>
                            <DialogTrigger asChild>
                                <Button>Tombol Verifikasi</Button>
                            </DialogTrigger>
                        </>
                    )}
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Verifikasi Inspeksi APD</DialogTitle>
                    <DialogDescription>Form ini hanya untuk  memverifikasi hasil inspeksi APD.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="approval_status">Status Verifikasi</Label>
                        <select id="approval_status" name="approval_status" className="w-full rounded-md border px-3 py-2 text-sm" required>
                            <option value="">Pilih status</option>
                            <option value="SAP">Setuju</option>
                            <option value="SRE">Reject</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note">Catatan</Label>
                        <textarea
                            id="note"
                            name="note"
                            rows={2}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            placeholder="Catatan tambahan..."
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
