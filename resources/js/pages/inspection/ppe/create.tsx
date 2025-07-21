import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import type { BreadcrumbItem } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi APD', href: '/inspection/ppe' },
    { title: 'Buat', href: '/inspection/ppe/create' },
];

const formSchema = z.object({
    inspection_date: z.string().min(1, { message: 'Inspection date is required' }),
    location_id: z.string().min(1, { message: 'Location must be selected' }),
    job_description: z.string().min(1, { message: 'Job description is required' }),
    project_name: z.string().min(1, { message: 'Project name is required' }),
    items: z.record(z.object({
        condition: z.string().optional(),
        usage: z.string().optional(),
        quantity: z.string().optional(),
        notes: z.string().optional(),
    }))
});

export default function CreatePpeInspection() {
    const {
        errors = {},
        locations = [],
        ppeItems = [],
    } = usePage().props as unknown as {
        errors: Record<string, string>;
        locations: Array<{ id: string; name: string }>;
        ppeItems: Array<{ id: string; apd_name: string; inspection_criteria: string }>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            inspection_date: '',
            location_id: '',
            job_description: '',
            project_name: '',
            items: ppeItems.reduce((acc, item) => {
                acc[item.id] = { condition: '', usage: '', quantity: '', notes: '' };
                return acc;
            }, {} as Record<string, { condition: string; usage: string; quantity: string; notes: string }>)
        },
    });

    // Handle error dari server (validasi Laravel)
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([key, message]) => {
                form.setError(key as keyof typeof formSchema._type, {
                    type: 'manual',
                    message,
                });
            });
        }
    }, [errors, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const transformedItems = Object.entries(values.items).map(([id, data]) => ({
            id,
            ...data,
        }));

        router.post(route('inspection.ppe.store'), {
            ...values,
            items: transformedItems,
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
                                    <Table className="w-full table-fixed border-collapse whitespace-normal">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-14">No</TableHead>
                                                <TableHead className="w-32">Nama APD</TableHead>
                                                <TableHead className="w-48">Kriteria Inspeksi</TableHead>
                                                <TableHead className="w-28">Kondisi</TableHead>
                                                <TableHead className="w-28">Pemakaian</TableHead>
                                                <TableHead className="w-24">Jumlah</TableHead>
                                                <TableHead className="w-40">Keterangan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ppeItems.map((item, index) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell className="break-words whitespace-normal">{item.apd_name}</TableCell>
                                                    <TableCell className="break-words whitespace-normal">{item.inspection_criteria}</TableCell>
                                                    <TableCell>
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${String(item.id)}.condition`}
                                                            render={({ field }) => (
                                                                <Select onValueChange={field.onChange}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Pilih" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Baik">Baik</SelectItem>
                                                                        <SelectItem value="Rusak">Rusak</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${item.id}.usage`}
                                                            render={({ field }) => (
                                                                <Select onValueChange={field.onChange}>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Pilih" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Ya">Ya</SelectItem>
                                                                        <SelectItem value="Tidak">Tidak</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${item.id}.quantity`}
                                                            render={({ field }) => (
                                                                <Input type="number" {...field} className="w-full" placeholder="0" />
                                                            )}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <FormField
                                                            control={form.control}
                                                            name={`items.${item.id}.notes`}
                                                            render={({ field }) => (
                                                                <Input type="text" {...field} className="w-full" placeholder="Keterangan..." />
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
            </div>
        </AppLayout>
    );
}
