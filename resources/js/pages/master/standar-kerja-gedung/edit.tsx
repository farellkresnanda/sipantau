import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Manage Standar Kerja Gedung', href: '/master/standar-kerja-gedung' },
    { title: 'Edit Standar Kerja Gedung', href: '#' },
];

const formSchema = z.object({
    nama: z.string().min(1).max(255),
    keterangan: z.string().min(1),
    periode: z.string().min(1).max(255),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function EditStandarKerjaGedung({
    standarKerjaGedung,
}: {
    standarKerjaGedung: { id: number; nama: string; keterangan: string; periode: string };
}) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nama: standarKerjaGedung.nama || '',
            keterangan: standarKerjaGedung.keterangan || '',
            periode: standarKerjaGedung.periode || '',
        },
    });

    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof FormSchemaType, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    function onSubmit(values: FormSchemaType) {
        const formData = { ...values };
        router.put(route('standar-kerja-gedung.update', standarKerjaGedung.id), formData);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Standar Kerja Gedung" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Edit Standar Kerja Gedung" subtitle="Perbarui data standar kerja gedung di bawah ini." />
                </div>

                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="nama"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Masukkan nama" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="keterangan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Keterangan</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Masukkan keterangan" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="periode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Periode</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Masukkan periode" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Updating...' : 'Update Data'}
                                    </Button>
                                    <Link href={route('standar-kerja-gedung.index')} className="text-muted-foreground text-sm hover:underline">
                                        Cancel
                                    </Link>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
