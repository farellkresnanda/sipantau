import AppLayout from "@/layouts/app-layout";
import SectionHeader from "@/components/section-header";
import { Head, useForm } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import * as React from "react";

// Jika tidak punya komponen Input, ganti <Input ...> => <input className="border rounded px-2 py-1 h-8" ... />
import { Input } from "@/components/ui/input";

/* =========================
 * Types (sinkron dgn controller)
 * ========================= */
type Doc = { month: number; evidence?: string | null; plan_note?: string | null; actual_note?: string | null };
type Item = {
  id: number;
  title: string;
  pic: string | null;
  unit_type: "monthly" | "once" | "custom";
  target_units: number | null;
  monthly_denominator_mode: "12" | "elapsed";
  plan_flags: boolean[] | null;
  actual_flags: boolean[] | null;
  plan_percent: number | null;   // EoY: monthly=12, once=1, custom=targetUnits
  actual_percent: number | null; // EoY relatif ke PLAN (monthly: pembagi = jumlah PLAN)
  docs?: Doc[] | null;           // opsional
};
type Section = { id: number; title: string; target_pct: number | null; items: Item[] | null };
type Program = {
  uuid: string;
  year: number;
  entity_code: string;
  plant_code: string;
  target_description: string | null;
  approval_status_code: "SOP" | "SAP" | "SRE";
  sections: Section[] | null;
};
type Props = { program: Program; canVerify?: boolean; canEdit?: boolean };

const QLABELS = ["Q1", "Q2", "Q3", "Q4"];
const MONTH_NUMBERS = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

/* =========================
 * Utils
 * ========================= */
const ensureArray = <T,>(v: T[] | null | undefined) => (Array.isArray(v) ? v : []);
const ensureBool12 = (v: (boolean | null | undefined)[] | null | undefined) => {
  const base = Array.isArray(v) ? v : [];
  const out: boolean[] = [];
  for (let i = 0; i < 12; i++) out.push(!!base[i]);
  return out;
};
const nz = (n: number | null | undefined, fallback = 0) => (typeof n === "number" && !Number.isNaN(n) ? n : fallback);
const safeToFixed = (n: number | null | undefined, digits = 2) => nz(n).toFixed(digits);
const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

/* =========================
 * Page
 * ========================= */
export default function ShowK3Program({ program, canVerify = false }: Props) {
  const sections = ensureArray(program.sections);
  const allItems = React.useMemo(() => sections.flatMap((s) => ensureArray(s.items)), [sections]);

  const planAvg = allItems.length ? avg(allItems.map((i) => nz(i.plan_percent))) : 0;
  const actualAvg = allItems.length ? avg(allItems.map((i) => nz(i.actual_percent))) : 0;

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Home", href: "/" },
        { title: "Program Kerja K3", href: "/analysis/k3-program" },
        { title: "Detail", href: "#" },
      ]}
    >
      <Head title={`Program K3 ${program.year}`} />
      <div className="p-4 space-y-4">
        <SectionHeader
          title={`Program K3 — ${program.year}`}
          subtitle={`${program.entity_code} / ${program.plant_code} — ${program.target_description ?? "-"}`}
        />

        {canVerify && <ValidatorBar uuid={program.uuid} />}

        {/* SUMMARY KPI */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <span
                className={`inline-block rounded px-2 py-1 text-xs ${
                  program.approval_status_code === "SAP"
                    ? "bg-emerald-100 text-emerald-700"
                    : program.approval_status_code === "SRE"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {program.approval_status_code}
              </span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Capaian Rencana (Plan)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="text-muted-foreground">Rata-rata</div>
                <div className="font-semibold">{safeToFixed(planAvg)}%</div>
              </div>
              <Progress value={planAvg} />
              <p className="mt-2 text-xs text-muted-foreground">Plan dihitung relatif ke PLAN.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Capaian Realisasi (Actual) — relatif ke PLAN</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm mb-2">
                <div className="text-muted-foreground">Rata-rata</div>
                <div className="font-semibold">{safeToFixed(actualAvg)}%</div>
              </div>
              <Progress value={actualAvg} />
              <p className="mt-2 text-xs text-muted-foreground">Pembagi = jumlah bulan yang di-PLAN.</p>
            </CardContent>
          </Card>
        </div>

        {/* SECTIONS */}
        {sections.map((sec, sIdx) => {
          const items = ensureArray(sec.items);
          return (
            <Card key={sec.id} className="break-inside-avoid-page">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {sIdx + 1}. {sec.title}
                </CardTitle>
                <div className="text-sm text-muted-foreground">Target Section: {nz(sec.target_pct)}%</div>
              </CardHeader>

              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm print:text-[12px]">
                    <thead>
                      {/* row-1 */}
                      <tr>
                        <Th rowSpan={3} className="w-10">
                          No
                        </Th>
                        <Th rowSpan={3} className="min-w-[280px]">
                          Program
                        </Th>
                        <Th rowSpan={3} className="min-w-[120px]">
                          PIC
                        </Th>
                        <Th rowSpan={3} className="min-w-[120px] text-center">
                          Rencana / Realisasi
                        </Th>
                        <Th colSpan={12} className="text-center">
                          Bulan
                        </Th>
                        <Th rowSpan={3} className="w-28 text-center">
                          Persentase Realisasi %
                        </Th>
                        <Th rowSpan={3} className="w-[240px] text-center">
                          Evidence
                        </Th>
                      </tr>
                      {/* row-2 */}
                      <tr>
                        {QLABELS.map((q) => (
                          <Th key={q} colSpan={3} className="text-center">
                            {q}
                          </Th>
                        ))}
                      </tr>
                      {/* row-3 */}
                      <tr>
                        {MONTH_NUMBERS.map((m) => (
                          <Th key={m} className="w-10 text-center">
                            {m}
                          </Th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {items.length === 0 && (
                        <tr>
                          <Td colSpan={18} className="text-center text-muted-foreground py-6">
                            Belum ada program.
                          </Td>
                        </tr>
                      )}

                      {items.map((it, idx) => (
                        <ProgramRow key={it.id} no={idx + 1} item={it} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <div className="flex justify-end gap-2 print:hidden">
          <Button onClick={() => window.print()} variant="default">
            Cetak / Simpan PDF
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

/* =========================
 * Validator toolbar
 * ========================= */
function ValidatorBar({ uuid }: { uuid: string }) {
  const approveForm = useForm({ approval_status: "SAP" as const, note_validator: "" });
  const rejectForm = useForm({ approval_status: "SRE" as const, note_validator: "" });
  const [openReject, setOpenReject] = React.useState(false);

  const doApprove = () => approveForm.post(`/analysis/k3-program/${uuid}/verify`);
  const doReject = () => {
    if (!rejectForm.data.note_validator?.trim()) return;
    rejectForm.post(`/analysis/k3-program/${uuid}/verify`, { onSuccess: () => setOpenReject(false) });
  };

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-card p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Verifikasi:</span>
        <Button size="sm" onClick={doApprove}>
          Approve
        </Button>
        <Button size="sm" variant={openReject ? "default" : "destructive"} onClick={() => setOpenReject((v) => !v)}>
          {openReject ? "Tutup Penolakan" : "Reject"}
        </Button>
      </div>

      {openReject && (
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">Catatan Penolakan</label>
          <Textarea
            rows={3}
            placeholder="Tuliskan alasan penolakan…"
            value={rejectForm.data.note_validator}
            onChange={(e) => rejectForm.setData("note_validator", e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => rejectForm.setData("note_validator", "")}>
              Bersihkan
            </Button>
            <Button variant="destructive" size="sm" onClick={doReject}>
              Kirim Penolakan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
 * Program row (Plan/Actual) — % & Evidence di-merge
 * ========================= */
function ProgramRow({ no, item }: { no: number; item: Item }) {
  const plan = ensureBool12(item.plan_flags);
  const actual = ensureBool12(item.actual_flags);

  return (
    <>
      {/* PLAN */}
      <tr className="border-b">
        <Td rowSpan={2} className="align-top text-center">
          {no}
        </Td>

        {/* HANYA judul program (tanpa label unit) */}
        <Td rowSpan={2} className="align-top">
          <div className="font-medium">{item.title ?? "-"}</div>
        </Td>

        <Td rowSpan={2} className="align-top">
          {item.pic ?? "-"}
        </Td>

        <Td className="text-center font-medium">Rencana</Td>

        {plan.map((b, i) => (
          <Td key={`p-${item.id}-${i}`} className="text-center">
            <Dot checked={b} tone="plan" />
          </Td>
        ))}

        {/* % Realisasi (MERGE 2 baris) */}
        <Td rowSpan={2} className="text-center font-semibold">
          {safeToFixed(item.actual_percent)}%
        </Td>

        {/* Evidence (MERGE 2 baris) */}
        <Td rowSpan={2} className="align-top">
          <EvidenceCell item={item} />
        </Td>
      </tr>

      {/* ACTUAL */}
      <tr className="border-b">
        <Td className="text-center font-medium">Realisasi</Td>
        {actual.map((b, i) => (
          <Td key={`a-${item.id}-${i}`} className="text-center">
            <Dot checked={b} tone="actual" />
          </Td>
        ))}
      </tr>
    </>
  );
}

/* =========================
 * Evidence cell — tanpa tanda '-' saat kosong
 * ========================= */
function EvidenceCell({ item }: { item: Item }) {
  const [open, setOpen] = React.useState(false);
  const docs = ensureArray(item.docs);

  const form = useForm<{
    month: string;
    mode: "link" | "file";
    link_url: string;
    file: File | null;
    note: string;
  }>({
    month: "1",
    mode: "link",
    link_url: "",
    file: null,
    note: "",
  });

  const submit = () => {
    form.post(`/analysis/k3-program/items/${item.id}/docs`, {
      forceFormData: true,
      onSuccess: () => {
        form.reset("link_url", "file", "note");
        setOpen(false);
      },
    });
  };

  return (
    <div className="space-y-2">
      {/* tampilkan daftar evidence jika ada; JIKA TIDAK ADA — tidak tampil apapun */}
      {docs.length > 0 && (
        <ul className="space-y-1">
          {docs.map((d, i) => (
            <li key={`${item.id}-doc-${i}`} className="text-xs">
              <span className="font-medium">M{d.month}:</span>{" "}
              {d.evidence ? (
                <a href={d.evidence} target="_blank" rel="noreferrer" className="underline hover:no-underline">
                  {truncate(d.evidence, 36)}
                </a>
              ) : (
                <span className="text-muted-foreground">evidence tersimpan</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* tombol tambah evidence selalu ada */}
      <Button size="sm" variant="secondary" onClick={() => setOpen((v) => !v)}>
        {open ? "Tutup" : "Tambah Evidence"}
      </Button>

      {open && (
        <div className="mt-2 rounded-md border p-2 space-y-2 bg-muted/20">
          <div className="grid grid-cols-3 gap-2 items-center">
            <label className="text-xs col-span-1">Bulan</label>
            <select
              className="col-span-2 border rounded px-2 py-1 h-8"
              value={form.data.month}
              onChange={(e) => form.setData("month", e.target.value)}
            >
              {MONTH_NUMBERS.map((m, idx) => (
                <option key={m} value={m}>
                  {`M${m} (${["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][idx]})`}
                </option>
              ))}
            </select>

            <label className="text-xs col-span-1">Jenis</label>
            <div className="col-span-2 flex gap-3 text-xs">
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name={`mode-${item.id}`}
                  checked={form.data.mode === "link"}
                  onChange={() => form.setData("mode", "link")}
                />
                Link
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="radio"
                  name={`mode-${item.id}`}
                  checked={form.data.mode === "file"}
                  onChange={() => form.setData("mode", "file")}
                />
                File
              </label>
            </div>

            {form.data.mode === "link" ? (
              <>
                <label className="text-xs col-span-1">URL</label>
                <Input
                  type="url"
                  placeholder="https://…"
                  className="col-span-2 h-8"
                  value={form.data.link_url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => form.setData("link_url", e.target.value)}
                />
              </>
            ) : (
              <>
                <label className="text-xs col-span-1">File</label>
                <input
                  type="file"
                  className="col-span-2 h-8 text-xs"
                  onChange={(e) => form.setData("file", e.target.files?.[0] ?? null)}
                />
              </>
            )}

            <label className="text-xs col-span-1">Catatan</label>
            <Textarea
              rows={2}
              className="col-span-2"
              placeholder="Catatan singkat (opsional)…"
              value={form.data.note}
              onChange={(e) => form.setData("note", e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button size="sm" onClick={submit} disabled={form.processing}>
              Simpan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================
 * Table helpers
 * ========================= */
const Th: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className = "", ...rest }) => (
  <th className={`border px-2 py-2 bg-muted/40 ${className}`} {...rest}>
    {children}
  </th>
);
const Td: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = "", ...rest }) => (
  <td className={`border px-2 py-2 ${className}`} {...rest}>
    {children}
  </td>
);

function Dot({ checked, tone }: { checked: boolean; tone: "plan" | "actual" }) {
  const on = tone === "plan" ? "text-amber-500" : "text-emerald-600";
  return <span className={`inline-block text-lg leading-none ${checked ? on : "text-muted-foreground/40"}`}>{checked ? "●" : "○"}</span>;
}

function truncate(v: string, n = 36) {
  return v.length > n ? v.slice(0, n - 1) + "…" : v;
}
