import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { showToast } from '@/components/ui/toast';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi K3L', href: '/inspection/k3l' },
    { title: 'Buat', href: '/inspection/k3l/create' },
];

const formSchema = z.object({
    inspection_date: z.string().min(1, { message: 'Tanggal inspeksi wajib diisi' }),
    location_id: z.string().min(1, { message: 'Lokasi wajib dipilih' }),
    note_validator: z.string().optional(),
    items: z.record(
        z.object({
            condition: z.string().optional(),
            note: z.string().optional(),
        }),
    ),
});

interface K3LItem {
    id: string;
    description: string;
    master_k3l_id?: string;
    created_at?: string;
    updated_at?: string;
}

type PageProps = {
    errors: Record<string, string>;
    locations: Array<{ id: string; name: string }>;
    k3lItems: Array<{
        key: string;
        title: string;
        items: K3LItem[];
    }>;
};

export default function CreateK3LInspection({ errors, locations, k3lItems }: PageProps) {
    const [showFindingModal, setShowFindingModal] = useState(false);
    const [newInspectionCode, setNewInspectionCode] = useState<string | null>(null);

    console.log({ k3lItems });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            inspection_date: '',
            location_id: '',
            items: Array.isArray(k3lItems)
                ? k3lItems.reduce((acc, group) => {
                    group.items.forEach((item) => {
                        acc[item.id] = { condition: '', note: '' };
                    });
                    return acc;
                }, {} as Record<string, { condition: string; note: string }>)
                : {},
        },
    });


    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as any, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const transformedItems = Object.entries(values.items).map(([id, data]) => ({
            master_k3l_description_id: id,
            ...data,
        }));

        const hasFinding = transformedItems.some(item => item.condition === "Tidak");

        router.post(route('inspection.k3l.store'), {
            ...values,
            items: transformedItems,
        }, {
            onSuccess: (page) => {
                if (hasFinding) {
                    const inspectionCode = page.props.k3lInspectionCode; // Sesuaikan nama props dari server

                    if (inspectionCode) {
                        setNewInspectionCode(inspectionCode.toString());
                        setShowFindingModal(true);
                    } else {
                        toast.error("Gagal mendapatkan kode inspeksi dari server.");
                    }
                } else {
                    showToast({
                        type: 'success',
                        message: 'K3L inspection data has been saved successfully',
                    });
                    router.visit('/inspection/k3l');
                }
            },
            onError: () => {
                toast.error('Gagal menyimpan data inspeksi K3L.');
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Inspeksi K3L" />
            <div className="space-y-6 p-4">
                <SectionHeader title="Buat Inspeksi K3L" subtitle="Isi data inspeksi dan hasil pengecekan K3L." />
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
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih lokasi" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {locations?.map((loc) => (
                                                            <SelectItem key={loc.id} value={String(loc.id)}>
                                                                {loc.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="overflow-x-auto">
                                {/* ✅ TAMPILAN DESKTOP */}
                                <div className="hidden md:block">
                                    <Table className="w-full min-w-[700px] table-fixed border-collapse whitespace-normal">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-10">#</TableHead>
                                                <TableHead className="min-w-[300px]">Tujuan & Deskripsi</TableHead>
                                                <TableHead className="w-24 text-center">Ya</TableHead>
                                                <TableHead className="w-24 text-center">Tidak</TableHead>
                                                <TableHead className="w-24 text-center">N/A</TableHead>
                                                <TableHead className="min-w-[200px]">Catatan</TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {k3lItems?.map((group, index) => (
                                                <React.Fragment key={group.key}>
                                                    {group.items?.map((item, subIndex) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="align-top">{subIndex === 0 ? index + 1 : ''}</TableCell>

                                                            <TableCell className="align-top text-sm whitespace-pre-line">
                                                                {subIndex === 0 && <div className="font-semibold">{group.title}</div>}
                                                                <div className="pl-2">
                                                                    {`${String.fromCharCode(97 + subIndex)}. ${item.description}`}
                                                                </div>
                                                            </TableCell>

                                                            {['Ya', 'Tidak', 'N/A'].map((option) => (
                                                                <TableCell key={option} className="text-center">
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`items.${item.id}.condition`}
                                                                        render={({ field }) => (
                                                                            <label className="flex flex-col items-center gap-1">
                                                                                <input
                                                                                    type="radio"
                                                                                    value={option}
                                                                                    checked={field.value === option}
                                                                                    onChange={() => field.onChange(option)}
                                                                                    className="form-radio"
                                                                                />
                                                                                <span className="text-xs">{option}</span>
                                                                            </label>
                                                                        )}
                                                                    />
                                                                </TableCell>
                                                            ))}

                                                            <TableCell className="align-top">
                                                                <FormField
                                                                    control={form.control}
                                                                    name={`items.${item.id}.note`}
                                                                    render={({ field }) => (
                                                                        <Input {...field} placeholder="Catatan" className="text-sm" />
                                                                    )}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* ✅ TAMPILAN MOBILE */}
                                <div className="block md:hidden">
                                    <Table className="w-full min-w-full table-fixed border-collapse whitespace-normal">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-10">#</TableHead>
                                                <TableHead>Tujuan & Deskripsi + Jawaban</TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {k3lItems?.map((group, index) => (
                                                <React.Fragment key={group.key}>
                                                    {group.items.map((item, subIndex) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell className="align-top">{subIndex === 0 ? index + 1 : ''}</TableCell>
                                                            <TableCell className="align-top text-sm whitespace-pre-line">
                                                                {subIndex === 0 && <div className="font-semibold">{group.title}</div>}
                                                                <div className="pl-2">
                                                                    {`${String.fromCharCode(97 + subIndex)}. ${item.description}`}
                                                                </div>
                                                                <div className="space-y-2 pt-2 pl-2">
                                                                    <div className="flex gap-4">
                                                                        {['Ya', 'Tidak', 'N/A'].map((option) => (
                                                                            <label key={option} className="inline-flex items-center gap-1">
                                                                                <FormField
                                                                                    control={form.control}
                                                                                    name={`items.${item.id}.condition`}
                                                                                    render={({ field }) => (
                                                                                        <>
                                                                                            <input
                                                                                                type="radio"
                                                                                                value={option}
                                                                                                checked={field.value === option}
                                                                                                onChange={() => field.onChange(option)}
                                                                                                className="form-radio"
                                                                                            />
                                                                                            <span className="text-xs">{option}</span>
                                                                                        </>
                                                                                    )}
                                                                                />
                                                                            </label>
                                                                        ))}
                                                                    </div>

                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`items.${item.id}.note`}
                                                                        render={({ field }) => (
                                                                            <Input {...field} placeholder="Catatan" className="text-sm" />
                                                                        )}
                                                                    />
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-start">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Menyimpan...' : 'Submit Data'}
                            </Button>
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
                                    router.visit('/inspection/k3l', {
                                        onSuccess: () => {
                                            showToast({ type: 'success', message: 'K3L inspection data saved successfully' });
                                        },
                                    })
                                }
                            >
                                Nanti saja
                            </Button>
                            <Button onClick={() => router.visit(`/finding/create?inspection=K3L&inspection_code=${newInspectionCode}`)}>
                                Ya, Buat Temuan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
