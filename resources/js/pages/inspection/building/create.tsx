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
import { toast } from "sonner";
import { showToast } from "@/components/ui/toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

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

type PageProps = {
    buildings: Building[];
    workStandards: WorkStandard[];
    errors?: Record<string, string>;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: "Home", href: "/" },
    { title: "Inspeksi Gedung", href: "/inspection/building" },
    { title: "Buat Inspeksi", href: "/inspection/building/create" },
];

const formSchema = z.object({
    inspection_date: z.string().min(1, { message: "Inspection date is required" }),
    building_id: z.coerce.number().min(1, { message: "Pilih gedung" }),
    frequency: z.enum(["weekly", "monthly"], { required_error: "Pilih frekuensi" }),
});

type ItemInput = {
    action_repair: boolean;
    action_maintenance: boolean;
    condition: "good" | "broken" | null;
    remarks: string;
};

export default function CreateBuildingInspection() {
    const { buildings = [], workStandards = [] } = usePage().props as unknown as PageProps;
    const [showFindingModal, setShowFindingModal] = useState(false);
    const [newInspectionCode, setNewInspectionCode] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            inspection_date: "",
            building_id: undefined as unknown as number,
            frequency: undefined as unknown as "weekly" | "monthly",
        },
    });

    // State untuk input per-baris standar kerja (editable)
    const [itemState, setItemState] = useState<Record<number, ItemInput>>({});

    // Ambil nilai frequency sekali per render (hindari watch() di deps)
    const frequency = form.watch("frequency");

    // Filter standar kerja berdasarkan frequency (memoized by primitives)
    const filteredStandards = useMemo(() => {
        if (!frequency) return [];
        return workStandards.filter((ws) => ws.frequency === frequency);
    }, [workStandards, frequency]);

    // Inisialisasi/rekonsiliasi state item ketika frequency/workStandards berganti
    useEffect(() => {
        if (!frequency) {
            setItemState({});
            return;
        }

        setItemState((prev) => {
            const next: Record<number, ItemInput> = { ...prev };

            // Tambahkan item baru yang belum ada
            for (const ws of filteredStandards) {
                if (!next[ws.id]) {
                    next[ws.id] = {
                        action_repair: false,
                        action_maintenance: false,
                        condition: null,
                        remarks: "",
                    };
                }
            }

            // Hapus item yang tidak lagi ada di daftar
            for (const id of Object.keys(next).map(Number)) {
                if (!filteredStandards.find((ws) => ws.id === id)) {
                    delete next[id];
                }
            }

            // Hindari setState bila tidak ada perubahan nyata
            const keysPrev = Object.keys(prev);
            const keysNext = Object.keys(next);
            const sameKeys =
                keysPrev.length === keysNext.length &&
                keysNext.every((k) => keysPrev.includes(k));

            if (!sameKeys) return next;

            const allEqual = keysNext.every((k) => {
                const a = prev[+k];
                const b = next[+k];
                return (
                    a &&
                    b &&
                    a.action_repair === b.action_repair &&
                    a.action_maintenance === b.action_maintenance &&
                    a.condition === b.condition &&
                    a.remarks === b.remarks
                );
            });

            return allEqual ? prev : next;
        });
    }, [frequency, workStandards, filteredStandards]);

    function setItem<K extends keyof ItemInput>(id: number, key: K, val: ItemInput[K]) {
        setItemState((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [key]: val,
            },
        }));
    }

    // Jika ingin eksklusif antara repair vs maintenance, logic ini sudah mengarah ke sana:
    function toggleAction(id: number, target: "repair" | "maintenance", checked: boolean) {
        setItemState((prev) => {
            const current = prev[id] ?? {
                action_repair: false,
                action_maintenance: false,
                condition: null,
                remarks: "",
            };
            return {
                ...prev,
                [id]: {
                    ...current,
                    action_repair: target === "repair" ? checked : checked ? false : current.action_repair,
                    action_maintenance:
                        target === "maintenance" ? checked : checked ? false : current.action_maintenance,
                },
            };
        });
    }

    function toggleCondition(id: number, target: "good" | "broken", checked: boolean) {
        setItemState((prev) => {
            const current = prev[id] ?? {
                action_repair: false,
                action_maintenance: false,
                condition: null,
                remarks: "",
            };
            return {
                ...prev,
                [id]: {
                    ...current,
                    condition: checked ? target : null,
                },
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

        router.post(
            route("inspection.building.store"),
            {
                ...values,
                items,
            },
            {
                onSuccess: (page) => {
                    // Cek apakah ada temuan (broken)
                    const hasFindings = items.some((item) => Number(item.condition_broken) > 0);

                    if (hasFindings) {
                        const buildingInspectionCode = (page as any).props?.buildingInspectionCode;

                        if (buildingInspectionCode) {
                            setNewInspectionCode(String(buildingInspectionCode));
                            setShowFindingModal(true);
                        } else {
                            toast.error("Gagal mendapatkan kode inspeksi dari server.");
                        }
                    } else {
                        router.visit("/inspection/building", {
                            onSuccess: () => {
                                showToast({
                                    type: "success",
                                    message: "Building inspection data has been saved successfully",
                                });
                            },
                        });
                    }
                },
            }
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Inspeksi Gedung" />
            <div className="p-4">
                <SectionHeader
                    title="Buat Inspeksi Gedung"
                    subtitle="Isi form berikut untuk membuat inspeksi Gedung baru."
                />
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {/* Tanggal Inspeksi */}
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

                                {/* Pilih Gedung */}
                                <FormField
                                    control={form.control}
                                    name="building_id"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Pilih Gedung</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value ? String(field.value) : undefined}
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

                                {/* Pilih Frekuensi */}
                                <FormField
                                    control={form.control}
                                    name="frequency"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Frekuensi</FormLabel>
                                            <FormControl>
                                                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
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

                        {/* Daftar Standar Kerja */}
                        <Card className="overflow-visible">
                            <CardContent className="space-y-3">
                                <div className="text-muted-foreground text-sm">
                                    Daftar standar kerja mengikuti frekuensi yang dipilih dan bisa diisi langsung.
                                </div>

                                {/* MOBILE: Kartu */}
                                <div className="space-y-4 md:hidden">
                                    {filteredStandards.length === 0 ? (
                                        <div className="text-muted-foreground rounded-md border p-4 text-center text-sm">
                                            {form.getValues("frequency")
                                                ? "Belum ada standar kerja untuk frekuensi ini."
                                                : "Pilih frekuensi untuk menampilkan standar kerja."}
                                        </div>
                                    ) : (
                                        filteredStandards.map((ws, idx) => {
                                            const s =
                                                itemState[ws.id] || {
                                                    action_repair: false,
                                                    action_maintenance: false,
                                                    condition: null,
                                                    remarks: "",
                                                };
                                            return (
                                                <div key={ws.id} className="space-y-3 rounded-lg border p-4">
                                                    <div className="text-muted-foreground text-xs">#{idx + 1}</div>

                                                    <div>
                                                        <div className="text-muted-foreground text-xs font-medium">
                                                            Pekerjaan
                                                        </div>
                                                        <div className="font-medium break-words whitespace-normal">
                                                            {ws.job_name}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="text-muted-foreground text-xs font-medium">
                                                            Deskripsi Standar
                                                        </div>
                                                        <div className="text-sm break-words whitespace-normal">
                                                            {ws.standard_description || "-"}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        {/* Perbaikan */}
                                                        <label className="flex items-center gap-2">
                                                            <Checkbox
                                                                className="rounded-sm border border-gray-400 data-[state=checked]:border-yellow-600 data-[state=checked]:bg-yellow-500"
                                                                checked={s.action_repair}
                                                                onCheckedChange={(c) =>
                                                                    toggleAction(ws.id, "repair", Boolean(c))
                                                                }
                                                            />
                                                            <span className="text-sm">Perbaikan</span>
                                                        </label>

                                                        {/* Perawatan */}
                                                        <label className="flex items-center gap-2">
                                                            <Checkbox
                                                                className="rounded-sm border border-gray-400 data-[state=checked]:border-yellow-600 data-[state=checked]:bg-yellow-500"
                                                                checked={s.action_maintenance}
                                                                onCheckedChange={(c) =>
                                                                    toggleAction(ws.id, "maintenance", Boolean(c))
                                                                }
                                                            />
                                                            <span className="text-sm">Perawatan</span>
                                                        </label>

                                                        {/* Baik */}
                                                        <label className="flex items-center gap-2">
                                                            <Checkbox
                                                                className="rounded-sm border border-gray-400 data-[state=checked]:border-yellow-600 data-[state=checked]:bg-yellow-500"
                                                                checked={s.condition === "good"}
                                                                onCheckedChange={(c) =>
                                                                    toggleCondition(ws.id, "good", Boolean(c))
                                                                }
                                                            />
                                                            <span className="text-sm">Baik</span>
                                                        </label>

                                                        {/* Rusak */}
                                                        <label className="flex items-center gap-2">
                                                            <Checkbox
                                                                className="rounded-sm border border-gray-400 data-[state=checked]:border-yellow-600 data-[state=checked]:bg-yellow-500"
                                                                checked={s.condition === "broken"}
                                                                onCheckedChange={(c) =>
                                                                    toggleCondition(ws.id, "broken", Boolean(c))
                                                                }
                                                            />
                                                            <span className="text-sm">Rusak</span>
                                                        </label>
                                                    </div>

                                                    <div>
                                                        <div className="text-muted-foreground mb-1 text-xs font-medium">
                                                            Catatan
                                                        </div>
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

                                {/* DESKTOP: Tabel */}
                                <div className="hidden md:block">
                                    <div className="rounded-md border">
                                        <Table className="w-full table-auto border-collapse text-sm">
                                            <colgroup>
                                                <col className="w-12" />
                                                <col />
                                                <col />
                                                <col className="w-28" />
                                                <col className="w-32" />
                                                <col className="w-20" />
                                                <col className="w-24" />
                                                <col />
                                            </colgroup>

                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead rowSpan={2} className="text-center align-middle">
                                                        #
                                                    </TableHead>
                                                    <TableHead rowSpan={2} className="align-middle">
                                                        Pekerjaan
                                                    </TableHead>
                                                    <TableHead rowSpan={2} className="align-middle">
                                                        Deskripsi Standar
                                                    </TableHead>
                                                    <TableHead colSpan={2} className="text-center align-middle">
                                                        Tindakan
                                                    </TableHead>
                                                    <TableHead colSpan={2} className="text-center align-middle">
                                                        Kondisi
                                                    </TableHead>
                                                    <TableHead rowSpan={2} className="align-middle">
                                                        Catatan
                                                    </TableHead>
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
                                                        <TableCell colSpan={8} className="text-muted-foreground text-center text-sm">
                                                            {form.getValues("frequency")
                                                                ? "Belum ada standar kerja untuk frekuensi ini."
                                                                : "Pilih frekuensi untuk menampilkan standar kerja."}
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    filteredStandards.map((ws, idx) => {
                                                        const s =
                                                            itemState[ws.id] || {
                                                                action_repair: false,
                                                                action_maintenance: false,
                                                                condition: null,
                                                                remarks: "",
                                                            };
                                                        return (
                                                            <TableRow key={ws.id} className="[&_td]:align-top">
                                                                <TableCell className="text-center">{idx + 1}</TableCell>
                                                                <TableCell className="font-medium break-words whitespace-normal">
                                                                    {ws.job_name}
                                                                </TableCell>
                                                                <TableCell className="text-sm break-words whitespace-normal">
                                                                    {ws.standard_description || "-"}
                                                                </TableCell>

                                                                {/* Action: Perbaikan */}
                                                                <TableCell className="text-center">
                                                                    <Checkbox
                                                                        className="rounded-sm border border-gray-400 data-[state=checked]:border-yellow-600 data-[state=checked]:bg-yellow-500"
                                                                        checked={s.action_repair}
                                                                        onCheckedChange={(c) =>
                                                                            toggleAction(ws.id, "repair", Boolean(c))
                                                                        }
                                                                    />
                                                                </TableCell>

                                                                {/* Action: Perawatan */}
                                                                <TableCell className="text-center">
                                                                    <Checkbox
                                                                        className="rounded-sm border border-gray-400 data-[state=checked]:border-yellow-600 data-[state=checked]:bg-yellow-500"
                                                                        checked={s.action_maintenance}
                                                                        onCheckedChange={(c) =>
                                                                            toggleAction(ws.id, "maintenance", Boolean(c))
                                                                        }
                                                                    />
                                                                </TableCell>

                                                                {/* Condition: Baik */}
                                                                <TableCell className="text-center">
                                                                    <Checkbox
                                                                        className="rounded-sm border border-gray-400 data-[state=checked]:border-yellow-600 data-[state=checked]:bg-yellow-500"
                                                                        checked={s.condition === "good"}
                                                                        onCheckedChange={(c) =>
                                                                            toggleCondition(ws.id, "good", Boolean(c))
                                                                        }
                                                                    />
                                                                </TableCell>

                                                                {/* Condition: Rusak */}
                                                                <TableCell className="text-center">
                                                                    <Checkbox
                                                                        className="rounded-sm border border-gray-400 data-[state=checked]:border-yellow-600 data-[state=checked]:bg-yellow-500"
                                                                        checked={s.condition === "broken"}
                                                                        onCheckedChange={(c) =>
                                                                            toggleCondition(ws.id, "broken", Boolean(c))
                                                                        }
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
                                {form.formState.isSubmitting ? "Creating..." : "Submit Data"}
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

                <Dialog open={showFindingModal} onOpenChange={setShowFindingModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Temuan Ditemukan</DialogTitle>
                            <DialogDescription>
                                Ada item yang tidak baik dalam inspeksi ini. Buat form temuan sekarang?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    router.visit("/inspection/building", {
                                        onSuccess: () => {
                                            showToast({
                                                type: "success",
                                                message: "Building inspection data has been saved successfully",
                                            });
                                        },
                                    });
                                }}
                            >
                                Nanti saja
                            </Button>
                            <Button
                                onClick={() =>
                                    router.visit(`/finding/create?inspection=GEDUNG&inspection_code=${newInspectionCode}`)
                                }
                            >
                                Ya, Buat Temuan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
