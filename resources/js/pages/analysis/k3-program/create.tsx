import * as React from "react";
import AppLayout from "@/layouts/app-layout";
import SectionHeader from "@/components/section-header";
import { Head, router, usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const SUBMIT_URL = "/analysis/k3-program";

/* =========================
 * Types
 * ========================= */
type Month = 1|2|3|4|5|6|7|8|9|10|11|12;

type DocRow = {
  month: Month;
  plan_note: string;
  actual_note: string;
  evidence: string;
};

type ItemDraft = {
  title: string;
  pic: string;
  plan_m: boolean[];   // PLAN saja (UI)
  actual_m: boolean[]; // dikirim false semua (controller butuh field)
  docs: DocRow[];
};

type SectionDraft = { title: string; target_pct: number; items: ItemDraft[]; };

type Props = {
  entities: { code: string; name: string }[];
  plants: { code: string; name: string; entity_code: string }[];
};

/* =========================
 * Const
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

/* =========================
 * Utils
 * ========================= */
const ensure12 = (v?: boolean[]) => {
  const base = Array.isArray(v) ? v.slice(0, 12) : [];
  while (base.length < 12) base.push(false);
  return base;
};

/* =========================
 * Page
 * ========================= */
export default function CreateK3ProgramWizard({ entities, plants }: Props) {
  const { props } = usePage<{ errors?: Record<string,string> }>();
  const errors = props?.errors ?? {};

  // Header
  const [year, setYear] = React.useState<number>(new Date().getFullYear());
  const [entityCode, setEntityCode] = React.useState<string>(entities[0]?.code ?? "");

  const filteredPlants = React.useMemo(
    () => plants.filter(p => p.entity_code === String(entityCode)),
    [plants, entityCode]
  );
  const [plantCode, setPlantCode] = React.useState<string>(filteredPlants[0]?.code ?? "");
  React.useEffect(() => {
    setPlantCode(filteredPlants[0]?.code ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityCode]);

  const [targetDescription, setTargetDescription] = React.useState<string>("");

  // Sections/Items
  const [sections, setSections] = React.useState<SectionDraft[]>([
    { title: "", target_pct: 0, items: [] },
  ]);

  const [step, setStep] = React.useState<number>(1);
  const maxStep = 6;
  const next = () => setStep((s) => Math.min(maxStep, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  /* ====== Mutators ====== */
  const mutateSection = (si: number, patch: Partial<SectionDraft>) => {
    setSections(prev => {
      const c = [...prev];
      c[si] = { ...c[si], ...patch };
      return c;
    });
  };
  const addSection = () => setSections(prev => [...prev, { title: "", target_pct: 0, items: [] }]);
  const removeSection = (si: number) => setSections(prev => prev.filter((_,i)=>i!==si));

  const mutateItem = (si: number, ii: number, patch: Partial<ItemDraft>) => {
    setSections(prev => {
      const c = [...prev];
      c[si].items[ii] = { ...c[si].items[ii], ...patch };
      return c;
    });
  };
  const addItem = (si: number) => {
    setSections(prev => {
      const c = [...prev];
      c[si].items.push({ title:"", pic:"", plan_m:ensure12([]), actual_m:ensure12([]), docs:[] });
      return c;
    });
  };
  const removeItem = (si: number, ii: number) => {
    setSections(prev => {
      const c = [...prev];
      c[si].items = c[si].items.filter((_,i)=>i!==ii);
      return c;
    });
  };

  const addDoc = (si: number, ii: number) => {
    setSections(prev => {
      const c = [...prev];
      c[si].items[ii].docs.push({ month:1, plan_note:"", actual_note:"", evidence:"" });
      return c;
    });
  };
  const removeDoc = (si:number, ii:number, di:number) => {
    setSections(prev => {
      const c = [...prev];
      c[si].items[ii].docs = c[si].items[ii].docs.filter((_,i)=>i!==di);
      return c;
    });
  };
  const mutateDoc = (si:number, ii:number, di:number, patch: Partial<DocRow>) => {
    setSections(prev => {
      const c = [...prev];
      const docs = [...c[si].items[ii].docs];
      docs[di] = { ...docs[di], ...patch };
      c[si].items[ii].docs = docs;
      return c;
    });
  };

  /* ====== Month helpers (PLAN only) ====== */
  const toggleMonth = (si:number, ii:number, m:Month) => {
    setSections(prev => {
      const c = [...prev];
      const arr = ensure12(c[si].items[ii].plan_m);
      arr[m-1] = !arr[m-1];
      c[si].items[ii].plan_m = arr;
      return c;
    });
  };
  const setQuarter = (si:number, ii:number, months:Month[]) => {
    setSections(prev => {
      const c = [...prev];
      const arr = ensure12(c[si].items[ii].plan_m);
      const allOn = months.every(m => arr[m-1]);
      months.forEach(m => arr[m-1] = !allOn); // toggle: kalau semua on -> off semua, else on semua
      c[si].items[ii].plan_m = arr;
      return c;
    });
  };
  const setAllMonths = (si:number, ii:number, val:boolean) => {
    setSections(prev => {
      const c = [...prev];
      c[si].items[ii].plan_m = Array(12).fill(val);
      return c;
    });
  };

  /* ====== Submit ====== */
  const submit = () => {
    const payload = {
      year,
      entity_code: entityCode,
      plant_code: plantCode,
      target_description: targetDescription || null,
      sections: sections.map(s => ({
        title: s.title,
        target_pct: Number(s.target_pct || 0),
        items: s.items.map(it => ({
          title: it.title,
          pic: it.pic || null,
          unit_type: "monthly",
          target_units: null,
          monthly_denominator_mode: "12",
          plan_m: ensure12(it.plan_m),
          actual_m: ensure12([]), // actual dikosongkan (diisi nanti di Capaian)
          docs: it.docs.map(d => ({
            month: d.month,
            plan_note: d.plan_note || null,
            actual_note: d.actual_note || null,
            evidence: d.evidence || null,
          })),
        })),
      })),
    };

    router.post(SUBMIT_URL, payload, {
      preserveScroll: true,
      onError: () => alert("Validasi gagal. Mohon cek isian Anda."),
    });
  };

  /* =========================
   * Render
   * ========================= */
  return (
    <AppLayout breadcrumbs={[
      { title: "Home", href: "/" },
      { title: "Program Kerja K3", href: "/analysis/k3-program" },
      { title: "Buat", href: "#" },
    ]}>
      <Head title="Buat Program K3 (Wizard)" />

      <div className="p-4 space-y-4">
        <SectionHeader
          title="Buat Program K3"
          subtitle="Centang rencana bulanan (PLAN). Realisasi akan diisi di menu Capaian."
        />

        <Stepper step={step} />

        {/* STEP 1 */}
        {step === 1 && (
          <Card>
            <CardHeader><CardTitle>1. Header Program</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Tahun</Label>
                <Input type="number" value={year} onChange={(e)=>setYear(Number(e.target.value))}/>
                {errors.year && <p className="text-xs text-destructive mt-1">{errors.year}</p>}
              </div>

              <div>
                <Label>Entitas</Label>
                <select
                  className="w-full border rounded-md h-10 px-3"
                  value={entityCode}
                  onChange={(e)=>setEntityCode(e.target.value)}
                >
                  {entities.map(e => <option key={e.code} value={e.code}>{e.name}</option>)}
                </select>
                {errors.entity_code && <p className="text-xs text-destructive mt-1">{errors.entity_code}</p>}
              </div>

              <div>
                <Label>Plant</Label>
                <select
                  className="w-full border rounded-md h-10 px-3"
                  value={plantCode}
                  onChange={(e)=>setPlantCode(e.target.value)}
                  disabled={!entityCode || filteredPlants.length===0}
                >
                  {filteredPlants.length===0
                    ? <option value="">(Tidak ada plant untuk entitas ini)</option>
                    : filteredPlants.map(p => <option key={p.code} value={p.code}>{p.name}</option>)
                  }
                </select>
                {errors.plant_code && <p className="text-xs text-destructive mt-1">{errors.plant_code}</p>}
              </div>

              <div className="md:col-span-2">
                <Label>Deskripsi Target (Head)</Label>
                <Textarea rows={3} value={targetDescription} onChange={(e)=>setTargetDescription(e.target.value)}/>
                {errors.target_description && <p className="text-xs text-destructive mt-1">{errors.target_description}</p>}
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Button onClick={next} disabled={!plantCode}>Lanjut</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <Card>
            <CardHeader><CardTitle>2. Sasaran & Target (Bobot %)</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {sections.map((s, si) => (
                <div key={si} className="rounded-md border p-3">
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <Label>Nama Sasaran</Label>
                      <Input
                        placeholder="Contoh: Kepatuhan K3"
                        value={s.title}
                        onChange={(e)=>mutateSection(si, { title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Target Bobot (%)</Label>
                      <Input
                        type="number"
                        placeholder="0 - 100"
                        value={s.target_pct}
                        onChange={(e)=>mutateSection(si, { target_pct: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    {sections.length>1 && (
                      <Button variant="ghost" size="sm" onClick={()=>removeSection(si)}>Hapus Sasaran</Button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={back}>Kembali</Button>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={addSection}>+ Tambah Sasaran</Button>
                  <Button onClick={next}>Lanjut</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <Card>
            <CardHeader><CardTitle>3. Program & Penanggung Jawab</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {sections.map((s, si) => (
                <div key={si} className="rounded-md border p-3">
                  <div className="mb-2 font-semibold">{si+1}. {s.title || "Sasaran (belum diisi)"}</div>

                  <div className="space-y-3">
                    {s.items.map((it, ii) => (
                      <div key={ii} className="rounded border p-3">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <Label>Nama Program</Label>
                            <Input value={it.title} onChange={(e)=>mutateItem(si, ii, { title: e.target.value })}/>
                          </div>
                          <div>
                            <Label>PIC</Label>
                            <Input value={it.pic} onChange={(e)=>mutateItem(si, ii, { pic: e.target.value })}/>
                          </div>
                        </div>
                        <div className="mt-2 text-right">
                          <Button variant="ghost" size="sm" onClick={()=>removeItem(si, ii)}>Hapus Program</Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2">
                    <Button variant="secondary" size="sm" onClick={()=>addItem(si)}>+ Tambah Program</Button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={back}>Kembali</Button>
                <Button onClick={next}>Lanjut</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 4 — Rencana Bulanan (ringkas & friendly) */}
        {step === 4 && (
          <Card>
            <CardHeader><CardTitle>4. Rencana Bulanan (PLAN)</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {sections.map((s, si) => (
                <div key={si} className="rounded-md border p-3">
                  <div className="mb-2 font-semibold">{si+1}. {s.title || "Sasaran"}</div>

                  {s.items.length===0 && <div className="text-sm text-muted-foreground">Belum ada program.</div>}

                  {s.items.map((it, ii) => (
                    <div key={ii} className="rounded border p-3 mb-3">
                      <div className="mb-3 font-medium">{it.title || "Program"}</div>

                      {/* Quick Actions */}
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Button type="button" size="sm" variant="secondary" onClick={()=>setAllMonths(si, ii, true)}>Semua</Button>
                        <Button type="button" size="sm" variant="outline" onClick={()=>setAllMonths(si, ii, false)}>Kosongkan</Button>
                        <span className="mx-1 text-xs text-muted-foreground">/ Kuartal:</span>
                        {QUARTERS.map(q => (
                          <Button
                            key={q.label}
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={()=>setQuarter(si, ii, q.months)}
                          >
                            {q.label}
                          </Button>
                        ))}
                      </div>

                      {/* Grid Bulan (checkbox) */}
                      <div className="grid grid-cols-12 gap-2">
                        {MONTHS.map(({m,label}) => (
                          <label
                            key={m}
                            className={[
                              "flex items-center justify-center gap-1 h-10 rounded-md border cursor-pointer",
                              it.plan_m[m-1] ? "bg-amber-500 text-white border-amber-600" : "bg-background hover:bg-muted"
                            ].join(" ")}
                            title={label}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={!!it.plan_m[m-1]}
                              onChange={()=>toggleMonth(si, ii, m)}
                            />
                            <span className="text-xs font-semibold">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={back}>Kembali</Button>
                <Button onClick={next}>Lanjut</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 5 — Dokumentasi */}
        {step === 5 && (
          <Card>
            <CardHeader><CardTitle>5. Dokumentasi Bulanan</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {sections.map((s, si) => (
                <div key={si} className="rounded-md border p-3">
                  <div className="mb-2 font-semibold">{si+1}. {s.title || "Sasaran"}</div>

                  {s.items.map((it, ii) => (
                    <div key={ii} className="rounded border p-3 space-y-3">
                      <div className="font-medium">{it.title || "Program"}</div>

                      {it.docs.length===0 && (
                        <div className="text-sm text-muted-foreground">Belum ada dokumentasi. Tambahkan di bawah.</div>
                      )}

                      {it.docs.map((d, di) => (
                        <div key={di} className="rounded-md border p-3 grid gap-3 md:grid-cols-3">
                          <div>
                            <Label>Bulan</Label>
                            <select
                              className="w-full border rounded-md h-10 px-3"
                              value={d.month}
                              onChange={(e)=>mutateDoc(si, ii, di, { month: Number(e.target.value) as Month })}
                            >
                              {MONTHS.map(mm => <option key={mm.m} value={mm.m}>{mm.label}</option>)}
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <Label>Evidence (tautan / nomor dokumen)</Label>
                            <Input
                              placeholder="URL / Path / No. Dokumen"
                              value={d.evidence}
                              onChange={(e)=>mutateDoc(si, ii, di, { evidence: e.target.value })}
                            />
                          </div>
                          <div className="md:col-span-3">
                            <Label>Catatan Plan</Label>
                            <Textarea rows={2} value={d.plan_note} onChange={(e)=>mutateDoc(si, ii, di, { plan_note: e.target.value })}/>
                          </div>
                          <div className="md:col-span-3">
                            <Label>Catatan Actual</Label>
                            <Textarea rows={2} value={d.actual_note} onChange={(e)=>mutateDoc(si, ii, di, { actual_note: e.target.value })}/>
                          </div>

                          <div className="md:col-span-3 text-right">
                            <Button variant="ghost" size="sm" onClick={()=>removeDoc(si, ii, di)}>Hapus Dok</Button>
                          </div>
                        </div>
                      ))}

                      <Button variant="secondary" size="sm" onClick={()=>addDoc(si, ii)}>+ Tambah Dokumentasi Bulanan</Button>
                    </div>
                  ))}
                </div>
              ))}

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={back}>Kembali</Button>
                <Button onClick={next}>Lanjut</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* STEP 6 — Review & Submit */}
        {step === 6 && (
          <Card>
            <CardHeader><CardTitle>6. Review & Submit</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(errors).length>0 && (
                <div className="rounded border border-destructive/30 bg-destructive/10 text-destructive text-sm p-3">
                  <div className="font-semibold mb-1">Periksa kembali isian:</div>
                  <ul className="list-disc ml-5">
                    {Object.entries(errors).map(([k,v]) => <li key={k}>{String(v)}</li>)}
                  </ul>
                </div>
              )}

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
                    <div>{si+1}. <b>{s.title || "(Sasaran)"}</b> — Target {s.target_pct}%</div>
                    <ul className="list-disc ml-6">
                      {s.items.map((it, ii) => (
                        <li key={ii}>
                          <b>{it.title || "(Program)"}</b> — PIC: {it.pic || "-"}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <Button variant="outline" onClick={back}>Kembali</Button>
                <Button onClick={submit} disabled={!plantCode}>Simpan Program</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

/* =========================
 * Stepper
 * ========================= */
function Stepper({ step }: { step: number }) {
  const steps = [
    "Header",
    "Sasaran & Target",
    "Program & PIC",
    "Rencana (Bulanan)",
    "Dokumentasi",
    "Review & Submit",
  ];
  return (
    <ol className="grid gap-2 md:grid-cols-6 mb-2">
      {steps.map((label, i) => {
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
            <span className={`text-xs ${done || active ? "text-foreground" : "text-muted-foreground"}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
