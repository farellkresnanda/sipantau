'use client';

import { Head, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi P3K', href: '/inspection/first-aid' },
    { title: 'Buat', href: '/inspection/first-aid/create' },
];

const formSchema = z.object({
    inspection_date: z.string().min(1, { message: 'Tanggal inspeksi harus diisi' }),
    location_id: z.string().min(1, { message: 'Lokasi harus dipilih' }),
    project_name: z.string().nullable(),
    entity_code: z.string().nullable(), // Ini akan diisi dari selectedLocation.entityData?.entity_code
    plant_code: z.string().nullable(),  // Ini akan diisi dari selectedLocation.plantData?.plant_code
    items: z.record(
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
            expired_at: z.string().nullable(),
            note: z.string().nullable(),
        }).partial()
    ),
});

export default function CreateFirstAidInspection() {
    const { errors = {}, locations = [], firstAidItems = [], conditions = [] } = usePage().props as unknown as {
        errors: Record<string, string>;
        locations: Array<{
            id: number;
            location: string;
            inventory_code: string;
            entity_code: string; // Ini adalah entity_code di tabel master_p3ks
            plant_code: string;  // Ini adalah plant_code di tabel master_p3ks
            entityData?: { id: number; entity_code: string; name?: string }; // Tipe untuk relasi eager-loaded
            plantData?: { id: number; plant_code: string; name?: string };   // Tipe untuk relasi eager-loaded
        }>;
        firstAidItems: Array<{ id: number; item_name: string; standard_quantity: string; unit?: string }>;
        conditions: Array<{ id: number; name: string }>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            inspection_date: '',
            location_id: '',
            project_name: '',
            entity_code: null,
            plant_code: null,
            items: firstAidItems.reduce((acc, item) => {
                acc[item.id] = {
                    quantity: null,
                    condition: null,
                    expired_at: null,
                    note: null,
                };
                return acc;
            }, {} as Record<string, { quantity: number | null; condition: string | null; expired_at: string | null; note: string | null }>),
        },
    });

    const selectedLocation = locations.find((loc) => String(loc.id) === form.watch('location_id'));

    useEffect(() => {
        if (selectedLocation) {
            // === REVISI DI SINI ===
            // Ambil entity_code/plant_code dari relasi eager loaded
            // Gunakan optional chaining (?.) untuk mencegah error jika relasi null
            // Gunakan nullish coalescing (??) untuk fallback ke kolom langsung (entity_code/plant_code dari master_p3ks)
            // jika relasi tidak ditemukan atau propertinya null.
            form.setValue('entity_code', selectedLocation.entityData?.entity_code ?? selectedLocation.entity_code);
            form.setValue('plant_code', selectedLocation.plantData?.plant_code ?? selectedLocation.plant_code);

            // === DEBUG POINT DI FRONTEND ===
            // Periksa di konsol browser (F12) setelah memilih lokasi
            console.log("Selected Location Data:", selectedLocation);
            console.log("Setting entity_code to:", selectedLocation.entityData?.entity_code ?? selectedLocation.entity_code);
            console.log("Setting plant_code to:", selectedLocation.plantData?.plant_code ?? selectedLocation.plant_code);
            // ===============================

        } else {
            form.setValue('entity_code', null);
            form.setValue('plant_code', null);
            console.log("Resetting entity_code and plant_code to null.");
        }
    }, [selectedLocation, form]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([key, message]) => {
                const pathParts = key.split('.');
                if (pathParts[0] === 'items' && !isNaN(Number(pathParts[1]))) {
                    const itemIndex = Number(pathParts[1]);
                    const propName = pathParts[2];

                    const masterItemId = firstAidItems.find(item => item.id === itemIndex)?.id || firstAidItems[itemIndex]?.id;

                    if (masterItemId !== undefined) {
                        let frontendPropName = propName;
                        if (propName === 'quantity_found') frontendPropName = 'quantity';
                        if (propName === 'condition_id') frontendPropName = 'condition';
                        if (propName === 'noted') frontendPropName = 'note';

                        const formPath = `items.${masterItemId}.${frontendPropName}` as keyof typeof formSchema._type;
                        form.setError(formPath, { type: 'manual', message });
                    }
                } else {
                    form.setError(key as keyof typeof formSchema._type, { type: 'manual', message });
                }
            });
        }
    }, [errors, form, firstAidItems]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const transformedItems = Object.entries(values.items)
            .map(([masterItemId, data]) => ({
                first_aid_check_item_id: Number(masterItemId),
                quantity_found: data.quantity ?? 0,
                condition_id: data.condition ? conditions.find(cond => cond.name === data.condition)?.id : null,
                expired_at: data.expired_at || null,
                note: data.note || null,
            }))
            .filter(item =>
                item.quantity_found > 0 ||
                item.condition_id !== null ||
                item.expired_at !== null ||
                item.note !== null
            );

        if (!transformedItems || transformedItems.length === 0) {
            alert('Mohon isi setidaknya satu item inspeksi.');
            return;
        }

        router.post(route('inspection.first-aid.store'), {
            inspection_date: values.inspection_date,
            location_id: Number(values.location_id),
            project_name: values.project_name,
            entity_code: values.entity_code, // Ini akan menggunakan nilai yang sudah di-set ke form dari relasi (KFHO)
            plant_code: values.plant_code,   // Ini akan menggunakan nilai yang sudah di-set ke form dari relasi (KFO)
            items: transformedItems,
        }, {
            onSuccess: () => {
                console.log('Submission berhasil! Inertia akan melakukan redirect.');
            },
            onError: (backendErrors) => {
                console.error('Terjadi kesalahan saat menyimpan inspeksi:', backendErrors);
            }
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Inspeksi P3K" />
            <div className="space-y-6 p-4">
                <SectionHeader title="Buat Inspeksi P3K" subtitle="Lengkapi data inspeksi P3K di bawah ini" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                                <FormField
                                    control={form.control}
                                    name="location_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lokasi</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={String(field.value ?? '')}
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih lokasi" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {locations.map((loc) => (
                                                            <SelectItem key={String(loc.id)} value={String(loc.id)}>
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

                                <div>
                                    <FormLabel>Kode Inventaris</FormLabel>
                                    <Input
                                        value={selectedLocation?.inventory_code ?? '-'}
                                        disabled
                                    />
                                </div>

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
                                            {firstAidItems.map((item, index) => (
                                                <TableRow key={String(item.id)}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{item.item_name}</TableCell>
                                                    <TableCell>
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${item.id}.quantity`}
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
                                                        <FormMessage>{form.formState.errors.items?.[item.id]?.quantity?.message}</FormMessage>
                                                    </TableCell>
                                                    <TableCell>{item.unit ?? '-'}</TableCell>
                                                    <TableCell>
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${item.id}.condition`}
                                                            render={({ field }) => (
                                                                <Select
                                                                    value={String(field.value ?? '')}
                                                                    onValueChange={(val) => {
                                                                        field.onChange(val === '' ? null : val);
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
                                                        <FormMessage>{form.formState.errors.items?.[item.id]?.condition?.message}</FormMessage>
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${item.id}.expired_at`}
                                                            render={({ field }) => (
                                                                <Input type="date" {...field} value={field.value ?? ''} />
                                                            )}
                                                        />
                                                        <FormMessage>{form.formState.errors.items?.[item.id]?.expired_at?.message}</FormMessage>
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${item.id}.note`}
                                                            render={({ field }) => (
                                                                <Input {...field} value={field.value ?? ''} placeholder="Keterangan" />
                                                            )}
                                                        />
                                                        <FormMessage>{form.formState.errors.items?.[item.id]?.note?.message}</FormMessage>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}