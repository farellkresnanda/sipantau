'use client';

import { Head, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { showToast } from '@/components/ui/toast';
import type { BreadcrumbItem } from '@/types';

interface CreateAcInspectionProps {
    masterAcs: Array<{ id: number; inventory_code: string; merk: string; room: string; }>;
    errors: Record<string, string>;
}

const formSchema = z.object({
    inspection_date: z.string().min(1, "Tanggal wajib diisi."),
    master_ac_id: z.string({ required_error: "Lokasi AC wajib dipilih." }).min(1, "Lokasi AC wajib dipilih."),
    maintenance_status: z.string({ required_error: "Status wajib dipilih." }),
    condition_status: z.string({ required_error: "Kondisi wajib dipilih." }),
    notes: z.string().nullable(),
});

export default function CreateAcInspectionPage({ masterAcs, errors }: CreateAcInspectionProps) {
    const [selectedAc, setSelectedAc] = useState<CreateAcInspectionProps['masterAcs'][0] | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            inspection_date: format(new Date(), 'yyyy-MM-dd'),
            notes: '',
        },
    });

    const watchedAcId = form.watch('master_ac_id');

    useEffect(() => {
        if (watchedAcId) {
            const ac = masterAcs.find(a => String(a.id) === watchedAcId);
            setSelectedAc(ac || null);
        } else {
            setSelectedAc(null);
        }
    }, [watchedAcId, masterAcs]);

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([key, message]) => {
                form.setError(key as any, { type: 'manual', message });
            });
            showToast({ type: 'error', message: 'Silakan periksa kembali isian form Anda.'});
        }
    }, [errors, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        router.post(route('inspection.ac.store'), values);
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Home', href: route('home') },
        { title: 'Laporan Inspeksi AC', href: route('inspection.ac.index') },
        { title: 'Buat Baru', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Inspeksi AC Baru" />
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <SectionHeader 
                    title="Buat Inspeksi AC Baru" 
                    subtitle="Buat data temuan baru dan lengkapi formulir di bawah ini dengan data yang dibutuhkan."
                />
                
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                                <FormField name="inspection_date" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tanggal Inspeksi</FormLabel>
                                        {/* [REVISI] Tambahkan className="w-full" */}
                                        <FormControl><Input type="date" className="w-full" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField name="master_ac_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Lokasi AC</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                {/* [REVISI] Tambahkan className="w-full" */}
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih Lokasi AC..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {masterAcs.map(ac => <SelectItem key={ac.id} value={String(ac.id)}>{ac.room}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormItem>
                                    <FormLabel>Kode Inventaris</FormLabel>
                                    {/* [REVISI] Tambahkan className="w-full" */}
                                    <Input className="w-full" value={selectedAc?.inventory_code ?? 'Pilih Lokasi AC terlebih dahulu'} readOnly />
                                </FormItem>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="overflow-x-auto pt-2">
                                <Table className="border">
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead colSpan={2} className="border bg-yellow-300 text-center font-bold text-black">Status</TableHead>
                                            <TableHead colSpan={2} className="border bg-yellow-300 text-center font-bold text-black">Kondisi</TableHead>
                                            <TableHead rowSpan={2} className="border bg-yellow-300 align-middle text-center font-bold text-black w-auto">Keterangan</TableHead>
                                        </TableRow>
                                        <TableRow>
                                            <TableHead className="border bg-yellow-100 text-center w-[120px]">Perbaikan</TableHead>
                                            <TableHead className="border bg-yellow-100 text-center w-[120px]">Perawatan</TableHead>
                                            <TableHead className="border bg-yellow-100 text-center w-[120px]">Baik</TableHead>
                                            <TableHead className="border bg-yellow-100 text-center w-[120px]">Rusak</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell className="border text-center">
                                                <FormField name="maintenance_status" render={({ field }) => (
                                                    <FormControl><Checkbox className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-600" checked={field.value === 'Perbaikan'} onCheckedChange={() => field.onChange('Perbaikan')} /></FormControl>
                                                )}/>
                                            </TableCell>
                                            <TableCell className="border text-center">
                                                <FormField name="maintenance_status" render={({ field }) => (
                                                    <FormControl><Checkbox className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-600" checked={field.value === 'Perawatan'} onCheckedChange={() => field.onChange('Perawatan')} /></FormControl>
                                                )}/>
                                            </TableCell>
                                            <TableCell className="border text-center">
                                                <FormField name="condition_status" render={({ field }) => (
                                                    <FormControl><Checkbox className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-600" checked={field.value === 'Baik'} onCheckedChange={() => field.onChange('Baik')} /></FormControl>
                                                )}/>
                                            </TableCell>
                                            <TableCell className="border text-center">
                                                <FormField name="condition_status" render={({ field }) => (
                                                    <FormControl><Checkbox className="data-[state=checked]:bg-red-500 data-[state=checked]:border-red-600" checked={field.value === 'Rusak'} onCheckedChange={() => field.onChange('Rusak')} /></FormControl>
                                                )}/>
                                            </TableCell>
                                            <TableCell className="border">
                                                <FormField name="notes" render={({ field }) => (
                                                     <FormControl><Textarea placeholder="Catatan inspeksi..." {...field} value={field.value ?? ''} /></FormControl>
                                                )}/>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                                 <div className="pt-2 text-red-600 text-sm">
                                     <FormMessage>{form.formState.errors.maintenance_status?.message}</FormMessage>
                                     <FormMessage>{form.formState.errors.condition_status?.message}</FormMessage>
                                 </div>
                            </CardContent>
                        </Card>
                        
                        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto" size="lg">
                            {form.formState.isSubmitting ? "Menyimpan..." : "Simpan Inspeksi"}
                        </Button>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}