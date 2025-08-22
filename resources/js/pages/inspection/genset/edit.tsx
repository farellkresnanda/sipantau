// resources/js/pages/inspection/genset/edit.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
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

// ================= Types (cocokkan dengan payload controller@edit) =================
type MasterGenset = { id: number; serial_number: string | null; merk: string | null; };
type WorkStandard  = { id: number; work_item: string; period: string };
type InspectionItem = { id: number; notes: string | null; work_standard?: WorkStandard | null };

type SimpleMaster = { name?: string | null };
type Genset = { id?: number; serial_number?: string | null; merk?: string | null };

type Inspection = {
  id: number;
  uuid: string;
  genset_id: number;
  car_auto_number?: string;
  inspection_date: string; // date string (bisa ISO)
  items: InspectionItem[];
  genset?: Genset | null;
  entity?: SimpleMaster | null;
  plant?: SimpleMaster | null;
};

interface CurrentPageProps extends PageProps {
  inspection: Inspection;                 // dari controller@edit
  masterGensets: MasterGenset[];
  workStandards: WorkStandard[];
}

// Ziggy
declare function route(name: string, params?: any): string;

/* ================= Helper Tanggal ================= */
function toYMD(val?: string | null) {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '';
  // normalisasi timezone agar tidak mundur/maju sehari
  const tzOffsetMs = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

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

type FormValues = {
  genset_id: string;
  inspection_date: string;
  selections: Record<string, { selected?: boolean; notes?: string }>;
  activePeriods: PeriodKey[];
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Inspeksi Genset', href: '/inspection/genset' },
  { title: 'Edit Inspeksi', href: '#' },
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
export default function EditGensetInspection() {
  const { inspection, masterGensets, workStandards } = usePage<CurrentPageProps>().props;

  // Group work standards by normalized period (untuk render checklist per-periode)
  const groups = useMemo(() => groupByPeriod(workStandards || []), [workStandards]);

  // Prefill selections dari inspection.items
  const preSelections: FormValues['selections'] = useMemo(() => {
    const map: FormValues['selections'] = {};
    for (const it of (inspection.items || [])) {
      const wsId = it.work_standard?.id;
      if (wsId) {
        map[String(wsId)] = {
          selected: true,
          notes: it.notes ?? '',
        };
      }
    }
    return map;
  }, [inspection.items]);

  // Prefill active periods berdasarkan work_standard period pada items yang sudah ada
  const preActivePeriods: PeriodKey[] = useMemo(() => {
    const set = new Set<PeriodKey>();
    for (const it of (inspection.items || [])) {
      const p = it.work_standard?.period;
      if (p) set.add(bucketPeriod(p));
    }
    const arr = Array.from(set);
    return arr.length ? (arr as PeriodKey[]) : (['MINGGUAN'] as PeriodKey[]);
  }, [inspection.items]);

  const defaultValues: DefaultValues<FormValues> = {
    genset_id: String(inspection.genset_id ?? ''),
    inspection_date: toYMD(inspection.inspection_date) || new Date().toISOString().slice(0, 10),
    selections: preSelections,
    activePeriods: preActivePeriods,
  };

  const {
    control, register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch, setError, reset,
  } = useForm<FormValues>({ resolver: zodResolver(FormSchema), defaultValues });

  // Reset form jika inspection berubah (dan normalisasi tanggal)
  useEffect(() => {
    reset({
      genset_id: String(inspection.genset_id ?? ''),
      inspection_date: toYMD(inspection.inspection_date) || new Date().toISOString().slice(0, 10),
      selections: preSelections,
      activePeriods: preActivePeriods,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspection.uuid, reset, preSelections, preActivePeriods]);

  const activePeriods = watch('activePeriods');

  const [selectedMonthStr, setSelectedMonthStr] = useState<string>(() => {
    const ymd = toYMD(inspection.inspection_date);
    const d = ymd ? new Date(ymd) : null;
    return d && !isNaN(d.getTime()) ? d.toLocaleString('id-ID', { month: 'long', year: 'numeric' }) : '';
  });

  const toggleAllInPeriod = (period: PeriodKey, value: boolean) => {
    groups[period].forEach(ws => {
      setValue(`selections.${ws.id}.selected`, value, { shouldDirty: true });
    });
  };

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    // hanya izinkan WS dari periode aktif
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

    const url = route('inspection.genset.update', { genset: inspection.uuid });
    router.put(url, payload, {
      onSuccess: () => {
        //router.visit(route('inspection.genset.show', { genset: inspection.uuid }), { replace: true });
      },
      onError: (errs) => {
        if (errs?.genset_id) setError('genset_id', { type: 'server', message: String(errs.genset_id) });
        if (errs?.inspection_date) setError('inspection_date', { type: 'server', message: String(errs.inspection_date) });
        if (errs?.message) alert(String(errs.message));
      },
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Inspeksi Genset" />
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
        <SectionHeader
          title="Edit Inspeksi Genset"
          subtitle="Perbarui informasi genset, tanggal inspeksi, dan checklist item per-periode."
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
              value={watch('activePeriods')}
              onChange={(v) => setValue('activePeriods', v, { shouldDirty: true, shouldValidate: true })}
            />
            {errors.activePeriods && <p className="text-sm text-red-600">{errors.activePeriods.message as string}</p>}
          </div>
        </div>

        {/* Checklist per periode aktif */}
        {watch('activePeriods').map((period) => {
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
            <Link href={route('inspection.genset.index')}>Kembali</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}
