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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showToast } from '@/components/ui/toast';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi K3L', href: '/inspection/k3l' },
    { title: 'Edit', href: '#' },
];

const formSchema = z.object({
    uuid: z.string().optional(),
    inspection_date: z.string().min(1, { message: 'Tanggal inspeksi wajib diisi' }),
    location_id: z.string().min(1, { message: 'Lokasi wajib diisi' }),
    items: z.record(
        z.object({
            condition: z.string().optional(),
            note: z.string().optional(),
        }),
    ),
});

export default function EditK3LInspection({
          k3lInspection,
          locations,
    }: {
    k3lInspection: {
        id: number;
        uuid: string;
        inspection_date: string;
        location: { id: number; name: string };
        items: Array<{
            id: number;
            master_k3l_master_k3l_description_id: string;
            condition: string;
            note: string;
            master_k3l_description: {
                id: string;
                description: string;
                master_k3l_id: string;
                master_k3l: {
                    id: string;
                    objective: string;
                };
            };
        }>;
    };
    locations: Array<{ id: number; name: string }>;
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            uuid: k3lInspection.uuid,
            inspection_date: k3lInspection.inspection_date,
            location_id: k3lInspection.location.id.toString(),
            items: k3lInspection.items.reduce((acc, item) => {
                const id = String(item.master_k3l_description?.id);
                acc[id] = {
                    condition: item.condition ?? '',
                    note: item.note ?? '',
                };
                return acc;
            }, {} as Record<string, { condition: string; note: string }>),
        },
    });

    const { flash } = usePage().props as {
        flash?: { success?: string; error?: string; message?: string };
    };

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

    const groupedItems = Object.values(
        k3lInspection.items.reduce((acc, item) => {
            const key = item.master_k3l_description.master_k3l_id;
            const objective = item.master_k3l_description.master_k3l.objective;
            if (!acc[key]) {
                acc[key] = { title: objective, items: [] };
            }
            acc[key].items.push(item);
            return acc;
        }, {} as Record<string, { title: string; items: typeof k3lInspection.items }>),
    );

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const items = Object.entries(values.items).map(([id, data]) => ({
            master_k3l_description_id: id,
            ...data,
        }));

        router.put(route('inspection.k3l.update', k3lInspection.uuid), {
            inspection_date: values.inspection_date,
            location_id: values.location_id,
            items,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Inspeksi K3L" />
            <div className="space-y-6 p-4">
                <SectionHeader title="Edit Inspeksi K3L" subtitle="Ubah data inspeksi dan hasil pengecekan K3L." />

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
                                                        {locations.map((loc) => (
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
                                {/* ✅ DESKTOP */}
                                <div className="hidden md:block">
                                    <Table className="w-full min-w-[700px] table-fixed border-collapse whitespace-normal">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-10">#</TableHead>
                                                <TableHead className="min-w-[300px]">Tujuan & Deskripsi</TableHead>
                                                <TableHead className="w-24 text-center">Ya</TableHead>
                                                <TableHead className="w-24 text-center">Tidak</TableHead>
                                                <TableHead className="w-24 text-center">N/A</TableHead>
                                                <TableHead className="min-w-[150px]">Catatan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {groupedItems.map((group, index) => (
                                                <React.Fragment key={`group-${index}`}>
                                                    {group.items.map((item, subIndex) => {
                                                        const dataKey = String(item.master_k3l_description.id);
                                                        return (
                                                            <TableRow key={`item-${dataKey}-${subIndex}`}>
                                                                <TableCell>{subIndex === 0 ? index + 1 : ''}</TableCell>
                                                                <TableCell className="align-top text-sm whitespace-pre-line">
                                                                    {subIndex === 0 && <div className="font-semibold">{group.title}</div>}
                                                                    <div className="pl-2">
                                                                        {`${String.fromCharCode(97 + subIndex)}. ${item?.master_k3l_description?.description ?? '-'}`}
                                                                    </div>
                                                                </TableCell>
                                                                {['Ya', 'Tidak', 'N/A'].map((option) => (
                                                                    <TableCell key={`radio-${dataKey}-${option}`} className="text-center align-top">
                                                                        <FormField
                                                                            control={form.control}
                                                                            name={`items.${dataKey}.condition`}
                                                                            render={({ field }) => {
                                                                                const isChecked = field.value === option;
                                                                                return (
                                                                                    <label className="flex flex-col items-center gap-1">
                                                                                        <input
                                                                                            type="radio"
                                                                                            value={option}
                                                                                            checked={isChecked}
                                                                                            onChange={() => field.onChange(option)}
                                                                                            className="form-radio"
                                                                                        />
                                                                                        <span className="text-xs">{option}</span>
                                                                                    </label>
                                                                                );
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                ))}
                                                                <TableCell className="align-top">
                                                                    <FormField
                                                                        control={form.control}
                                                                        name={`items.${dataKey}.note`}
                                                                        render={({ field }) => (
                                                                            <Input {...field} placeholder="Catatan..." />
                                                                        )}
                                                                    />
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* ✅ MOBILE */}
                                <div className="block md:hidden">
                                    <Table className="w-full table-fixed border-collapse whitespace-normal">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-10">#</TableHead>
                                                <TableHead>Tujuan, Deskripsi & Jawaban</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {groupedItems.map((group, index) => (
                                                <React.Fragment key={`group-mobile-${index}`}>
                                                    {group.items.map((item, subIndex) => {
                                                        const dataKey = String(item.master_k3l_description.id);
                                                        return (
                                                            <TableRow key={`item-mobile-${dataKey}-${subIndex}`}>
                                                                <TableCell className="align-top">
                                                                    {subIndex === 0 ? index + 1 : ''}
                                                                </TableCell>
                                                                <TableCell className="align-top text-sm whitespace-pre-line">
                                                                    {subIndex === 0 && <div className="font-semibold">{group.title}</div>}
                                                                    <div className="pl-2">
                                                                        {`${String.fromCharCode(97 + subIndex)}. ${item?.master_k3l_description?.description ?? '-'}`}
                                                                    </div>
                                                                    <div className="pl-2 pt-2 space-y-2">
                                                                        <div className="flex gap-4">
                                                                            {['Ya', 'Tidak', 'N/A'].map((option) => (
                                                                                <label key={`mobile-radio-${dataKey}-${option}`} className="inline-flex items-center gap-1">
                                                                                    <FormField
                                                                                        control={form.control}
                                                                                        name={`items.${dataKey}.condition`}
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
                                                                            name={`items.${dataKey}.note`}
                                                                            render={({ field }) => (
                                                                                <Input {...field} placeholder="Catatan..." />
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            ))}
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
