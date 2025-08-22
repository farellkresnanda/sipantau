// resources/js/pages/inspection/genset/components/validator-verify-genset-dialog.tsx
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

interface ValidatorVerifyGensetDialogProps {
  inspection: {
    uuid: string;
    approval_status_code: string; // 'SOP' | 'SAP' | 'SRE'
  };
}

declare function route(name: string, params?: any): string;

export default function ValidatorVerifyGensetDialog({ inspection }: ValidatorVerifyGensetDialogProps) {
  const [open, setOpen] = useState(false);
  const { auth } = usePage<SharedData>().props;
  const role = auth.role;

  const isValidator = role === 'Validator';
  const isAlreadyVerified = ['SAP', 'SRE'].includes(inspection.approval_status_code);

  // Hanya tampil untuk Validator dan jika belum diverifikasi
  if (!isValidator || isAlreadyVerified) return null;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const finalFormData = new FormData();
    const approvalStatus = String(formData.get('approval_status_code') || '').trim();
    const noteValidator = String(formData.get('note_validator') || '').trim();

    if (!approvalStatus) {
      toast.error('Status verifikasi harus dipilih.');
      return;
    }

    // Backend: note_validator wajib diisi jika SRE
    if (approvalStatus === 'SRE' && !noteValidator) {
      toast.error('Catatan wajib diisi saat menolak (Reject).');
      return;
    }

    finalFormData.set('approval_status_code', approvalStatus);
    finalFormData.set('note_validator', noteValidator);

    router.post(route('inspection.genset.verify', { uuid: inspection.uuid }), finalFormData, {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => {
        setOpen(false);
        toast.success('Inspeksi Genset berhasil diverifikasi.');
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
          <DialogTitle>Verifikasi Inspeksi Genset</DialogTitle>
          <DialogDescription>
            Form ini hanya untuk Validator dalam memverifikasi hasil inspeksi Genset.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="approval_status_code">Status Verifikasi</Label>
            <select
              id="approval_status_code"
              name="approval_status_code"
              className="w-full rounded-md border px-3 py-2 text-sm"
              required
              defaultValue=""
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
              placeholder="Tuliskan catatan tambahan. Wajib diisi jika menolak (Reject)."
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
