// resources/js/pages/analysis/k3-program/achievements.tsx
import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/section-header';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import * as React from 'react';

type Item = {
  id: number; title: string; pic: string | null;
  unit_type: 'monthly' | 'once' | 'custom';
  target_units: number | null;
  monthly_denominator_mode: '12' | 'elapsed';
  plan_flags: boolean[]; actual_flags: boolean[];
  plan_evidence: string | null; actual_evidence: string | null;
  plan_percent: number; actual_percent: number;
};
type Section = { id: number; title: string; target_pct: number; order_no: number; items: Item[] };
type Program = {
  uuid: string; year: number; entity_code: string; plant_code: string; target_description: string;
  approval_status_code: 'SOP' | 'SAP' | 'SRE';
  sections: Section[];
};
type Props = { program: Program };

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

export default function K3ProgramAchievements({ program }: Props) {
  // bentuk payload minimal ke backend
  const initial = React.useMemo(() => ({
    items: program.sections.flatMap(sec =>
      sec.items.map(it => ({
        id: it.id,
        actual_flags: it.actual_flags ?? Array(12).fill(false),
        actual_evidence: it.actual_evidence ?? '',
      }))
    ),
  }), [program.sections]);

  const form = useForm(initial);

  // helper akses/mutasi item di form
  function getItemState(id: number) {
    return form.data.items.find(i => i.id === id)!;
  }
  function setItemFlag(id: number, monthIdx: number, value: boolean) {
    form.setData('items', form.data.items.map(it => it.id === id
      ? { ...it, actual_flags: it.actual_flags.map((v, i) => i === monthIdx ? value : v) }
      : it
    ));
  }
  function setItemEvidence(id: number, value: string) {
    form.setData('items', form.data.items.map(it => it.id === id ? { ...it, actual_evidence: value } : it));
  }

  // hitung ulang percent per item (client-side) untuk tampilan ringkas
  const computedItems = React.useMemo(() => {
    const meta: Record<number, { unit_type: Item['unit_type']; monthly_denominator_mode: Item['monthly_denominator_mode']; target_units: number | null }> = {};
    program.sections.forEach(sec => sec.items.forEach(it => {
      meta[it.id] = {
        unit_type: it.unit_type,
        monthly_denominator_mode: it.monthly_denominator_mode,
        target_units: it.target_units,
      };
    }));

    const now = new Date();
    const elapsed = now.getMonth() + 1; // 1..12
    return form.data.items.map(it => {
      const m = meta[it.id];
      const trueCount = it.actual_flags.filter(Boolean).length;
      let denom = 1;

      if (m.unit_type === 'monthly') {
        denom = m.monthly_denominator_mode === 'elapsed' ? Math.max(1, Math.min(12, elapsed)) : 12;
      } else if (m.unit_type === 'once') {
        denom = 1;
      } else { // custom
        denom = Math.max(1, m.target_units ?? 1);
      }

      const percent = Math.max(0, Math.min(100, (trueCount / denom) * 100));
      return { id: it.id, percent };
    });
  }, [form.data.items, program.sections]);

  const percentMap = React.useMemo(() => Object.fromEntries(computedItems.map(i => [i.id, i.percent])), [computedItems]);

  // agregat rata-rata plan/actual (actual pakai computed)
  const allPlan = React.useMemo(() => program.sections.flatMap(s => s.items.map(i => i.plan_percent)), [program.sections]);
  const allActual = React.useMemo(
    () => program.sections.flatMap(s => s.items.map(i => percentMap[i.id] ?? i.actual_percent)),
    [program.sections, percentMap]
  );
  const planAvg   = allPlan.length ? avg(allPlan) : 0;
  const actualAvg = allActual.length ? avg(allActual) : 0;

  const submit = () => {
    form.post(`/analysis/k3-program/${program.uuid}/achievements`, {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={[
      { title: 'Home', href: '/' },
      { title: 'Program Kerja K3', href: '/analysis/k3-program' },
      { title: 'Isi Capaian', href: '#' },
    ]}>
      <Head title={`Isi Capaian — Program K3 ${program.year}`} />
      <div className="p-4 space-y-4">
        <SectionHeader
          title={`Isi Capaian — Program K3 ${program.year}`}
          subtitle={`${program.entity_code} / ${program.plant_code} — ${program.target_description}`}
        />

        {/* SUMMARY KPI */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Status</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <span className={`inline-block rounded px-2 py-1 text-xs
                ${program.approval_status_code==='SAP' ? 'bg-emerald-100 text-emerald-700' :
                  program.approval_status_code==='SRE' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'}`}>
                {program.approval_status_code === 'SAP' ? 'Approved' : program.approval_status_code === 'SRE' ? 'Rejected' : 'Open'}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Capaian Rencana (Plan)</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="text-muted-foreground">Rata-rata</div>
                <div className="font-semibold">{planAvg.toFixed(2)}%</div>
              </div>
              <Progress value={planAvg} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Capaian Realisasi (Actual)</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="text-muted-foreground">Rata-rata</div>
                <div className="font-semibold">{actualAvg.toFixed(2)}%</div>
              </div>
              <Progress value={actualAvg} />
            </CardContent>
          </Card>
        </div>

        {/* SECTIONS: 2 baris per item (Plan / Actual), actual editable */}
        {program.sections.map((sec, sIdx) => (
          <Card key={sec.id} className="break-inside-avoid-page">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">{sIdx + 1}. {sec.title}</CardTitle>
              <div className="text-sm text-muted-foreground">Target Section: {sec.target_pct}%</div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm print:text-[12px]">
                  <thead>
                    <tr>
                      <Th rowSpan={2} className="w-10">No</Th>
                      <Th rowSpan={2} className="min-w-[280px]">Sasaran / Target Program</Th>
                      <Th rowSpan={2} className="min-w-[120px]">PIC</Th>
                      <Th colSpan={12} className="text-center">Bulan</Th>
                      <Th rowSpan={2} className="w-24 text-center">% Capaian</Th>
                      <Th rowSpan={2} className="min-w-[220px]">Evidence</Th>
                    </tr>
                    <tr>
                      {MONTHS.map(m => <Th key={m} className="w-12 text-center">{m}</Th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {sec.items.length === 0 && (
                      <tr>
                        <Td colSpan={17} className="text-center text-muted-foreground py-6">
                          Belum ada item.
                        </Td>
                      </tr>
                    )}
                    {sec.items.map((it, idx) => {
                      const state = getItemState(it.id);
                      const percent = percentMap[it.id] ?? it.actual_percent;
                      return (
                        <React.Fragment key={it.id}>
                          {/* PLAN (read-only) */}
                          <tr className="border-b bg-muted/30">
                            <Td rowSpan={2} className="align-top text-center">{idx + 1}</Td>
                            <Td rowSpan={2} className="align-top">
                              <div className="font-medium">{it.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">Unit: {unitLabel(it)}</div>
                            </Td>
                            <Td rowSpan={2} className="align-top">{it.pic ?? '-'}</Td>

                            {MONTHS.map((_m, i) => (
                              <Td key={`plan-${it.id}-${i}`} className="text-center">
                                <Dot checked={!!it.plan_flags[i]} tone="plan" />
                              </Td>
                            ))}
                            <Td className="text-center font-semibold">{it.plan_percent.toFixed(2)}%</Td>
                            <Td rowSpan={2} className="align-top">
                              <Textarea
                                value={state.actual_evidence ?? ''}
                                onChange={(e) => setItemEvidence(it.id, e.target.value)}
                                placeholder="Lampirkan keterangan/link/nomor dokumen…"
                                rows={3}
                              />
                            </Td>
                          </tr>

                          {/* ACTUAL (editable) */}
                          <tr className="border-b">
                            {MONTHS.map((_m, i) => (
                              <Td key={`act-${it.id}-${i}`} className="text-center">
                                <label className="inline-flex items-center justify-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4"
                                    checked={!!state.actual_flags[i]}
                                    onChange={(e) => setItemFlag(it.id, i, e.target.checked)}
                                  />
                                </label>
                              </Td>
                            ))}
                            <Td className="text-center font-semibold">{percent.toFixed(2)}%</Td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* actions */}
        <div className="flex justify-end gap-2 print:hidden">
          <Button variant="outline" onClick={() => history.back()}>Kembali</Button>
          <Button onClick={submit}>Simpan Capaian</Button>
        </div>
      </div>
    </AppLayout>
  );
}

/* ===== helpers ===== */
const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...rest }) => (
  <th className={`border px-2 py-2 bg-muted/40 ${className}`} {...rest}>{children}</th>
);
const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...rest }) => (
  <td className={`border px-2 py-2 ${className}`} {...rest}>{children}</td>
);

function Dot({ checked, tone }: { checked: boolean; tone: 'plan' | 'actual' }) {
  const on = tone === 'plan' ? 'text-emerald-600' : 'text-blue-600';
  return <span className={`inline-block text-lg leading-none ${checked ? on : 'text-muted-foreground/40'}`}>{checked ? '●' : '○'}</span>;
}

const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

function unitLabel(it: Item) {
  if (it.unit_type === 'once') return 'sekali (1x)';
  if (it.unit_type === 'custom') return `custom: target ${it.target_units}x`;
  return it.monthly_denominator_mode === 'elapsed' ? 'bulanan (pembagi bulan berjalan)' : 'bulanan (pembagi 12)';
}
