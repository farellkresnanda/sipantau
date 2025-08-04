'use client';

import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

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
import type { BreadcrumbItem, PageProps } from '@/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi P3K', href: '/inspection/first-aid' },
    { title: 'Buat', href: '/inspection/first-aid/create' },
];

const formSchema = z.object({
    inspection_date: z.string().min(1, { message: 'Tanggal inspeksi harus diisi' }),
    location_id: z.string().min(1, { message: 'Lokasi harus dipilih' }),
    project_name: z.string().nullable(),
    entity_code: z.string().nullable(),
    plant_code: z.string().nullable(),
    items: z.record(
        z.object({
            quantity: z.preprocess(
                (val) => (val === '' || val === null ? null : Number(val)),
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

// ✅ PERBAIKAN: Mendefinisikan tipe data yang lebih spesifik untuk props
interface Location {
    id: number;
    location: string;
    inventory_code: string;
    entity_code: string;
    plant_code: string;
    entityData?: { id: number; entity_code: string; name?: string };
    plantData?: { id: number; plant_code: string; name?: string };
}

interface FirstAidItem {
    id: number;
    item_name: string;
    standard_quantity: string;
    unit?: string;
}

interface Condition {
    id: number;
    name: string;
}

interface CreatePageProps extends PageProps {
    locations: Location[];
    firstAidItems: FirstAidItem[];
    conditions: Condition[];
    firstAidInspectionUuid?: string;
    firstAidInspectionCode?: string;
    success?: string;
}

export default function CreateFirstAidInspection() {
    const [showFindingModal, setShowFindingModal] = useState(false);
    const [newInspectionCode, setNewInspectionCode] = useState<string | null>(null);
    const [findingDescription, setFindingDescription] = useState<string>('');

    // ✅ PERBAIKAN: Menggunakan tipe CreatePageProps yang sudah didefinisikan
    const { errors = {}, locations = [], firstAidItems = [], conditions = [] } = usePage<CreatePageProps>().props;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            inspection_date: '',
            location_id: '',
            project_name: '',
            entity_code: null,
            plant_code: null,
            // ✅ PERBAIKAN: Menambahkan tipe pada parameter reduce
            items: firstAidItems.reduce((acc: Record<string, any>, item: FirstAidItem) => {
                acc[item.id] = { quantity: null, condition: null, expired_at: null, note: null };
                return acc;
            }, {}),
        },
    });

    const selectedLocation = locations.find((loc) => String(loc.id) === form.watch('location_id'));

    useEffect(() => {
        if (selectedLocation) {
            form.setValue('entity_code', selectedLocation.entityData?.entity_code ?? selectedLocation.entity_code);
            form.setValue('plant_code', selectedLocation.plantData?.plant_code ?? selectedLocation.plant_code);
        } else {
            form.setValue('entity_code', null);
            form.setValue('plant_code', null);
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
        const today = new Date().toISOString().split("T")[0];

        const findings: string[] = [];
        Object.entries(values.items).forEach(([itemId, item]) => {
            if (!item) return;
            const masterItem = firstAidItems.find((i) => String(i.id) === itemId);
            if (!masterItem) return;

            const qtyKurang = typeof item.quantity === 'number' && item.quantity < Number(masterItem.standard_quantity);
            const kondisiBermasalah = item.condition === 'Rusak' || item.condition === 'N/A';
            const kadaluarsa = item.expired_at && item.expired_at < today;

            if (qtyKurang) findings.push(`${masterItem.item_name} kurang (standar: ${masterItem.standard_quantity}, ditemukan: ${item.quantity})`);
            if (kondisiBermasalah) findings.push(`${masterItem.item_name} dalam kondisi ${item.condition}`);
            if (kadaluarsa) findings.push(`${masterItem.item_name} kadaluarsa (tanggal: ${item.expired_at})`);
        });
        
        const hasFindings = findings.length > 0;
        const detailedFindingDescription = findings.join(', ');

        const transformedItems = Object.entries(values.items)
            .map(([masterItemId, data]) => ({
                first_aid_check_item_id: Number(masterItemId),
                quantity_found: data.quantity ?? 0,
                condition_id: data.condition ? conditions.find(cond => cond.name === data.condition)?.id : null,
                expired_at: data.expired_at || null,
                note: data.note || null,
            }))
            .filter(item =>
                item.quantity_found > 0 || item.condition_id !== null || item.expired_at !== null || item.note !== null
            );

        if (transformedItems.length === 0) {
            toast.error('Mohon isi setidaknya satu item inspeksi.');
            return;
        }

        router.post(route('inspection.first-aid.store'), {
            inspection_date: values.inspection_date,
            location_id: Number(values.location_id),
            project_name: values.project_name,
            entity_code: values.entity_code,
            plant_code: values.plant_code,
            items: transformedItems,
        }, {
            onSuccess: (page) => {
                // ✅ PERBAIKAN: Menggunakan 'as unknown' untuk mengatasi ketidakcocokan tipe TypeScript
                const pageProps = page.props as unknown as CreatePageProps;
                if (pageProps.success) {
                    toast.success(pageProps.success);
                }

                if (hasFindings) {
                    const inspectionCode = pageProps.firstAidInspectionCode;

                    if (inspectionCode) {
                        setNewInspectionCode(inspectionCode);
                        const findingText = `Isi Temuan untuk inspeksi P3K (${inspectionCode}) pada Tanggal (${values.inspection_date}): ${detailedFindingDescription}`;
                        setFindingDescription(findingText);
                        setShowFindingModal(true);
                    } else {
                        toast.error("Gagal mendapatkan data inspeksi dari server.");
                    }
                } else {
                    router.visit('/inspection/first-aid');
                }
            },
            onError: (backendErrors) => {
                console.error('Gagal menyimpan inspeksi:', backendErrors);
                toast.error('Gagal menyimpan inspeksi. Periksa kembali data Anda.');
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
                            <CardContent className="grid grid-cols-1 gap-4 pt-6 md:grid-cols-2">
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
                                                    onValueChange={field.onChange}
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
                            <CardContent className="overflow-x-auto p-0">
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

                <Dialog open={showFindingModal} onOpenChange={setShowFindingModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Temuan Ditemukan</DialogTitle>
                            <DialogDescription>
                                Ada item yang tidak sesuai dalam inspeksi P3K ini. Buat form temuan sekarang?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => router.visit('/inspection/first-aid')}>
                                Nanti saja
                            </Button>
                            <Button onClick={() => router.visit(`/finding/create?inspection=P3K&inspection_code=${encodeURIComponent(newInspectionCode || '')}&description=${encodeURIComponent(findingDescription)}`)}>
                                Ya, Buat Temuan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}