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
import {router, usePage} from '@inertiajs/react';
import { toast } from 'sonner';
import {SharedData} from "@/types";

interface FindingVerifyDialogProps {
    finding: any;
}

export default function VerifyDialog({ finding }: FindingVerifyDialogProps) {
    const [open, setOpen] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const userId = auth.user?.id;

    const hasBeenVerified = finding.finding_approval_histories?.some((history: any, index: number) => {
        const isVerified = history.verified_at !== null && history.verified_at !== '';

        const matchedAssignment = Array.isArray(history.finding_approval_assignment)
            ? history.finding_approval_assignment.some((assignment: any) =>
                Number(assignment.user_id) === Number(userId)
            )
            : false;

        console.log(`History ${index}:`, {
            verified_at: history.verified_at,
            assignments: history.finding_approval_assignment,
            isVerified,
            matchedAssignment,
            match: isVerified && matchedAssignment,
        });

        return isVerified && matchedAssignment;
    });


    // Jika sudah verifikasi, jangan tampilkan tombol sama sekali
    if (hasBeenVerified) {
        return null;
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const payload = {
            approval_status: formData.get('approval_status'),
            corrective_plan: formData.get('corrective_plan'),
            corrective_due_date: formData.get('corrective_due_date'),
        };

        router.post(`/finding/verify/${finding.uuid}`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                toast.success('Verifikasi berhasil');
            },
            onError: (errors) => {
                toast.error('Gagal verifikasi: ' + errors.message);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!hasBeenVerified && (
                <DialogTrigger asChild>
                    <Button className="w-full">Tombol Verifikasi</Button>
                </DialogTrigger>
            )}
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Verifikasi Temuan</DialogTitle>
                    <DialogDescription>Lengkapi form berikut untuk memverifikasi temuan.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="approval_status">Status Verifikasi</Label>
                        <select id="approval_status" name="approval_status" className="w-full rounded-md border px-3 py-2 text-sm" required>
                            <option value="">Pilih status</option>
                            <option value="APPROVED">Setuju</option>
                            <option value="REJECTED">Tolak</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="corrective_plan">Rencana Perbaikan</Label>
                        <textarea
                            id="corrective_plan"
                            name="corrective_plan"
                            rows={3}
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            required
                            placeholder="Masukkan rencana perbaikan..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="corrective_due_date">Batas Waktu Perbaikan</Label>
                        <input
                            type="date"
                            id="corrective_due_date"
                            name="corrective_due_date"
                            className="w-full rounded-md border px-3 py-2 text-sm"
                            required
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
