'use client';

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

// Definisi breadcrumbs untuk halaman ini
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi AC', href: '/inspection/ac' },
    { title: 'Buat', href: '#create' },
];

// Skema validasi form menggunakan Zod
const formSchema = z.object({
    inspection_date: z.string().min(1, { message: 'Tanggal inspeksi wajib diisi' }),
    entity_id: z.string().min(1, { message: 'Entitas wajib dipilih' }), // Akan mengirim ID entitas
    plant_id: z.string().min(1, { message: 'Plant wajib dipilih' }),     // Akan mengirim ID plant
    location_id: z.string().min(1, { message: 'Lokasi wajib dipilih' }), // Akan mengirim ID lokasi
    notes: z.string().nullable(), // Catatan global untuk inspeksi ini

    items: z.record( // Record of items keyed by master_ac_unit_id (string)
        z.object({
            maintenance_status: z.string().nullable(),
            condition_status: z.string().nullable(),
            notes: z.string().nullable(), // Catatan per item
        }).partial() // Gunakan partial karena tidak semua field item harus diisi
    ),
});

// Tipe props yang diterima dari controller
interface CreateAcInspectionProps {
    locations: Array<{ id: number; location: string; inventory_code: string; entity_code: string; plant_code: string }>;
    entities: Array<{ id: number; entity_code: string; name: string }>; // List entitas untuk dropdown
    plants: Array<{ id: number; plant_code: string; name: string; alias_name: string }>; // List plant untuk dropdown
    maintenanceStatuses: Array<{ name: string; value: string }>; // Hardcoded statuses dari controller
    conditionTypes: Array<{ name: string; value: string }>; // Hardcoded conditions dari controller
    masterAcUnits: Array<{ id: number; ac_number: string; inventory_code: string; brand: string; room: string; entity_code: string; plant_code: string }>; // List master unit AC
    // Catatan: Jika masterAcUnits tidak dikirim dari backend, Anda perlu menyesuaikan ini atau metode store/update
}

export default function CreateAcInspection({
    locations,
    entities,
    plants,
    maintenanceStatuses,
    conditionTypes,
    masterAcUnits,
}: CreateAcInspectionProps) {
    const { errors: backendErrors = {} } = usePage().props as {
        errors?: Record<string, string>;
    };

    // Inisialisasi form dengan React Hook Form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            inspection_date: formatFnsDate(new Date(), 'yyyy-MM-dd'), // Default tanggal hari ini
            entity_id: '',
            plant_id: '',
            location_id: '',
            notes: '',
            items: masterAcUnits.reduce((acc, unit) => {
                acc[unit.id] = { // Inisialisasi setiap master AC unit dengan default null/kosong
                    maintenance_status: null,
                    condition_status: null,
                    notes: null,
                };
                return acc;
            }, {} as Record<string, { maintenance_status: string | null; condition_status: string | null; notes: string | null }>),
        },
    });

    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string; message?: string };
    };

    // Efek untuk menampilkan toast messages dari backend (sukses/gagal)
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

    // Efek untuk menangani error validasi dari backend dan menampilkannya di form
    useEffect(() => {
        if (Object.keys(backendErrors).length > 0) {
            Object.entries(backendErrors).forEach(([key, message]) => {
                const pathParts = key.split('.');
                // Handle item specific errors (e.g., items.0.maintenance_status)
                if (pathParts[0] === 'items' && !isNaN(Number(pathParts[1]))) {
                    const masterUnitId = Number(pathParts[1]); // ID master AC unit
                    const propName = pathParts[2]; // Nama properti (maintenance_status, etc.)

                    const formPath = `items.${masterUnitId}.${propName}` as keyof typeof formSchema._type;
                    form.setError(formPath, { type: 'manual', message: message as string });
                } else {
                    // Handle general form errors (e.g., inspection_date, entity_id)
                    form.setError(key as keyof typeof formSchema._type, { type: 'manual', message: message as string });
                }
            });
        }
    }, [backendErrors, form]);

    // Fungsi yang dipanggil saat form disubmit
    const onSubmit = (values: z.infer<typeof formSchema>) => {
        // Transformasi data item agar sesuai dengan yang diharapkan backend
        const transformedItems = Object.entries(values.items)
            .map(([masterAcUnitId, data]) => ({
                master_ac_unit_id: Number(masterAcUnitId), // Ubah ID string menjadi number
                maintenance_status: data.maintenance_status || null,
                condition_status: data.condition_status || null,
                notes: data.notes || null,
            }))
            .filter(item => // Filter hanya item yang ada isinya
                item.maintenance_status !== null ||
                item.condition_status !== null ||
                item.notes !== null
            );

        if (transformedItems.length === 0) {
            alert('Mohon isi setidaknya satu item Inspeksi AC.');
            return;
        }

        // Kirim data ke backend
        router.post(route('inspection.ac.store'), {
            inspection_date: values.inspection_date,
            entity_id: Number(values.entity_id), // Kirim ID entitas sebagai number
            plant_id: Number(values.plant_id),   // Kirim ID plant sebagai number
            location_id: Number(values.location_id), // Kirim ID lokasi sebagai number
            notes: values.notes,
            items: transformedItems,
        }, {
            onSuccess: () => {
                showToast({ type: 'success', message: 'Inspeksi AC berhasil dibuat!' });
                // Inertia akan secara otomatis redirect karena controller mengembalikan redirect()->route()
            },
            onError: (errors) => {
                console.error('Terjadi kesalahan saat membuat inspeksi AC:', errors);
                showToast({ type: 'error', message: errors.message || 'Gagal membuat inspeksi AC. Cek konsol.' });
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Inspeksi AC" />
            <div className="space-y-6 p-4">
                <SectionHeader title="Buat Inspeksi AC" subtitle="Lengkapi data inspeksi AC baru di bawah ini." />

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

                                {/* Entitas */}
                                <FormField
                                    control={form.control}
                                    name="entity_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Entitas</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih Entitas" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {entities.map((ent) => (
                                                            <SelectItem key={ent.id} value={String(ent.id)}>
                                                                {ent.name} ({ent.entity_code})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Plant */}
                                <FormField
                                    control={form.control}
                                    name="plant_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Plant</FormLabel>
                                            <FormControl>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih Plant" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {plants.map((plt) => (
                                                            <SelectItem key={plt.id} value={String(plt.id)}>
                                                                {plt.name} ({plt.plant_code})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
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
                                                        <SelectValue placeholder="Pilih Lokasi" />
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

                                {/* Catatan Global Inspeksi */}
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2"> {/* Kolom penuh untuk catatan */}
                                            <FormLabel>Catatan Inspeksi Umum</FormLabel>
                                            <FormControl>
                                                <Input {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)} placeholder="Tulis catatan umum untuk inspeksi ini" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        {/* Bagian Tabel Item Inspeksi AC */}
                        <Card className="overflow-hidden">
                            <CardContent className="overflow-x-auto">
                                <h3 className="mb-4 text-lg font-semibold">Unit AC yang Diperiksa</h3>
                                <div className="w-full">
                                    <Table className="w-full table-fixed border-collapse whitespace-normal">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-10">No</TableHead>
                                                <TableHead className="w-24">Nomor AC</TableHead>
                                                <TableHead className="w-28">Kode Inventaris</TableHead>
                                                <TableHead className="w-20">Merek</TableHead>
                                                <TableHead className="w-32">Lokasi Ruangan</TableHead>
                                                <TableHead className="w-28">Status Perawatan</TableHead>
                                                <TableHead className="w-28">Kondisi</TableHead>
                                                <TableHead className="w-40">Catatan Item</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {masterAcUnits.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                                                        Tidak ada unit AC master ditemukan.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                masterAcUnits.map((unit, index) => {
                                                    const unitId = String(unit.id); // ID dari MasterAcUnit
                                                    return (
                                                        <TableRow key={unitId}>
                                                            <TableCell>{index + 1}</TableCell>
                                                            <TableCell>{unit.ac_number ?? '-'}</TableCell>
                                                            <TableCell>{unit.inventory_code ?? '-'}</TableCell>
                                                            <TableCell>{unit.brand ?? '-'}</TableCell>
                                                            <TableCell>{unit.room ?? '-'}</TableCell>
                                                            <TableCell>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`items.${unitId}.maintenance_status`}
                                                                    render={({ field }) => (
                                                                        <Select value={String(field.value ?? '')} onValueChange={(val) => field.onChange(val === '' ? null : val)}>
                                                                            <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                                                                            <SelectContent>
                                                                                {maintenanceStatuses.map((status) => (
                                                                                    <SelectItem key={status.value} value={status.value}>{status.name}</SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    )}
                                                                />
                                                                <FormMessage>{form.formState.errors.items?.[unitId]?.maintenance_status?.message}</FormMessage>
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`items.${unitId}.condition_status`}
                                                                    render={({ field }) => (
                                                                        <Select value={String(field.value ?? '')} onValueChange={(val) => field.onChange(val === '' ? null : val)}>
                                                                            <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                                                                            <SelectContent>
                                                                                {conditionTypes.map((condition) => (
                                                                                    <SelectItem key={condition.value} value={condition.value}>{condition.name}</SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    )}
                                                                />
                                                                <FormMessage>{form.formState.errors.items?.[unitId]?.condition_status?.message}</FormMessage>
                                                            </TableCell>
                                                            <TableCell>
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`items.${unitId}.notes`}
                                                                    render={({ field }) => (
                                                                        <Input {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)} placeholder="Catatan..." />
                                                                    )}
                                                                />
                                                                <FormMessage>{form.formState.errors.items?.[unitId]?.notes?.message}</FormMessage>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tombol Submit */}
                        <div className="flex justify-start">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Menyimpan...' : 'Buat Inspeksi AC'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}