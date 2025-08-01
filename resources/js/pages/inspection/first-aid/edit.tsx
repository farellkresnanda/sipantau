import React, { useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format as formatFnsDate } from 'date-fns'; // Import fungsi format dari date-fns

import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { showToast } from '@/components/ui/toast';
import type { BreadcrumbItem } from '@/types';

// Definisi breadcrumbs untuk Inspeksi P3K
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi P3K', href: '/inspection/first-aid' },
    { title: 'Edit', href: '#' },
];

// Skema validasi form untuk Inspeksi P3K
const formSchema = z.object({
    uuid: z.string().optional(),
    inspection_date: z.string().min(1, { message: 'Tanggal inspeksi wajib diisi' }),
    location_id: z.string().min(1, { message: 'Lokasi wajib diisi' }),
    project_name: z.string().nullable(),
    entity_code: z.string().nullable(),
    plant_code: z.string().nullable(),
    approval_status_code: z.string(), // Menambahkan ini berdasarkan error sebelumnya
    items: z.record( // Sesuaikan skema item untuk P3K
        z.object({
            quantity: z.preprocess(
                (val) => {
                    if (val === '' || val === null) return null;
                    const num = Number(val);
                    return isNaN(num) ? null : num;
                },
                z.number().nullable().refine(val => val === null || val >= 0, {
                    message: 'Jumlah harus angka positif atau nol.',
                })
            ) as z.ZodType<number | null | undefined>,
            condition: z.string().nullable(),
            expired_at: z.string().nullable(), // Tanggal kadaluarsa sebagai string
            note: z.string().nullable(), // Catatan sebagai string
        }).partial(),
    ),
});

// Tipe props yang diterima dari controller
interface EditFirstAidInspectionProps {
    inspection: {
        uuid: string;
        inspection_date: string;
        project_name: string | null;
        entity_code: string;
        plant_code: string;
        location_id: number;
        approval_status_code: string; // Menambahkan ini berdasarkan error sebelumnya
        location: {
            id: number;
            location: string;
            inventory_code: string;
            entity_code: string;
            plant_code: string;
        };
        items: Array<{
            id: number;
            first_aid_check_item_id: number;
            quantity_found: number;
            condition_id: number;
            note: string | null;
            expired_at: string | null; // <<< Pastikan tipe ini adalah string | null
            item: { id: number; item_name: string; standard_quantity: string; unit?: string };
            condition: { id: number; name: string };
        }>;
    };
    locations: Array<{ id: number; location: string; inventory_code: string; entity_code: string; plant_code: string }>;
    firstAidItems: Array<{ id: number; item_name: string; standard_quantity: string; unit?: string }>;
    conditions: Array<{ id: number; name: string }>;
}

// Helper function untuk memformat tanggal ke YYYY-MM-DD
const formatDateForInput = (dateString?: string | null): string | null => {
    // --- DEBUGGING EKSTRA UNTUK TANGGAL ---
    console.log("formatDateForInput: Input dateString:", dateString);
    console.log("formatDateForInput: Type of dateString:", typeof dateString);
    // --- AKHIR DEBUGGING EKSTRA ---

    if (!dateString) return null;

    try {
        const date = new Date(dateString);
        // Pastikan date object valid
        if (isNaN(date.getTime())) {
            console.warn("formatDateForInput: Invalid Date object created for:", dateString);
            return null;
        }
        const formatted = formatFnsDate(date, 'yyyy-MM-dd');
        console.log("formatDateForInput: Formatted date:", formatted);
        return formatted;
    } catch (e) {
        console.error("formatDateForInput: Error formatting date for input:", dateString, e);
        return null;
    }
};

export default function EditFirstAidInspection({
    inspection,
    locations,
    firstAidItems,
    conditions,
}: EditFirstAidInspectionProps) {
    const { errors: backendErrors = {} } = usePage().props as {
        errors?: Record<string, string>;
    };

    // Inisialisasi form dengan nilai yang ada dari inspeksi
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            uuid: inspection.uuid,
            inspection_date: formatDateForInput(inspection.inspection_date) ?? '',
            location_id: String(inspection.location_id),
            project_name: inspection.project_name ?? '',
            entity_code: inspection.entity_code ?? null,
            plant_code: inspection.plant_code ?? null,
            approval_status_code: inspection.approval_status_code, // Set default value
            items: firstAidItems.reduce((acc, masterItem) => {
                const existingItem = inspection.items.find(
                    (item) => item.first_aid_check_item_id === masterItem.id,
                );

                acc[masterItem.id] = {
                    quantity: existingItem?.quantity_found ?? null,
                    condition: existingItem?.condition?.name ?? null,
                    expired_at: formatDateForInput(existingItem?.expired_at), // Menggunakan helper function
                    note: existingItem?.note ?? null,
                };
                return acc;
            }, {} as Record<string, { quantity: number | null; condition: string | null; expired_at: string | null; note: string | null }>),
        },
    });

    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string; message?: string };
    };

    // Tampilkan toast untuk flash messages dari backend
    useEffect(() => {
        if (flash?.success) {
            showToast({ type: 'success', message: flash.success });
        }
        if (flash?.error) {
            showToast({ type: 'error', message: flash.error });
        }
        if (flash?.message) {
            showToast({ message: flash.message });
        }
    }, [flash]);

    // Logika untuk mengisi entity_code dan plant_code berdasarkan lokasi yang dipilih
    const selectedLocation = locations.find((loc) => String(loc.id) === form.watch('location_id'));

    useEffect(() => {
        if (selectedLocation) {
            form.setValue('entity_code', selectedLocation.entity_code);
            form.setValue('plant_code', selectedLocation.plant_code);
        } else {
            form.setValue('entity_code', null);
            form.setValue('plant_code', null);
        }
    }, [selectedLocation, form]);

    // Handle error dari backend validation
    useEffect(() => {
        if (Object.keys(backendErrors).length > 0) {
            Object.entries(backendErrors).forEach(([key, message]) => {
                const pathParts = key.split('.');
                if (pathParts[0] === 'items' && !isNaN(Number(pathParts[1]))) {
                    const masterItemId = Number(pathParts[1]);
                    const propName = pathParts[2];

                    let frontendPropName = propName;
                    if (propName === 'quantity_found') frontendPropName = 'quantity';
                    if (propName === 'condition_id') frontendPropName = 'condition';

                    const formPath = `items.${masterItemId}.${frontendPropName}` as keyof typeof formSchema._type;
                    form.setError(formPath, { type: 'manual', message: message as string });
                } else {
                    form.setError(key as keyof typeof formSchema._type, { type: 'manual', message: message as string });
                }
            });
        }
    }, [backendErrors, form]);

    // Fungsi submit form
    const onSubmit = (values: z.infer<typeof formSchema>) => {
        // Transformasi item untuk dikirim ke backend
        const transformedItems = Object.entries(values.items)
            .map(([masterItemId, data]) => ({
                first_aid_check_item_id: Number(masterItemId),
                quantity_found: data.quantity ?? 0,
                condition_id: data.condition ? conditions.find(cond => cond.name === data.condition)?.id : null,
                expired_at: data.expired_at || null,
                note: data.note || null,
            }))
            .filter(item => // Filter item yang benar-benar ada datanya
                item.quantity_found > 0 ||
                item.condition_id !== null ||
                item.expired_at !== null ||
                item.note !== null
            );

        // Kirim data ke backend menggunakan router.put untuk update
        router.put(route('inspection.first-aid.update', inspection.uuid), {
            inspection_date: values.inspection_date,
            location_id: Number(values.location_id),
            project_name: values.project_name,
            entity_code: values.entity_code,
            plant_code: values.plant_code,
            approval_status_code: values.approval_status_code, // Kirim approval_status_code
            items: transformedItems,
        }, {
            onSuccess: () => {
                showToast({ type: 'success', message: 'Inspeksi berhasil diperbarui!' });
                console.log('Update berhasil! Inertia akan melakukan redirect.');
            },
            onError: (backendErrors) => {
                console.error('Terjadi kesalahan saat mengupdate inspeksi:', backendErrors);
                showToast({ type: 'error', message: 'Gagal memperbarui inspeksi. Cek konsol untuk detail.' });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Inspeksi P3K" />
            <div className="space-y-6 p-4">
                <SectionHeader title="Edit Inspeksi P3K" subtitle="Ubah data inspeksi P3K di bawah ini" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* Tanggal Inspeksi */}
                                <FormField
                                    control={form.control}
                                    name="inspection_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tanggal Inspeksi</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Lokasi */}
                                <FormField
                                    control={form.control}
                                    name="location_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lokasi</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih lokasi" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {locations.map((loc) => (
                                                            <SelectItem key={loc.id} value={String(loc.id)}>
                                                                {loc.location}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Kode Inventaris (Disabled, dari lokasi yang dipilih) */}
                                <div>
                                    <FormLabel>Kode Inventaris</FormLabel>
                                    <Input
                                        value={selectedLocation?.inventory_code ?? '-'}
                                        disabled
                                    />
                                </div>

                                {/* Nama Proyek */}
                                <FormField
                                    control={form.control}
                                    name="project_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Proyek</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)} placeholder="Masukkan nama proyek" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* entity_code dan plant_code tidak perlu ditampilkan, karena otomatis dari lokasi */}
                                <FormField
                                    control={form.control}
                                    name="entity_code"
                                    render={({ field }) => (
                                        // Hidden field untuk entity_code
                                        <Input type="hidden" {...field} value={field.value ?? ''} />
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="plant_code"
                                    render={({ field }) => (
                                        // Hidden field untuk plant_code
                                        <Input type="hidden" {...field} value={field.value ?? ''} />
                                    )}
                                />
                                {/* Hidden field for approval_status_code */}
                                <FormField
                                    control={form.control}
                                    name="approval_status_code"
                                    render={({ field }) => (
                                        <Input type="hidden" {...field} value={field.value} />
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden">
                            <CardContent className="overflow-x-auto">
                                <div className="w-full">
                                    <Table className="w-full table-fixed border-collapse whitespace-normal">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-14">No</TableHead>
                                                <TableHead className="w-32">Nama Obat</TableHead>
                                                <TableHead className="w-28">Jumlah Obat</TableHead>
                                                <TableHead className="w-20">Satuan</TableHead>
                                                <TableHead className="w-28">Kondisi</TableHead>
                                                <TableHead className="w-32">Masa Berlaku</TableHead>
                                                <TableHead className="w-40">Keterangan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {firstAidItems.map((masterItem, index) => {
                                                const itemId = String(masterItem.id);
                                                return (
                                                    <TableRow key={itemId}>
                                                        <TableCell>{index + 1}</TableCell>
                                                        <TableCell>{masterItem.item_name}</TableCell>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`items.${itemId}.quantity`}
                                                                render={({ field }) => (
                                                                    <Input
                                                                        type="number"
                                                                        {...field}
                                                                        value={field.value ?? ''}
                                                                        onChange={(e) => {
                                                                            field.onChange(e.target.value === '' ? null : Number(e.target.value));
                                                                        }}
                                                                        placeholder="0"
                                                                    />
                                                                )}
                                                            />
                                                            <FormMessage>{form.formState.errors.items?.[itemId]?.quantity?.message}</FormMessage>
                                                        </TableCell>
                                                        <TableCell>{masterItem.unit ?? '-'}</TableCell>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`items.${itemId}.condition`}
                                                                render={({ field }) => (
                                                                    <Select
                                                                        value={String(field.value ?? '')}
                                                                        onValueChange={(val) => {
                                                                            field.onChange(val === '' ? null : val);
                                                                            // Juga perbarui catatan menjadi null jika kondisi berubah menjadi N/A
                                                                            if (val === 'N/A') {
                                                                                form.setValue(`items.${itemId}.note`, null);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                                                                        <SelectContent>
                                                                            {conditions.map((cond) => (
                                                                                <SelectItem key={cond.id} value={cond.name}>{cond.name}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                            />
                                                            <FormMessage>{form.formState.errors.items?.[itemId]?.condition?.message}</FormMessage>
                                                        </TableCell>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`items.${itemId}.expired_at`}
                                                                render={({ field }) => (
                                                                    <Input type="date" {...field} value={field.value ?? ''} />
                                                                )}
                                                            />
                                                            <FormMessage>{form.formState.errors.items?.[itemId]?.expired_at?.message}</FormMessage>
                                                        </TableCell>
                                                        <TableCell>
                                                            <FormField
                                                                control={form.control}
                                                                name={`items.${itemId}.note`}
                                                                render={({ field }) => (
                                                                    <Input {...field} value={field.value ?? ''} placeholder="Catatan..." />
                                                                )}
                                                            />
                                                            <FormMessage>{form.formState.errors.items?.[itemId]?.note?.message}</FormMessage>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-start">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}