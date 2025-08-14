import type { BreadcrumbItem } from "@/types";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import SectionHeader from "@/components/section-header";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, XCircle } from "lucide-react";

type Building = {
    entity: any;
    location_name: any;
    id: number;
    name: string;
    code?: string;
};

type WorkStandard = {
    id: number;
    job_name: string;
    standard_description?: string | null;
    frequency: "weekly" | "monthly";
};

type InspectionItem = {
    id: number;
    work_standard_id?: number | null;
    job_name?: string | null;
    standard_description?: string | null;
    action_repair?: number | boolean;
    action_maintenance?: number | boolean;
    condition_good?: number | boolean;
    condition_broken?: number | boolean;
    remarks?: string | null;
};

type BuildingInspection = {
    uuid: string;
    inspection_date: string;
    building_id: number;
    frequency: string; // "weekly" | "monthly" | "Mingguan" | "Bulanan"
    items?: InspectionItem[];
};

type PageProps = {
    buildingInspection: BuildingInspection;
    buildings: Building[];
    workStandards: WorkStandard[];
    errors?: Record<string, string>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Home", href: "/" },
    { title: "Inspeksi Gedung", href: "/inspection/building" },
    { title: "Edit Inspeksi", href: "#" },
];

const formSchema = z.object({
    inspection_date: z.string().min(1, { message: "Inspection date is required" }),
    building_id: z.coerce.number().min(1, { message: "Pilih gedung" }),
    frequency: z.enum(["weekly", "monthly"], { required_error: "Pilih frekuensi" }),
});

type ItemInput = {
    id?: number;
    action_repair: boolean;
    action_maintenance: boolean;
    condition: "good" | "broken" | null;
    remarks: string;
};

const CHECKBOX_CLS =
    "border border-gray-400 rounded-sm data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-600";

function toDateInput(s: string) {
    // ambil YYYY-MM-DD di depan supaya aman
    return (s || "").slice(0, 10);
}

function normalizeFrequency(s: string): "weekly" | "monthly" {
    const x = (s || "").toLowerCase();
    if (x.includes("week") || x.includes("minggu")) return "weekly";
    return "monthly";
}

export default function EditBuildingInspection() {
    const { buildingInspection, buildings = [], workStandards = [] } = usePage().props as unknown as PageProps;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            inspection_date: toDateInput(buildingInspection.inspection_date),
            building_id: buildingInspection.building_id,
            frequency: normalizeFrequency(buildingInspection.frequency),
        },
    });

    // State input per baris standar kerja
    const [itemState, setItemState] = useState<Record<number, ItemInput>>({});

    // Lookup existing items by work_standard_id / job_name untuk prefill
    const existingByStandardId = useMemo(() => {
        const m = new Map<number, InspectionItem>();
        (buildingInspection.items || []).forEach((it) => {
            if (typeof it.work_standard_id === "number") m.set(it.work_standard_id, it);
        });
        return m;
    }, [buildingInspection.items]);

    const existingByJobName = useMemo(() => {
        const m = new Map<string, InspectionItem>();
        (buildingInspection.items || []).forEach((it) => {
            const key = (it.job_name || "").trim().toLowerCase();
            if (key) m.set(key, it);
        });
        return m;
    }, [buildingInspection.items]);

    // Filter standar kerja sesuai frequency
    const filteredStandards = useMemo(() => {
        const f = form.watch("frequency");
        if (!f) return [];
        return workStandards.filter((ws) => ws.frequency === f);
    }, [workStandards, form.watch("frequency")]);

    // Prefill & sinkronkan itemState setiap kali daftar standar berubah
    useEffect(() => {
        setItemState((prev) => {
            const next: Record<number, ItemInput> = { ...prev };

            for (const ws of filteredStandards) {
                if (!next[ws.id]) {
                    // cari item existing dari edit payload
                    const byId = existingByStandardId.get(ws.id);
                    const byName = existingByJobName.get(ws.job_name.trim().toLowerCase());
                    const src = byId || byName;

                    next[ws.id] = {
                        id: src?.id,
                        action_repair: Boolean(src?.action_repair),
                        action_maintenance: Boolean(src?.action_maintenance),
                        condition: src?.condition_good
                            ? "good"
                            : src?.condition_broken
                                ? "broken"
                                : null,
                        remarks: src?.remarks || "",
                    };
                }
            }

            // bersihkan id yang tidak ada lagi di daftar
            Object.keys(next)
                .map(Number)
                .forEach((id) => {
                    if (!filteredStandards.find((ws) => ws.id === id)) {
                        delete next[id];
                    }
                });

            return next;
        });
    }, [filteredStandards, existingByStandardId, existingByJobName]);

    function setItem<K extends keyof ItemInput>(id: number, key: K, val: ItemInput[K]) {
        setItemState((prev) => ({
            ...prev,
            [id]: { ...prev[id], [key]: val },
        }));
    }

    // Action eksklusif
    function toggleAction(id: number, target: "repair" | "maintenance", checked: boolean) {
        setItemState((prev) => {
            const curr = prev[id] || { action_repair: false, action_maintenance: false, condition: null, remarks: "" };
            return {
                ...prev,
                [id]: {
                    ...curr,
                    action_repair: target === "repair" ? checked : checked ? false : curr.action_repair,
                    action_maintenance: target === "maintenance" ? checked : checked ? false : curr.action_maintenance,
                },
            };
        });
    }

    // Condition eksklusif
    function toggleCondition(id: number, target: "good" | "broken", checked: boolean) {
        setItemState((prev) => {
            const curr = prev[id] || { action_repair: false, action_maintenance: false, condition: null, remarks: "" };
            return {
                ...prev,
                [id]: { ...curr, condition: checked ? target : null },
            };
        });
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        const items = filteredStandards.map((ws) => {
            const s = itemState[ws.id] || {
                action_repair: false,
                action_maintenance: false,
                condition: null,
                remarks: "",
            };
            return {
                id: s.id,
                work_standard_id: ws.id,
                job_name: ws.job_name,
                standard_description: ws.standard_description ?? null,
                action_repair: s.action_repair ? 1 : 0,
                action_maintenance: s.action_maintenance ? 1 : 0,
                condition_good: s.condition === "good" ? 1 : 0,
                condition_broken: s.condition === "broken" ? 1 : 0,
                remarks: s.remarks || null,
            };
        });

        router.put(
            route("inspection.building.update", buildingInspection.uuid),
            { ...values, items },
            {}
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Inspeksi Gedung" />
            <div className="p-4">
                <SectionHeader
                    title="Edit Inspeksi Gedung"
                    subtitle="Perbarui data inspeksi gedung dan detail itemnya."
                />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {/* Tanggal */}
                                <FormField
                                    control={form.control}
                                    name="inspection_date"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Tanggal Inspeksi</FormLabel>
                                            <FormControl>
                                                <Input type="date" className="w-full" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Gedung */}
                                <FormField
                                    control={form.control}
                                    name="building_id"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Pilih Gedung</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    defaultValue={field.value ? String(field.value) : undefined}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih gedung" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {buildings.map((b) => (
                                                            <SelectItem key={b.id} value={String(b.id)}>
                                                                {b.entity?.name} {b.location_name ? `(${b.location_name})` : ""}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Frekuensi */}
                                <FormField
                                    control={form.control}
                                    name="frequency"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Frekuensi</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih frekuensi" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="weekly">Mingguan</SelectItem>
                                                        <SelectItem value="monthly">Bulanan</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* DETAIL ITEMS */}
                        <Card>
                            <CardContent className="space-y-3">
                                <div className="text-sm text-muted-foreground">
                                    Daftar standar kerja mengikuti frekuensi yang dipilih dan bisa diubah langsung.
                                </div>

                                {/* MOBILE: Kartu */}
                                <div className="space-y-4 md:hidden">
                                    {filteredStandards.length === 0 ? (
                                        <div className="text-center text-sm text-muted-foreground border rounded-md p-4">
                                            {form.getValues("frequency")
                                                ? "Belum ada standar kerja untuk frekuensi ini."
                                                : "Pilih frekuensi untuk menampilkan standar kerja."}
                                        </div>
                                    ) : (
                                        filteredStandards.map((ws, idx) => {
                                            const s = itemState[ws.id] || {
                                                action_repair: false,
                                                action_maintenance: false,
                                                condition: null,
                                                remarks: "",
                                            };
                                            return (
                                                <div key={ws.id} className="border rounded-lg p-4 space-y-3">
                                                    <div className="text-xs text-muted-foreground">#{idx + 1}</div>

                                                    <div>
                                                        <div className="text-xs font-medium text-muted-foreground">Pekerjaan</div>
                                                        <div className="font-medium whitespace-normal break-words">
                                                            {ws.job_name}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-xs font-medium text-muted-foreground">Deskripsi Standar</div>
                                                        <div className="text-sm whitespace-normal break-words">
                                                            {ws.standard_description || "-"}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-xs font-medium text-muted-foreground mb-1">Tindakan</div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <label className="flex items-center gap-2">
                                                                <Checkbox
                                                                    className={CHECKBOX_CLS}
                                                                    checked={s.action_repair}
                                                                    onCheckedChange={(c) => toggleAction(ws.id, "repair", Boolean(c))}
                                                                />
                                                                <span className="text-sm">Perbaikan</span>
                                                            </label>
                                                            <label className="flex items-center gap-2">
                                                                <Checkbox
                                                                    className={CHECKBOX_CLS}
                                                                    checked={s.action_maintenance}
                                                                    onCheckedChange={(c) => toggleAction(ws.id, "maintenance", Boolean(c))}
                                                                />
                                                                <span className="text-sm">Perawatan</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-xs font-medium text-muted-foreground mb-1">Kondisi</div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <label className="flex items-center gap-2">
                                                                <Checkbox
                                                                    className={CHECKBOX_CLS}
                                                                    checked={s.condition === "good"}
                                                                    onCheckedChange={(c) => toggleCondition(ws.id, "good", Boolean(c))}
                                                                />
                                                                <span className="text-sm">Baik</span>
                                                            </label>
                                                            <label className="flex items-center gap-2">
                                                                <Checkbox
                                                                    className={CHECKBOX_CLS}
                                                                    checked={s.condition === "broken"}
                                                                    onCheckedChange={(c) => toggleCondition(ws.id, "broken", Boolean(c))}
                                                                />
                                                                <span className="text-sm">Rusak</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-xs font-medium text-muted-foreground mb-1">Catatan</div>
                                                        <Input
                                                            className="w-full"
                                                            placeholder="Catatan / temuan..."
                                                            value={s.remarks}
                                                            onChange={(e) => setItem(ws.id, "remarks", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* DESKTOP: Tabel 2 baris header dengan colgroup */}
                                <div className="hidden md:block">
                                    <div className="rounded-md border">
                                        <Table className="w-full table-auto border-collapse text-sm">
                                            <colgroup>
                                                <col className="w-12" />   {/* # */}
                                                <col />                    {/* Pekerjaan */}
                                                <col />                    {/* Deskripsi Standar */}
                                                <col className="w-28" />   {/* Perbaikan */}
                                                <col className="w-32" />   {/* Perawatan */}
                                                <col className="w-20" />   {/* Baik */}
                                                <col className="w-24" />   {/* Rusak */}
                                                <col />                    {/* Catatan */}
                                            </colgroup>

                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead rowSpan={2} className="text-center align-middle">#</TableHead>
                                                    <TableHead rowSpan={2} className="align-middle">Pekerjaan</TableHead>
                                                    <TableHead rowSpan={2} className="align-middle">Deskripsi Standar</TableHead>
                                                    <TableHead colSpan={2} className="text-center align-middle">Tindakan</TableHead>
                                                    <TableHead colSpan={2} className="text-center align-middle">Kondisi</TableHead>
                                                    <TableHead rowSpan={2} className="align-middle">Catatan</TableHead>
                                                </TableRow>
                                                <TableRow>
                                                    <TableHead className="text-center">Perbaikan</TableHead>
                                                    <TableHead className="text-center">Perawatan</TableHead>
                                                    <TableHead className="text-center">Baik</TableHead>
                                                    <TableHead className="text-center">Rusak</TableHead>
                                                </TableRow>
                                            </TableHeader>

                                            <TableBody>
                                                {filteredStandards.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={8} className="text-center text-sm text-muted-foreground">
                                                            {form.getValues("frequency")
                                                                ? "Belum ada standar kerja untuk frekuensi ini."
                                                                : "Pilih frekuensi untuk menampilkan standar kerja."}
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredStandards.map((ws, idx) => {
                                                        const s = itemState[ws.id] || {
                                                            action_repair: false,
                                                            action_maintenance: false,
                                                            condition: null,
                                                            remarks: "",
                                                        };
                                                        return (
                                                            <TableRow key={ws.id} className="[&_td]:align-top">
                                                                <TableCell className="text-center">{idx + 1}</TableCell>
                                                                <TableCell className="font-medium whitespace-normal break-words">
                                                                    {ws.job_name}
                                                                </TableCell>
                                                                <TableCell className="text-sm whitespace-normal break-words">
                                                                    {ws.standard_description || "-"}
                                                                </TableCell>

                                                                <TableCell className="text-center">
                                                                    <Checkbox
                                                                        className={CHECKBOX_CLS}
                                                                        checked={s.action_repair}
                                                                        onCheckedChange={(c) => toggleAction(ws.id, "repair", Boolean(c))}
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Checkbox
                                                                        className={CHECKBOX_CLS}
                                                                        checked={s.action_maintenance}
                                                                        onCheckedChange={(c) => toggleAction(ws.id, "maintenance", Boolean(c))}
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Checkbox
                                                                        className={CHECKBOX_CLS}
                                                                        checked={s.condition === "good"}
                                                                        onCheckedChange={(c) => toggleCondition(ws.id, "good", Boolean(c))}
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Checkbox
                                                                        className={CHECKBOX_CLS}
                                                                        checked={s.condition === "broken"}
                                                                        onCheckedChange={(c) => toggleCondition(ws.id, "broken", Boolean(c))}
                                                                    />
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Input
                                                                        className="w-full"
                                                                        placeholder="Catatan / temuan..."
                                                                        value={s.remarks}
                                                                        onChange={(e) => setItem(ws.id, "remarks", e.target.value)}
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? "Updating..." : "Update Data"}
                            </Button>
                            <Link
                                href={route("inspection.building.index")}
                                className="text-muted-foreground text-sm hover:underline"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
