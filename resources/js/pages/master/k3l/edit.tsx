'use client';

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
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Master K3l', href: '/master/k3l' },
    { title: 'Edit Master K3l', href: '#' },
];

const formSchema = z.object({
    tujuan: z.string().min(1, { message: 'Tujuan wajib diisi' }).max(255),
    deskripsi: z
        .array(
            z.object({
                id: z.number().optional(),
                deskripsi: z.string().min(1, { message: 'Deskripsi wajib diisi' }),
            }),
        )
        .min(1, { message: 'Minimal satu deskripsi' }),
});

type FormData = z.infer<typeof formSchema>;

interface EditPageProps {
    data: {
        id: number;
        tujuan: string;
        deskripsi: { id?: number; deskripsi: string }[];
    };
    errors: Record<string, string>;
}

export default function EditMasterK3l() {
    const { data } = usePage().props as unknown as EditPageProps;

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tujuan: data.tujuan,
            deskripsi: data.deskripsi,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'deskripsi',
    });

    useEffect(() => {
        form.reset({
            tujuan: data.tujuan,
            deskripsi: data.deskripsi,
        });
    }, [data]);

    function onSubmit(values: FormData) {
        router.put(route('k3l.update', data.id), values, {
            onSuccess: () => form.reset(),
            onError: (errors) => {
                for (const key in errors) {
                    form.setError(key as keyof FormData, {
                        type: 'manual',
                        message: errors[key],
                    });
                }
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Master K3l" />
            <div className="space-y-6 p-4">
                <SectionHeader title="Edit Data Master K3l" subtitle="Perbarui data tujuan dan deskripsi K3L" />

                <Card>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Tujuan dengan grid untuk menyamakan lebar */}
                                <div className="grid grid-cols-1 items-start gap-2">
                                    <div className="w-10" />
                                    <FormField
                                        control={form.control}
                                        name="tujuan"
                                        render={({ field }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Tujuan</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Masukkan tujuan" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className="w-10" />
                                </div>

                                {/* Deskripsi */}
                                <div className="space-y-4">
                                    {/* Label Deskripsi di tengah */}
                                    <div className="grid grid-cols-1">
                                        <div />
                                        <FormLabel>Deskripsi</FormLabel>
                                        <div />
                                    </div>

                                    {fields.map((item, index) => {
                                        const isLast = index === fields.length - 1;
                                        const showDelete = fields.length > 1;

                                        return (
                                            <div key={item.id} className="grid grid-cols-[40px_1fr_40px] items-start gap-2">
                                                {/* Kolom kiri: Tombol Tambah (selalu tampil, hanya aktif di baris terakhir) */}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => append({ deskripsi: '' })}
                                                    title="Tambah deskripsi"
                                                    className="h-10 w-10"
                                                    disabled={!isLast} // Hanya aktif di baris terakhir
                                                >
                                                    ➕
                                                </Button>

                                                {/* Kolom tengah: Input Deskripsi */}
                                                <FormField
                                                    control={form.control}
                                                    name={`deskripsi.${index}.deskripsi`}
                                                    render={({ field }) => (
                                                        <FormItem className="w-full">
                                                            <FormControl>
                                                                <Input placeholder={`Deskripsi ${index + 1}`} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                {/* Kolom kanan: Tombol Hapus (selalu tampil, hanya aktif jika field > 1) */}
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    title="Hapus deskripsi"
                                                    className="h-10 w-10"
                                                    disabled={!showDelete} // Hanya aktif jika lebih dari 1 field
                                                >
                                                    🗑️
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Tombol Submit & Batal */}
                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Menyimpan...' : 'Update Data'}
                                    </Button>
                                    <Link href={route('k3l.index')} className="text-muted-foreground text-sm hover:underline">
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
