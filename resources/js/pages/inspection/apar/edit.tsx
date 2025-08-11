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
import { showToast } from '@/components/ui/toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi APAR', href: '/inspection/apar' },
    { title: 'Buat Inspeksi', href: '/inspection/apar' },
];

const formSchema = z.object({
    date: z.string().min(1, { message: 'Tanggal is required' }),
    apar_id: z.string().min(1, { message: 'APAR is required' }),
    expired_year: z.string().min(1, { message: 'Tahun kadaluarsa is required' }),
    note: z.string().optional(),
});

const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const inspectionFields = ["Segel", "Hose", "Tekanan", "Dibalik", "Berat (CO₂)", "Sesuai Tempatnya"];

export default function EditInspectionApar({
    aparInspection,
    inspectionItems,
}: {
    aparInspection: {
        uuid?: string;
        id: number;
        date: string;
        apar_id: string;
        expired_year: string;
        location?: string;
        note?: string;
    };
    inspectionItems: {
        month: string;
        field: string;
        value: 'baik' | 'tidak_baik' | null;
    }[];
}) {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const date = new Date(aparInspection.date);
        return months[date.getMonth()];
    });

    const { errors = {}, apars = [] } = usePage().props as unknown as {
        errors: Record<string, string>;
        apars: { id: number; inventory_code: string; apar: string; location: string }[];
    };

    const [inspectionState, setInspectionState] = useState<Record<string, Record<string, 'baik' | 'tidak_baik' | null> & { note?: string }>>(() => {
        const state: Record<string, Record<string, 'baik' | 'tidak_baik' | null> & { note?: string }> = {};

        months.forEach((month) => {
            state[month] = { note: '' } as any;
            inspectionFields.forEach((field) => {
                state[month][field] = null;
            });
        });

        inspectionItems.forEach((item) => {
            if (!state[item.month]) return;
            if (!item.field || item.field === 'null') return; // tambahan filter
            state[item.month][item.field] = item.value;
        });

        return state;
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: aparInspection.date,
            apar_id: aparInspection.apar_id,
            expired_year: aparInspection.expired_year,
            note: aparInspection.note || '',
        },
    });
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

        if (!aparInspection.uuid) {
            toast.error('Invalid inspection ID');
            return;
        }

        formData.append('note', form.getValues().note || inspectionState[selectedMonth]?.note || '');
        formData.append('apar_inspection_items', JSON.stringify(inspectionItems));
        formData.append('_method', 'PUT'); // agar dikenali sebagai update

        router.post(route('inspection.apar.update', aparInspection.uuid), formData, {
            onSuccess: () => {
                router.visit('/inspection/apar');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Inspection" />
            <div className="space-y-6 p-4">
                <SectionHeader title="Edit Inspeksi APAR" subtitle="Perbarui data inspeksi APAR di bawah ini" />
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
                                                    readOnly
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
                                                        {inspectionFields.map((field, index) => {
                                                            const value = inspectionState[month]?.[field];

                                                            return (
                                                                <React.Fragment key={`${month}-${field}-${index}`}>
                                                                    {/* Checkbox Baik */}
                                                                    <TableCell className="border text-center">
                                                                        <Checkbox
                                                                            className="mx-auto h-4 w-4 rounded-sm border-2 border-gray-400 data-[state=checked]:border-green-600 data-[state=checked]:bg-green-500"
                                                                            checked={value === 'baik'}
                                                                            onCheckedChange={(checked) =>
                                                                                setInspectionState((prev) => ({
                                                                                    ...prev,
                                                                                    [month]: {
                                                                                        ...prev[month],
                                                                                        [field]: checked ? 'baik' : null, // jika dicentang => "baik", jika uncheck => null
                                                                                    },
                                                                                }))
                                                                            }
                                                                        />
                                                                    </TableCell>

                                                                    {/* Checkbox Tidak Baik */}
                                                                    <TableCell className="border text-center">
                                                                        <Checkbox
                                                                            className="mx-auto h-4 w-4 rounded-sm border-2 border-gray-400 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-500"
                                                                            checked={value === 'tidak_baik'}
                                                                            onCheckedChange={(checked) =>
                                                                                setInspectionState((prev) => ({
                                                                                    ...prev,
                                                                                    [month]: {
                                                                                        ...prev[month],
                                                                                        [field]: checked ? 'tidak_baik' : null, // jika dicentang => "tidak_baik", jika uncheck => null
                                                                                    },
                                                                                }))
                                                                            }
                                                                        />
                                                                    </TableCell>
                                                                </React.Fragment>
                                                            );
                                                        })}
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
                                            name="note"
                                            className="mt-1 w-full text-sm"
                                            placeholder={`Tulis catatan untuk bulan ${selectedMonth}...`}
                                            value={inspectionState[selectedMonth]?.note || aparInspection.note || ''}
                                            onChange={(e) => {
                                                handleNoteChange(selectedMonth, e.target.value);
                                                form.setValue('note', e.target.value);
                                            }}
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
            </div>
        </AppLayout>
    );
}
