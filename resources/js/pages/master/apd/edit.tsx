'use client';

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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Master APD', href: '/master/apd' },
    { title: 'Edit Master APD', href: '#' },
];

// Skema validasi menggunakan zod
const formSchema = z.object({
    nama_apd: z.string().min(1, 'Nama APD wajib diisi').max(255),
    kriteria_inspeksi: z.string().min(1, 'Kriteria inspeksi wajib diisi'),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function EditMasterApd({
    masterApd,
}: {
    masterApd: {
        id: number;
        nama_apd: string;
        kriteria_inspeksi: string;
    };
}) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nama_apd: masterApd.nama_apd || '',
            kriteria_inspeksi: masterApd.kriteria_inspeksi || '',
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
        router.put(route('apd.update', masterApd.id), values);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Master APD" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Edit Master APD"
                        subtitle="Perbarui data nama dan kriteria inspeksi APD di bawah ini."
                    />
                </div>

                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="nama_apd"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama APD</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Contoh: Safety Helmet" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="kriteria_inspeksi"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Kriteria Inspeksi</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Contoh: APD harus tidak rusak, lengkap, sesuai standar..."
                                                    rows={4}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting
                                            ? 'Updating...'
                                            : 'Update Data'}
                                    </Button>
                                    <Link
                                        href={route('apd.index')}
                                        className="text-muted-foreground text-sm hover:underline"
                                    >
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
