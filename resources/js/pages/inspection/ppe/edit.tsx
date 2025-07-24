import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router } from '@inertiajs/react';
import * as z from 'zod';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/section-header';
import { Card, CardContent } from '@/components/ui/card';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { BreadcrumbItem } from '@/types';
import { useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type PpeItem = {
    id: number;
    apd_name: string;
    inspection_criteria: string;
};

type PpeInspectionItem = {
    ppe_check_item_id: number;
    good_condition: number;
    bad_condition: number;
    used: number;
    unused: number;
    notes: string;
};

type PpeInspection = {
    uuid: string;
    inspection_date: string;
    location: string;
    job_description?: string;
    project_name?: string;
    items: PpeInspectionItem[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi APD', href: '/inspection/ppe' },
    { title: 'Ubah', href: '#' },
];

const formSchema = z.object({
    inspection_date: z.string().min(1, 'Tanggal wajib diisi'),
    location: z.string().min(1, 'Lokasi wajib diisi'),
    job_description: z.string().optional(),
    project_name: z.string().optional(),
    items: z.record(
        z.object({
            id: z.number().optional(),
            good_condition: z.coerce.number().min(0, 'Minimal 0'),
            bad_condition: z.coerce.number().min(0, 'Minimal 0'),
            used: z.coerce.number().min(0, 'Minimal 0'),
            unused: z.coerce.number().min(0, 'Minimal 0'),
            notes: z.string().optional(),
        })
    ),
});

type FormSchema = z.infer<typeof formSchema>;

export default function EditPpeInspection({
                                              ppeItems,
                                              ppeInspection,
                                          }: {
    ppeItems: PpeItem[];
    ppeInspection: PpeInspection;
}) {
    const transformed = {
        uuid: ppeInspection.uuid,
        inspection_date: ppeInspection.inspection_date,
        location: ppeInspection.location,
        job_description: ppeInspection.job_description ?? '',
        project_name: ppeInspection.project_name ?? '',
        items: (ppeInspection.items ?? []).reduce((acc: Record<string, any>, item) => {
            acc[item.ppe_check_item_id] = {
                id: item.ppe_check_item_id,
                good_condition: item.good_condition ?? 0,
                bad_condition: item.bad_condition ?? 0,
                used: item.used ?? 0,
                unused: item.unused ?? 0,
                notes: item.notes ?? '',
            };
            return acc;
        }, {}),
    };

    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        defaultValues: transformed,
    });

    const JumlahCell = ({ control, itemId }: { control: any; itemId: number }) => {
        const watched = useWatch({
            control,
            name: `items.${itemId}`,
        });

        const good = Number(watched?.good_condition ?? 0);
        const bad = Number(watched?.bad_condition ?? 0);
        return <span className="text-sm font-semibold">{good + bad}</span>;
    };

    useEffect(() => {
        console.log('🔍 Form Errors:', form.formState.errors);
    }, [form.formState.errors]);

    const onSubmit = (data: FormSchema) => {
        router.put(route('inspection.ppe.update', ppeInspection.uuid), data, {
            onError: (errors) => console.error('❌ Submit Error:', errors),
            onSuccess: () => console.log('✅ Submit Success'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit PPE Inspection" />
            <div className="space-y-6 p-4">
                <SectionHeader title="Ubah Inspeksi APD" subtitle="Perbarui data inspeksi APD di bawah ini" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
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
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lokasi/Nama Pemilik</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Masukkan lokasi/nama pemilik" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="job_description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Deskripsi Pekerjaan</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Masukkan deskripsi" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="project_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Proyek</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Masukkan nama proyek" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden">
                            <CardContent className="overflow-x-auto">
                                <Table className="w-full table-auto border-collapse text-sm whitespace-normal">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead rowSpan={2} className="w-14 border bg-gray-100 text-center align-middle text-sm leading-tight p-1">
                                                No
                                            </TableHead>
                                            <TableHead rowSpan={2} className="w-32 border bg-gray-100 text-center align-middle text-sm leading-tight p-1">
                                                Nama APD
                                            </TableHead>
                                            <TableHead rowSpan={2} className="w-48 border bg-gray-100 text-center align-middle text-sm leading-tight p-1">
                                                Kriteria Inspeksi
                                            </TableHead>

                                            {/* Kondisi */}
                                            <TableHead colSpan={2} className="w-32 border bg-gray-100 text-center align-middle text-sm leading-tight p-1">
                                                Kondisi
                                            </TableHead>

                                            {/* Pemakaian APD */}
                                            <TableHead colSpan={2} className="w-32 border bg-gray-100 text-center align-middle text-sm leading-tight p-1">
                                                Pemakaian APD
                                            </TableHead>

                                            <TableHead rowSpan={2} className="w-20 border bg-gray-100 text-center align-middle text-sm leading-tight p-1">
                                                Jumlah
                                            </TableHead>
                                            <TableHead rowSpan={2} className="w-64 border bg-gray-100 text-center align-middle text-sm leading-tight p-1">
                                                Keterangan
                                            </TableHead>
                                        </TableRow>

                                        <TableRow>
                                            {/* Subkolom Kondisi */}
                                            <TableHead className="w-16 border bg-green-100 text-center text-sm leading-tight p-1">
                                                Baik
                                            </TableHead>
                                            <TableHead className="w-16 border bg-red-100 text-center text-sm leading-tight p-1">
                                                Rusak
                                            </TableHead>

                                            {/* Subkolom Pemakaian */}
                                            <TableHead className="w-16 border bg-yellow-100 text-center text-sm leading-tight p-1">
                                                Terpakai
                                            </TableHead>
                                            <TableHead className="w-16 border bg-blue-100 text-center text-sm leading-tight p-1">
                                                Tidak Terpakai
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {ppeItems.map((item, index) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="border text-center">{index + 1}</TableCell>
                                                <TableCell className="border whitespace-normal align-middle">{item.apd_name}</TableCell>
                                                <TableCell className="border whitespace-normal align-middle">{item.inspection_criteria}</TableCell>
                                                {['good_condition', 'bad_condition', 'used', 'unused'].map((fieldKey) => (
                                                    <TableCell key={fieldKey} className="border text-center">
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${item.id}.${fieldKey}` as any}
                                                            render={({ field }) => (
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    className="w-16 text-sm"
                                                                    min={0}
                                                                />
                                                            )}
                                                        />
                                                    </TableCell>
                                                ))}
                                                <TableCell className="border text-center">
                                                    <JumlahCell control={form.control} itemId={item.id} />
                                                </TableCell>
                                                <TableCell>
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${item.id}.notes`}
                                                        render={({ field }) => (
                                                            <Input
                                                                type="text"
                                                                {...field}
                                                                className="w-full text-sm"
                                                                placeholder="Keterangan..."
                                                            />
                                                        )}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Updating...' : 'Update Data'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
