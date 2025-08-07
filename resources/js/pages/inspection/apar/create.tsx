import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Head, Link, router, usePage } from '@inertiajs/react';
import SectionHeader from '@/components/section-header';
import type { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { useEffect, useState } from 'react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {showToast} from "@/components/ui/toast";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi APAR', href: '/inspection/apar' },
    { title: 'Buat Inspeksi', href: '/inspection/apar' },
];

const formSchema = z.object({
    date: z.string().min(1, { message: 'Tanggal is required' }),
    location: z.string().optional(),
    apar_id: z.string().min(1, { message: 'APAR is required' }),
    expired_year: z.string().min(1, { message: 'Tahun kadaluarsa is required' }),
});

const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const inspectionFields = ["Segel", "Hose", "Tekanan", "Bohlam", "Berat (CO₂)"];

export default function CreateInspectionApar() {
    const [showFindingModal, setShowFindingModal] = useState(false);
    const [newInspectionCode, setNewInspectionCode] = useState<string | null>(null);

    const { errors = {}, apars = [] } = usePage().props as unknown as {
        errors: Record<string, string>;
        apars: { id: number; inventory_code: string; apar: string; location: string }[];
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {},
    });

    const [inspectionState, setInspectionState] = useState<Record<string, Record<string, 'baik' | 'tidak_baik' | null> & { note?: string }>>(() => {
        const initial: Record<string, Record<string, 'baik' | 'tidak_baik' | null> & { note?: string }> = {};
        months.forEach((month) => {
            initial[month] = { note: '' } as Record<string, 'baik' | 'tidak_baik' | null> & { note: string };
            inspectionFields.forEach((field) => {
                initial[month][field] = null;
            });
        });
        return initial;
    });

    const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

    const handleCheck = (month: string, field: string, value: 'baik' | 'tidak_baik') => {
        setInspectionState((prev) => ({
            ...prev,
            [month]: {
                ...prev[month],
                [field]: prev[month][field] === value ? null : value,
            },
        }));
    };

    const handleNoteChange = (month: string, value: string) => {
        setInspectionState((prev) => ({
            ...prev,
            [month]: {
                ...prev[month],
                note: value,
            } as Record<string, 'baik' | 'tidak_baik' | null> & { note: string },
        }));
    };

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([key, message]) => {
                if (key !== 'message' && key !== 'error') {
                    // Cek apakah key ada di formSchema
                    if (key in form.getValues()) {
                        form.setError(key as keyof typeof formSchema._type, {
                            type: 'manual',
                            message: message as string,
                        });
                    } else {
                        // Kalau tidak, tampilkan sebagai toast error
                        toast.error(message as string);
                    }
                }
            });
        }

        if (errors.message) toast.error(errors.message);
        if (errors.error) toast.error(errors.error);
    }, [errors, form]);


    function onSubmit(values: z.infer<typeof formSchema>) {
        if (!selectedMonth) {
            toast.error('Pilih tanggal inspeksi terlebih dahulu');
            return;
        }

        const inspectionItems = inspectionFields.map((field) => ({
            month: selectedMonth,
            field,
            value: inspectionState[selectedMonth]?.[field] ?? null,
        }));

        const formData = new FormData();

        Object.entries(values).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value.toString());
            }
        });

        formData.append('note', inspectionState[selectedMonth]?.note || '');
        formData.append('apar_inspection_items', JSON.stringify(inspectionItems));

        router.post(route('inspection.apar.store'), formData, {
            onSuccess: (page) => {
                // Cek apakah ada temuan
                const hasFindings = inspectionItems.some(item => item.value === 'tidak_baik');

                if (hasFindings) {
                    // Simpan ID inspeksi dari response Inertia jika tersedia
                    const aparInspectionCode = page.props.aparInspectionCode; // asumsi ID dikembalikan
                    console.log('aparInspectionCode', aparInspectionCode);

                    if (aparInspectionCode) {
                        setNewInspectionCode(aparInspectionCode.toString());
                        setShowFindingModal(true);
                    } else {
                        toast.error('Gagal mendapatkan ID inspeksi dari server.');
                    }
                } else {
                    router.visit('/inspection/apar', {
                        onSuccess: () => {
                            showToast({ type: 'success', message: 'APAR inspection data saved successfully' });
                        },
                    });
                }
            }
        });

    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Inspection" />
            <div className="space-y-6 p-4">
                <SectionHeader
                    title="Buat Inspeksi APAR Baru"
                    subtitle="Buat data temuan baru dan lengkapi formulir di bawah ini dengan data yang dibutuhkan"
                />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tanggal Inspeksi</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="date"
                                                    className="w-full min-w-0"
                                                    {...field}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        field.onChange(value);

                                                        const date = new Date(value);
                                                        const monthIndex = date.getMonth();
                                                        const monthName = months[monthIndex];
                                                        setSelectedMonth(monthName);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="apar_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>APAR</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih APAR" />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-[200px]">
                                                        <input
                                                            className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                                            placeholder="Search APAR..."
                                                            onChange={(e) => {
                                                                const value = e.target.value.toLowerCase();
                                                                const items = document.querySelectorAll('[role="option"]');
                                                                items.forEach((item) => {
                                                                    const text = item.textContent?.toLowerCase() || '';
                                                                    if (text.includes(value)) {
                                                                        item.classList.remove('hidden');
                                                                    } else {
                                                                        item.classList.add('hidden');
                                                                    }
                                                                });
                                                            }}
                                                        />
                                                        {apars.map((apar) => (
                                                            <SelectItem key={apar.id} value={String(apar.id)}>
                                                                {apar.inventory_code} - {apar.apar} - {apar.location}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="expired_year"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tahun Kadaluarsa</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="2024"
                                                    className="w-full min-w-0"
                                                    {...field}
                                                    placeholder="Tahun Kadaluarsa"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="space-y-4">
                                <div className="overflow-x-auto rounded-md border">
                                    <Table className="w-full table-auto border-collapse text-sm whitespace-normal">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead rowSpan={2} className="w-28 border bg-yellow-300 p-1 text-center text-sm">
                                                    Bulan
                                                </TableHead>
                                                {inspectionFields.map((field) => (
                                                    <TableHead key={field} colSpan={2} className="border bg-yellow-300 p-1 text-center text-sm">
                                                        {field}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                            <TableRow>
                                                {inspectionFields.map((field, idx) => (
                                                    <React.Fragment key={`${field}-${idx}`}>
                                                        <TableHead className="w-16 border bg-yellow-100 p-1 text-center text-xs">Baik</TableHead>
                                                        <TableHead className="w-16 border bg-yellow-100 p-1 text-center text-xs">
                                                            Tidak Baik
                                                        </TableHead>
                                                    </React.Fragment>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {months
                                                .filter((month) => !selectedMonth || month === selectedMonth)
                                                .map((month) => (
                                                    <TableRow key={month}>
                                                        <TableCell className="border px-2 py-1">{month}</TableCell>
                                                        {inspectionFields.map((field, index) => (
                                                            <React.Fragment key={`${month}-${field}-${index}`}>
                                                                <TableCell className="border text-center">
                                                                    <Checkbox
                                                                        className="mx-auto h-4 w-4 rounded-sm border-2 border-gray-400 data-[state=checked]:border-green-600 data-[state=checked]:bg-green-500"
                                                                        checked={inspectionState[month][field] === 'baik'}
                                                                        onCheckedChange={() => handleCheck(month, field, 'baik')}
                                                                    />
                                                                </TableCell>
                                                                <TableCell className="border text-center">
                                                                    <Checkbox
                                                                        className="mx-auto h-4 w-4 rounded-sm border-2 border-gray-400 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-500"
                                                                        checked={inspectionState[month][field] === 'tidak_baik'}
                                                                        onCheckedChange={() => handleCheck(month, field, 'tidak_baik')}
                                                                    />
                                                                </TableCell>
                                                            </React.Fragment>
                                                        ))}
                                                    </TableRow>
                                                ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Catatan di luar tabel */}
                                {selectedMonth && (
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">Catatan untuk bulan {selectedMonth}</label>
                                        <Textarea
                                            className="mt-1 w-full text-sm"
                                            placeholder={`Tulis catatan untuk bulan ${selectedMonth}...`}
                                            value={inspectionState[selectedMonth]?.note || ''}
                                            onChange={(e) => handleNoteChange(selectedMonth, e.target.value)}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Creating...' : 'Submit Data'}
                            </Button>
                            <Link href={route('finding.index')} className="text-muted-foreground text-sm hover:underline">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </Form>

                <Dialog open={showFindingModal} onOpenChange={setShowFindingModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Temuan Ditemukan</DialogTitle>
                            <DialogDescription>Ada item yang tidak baik dalam inspeksi ini. Buat form temuan sekarang?</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.visit('/inspection/apar', {
                                        onSuccess: () => {
                                            showToast({ type: 'success', message: 'APAR inspection data saved successfully' });
                                        },
                                    })
                                }
                            >
                                Nanti saja
                            </Button>
                            <Button onClick={() => router.visit(`/finding/create?inspection=APAR&inspection_code=${newInspectionCode}`)}>
                                Ya, Buat Temuan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
