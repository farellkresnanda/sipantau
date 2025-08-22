// resources/js/pages/inspection/genset/create.tsx

'use client';

import { useMemo, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableHeader, TableHead, TableRow, TableBody, TableCell,
} from '@/components/ui/table';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Check, Filter } from 'lucide-react';

import { z } from 'zod';
import { useForm, Controller, type SubmitHandler, type DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PageProps, BreadcrumbItem } from '@/types';

/* ================= TYPES ================= */
type MasterGenset = { id: number; serial_number: string | null; merk: string | null; };
type WorkStandard = { id: number; work_item: string; period: string; };

interface CurrentPageProps extends PageProps {
  masterGensets: MasterGenset[];
  workStandards: WorkStandard[];
}

// Ziggy
declare function route(name: string, params?: any): string;

/* ================ PERIOD CONFIG ================ */
const PERIOD_KEYS = ['MINGGUAN', 'BULANAN', '3 BULANAN', '6 BULANAN', 'TAHUNAN'] as const;
type PeriodKey = typeof PERIOD_KEYS[number];

const periodLabels: Record<PeriodKey, string> = {
  'MINGGUAN': 'Mingguan',
  'BULANAN': 'Bulanan',
  '3 BULANAN': '3 Bulanan',
  '6 BULANAN': '6 Bulanan',
  'TAHUNAN': 'Tahunan',
};

function normalize(t: string) { return (t || '').trim().toLowerCase(); }
function bucketPeriod(raw: string): PeriodKey {
  const t = normalize(raw);
  if (t.includes('minggu') || t.includes('week')) return 'MINGGUAN';
  if (t.includes('3') || t.includes('tri') || t.includes('quarter')) return '3 BULANAN';
  if (t.includes('6') || t.includes('semester')) return '6 BULANAN';
  if (t.includes('tahun') || t.includes('year')) return 'TAHUNAN';
  if (t.includes('bulan') || t.includes('month')) return 'BULANAN';
  return 'BULANAN';
}
function groupByPeriod(items: WorkStandard[]) {
  const groups: Record<PeriodKey, WorkStandard[]> = {
    'MINGGUAN': [], 'BULANAN': [], '3 BULANAN': [], '6 BULANAN': [], 'TAHUNAN': [],
  };
  for (const ws of items) groups[bucketPeriod(ws.period)].push(ws);
  for (const k of PERIOD_KEYS) groups[k].sort((a, b) => a.work_item.localeCompare(b.work_item));
  return groups;
}

/* ================ FORM SCHEMA ================ */
const SelectionSchema = z.object({
  selected: z.boolean().default(false).optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
});
const FormSchema = z.object({
  genset_id: z.string().min(1, 'Pilih genset'),
  inspection_date: z.string().min(1, 'Isi tanggal inspeksi'),
  selections: z.record(SelectionSchema),
  activePeriods: z.array(z.enum(PERIOD_KEYS)).min(1, 'Pilih minimal satu periode'),
});
type FormValues = z.infer<typeof FormSchema>;

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Inspeksi Genset', href: '/inspection/genset' },
  { title: 'Buat Inspeksi', href: '/inspection/genset/create' },
];

/* ================ Multi-select Periode (Dialog) ================ */
function PeriodMultiSelectDialog({
  value, onChange,
}: { value: PeriodKey[]; onChange: (v: PeriodKey[]) => void; }) {
  const [open, setOpen] = useState(false);
  const [temp, setTemp] = useState<PeriodKey[]>(value);

  const toggle = (p: PeriodKey) => {
    const set = new Set(temp);
    set.has(p) ? set.delete(p) : set.add(p);
    setTemp(Array.from(set) as PeriodKey[]);
  };

  const summary =
    temp.length === 0 ? '—'
    : temp.length === PERIOD_KEYS.length ? 'Semua periode'
    : temp.map((v) => periodLabels[v]).join(', ');

  const countText =
    temp.length === 0 ? 'Tidak ada periode dipilih'
    : temp.length === PERIOD_KEYS.length ? 'Semua periode dipilih'
    : `${temp.length} periode dipilih`;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => { setTemp(value); setOpen(true); }}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Pilih Periode</span>
        </div>
        <span className="text-xs text-muted-foreground truncate max-w-[220px]">{summary}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pilih Periode Inspeksi</DialogTitle>
            <DialogDescription>Centang periode yang ingin ditampilkan sebagai checklist.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setTemp([...PERIOD_KEYS])}>
                Pilih semua
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setTemp([])}>
                Bersihkan
              </Button>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-1">
              {PERIOD_KEYS.map((p) => {
                const checked = temp.includes(p);
                return (
                  <label key={p} className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-muted cursor-pointer">
                    <Checkbox checked={checked} onCheckedChange={() => toggle(p)} />
                    <span className="text-sm">{periodLabels[p]}</span>
                    {checked && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </label>
                );
              })}
            </div>

            <p className="text-xs text-muted-foreground">{countText}</p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button
              type="button"
              onClick={() => { onChange(temp); setOpen(false); }}
            >
              Terapkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ================ PAGE ================ */
export default function CreateGensetInspection({ masterGensets, workStandards }: CurrentPageProps) {
  const groups = useMemo(() => groupByPeriod(workStandards || []), [workStandards]);
  const [selectedMonthStr, setSelectedMonthStr] = useState<string>('');

  // Dialog konfirmasi temuan
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const defaultValues: DefaultValues<FormValues> = {
    genset_id: '',
    inspection_date: new Date().toISOString().slice(0, 10),
    selections: {},
    activePeriods: ['MINGGUAN'],
  };

  const {
    control, register, handleSubmit, formState: { errors }, setValue, watch, setError,
  } = useForm<FormValues>({ resolver: zodResolver(FormSchema), defaultValues });

  const activePeriods = watch('activePeriods');

  const toggleAllInPeriod = (period: PeriodKey, value: boolean) => {
    groups[period].forEach(ws => {
      setValue(`selections.${ws.id}.selected`, value, { shouldDirty: true });
    });
  };

  // helper: format D/M/YYYY tanpa leading zero
  const fmtDmy = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  // Step 1 — validasi lokal, lalu buka dialog "Apakah ada temuan?"
  const startSubmit: SubmitHandler<FormValues> = (values) => {
    const allowedIds = new Set(activePeriods.flatMap(p => groups[p].map(ws => ws.id)));

    const details = Object.entries(values.selections)
      .filter(([id, v]) => allowedIds.has(Number(id)) && Boolean(v?.selected))
      .map(([id, v]) => ({
        work_standard_id: Number(id),
        notes: v?.notes ? String(v.notes) : null,
      }));

    if (details.length === 0) {
      alert('Pilih minimal satu item pekerjaan dari periode yang aktif.');
      return;
    }

    const payload = {
      genset_id: Number(values.genset_id),
      inspection_date: values.inspection_date,
      details,
    };

    setPendingPayload(payload);
    setConfirmOpen(true);
  };

  // Step 2 — submit ke server, lalu arahkan:
  // - Tidak Ada: kembali ke index
  // - Ada Temuan: ke /finding/create?inspection=GENSET&inspection_code=...&description=...
  const doSubmit = (goToFinding: boolean) => {
    if (!pendingPayload) return;
    setSubmitting(true);

    const url = route ? route('inspection.genset.store') : '/inspection/genset';
    router.post(url, pendingPayload, {
      preserveScroll: true,
      onSuccess: (page) => {
        const flash = (page.props as any)?.flash || {};
        // Pastikan backend meng-SET dua ini saat store():
        // 'gensetInspectionUuid' dan 'gensetInspectionCode'
        const code: string | undefined = flash.gensetInspectionCode; // CAR number
        // const uuid: string | undefined = flash.gensetInspectionUuid; // kalau butuh UUID

        if (goToFinding && code) {
          const dmy = fmtDmy(pendingPayload.inspection_date);
          const desc = `Isi Temuan untuk Inspeksi GENSET [${code}] pada Tanggal [${dmy}]`;
          const q = new URLSearchParams({
            inspection: 'GENSET',
            inspection_code: code,      // samakan dengan pola AC
            description: desc,
          });
          router.visit(`/finding/create?${q.toString()}`);
        } else {
          router.visit(route ? route('inspection.genset.index') : '/inspection/genset', { replace: true });
        }
      },
      onError: (errs: any) => {
        if (errs?.genset_id) setError('genset_id', { type: 'server', message: String(errs.genset_id) });
        if (errs?.inspection_date) setError('inspection_date', { type: 'server', message: String(errs.inspection_date) });
        if (errs?.message) alert(String(errs.message));
      },
      onFinish: () => {
        setSubmitting(false);
        setConfirmOpen(false);
        setPendingPayload(null);
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Buat Inspeksi Genset" />
      <form onSubmit={handleSubmit(startSubmit)} className="p-4 space-y-6">
        <SectionHeader
          title="Buat Inspeksi Genset"
          subtitle="Pilih genset & tanggal, pilih periode checklist. Setelah simpan, tentukan apakah ada temuan."
        />

        {/* Header fields */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Genset */}
          <div className="space-y-2">
            <Label htmlFor="genset_id">Genset</Label>
            <Controller
              control={control}
              name="genset_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="genset_id" className="w-full">
                    <SelectValue placeholder="Pilih genset" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[260px]">
                    {masterGensets.map(g => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {(g.serial_number || 'SN?') + ' — ' + (g.merk || 'Merek?')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.genset_id && <p className="text-sm text-red-600">{errors.genset_id.message}</p>}
          </div>

          {/* Tanggal */}
          <div className="space-y-2">
            <Label htmlFor="inspection_date">Tanggal Inspeksi</Label>
            <Input
              type="date"
              id="inspection_date"
              {...register('inspection_date')}
              onChange={(e) => {
                const v = e.target.value;
                (register('inspection_date').onChange as any)(e);
                const d = new Date(v);
                setSelectedMonthStr(!isNaN(d.getTime()) ? d.toLocaleString('id-ID', { month: 'long', year: 'numeric' }) : '');
              }}
            />
            {errors.inspection_date && <p className="text-sm text-red-600">{errors.inspection_date.message}</p>}
            {selectedMonthStr && <p className="text-xs text-muted-foreground">Bulan aktif: {selectedMonthStr}</p>}
          </div>

          {/* Periode aktif — Multi-select via Dialog */}
          <div className="space-y-2">
            <Label>Periode yang Diinspeksi</Label>
            <PeriodMultiSelectDialog
              value={activePeriods}
              onChange={(v) => setValue('activePeriods', v, { shouldDirty: true, shouldValidate: true })}
            />
            {errors.activePeriods && <p className="text-sm text-red-600">{errors.activePeriods.message as string}</p>}
          </div>
        </div>

        {/* Checklist per periode aktif */}
        {activePeriods.map((period) => {
          const list = groups[period] || [];
          return (
            <div key={period} className="space-y-3 border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{periodLabels[period]}</h3>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => toggleAllInPeriod(period, true)}>
                    Centang Semua
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => toggleAllInPeriod(period, false)}>
                    Hapus Centang
                  </Button>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <div className="min-w-[900px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-yellow-300">
                        <TableHead className="border border-gray-400">Pekerjaan</TableHead>
                        <TableHead className="w-[80px] text-center border border-gray-400">Ceklis</TableHead>
                        <TableHead className="w-[45%] border border-gray-400">Catatan</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {list.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
                            Tidak ada item untuk periode ini.
                          </TableCell>
                        </TableRow>
                      )}
                      {list.map((ws) => {
                        const selected = watch(`selections.${ws.id}.selected`) ?? false;
                        return (
                          <TableRow key={ws.id}>
                            {/* Kolom pekerjaan */}
                            <TableCell className="border border-gray-400">
                              <div className="font-medium">{ws.work_item}</div>
                              <div className="text-xs text-muted-foreground">Standar: {ws.period}</div>
                            </TableCell>

                            {/* Kolom ceklis */}
                            <TableCell className="text-center border border-gray-400">
                              <Controller
                                control={control}
                                name={`selections.${ws.id}.selected`}
                                render={({ field }) => (
                                  <Checkbox
                                    className="h-5 w-5 border-2 border-gray-500 data-[state=checked]:border-gray-700"
                                    checked={Boolean(field.value)}
                                    onCheckedChange={(v) => field.onChange(Boolean(v))}
                                  />
                                )}
                              />
                            </TableCell>

                            {/* Kolom catatan */}
                            <TableCell className="border border-gray-400">
                              <Controller
                                control={control}
                                name={`selections.${ws.id}.notes`}
                                render={({ field }) => (
                                  <Textarea
                                    placeholder={selected ? 'Catatan (opsional)...' : 'Centang dulu untuk mengisi catatan'}
                                    disabled={!selected}
                                    value={field.value ?? ''}
                                    onChange={field.onChange}
                                  />
                                )}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          );
        })}

        {/* Actions */}
        <div className="flex items-center justify-start gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/inspection/genset">Kembali</Link>
          </Button>
          <Button type="submit">
            Simpan Inspeksi
          </Button>
        </div>
      </form>

      {/* Dialog konfirmasi temuan */}
      <Dialog open={confirmOpen} onOpenChange={(o) => { if (!submitting) setConfirmOpen(o); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apakah ada temuan?</DialogTitle>
            <DialogDescription>
              Inspeksi akan disimpan terlebih dahulu. Jika ada temuan, Anda akan diarahkan ke halaman pembuatan temuan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" disabled={submitting} onClick={() => doSubmit(false)}>
              Tidak Ada
            </Button>
            <Button type="button" disabled={submitting} onClick={() => doSubmit(true)}>
              Ada Temuan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
