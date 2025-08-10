import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { BreadcrumbItem } from '@/types';
import { useWatch } from 'react-hook-form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {showToast} from "@/components/ui/toast";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi APD', href: '/inspection/ppe' },
    { title: 'Buat', href: '/inspection/ppe/create' },
];

const formSchema = z.object({
    inspection_date: z.string().min(1, { message: 'Inspection date is required' }),
    location: z.string().min(1, { message: 'Location is required' }),
    job_description: z.string().min(1, { message: 'Job description is required' }),
    project_name: z.string().min(1, { message: 'Project name is required' }),
    items: z.record(
        z.object({
            good_condition: z.string().optional(),   // Kondisi: Baik
            bad_condition: z.string().optional(),    // Kondisi: Rusak
            used: z.string().optional(),             // Pemakaian: Terpakai
            unused: z.string().optional(),           // Pemakaian: Tidak Terpakai
            notes: z.string().optional(),            // Keterangan
        })
    ),
});

export default function CreatePpeInspection() {
    const [showFindingModal, setShowFindingModal] = useState(false);
    const [newInspectionCode, setNewInspectionCode] = useState<string | null>(null);

    const {
        errors = {},
        ppeItems = [],
    } = usePage().props as unknown as {
        errors: Record<string, string>;
        ppeItems: Array<{ id: string; apd_name: string; inspection_criteria: string }>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            inspection_date: '',
            location: '',
            job_description: '',
            project_name: '',
            items: ppeItems.reduce((acc, item) => {
                acc[item.id] = {
                    good_condition: '',     // input Kondisi: Baik
                    bad_condition: '',      // input Kondisi: Rusak
                    used: '',               // input Terpakai
                    unused: '',             // input Tidak Terpakai
                    notes: ''               // input Keterangan
                };
                return acc;
            }, {} as Record<
                string,
                {
                    good_condition: string;
                    bad_condition: string;
                    used: string;
                    unused: string;
                    notes: string;
                }
            >)
        },
    });

    const JumlahCell = ({ control, itemId }: { control: any; itemId: number }) => {
        const watched = useWatch({
            control,
            name: `items.${itemId}`,
        });

        const good = parseInt(watched?.good_condition || 0, 10);
        const bad = parseInt(watched?.bad_condition || 0, 10);
        const total = good + bad;

        return <span className="text-sm font-semibold">{total}</span>;
    };

    // Handle error dari server (validasi Laravel)
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
        const transformedItems = Object.entries(values.items).map(([id, data]) => ({
            id,
            ...data,
        }));

        router.post(route('inspection.ppe.store'), {
            ...values,
            items: transformedItems,
        }, {
            onSuccess: (page) => {
                // Cek apakah ada item dengan bad_condition > 0
                const hasFindings = transformedItems.some(item =>
                    Number(item.bad_condition) > 0
                );

                if (hasFindings) {
                    const ppeInspectionCode = page.props.ppeInspectionCode;

                    console.log("ppeInspectionCode", ppeInspectionCode);

                    if (ppeInspectionCode) {
                        setNewInspectionCode(ppeInspectionCode.toString());
                        setShowFindingModal(true);
                    } else {
                        toast.error("Gagal mendapatkan kode inspeksi dari server.");
                    }
                } else {
                    router.visit('/inspection/ppe', {
                        onSuccess: () => {
                            showToast({ type: 'success', message: 'PPE inspection data has been saved successfully' });
                        },
                    });
                }
            }
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create PPE Inspection" />
            <div className="space-y-6 p-4">
                <SectionHeader title="Buat Inspeksi APD" subtitle="Lengkapi data inspeksi APD di bawah ini" />

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

                                {/* Lokasi/Nama Pemilik */}
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Lokasi/Nama Pemilik</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Masukkan lokasi / nama pemilik" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Deskripsi Pekerjaan */}
                                <FormField
                                    control={form.control}
                                    name="job_description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Deskripsi Pekerjaan</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Masukkan deskripsi pekerjaan" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Nama Proyek */}
                                <FormField
                                    control={form.control}
                                    name="project_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Proyek</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Masukkan nama proyek" />
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
                                    <Table className="w-full table-auto border-collapse text-sm whitespace-normal">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead
                                                    rowSpan={2}
                                                    className="w-14 border bg-gray-100 p-1 text-center align-middle text-sm leading-tight"
                                                >
                                                    No
                                                </TableHead>
                                                <TableHead
                                                    rowSpan={2}
                                                    className="w-32 border bg-gray-100 p-1 text-center align-middle text-sm leading-tight"
                                                >
                                                    Nama APD
                                                </TableHead>
                                                <TableHead
                                                    rowSpan={2}
                                                    className="w-48 border bg-gray-100 p-1 text-center align-middle text-sm leading-tight"
                                                >
                                                    Kriteria Inspeksi
                                                </TableHead>

                                                {/* Kondisi */}
                                                <TableHead
                                                    colSpan={2}
                                                    className="w-32 border bg-gray-100 p-1 text-center align-middle text-sm leading-tight"
                                                >
                                                    Kondisi
                                                </TableHead>

                                                {/* Pemakaian APD */}
                                                <TableHead
                                                    colSpan={2}
                                                    className="w-32 border bg-gray-100 p-1 text-center align-middle text-sm leading-tight"
                                                >
                                                    Pemakaian APD
                                                </TableHead>

                                                <TableHead
                                                    rowSpan={2}
                                                    className="w-20 border bg-gray-100 p-1 text-center align-middle text-sm leading-tight"
                                                >
                                                    Jumlah
                                                </TableHead>
                                                <TableHead
                                                    rowSpan={2}
                                                    className="w-64 border bg-gray-100 p-1 text-center align-middle text-sm leading-tight"
                                                >
                                                    Keterangan
                                                </TableHead>
                                            </TableRow>

                                            <TableRow>
                                                {/* Subkolom Kondisi */}
                                                <TableHead className="w-16 border bg-green-100 p-1 text-center text-sm leading-tight">Baik</TableHead>
                                                <TableHead className="w-16 border bg-red-100 p-1 text-center text-sm leading-tight">Rusak</TableHead>

                                                {/* Subkolom Pemakaian */}
                                                <TableHead className="w-16 border bg-yellow-100 p-1 text-center text-sm leading-tight">
                                                    Terpakai
                                                </TableHead>
                                                <TableHead className="w-16 border bg-blue-100 p-1 text-center text-sm leading-tight">
                                                    Tidak Terpakai
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {ppeItems.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    {/* No */}
                                                    <TableCell className="border text-center align-middle">{index + 1}</TableCell>

                                                    {/* Nama APD */}
                                                    <TableCell className="border align-middle whitespace-normal">{item.apd_name}</TableCell>

                                                    {/* Kriteria Inspeksi */}
                                                    <TableCell className="border align-middle whitespace-normal">
                                                        {item.inspection_criteria}
                                                    </TableCell>

                                                    {/* Kondisi: Baik */}
                                                    <TableCell className="border text-center align-middle">
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${item.id}.good_condition`}
                                                            render={({ field }) => (
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    className="h-9 w-16 min-w-0 px-2 py-1 text-sm leading-tight"
                                                                    placeholder="0"
                                                                />
                                                            )}
                                                        />
                                                    </TableCell>

                                                    {/* Kondisi: Rusak */}
                                                    <TableCell className="border text-center align-middle">
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${item.id}.bad_condition`}
                                                            render={({ field }) => (
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    className="h-9 w-16 min-w-0 px-2 py-1 text-sm leading-tight"
                                                                    placeholder="0"
                                                                />
                                                            )}
                                                        />
                                                    </TableCell>

                                                    {/* Pemakaian: Terpakai */}
                                                    <TableCell className="border text-center align-middle">
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${item.id}.used`}
                                                            render={({ field }) => (
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    className="h-9 w-16 min-w-0 px-2 py-1 text-sm leading-tight"
                                                                    placeholder="0"
                                                                />
                                                            )}
                                                        />
                                                    </TableCell>

                                                    {/* Pemakaian: Tidak Terpakai */}
                                                    <TableCell className="border text-center align-middle">
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${item.id}.unused`}
                                                            render={({ field }) => (
                                                                <Input
                                                                    type="number"
                                                                    {...field}
                                                                    className="h-9 w-16 min-w-0 px-2 py-1 text-sm leading-tight"
                                                                    placeholder="0"
                                                                />
                                                            )}
                                                        />
                                                    </TableCell>

                                                    {/* Jumlah */}
                                                    <TableCell className="border text-center align-middle">
                                                        <JumlahCell control={form.control} itemId={parseInt(item.id, 10)} />
                                                    </TableCell>

                                                    {/* Keterangan */}
                                                    <TableCell className="border align-middle">
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${item.id}.notes`}
                                                            render={({ field }) => (
                                                                <Input
                                                                    type="text"
                                                                    {...field}
                                                                    className="h-9 w-full px-2 py-1 text-sm leading-tight"
                                                                    placeholder="Keterangan..."
                                                                />
                                                            )}
                                                        />
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
                                {form.formState.isSubmitting ? 'Creating...' : 'Submit Data'}
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
                                onClick={() => {
                                    router.visit('/inspection/ppe', {
                                        onSuccess: () => {
                                            showToast({
                                                type: 'success',
                                                message: 'PPE inspection data has been saved successfully',
                                            });
                                        },
                                    });
                                }}
                            >
                                Nanti saja
                            </Button>
                            <Button onClick={() => router.visit(`/finding/create?inspection=APD&inspection_code=${newInspectionCode}`)}>
                                Ya, Buat Temuan
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
