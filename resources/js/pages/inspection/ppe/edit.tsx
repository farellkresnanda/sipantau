import { useForm } from 'react-hook-form';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type {BreadcrumbItem} from "@/types";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi APD', href: '/inspection/ppe' },
    { title: 'Ubah', href: '#' },
];

const formSchema = z.object({
    inspection_date: z.string().min(1, 'Date is required'),
    location_id: z.string().min(1, 'Location is required'),
    job_description: z.string().optional(),
    project_name: z.string().optional(),
    items: z.record(
        z.object({
            id: z.string().optional(),
            condition: z.string().min(1, 'Condition is required'),
            usage: z.string().min(1, 'Usage is required'),
            quantity: z.number().min(0, 'Quantity must be 0 or greater'),
            notes: z.string().optional(),
        }),
    ),
});

export default function EditPpeInspection({ locations, ppeItems, ppeInspection}: any) {
    // Transform backend data
    const ppe_inspection = {
        uuid: ppeInspection.uuid,
        inspection_date: ppeInspection.inspection_date,
        location_id: String(ppeInspection.location_id),
        job_description: ppeInspection.job_description,
        project_name: ppeInspection.project_name,
        items: (ppeInspection.items ?? []).reduce((acc: Record<string, any>, item: any) => {
            acc[item.ppe_check_item_id] = {
                id: item.ppe_check_item_id,
                condition: item.condition,
                usage: item.usage,
                quantity: parseInt(item.quantity),
                notes: item.notes,
            };
            return acc;
        }, {}),
    };



    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: ppe_inspection,
    });

    console.log('Form State:', form.formState);
    console.log('Form Values:', form.watch());

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        console.log(data)
        router.put(route('inspection.ppe.update', ppeInspection.uuid), data, {
            onError: (errors) => {
                console.error('❌ Submit Error:', errors);
            },
            onSuccess: () => {
                console.log('✅ Submit Success');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit PPE Inspection" />
            <div className="space-y-6 p-4">
                <SectionHeader title="Edit Inspeksi APD" />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardContent className="p-6 space-y-4">
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
                                        name="location_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lokasi</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih lokasi" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {locations.map((location: any) => (
                                                            <SelectItem key={location.id} value={String(location.id)}>
                                                                {location.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
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

                        <Card>
                            <CardContent className="p-6 space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border">
                                        <thead className="bg-muted">
                                        <tr>
                                            <th className="p-2 border">APD</th>
                                            <th className="p-2 border">Kriteria Pemeriksaan</th>
                                            <th className="p-2 border">Kondisi</th>
                                            <th className="p-2 border">Pemakaian</th>
                                            <th className="p-2 border">Jumlah</th>
                                            <th className="p-2 border">Catatan</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {ppeItems.map((item: any) => (
                                            <tr key={item.id}>
                                                <td className="p-2 border">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${item.id}.id`}
                                                        render={({ field }) => <input type="hidden" {...field} value={item.id} />}
                                                    />
                                                    {item.apd_name}
                                                </td>
                                                <td className="p-2 border">{item.inspection_criteria}</td>
                                                <td className="p-2 border">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${item.id}.condition`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Pilih" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="Baik">Baik</SelectItem>
                                                                        <SelectItem value="Rusak">Rusak</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${item.id}.usage`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                    <FormControl>
                                                                        <SelectTrigger>
                                                                            <SelectValue placeholder="Pilih" />
                                                                        </SelectTrigger>
                                                                    </FormControl>
                                                                    <SelectContent>
                                                                        <SelectItem value="Ya">Ya</SelectItem>
                                                                        <SelectItem value="Tidak">Tidak</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${item.id}.quantity`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input
                                                                        type="number"
                                                                        value={field.value ?? ''}
                                                                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                                                                    />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </td>
                                                <td className="p-2 border">
                                                    <FormField
                                                        control={form.control}
                                                        name={`items.${item.id}.notes`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormControl>
                                                                    <Input placeholder="Catatan" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
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
