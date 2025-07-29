import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FormEvent, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { SharedData } from '@/types';
import { getCurrentStage } from "@/lib/stages";

interface FindingVerifyDialogProps {
    finding: any;
}

export default function VerifyDialog({ finding }: FindingVerifyDialogProps) {
    // State untuk mengontrol dialog
    const [open, setOpen] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const userId = auth.user?.id;
    const role = auth.role;
    const stageName = getCurrentStage(finding);

    // Cek apakah user sudah ditugaskan untuk verifikasi
    const isUserAssigned = finding.finding_approval_histories?.some(
        (history: { finding_approval_assignment: any[] }) =>
            Array.isArray(history.finding_approval_assignment) &&
            history.finding_approval_assignment.some((assignment) => Number(assignment.user_id) === Number(userId)),
    );

    // Cek apakah user sudah melakukan verifikasi sebelumnya
    const currentHistory = finding.finding_approval_histories?.[finding.finding_approval_histories.length - 1];

    // Cek apakah user sudah melakukan verifikasi pada tahap ini
    const hasBeenVerified = currentHistory
        ? Boolean(currentHistory.verified_at) &&
        Array.isArray(currentHistory.finding_approval_assignment) &&
        currentHistory.finding_approval_assignment.some(
            (assignment: { user_id: number | string }) => Number(assignment.user_id) === Number(userId)
        )
        : false;

    // Cek apakah user bisa melakukan verifikasi sekarang
    const canVerifyNow = (() => {
        const histories = finding.finding_approval_histories;
        if (!Array.isArray(histories)) return false;

        const userIndex = histories.findIndex(
            (history) =>
                Array.isArray(history.finding_approval_assignment) &&
                history.finding_approval_assignment.some((assignment: { user_id: any }) => Number(assignment.user_id) === Number(userId)),
        );

        if (userIndex === -1) return false;

        const priorStages = histories.slice(0, userIndex);
        const allPriorApproved = priorStages.every((history, i) => {
            const result = Boolean(history.verified_at);
            console.log(`Prior stage [${i}] verified_at = ${history.verified_at} →`, result);
            return result;
        });

        console.log('canVerifyNow result:', allPriorApproved);
        return allPriorApproved;
    })();

    // State untuk menyimpan status izin kerja
    const [needPermit, setNeedPermit] = useState('');

    // Debugging output
    console.log('Assign:', !isUserAssigned);
    console.log('hasBeenVerified', hasBeenVerified);
    console.log('Not hasBeenVerified:', !hasBeenVerified);
    console.log('canVerifyNow:', !canVerifyNow);
    console.log('Stage Name:', stageName);

    // Jika user tidak ditugaskan atau sudah melakukan verifikasi, jangan tampilkan tombol
    if (!isUserAssigned || hasBeenVerified || !canVerifyNow) return null;

    // Handler untuk submit form verifikasi
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        // Default payload dengan status wajib
        const payload: Record<string, any> = {
            approval_status: formData.get('approval_status') || 'APPROVED',
        };

        // Tambahkan properti untuk Technician
        if (role === 'Technician') {
            payload.corrective_plan = formData.get('corrective_plan');
            payload.corrective_due_date = formData.get('corrective_due_date');
            payload.corrective_action = formData.get('corrective_action');
            payload.need_permit = needPermit === 'ya';
        }

        // Tambahkan properti untuk Admin
        if (role === 'Admin') {
            payload.car_number_manual = formData.get('car_number_manual');
            payload.note = formData.get('note');

            const photoFile = formData.get('photo_after') as File;
            if (photoFile && photoFile.size > 0) {
                formData.set('photo_after', photoFile);
            }
        }

        // Tambahkan properti untuk Validator
        if (role === 'Validator') {
            payload.note = formData.get('note');
        }

        // Set hanya properti yang dibutuhkan
        const finalFormData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                finalFormData.set(key, value);
            }
        });

        if (role === 'Admin') {
            const photoFile = formData.get('photo_after') as File;
            if (photoFile && photoFile.size > 0) {
                finalFormData.set('photo_after', photoFile);
            }
        }

        // Kirim data ke server
        router.post(`/finding/verify/${finding.uuid}`, finalFormData, {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setOpen(false);
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
                    {role === 'Technician' && stageName === 'Detection' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="approval_status">Status Verifikasi</Label>
                                <select id="approval_status" name="approval_status" className="w-full rounded-md border px-3 py-2 text-sm" required>
                                    <option value="">Pilih status</option>
                                    <option value="APPROVED">Approve</option>
                                    <option value="REJECTED">Reject</option>
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
                                    placeholder="Rencana perbaikan..."
                                />
                            </div>
                        </>
                    )}

                    {role === 'Admin' && stageName === 'Drafting' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="approval_status">Status Verifikasi</Label>
                                <select id="approval_status" name="approval_status" className="w-full rounded-md border px-3 py-2 text-sm" required>
                                    <option value="">Pilih status</option>
                                    <option value="APPROVED">Approve</option>
                                    <option value="REJECTED">Reject</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="car_number_manual">Nomor CAR</Label>
                                <input
                                    type="text"
                                    id="car_number_manual"
                                    name="car_number_manual"
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    placeholder="Contoh: CAR-2025-001"
                                    required
                                />
                            </div>
                        </>
                    )}

                    {role === 'Technician' && stageName === 'Planning' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="approval_status">Status Verifikasi</Label>
                                <select id="approval_status" name="approval_status" className="w-full rounded-md border px-3 py-2 text-sm" required>
                                    <option value="">Pilih status</option>
                                    <option value="ON_PROGRESS">On Progress</option>
                                </select>
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

                            <div className="space-y-2">
                                <Label htmlFor="need_permit">Perlu Izin Permit?</Label>
                                <select
                                    id="need_permit"
                                    name="need_permit"
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    value={needPermit}
                                    onChange={(e) => setNeedPermit(e.target.value)}
                                    required
                                >
                                    <option value="">Pilih</option>
                                    <option value="ya">Ya</option>
                                    <option value="tidak">Tidak</option>
                                </select>

                                {needPermit === 'ya' && (
                                    <a
                                        href={`/working-permit/create?car_number=${finding.car_number_auto}`}
                                        className="text-sm text-blue-600 hover:underline"
                                        target="_blank"
                                    >
                                        Buat Izin Kerja (Working Permit)
                                    </a>
                                )}
                            </div>
                        </>
                    )}

                    {role === 'Technician' && stageName === 'On Progress' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="approval_status">Status Verifikasi</Label>
                                <select id="approval_status" name="approval_status" className="w-full rounded-md border px-3 py-2 text-sm" required>
                                    <option value="">Pilih status</option>
                                    <option value="FINISHED">Selesai</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="corrective_action">Tindakan Perbaikan</Label>
                                <textarea
                                    id="corrective_action"
                                    name="corrective_action"
                                    rows={3}
                                    className="w-full rounded-md border px-3 py-2 text-sm"
                                    placeholder="Tindakan perbaikan yang dilakukan..."
                                    required
                                />
                            </div>
                        </>
                    )}

                    {role === 'Admin' && stageName === 'Finalizing' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="approval_status">Status Verifikasi</Label>
                                <select id="approval_status" name="approval_status" className="w-full rounded-md border px-3 py-2 text-sm" required>
                                    <option value="">Pilih status</option>
                                    <option value="EFFECTIVE">Efektif</option>
                                    <option value="INEFFECTIVE">Tidak Efektif</option>
                                    <option value="POSTPONED">Ditunda</option>
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

                            <div className="space-y-2">
                                <Label htmlFor="photo_after">Foto Setelah Perbaikan</Label>
                                <input type="file" id="photo_after" name="photo_after" accept="image/*" className="w-full text-sm" />
                            </div>
                        </>
                    )}

                    {role === 'Validator' && stageName === 'Verification' && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="approval_status">Status Verifikasi</Label>
                                <select id="approval_status" name="approval_status" className="w-full rounded-md border px-3 py-2 text-sm" required>
                                    <option value="">Pilih status</option>
                                    <option value="CLOSE">Close</option>
                                </select>
                            </div>
                        </>
                    )}

                    <DialogFooter className="pt-4">
                        <DialogTrigger asChild>
                            <Button type="button" variant="outline">
                                Batal
                            </Button>
                        </DialogTrigger>
                        {(role === 'Admin' || role === 'Technician' || role === 'Validator') && <Button type="submit">Verifikasi</Button>}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
