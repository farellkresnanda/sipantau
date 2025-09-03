import * as React from "react";
import AppLayout from "@/layouts/app-layout";
import SectionHeader from "@/components/section-header";
import { Head, router, usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

/* =========================
 * Types
 * ========================= */
type Month = 1|2|3|4|5|6|7|8|9|10|11|12;

type DocRow = { month: Month; plan_note?: string|null; actual_note?: string|null; evidence?: string|null };

type ItemDraft = {
  id: number;
  title: string; pic: string|null;
  plan_m: boolean[]; actual_m: boolean[]; // actual_m disimpan saja (tanpa UI)
  docs: DocRow[];
  unit_type?: "monthly"|"once"|"custom";
  target_units?: number|null;
};

type SectionDraft = { id: number; title: string; target_pct: number; items: ItemDraft[] };

type ProgramServer = {
  uuid: string;
  year: number;
  entity_code: string;
  plant_code: string;
  target_description: string|null;
  approval_status_code: "SOP"|"SAP"|"SRE";
  sections?: Array<{
    id: number; title: string; target_pct?: number|null;
    items?: Array<{
      id: number; title: string; pic?: string|null;
      plan_flags?: boolean[]|string|null;
      actual_flags?: boolean[]|string|null;
      unit_type?: "monthly"|"once"|"custom";
      target_units?: number|null;
      docs?: DocRow[]|null;
    }>
  }>|null;
};

type Props = {
  program?: ProgramServer;
  entities?: { code: string; name: string }[] | null;
  plants?: { code: string; name: string; entity_code: string }[] | null;
};

/* =========================
 * Const & helpers
 * ========================= */
const MONTHS: { m: Month; label: string }[] = [
  { m:1, label:"Jan" },{ m:2, label:"Feb" },{ m:3, label:"Mar" },
  { m:4, label:"Apr" },{ m:5, label:"Mei" },{ m:6, label:"Jun" },
  { m:7, label:"Jul" },{ m:8, label:"Agu" },{ m:9, label:"Sep" },
  { m:10,label:"Okt" },{ m:11,label:"Nov" },{ m:12,label:"Des" },
];

const QUARTERS = [
  { label:"Q1", months:[1,2,3] as Month[] },
  { label:"Q2", months:[4,5,6] as Month[] },
  { label:"Q3", months:[7,8,9] as Month[] },
  { label:"Q4", months:[10,11,12] as Month[] },
];

const ensureArray = <T,>(v: T[] | null | undefined): T[] => Array.isArray(v) ? v : [];
const ensureBool12 = (v: any): boolean[] => {
  let arr: any = v;
  if (typeof arr === "string") { try { arr = JSON.parse(arr); } catch { arr = []; } }
  if (!Array.isArray(arr)) arr = [];
  const out: boolean[] = [];
  for (let i = 0; i < 12; i++) out.push(Boolean(arr[i]));
  return out;
};
const nz = (n: number | null | undefined, f = 0) => (typeof n === "number" && !Number.isNaN(n) ? n : f);
const debounce = (fn: Function, ms = 500) => {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => { if (t) clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

/* =========================
 * Page
 * ========================= */
export default function EditK3Program(p: Props) {
  // Ambil dari props ATAU dari usePage (supaya tidak undefined)
  const page = usePage<{ program?: ProgramServer; entities?: any; plants?: any; errors?: Record<string,string> }>();
  const program = (p.program ?? page.props.program)!; // wajib ada
  const entities = ensureArray(p.entities ?? (page.props.entities as any) ?? []);
  const plants   = ensureArray(p.plants   ?? (page.props.plants as any)   ?? []);
  const errors = page.props.errors ?? {};

  /* ---------- Header state ---------- */
  const [year, setYear] = React.useState<number>(program.year);
  const [entityCode, setEntityCode] = React.useState<string>(program.entity_code);
  const filteredPlants = React.useMemo(
    () => plants.filter(p => p.entity_code === String(entityCode)),
    [plants, entityCode]
  );
  const [plantCode, setPlantCode] = React.useState<string>(program.plant_code);
  React.useEffect(() => {
    if (!filteredPlants.find(p => p.code === plantCode)) {
      setPlantCode(filteredPlants[0]?.code ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityCode]);

  const [targetDescription, setTargetDescription] = React.useState<string>(program.target_description ?? "");

  /* ---------- Sections/Items (init safely) ---------- */
  const SECTIONS_FROM_SERVER = ensureArray(program.sections);
  const initialSections: SectionDraft[] = React.useMemo(() => {
    const secs = SECTIONS_FROM_SERVER.map((s) => {
      const items = ensureArray(s.items).map((it) => ({
        id: it.id,
        title: it.title ?? "",
        pic: it.pic ?? "",
        plan_m: ensureBool12(it.plan_flags),
        actual_m: ensureBool12(it.actual_flags), // tidak diedit di UI
        docs: ensureArray(it.docs ?? []),
        unit_type: it.unit_type ?? "monthly",
        target_units: it.target_units ?? null,
      }));
      return { id: s.id, title: s.title, target_pct: nz(s.target_pct, 0), items };
    });
    // fallback kalau kosong
    return secs.length ? secs : [{ id: 1, title: "Sasaran", target_pct: 100, items: [] }];
  }, [SECTIONS_FROM_SERVER]);

  const [sections, setSections] = React.useState<SectionDraft[]>(initialSections);

  /* ---------- Stepper ---------- */
  const steps = [
    "Header",
    "Sasaran & Target (lihat)",
    "Program & PIC (lihat)",
    "Rencana (PLAN) per Bulan",
    "Dokumentasi Bulanan",
    "Review & Simpan",
  ];
  const [step, setStep] = React.useState<number>(1);
  const maxStep = steps.length;
  const next = () => setStep((s) => Math.min(maxStep, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  /* ---------- Save: header ---------- */
  const submitHeader = () => {
    const payload = {
      year,
      entity_code: entityCode,
      plant_code: plantCode,
      target_description: targetDescription || "",
      _method: "PUT",
    };
    router.post(`/analysis/k3-program/${program.uuid}`, payload, {
      preserveScroll: true,
    });
  };

  /* ---------- Save: monthly PLAN (debounced) ---------- */
  const saveItemMonthly = React.useMemo(
    () => debounce((itemId: number, plan_m: boolean[], actual_m: boolean[]) => {
      router.patch(`/analysis/k3-program/items/${itemId}/monthly`, { plan_m, actual_m }, { preserveScroll: true });
    }, 350),
    []
  );

  const toggleMonthPlan = (si: number, ii: number, month: Month, val: boolean) => {
    setSections(prev => {
      const clone = [...prev];
      const item = clone[si].items[ii];
      const plan = [...item.plan_m];
      plan[month-1] = val;
      item.plan_m = plan;
      // kirim actual_m apa adanya (tanpa UI)
      saveItemMonthly(item.id, item.plan_m, item.actual_m);
      return clone;
    });
  };

  const setQuarterPlan = (si: number, ii: number, months: Month[], val: boolean) => {
    setSections(prev => {
      const clone = [...prev];
      const item = clone[si].items[ii];
      const plan = [...item.plan_m];
      months.forEach(m => { plan[m-1] = val; });
      item.plan_m = plan;
      saveItemMonthly(item.id, item.plan_m, item.actual_m);
      return clone;
    });
  };

  /* ---------- Evidence submit (inline) ---------- */
  const submitEvidence = (
    item: ItemDraft,
    form: { month: string; link_url: string; file: File|null; note: string },
    close: ()=>void
  ) => {
    const fd = new FormData();
    fd.append("month", form.month);
    fd.append("mode", form.file ? "file" : "link");
    fd.append("link_url", form.link_url || "");
    fd.append("note", form.note || "");
    if (form.file) fd.append("file", form.file);
    router.post(`/analysis/k3-program/items/${item.id}/docs`, fd, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => close(),
    });
  };

  return (
    <AppLayout breadcrumbs={[
      { title: "Home", href: "/" },
      { title: "Program Kerja K3", href: "/analysis/k3-program" },
      { title: "Edit", href: "#" },
    ]}>
      <Head title={`Edit Program K3 ${program.year}`} />

      <div className="p-4 space-y-4">
        <SectionHeader
          title={`Edit Program K3 — ${program.year}`}
          subtitle={`${program.entity_code} / ${program.plant_code} — ${program.target_description ?? "-"}`}
        />

        <Stepper step={step} labels={steps} />

        {/* STEP 1: Header */}
        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>1. Header Program</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Tahun</Label>
                <Input type="number" value={year} onChange={(e)=>setYear(Number(e.target.value))} />
                {errors.year && <p className="text-xs text-destructive mt-1">{errors.year}</p>}
              </div>

              <div>
                <Label>Entitas</Label>
                <select className="w-full border rounded-md h-10 px-3" value={entityCode} onChange={(e)=>setEntityCode(e.target.value)}>
                  {entities.map(e => <option key={e.code} value={e.code}>{e.name}</option>)}
                </select>
                {errors.entity_code && <p className="text-xs text-destructive mt-1">{errors.entity_code}</p>}
              </div>

              <div>
                <Label>Plant</Label>
                <select className="w-full border rounded-md h-10 px-3" value={plantCode} onChange={(e)=>setPlantCode(e.target.value)} disabled={!entityCode || filteredPlants.length===0}>
                  {filteredPlants.length===0 ? (
                    <option value="">(Tidak ada plant untuk entitas ini)</option>
                  ) : (
                    filteredPlants.map(p => <option key={p.code} value={p.code}>{p.name}</option>)
                  )}
                </select>
                {errors.plant_code && <p className="text-xs text-destructive mt-1">{errors.plant_code}</p>}
              </div>

              <div className="md:col-span-2">
                <Label>Deskripsi Target (Head)</Label>
                <Textarea rows={3} value={targetDescription} onChange={(e)=>setTargetDescription(e.target.value)} />
                {errors.target_description && <p className="text-xs text-destructive mt-1">{errors.target_description}</p>}
              </div>

              <div className="md:col-span-2 flex justify-between">
                <Button variant="outline" onClick={next}>Lanjut</Button>
                <Button onClick={submitHeader}>Simpan Header</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2: Sasaran (read-only) */}
        {step === 2 && (
          <Card>
            <CardHeader><CardTitle>2. Sasaran & Target (read-only)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {sections.map((s, si) => (
                <div key={si} className="rounded-md border p-3 grid gap-3 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <Label>Nama Sasaran</Label>
                    <Input value={s.title} readOnly />
                  </div>
                  <div>
                    <Label>Target Bobot (%)</Label>
                    <Input value={s.target_pct} readOnly />
                  </div>
                </div>
              ))}
              <div className="flex justify-between">
                <Button variant="outline" onClick={back}>Kembali</Button>
                <Button onClick={next}>Lanjut</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3: Program & PIC (read-only) */}
        {step === 3 && (
          <Card>
            <CardHeader><CardTitle>3. Program & PIC (read-only)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {sections.map((s, si) => (
                <div key={si} className="rounded-md border p-3">
                  <div className="mb-2 font-semibold">{si+1}. {s.title}</div>
                  {s.items.map((it, ii) => (
                    <div key={ii} className="rounded border p-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <Label>Nama Program</Label>
                        <Input value={it.title} readOnly />
                      </div>
                      <div>
                        <Label>PIC</Label>
                        <Input value={it.pic ?? ""} readOnly />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div className="flex justify-between">
                <Button variant="outline" onClick={back}>Kembali</Button>
                <Button onClick={next}>Lanjut</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4: Bulanan (PLAN only) */}
        {step === 4 && (
          <Card>
            <CardHeader><CardTitle>4. Rencana (PLAN) per Bulan</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {sections.map((s, si) => (
                <div key={si} className="rounded-md border p-3">
                  <div className="mb-2 font-semibold">{si+1}. {s.title}</div>

                  {s.items.length === 0 && <div className="text-sm text-muted-foreground">Belum ada program.</div>}

                  {s.items.map((it, ii) => (
                    <div key={ii} className="rounded border p-3 mb-3">
                      <div className="mb-2 font-medium">{it.title}</div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {QUARTERS.map((q) => (
                          <div key={q.label} className="rounded-md border p-3">
                            <div className="mb-2 flex items-center justify-between">
                              <div className="text-sm font-semibold">{q.label}</div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="secondary" className="h-7 px-2 text-xs"
                                  onClick={() => setQuarterPlan(si, ii, q.months, true)}>Plan: All</Button>
                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs"
                                  onClick={() => setQuarterPlan(si, ii, q.months, false)}>Plan: None</Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                              {q.months.map((m) => (
                                <div key={m} className="rounded border px-2 py-2">
                                  <div className="text-xs font-medium mb-1">{MONTHS.find(x=>x.m===m)?.label}</div>
                                  <label className="flex items-center gap-2 text-xs">
                                    <Checkbox checked={!!it.plan_m[m-1]}
                                      onCheckedChange={(v)=>toggleMonthPlan(si, ii, m, Boolean(v))} />
                                    Plan
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 text-xs text-muted-foreground">Perubahan PLAN disimpan otomatis.</div>
                    </div>
                  ))}
                </div>
              ))}

              <div className="flex justify-between">
                <Button variant="outline" onClick={back}>Kembali</Button>
                <Button onClick={next}>Lanjut</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 5: Evidence */}
        {step === 5 && (
          <Card>
            <CardHeader><CardTitle>5. Dokumentasi Bulanan</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {sections.map((s, si) => (
                <div key={si} className="rounded-md border p-3">
                  <div className="mb-2 font-semibold">{si+1}. {s.title}</div>

                  {s.items.map((it, ii) => (
                    <div key={ii} className="rounded border p-3 space-y-3">
                      <div className="font-medium">{it.title}</div>

                      {ensureArray(it.docs).length > 0 && (
                        <ul className="text-xs space-y-1">
                          {ensureArray(it.docs).map((d, di) => (
                            <li key={di}>M{d.month}: {d.evidence ? <a className="underline" href={d.evidence} target="_blank" rel="noreferrer">{d.evidence}</a> : <span className="text-muted-foreground">—</span>}</li>
                          ))}
                        </ul>
                      )}

                      <EvidenceInlineForm item={it} onSubmit={(item, form, close)=>submitEvidence(item, form, close)} />
                    </div>
                  ))}
                </div>
              ))}

              <div className="flex justify-between">
                <Button variant="outline" onClick={back}>Kembali</Button>
                <Button onClick={next}>Lanjut</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 6: Review */}
        {step === 6 && (
          <Card>
            <CardHeader><CardTitle>6. Review & Simpan</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div><span className="text-muted-foreground">Tahun:</span> <b>{year}</b></div>
                <div><span className="text-muted-foreground">Entitas/Plant:</span> <b>{entityCode}</b> / <b>{plantCode || "-"}</b></div>
                <div><span className="text-muted-foreground">Deskripsi:</span> {targetDescription || "-"}</div>
                <div><span className="text-muted-foreground">Jumlah Sasaran:</span> {sections.length}</div>
              </div>

              <div className="rounded border p-3 text-sm">
                <div className="font-semibold mb-2">Ringkasan</div>
                {sections.map((s, si) => (
                  <div key={si} className="mb-3">
                    <div>{si+1}. <b>{s.title}</b> — Target {s.target_pct}%</div>
                    <ul className="list-disc ml-6">
                      {s.items.map((it, ii) => (
                        <li key={ii}><b>{it.title}</b> — PIC: {it.pic ?? "-"} — Plan {it.plan_m.filter(Boolean).length}/12</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={back}>Kembali</Button>
                <Button onClick={submitHeader}>Simpan Header</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

/* =========================
 * Subcomponents
 * ========================= */
function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <ol className="grid gap-2 md:grid-cols-6 mb-2">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`h-6 w-6 rounded-full grid place-items-center text-xs
              ${done ? "bg-emerald-600 text-white"
                     : active ? "bg-primary text-primary-foreground"
                     : "bg-muted text-muted-foreground"}`}
              title={label}
            >
              {n}
            </span>
            <span className={`text-xs ${done || active ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function EvidenceInlineForm({
  item,
  onSubmit,
}: {
  item: ItemDraft;
  onSubmit: (item: ItemDraft, form: { month: string; link_url: string; file: File|null; note: string }, close: ()=>void) => void
}) {
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<{ month: string; link_url: string; file: File|null; note: string }>({
    month: "1", link_url: "", file: null, note: "",
  });

  return (
    <div className="space-y-2">
      <Button size="sm" variant="secondary" onClick={() => setOpen(v => !v)}>{open ? "Tutup" : "Tambah Evidence"}</Button>
      {open && (
        <div className="mt-2 rounded-md border p-2 space-y-2 bg-muted/20">
          <div className="grid grid-cols-3 gap-2 items-center">
            <label className="text-xs col-span-1">Bulan</label>
            <select className="col-span-2 border rounded px-2 py-1 h-8"
              value={form.month} onChange={(e)=>setForm(prev => ({...prev, month: e.target.value}))}>
              {MONTHS.map((m, idx) => (
                <option key={m.m} value={m.m.toString()}>{`M${m.m} (${MONTHS[idx].label})`}</option>
              ))}
            </select>

            <label className="text-xs col-span-1">URL</label>
            <Input type="url" className="col-span-2 h-8" placeholder="https://…" value={form.link_url}
              onChange={(e)=>setForm(prev => ({...prev, link_url: e.target.value}))} />

            <label className="text-xs col-span-1">atau File</label>
            <input type="file" className="col-span-2 h-8 text-xs"
              onChange={(e)=>setForm(prev => ({...prev, file: e.target.files?.[0] ?? null}))} />

            <label className="text-xs col-span-1">Catatan</label>
            <Textarea rows={2} className="col-span-2" placeholder="Catatan singkat (opsional)…"
              value={form.note} onChange={(e)=>setForm(prev => ({...prev, note: e.target.value}))} />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={()=>setOpen(false)}>Batal</Button>
            <Button size="sm" onClick={()=>onSubmit(item, form, ()=>setOpen(false))}>Simpan</Button>
          </div>
        </div>
      )}
    </div>
  );
}
