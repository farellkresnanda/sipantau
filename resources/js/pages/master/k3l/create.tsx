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
    { title: 'Create Master K3l', href: '/master/k3l/create' },
];

const formSchema = z.object({
    objective: z.string().min(1, { message: 'Tujuan is required' }).max(255),
    description: z
        .array(
            z.object({
                description: z.string().min(1, { message: 'Deskripsi is required' }).max(255),
            }),
        )
        .min(1, { message: 'Minimal 1 description' }),
});

export default function CreateMasterK3l() {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            objective: '',
            description: [{ description: '' }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'description',
    });

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
        router.post(route('k3l.store'), values, {
            onSuccess: () => form.reset(),
            onError: (errors) => {
                Object.entries(errors).forEach(([key, message]) => {
                    form.setError(key as keyof typeof formSchema._type, {
                        type: 'manual',
                        message: message as string,
                    });
                });
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Master K3l" />
            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Buat Data Master K3l" subtitle="Buat data master K3L baru untuk pendataan inventaris yang dimiliki" />
                </div>

                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* Input Tujuan */}
                                <div className="grid grid-cols-1 items-start gap-2">
                                    <div className="w-10" /> {/* Placeholder kiri */}
                                    <FormField
                                        control={form.control}
                                        name="objective"
                                        render={({ field, formState }) => (
                                            <FormItem className="w-full">
                                                <FormLabel>Tujuan</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter Tujuan" {...field} />
                                                </FormControl>
                                                <FormMessage>{formState.errors?.objective?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                    <div className="w-10" /> {/* Placeholder kanan */}
                                </div>

                                {/* Dynamic Deskripsi */}
                                <div className="space-y-4">
                                    {/* Label di pojok kiri */}
                                    <FormLabel>Deskripsi</FormLabel>

                                    {fields.map((item, index) => {
                                        const isLast = index === fields.length - 1;
                                        const showDelete = fields.length > 1;

                                        return (
                                            <div key={item.id} className="flex items-start gap-2">
                                                {/* Tombol Tambah (selalu ada, hanya aktif di baris terakhir) */}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => append({ description: '' })}
                                                    title="Tambah description"
                                                    className="h-10 w-10 shrink-0"
                                                    disabled={!isLast} // aktif hanya di baris terakhir
                                                >
                                                    ➕
                                                </Button>

                                                {/* Input Deskripsi */}
                                                <FormField
                                                    control={form.control}
                                                    name={`description.${index}.description`}
                                                    render={({ field, formState }) => {
                                                        return (
                                                            <FormItem className="w-full">
                                                                <FormControl>
                                                                    <Input placeholder="Enter Deskripsi" {...field} />
                                                                </FormControl>
                                                                <FormMessage>{formState.errors?.description?.[index]?.description?.message}</FormMessage>
                                                            </FormItem>
                                                        );
                                                    }}
                                                />

                                                {/* Tombol Hapus (selalu ada, disable jika cuma 1 baris) */}
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => remove(index)}
                                                    title="Hapus"
                                                    className="h-10 w-10 shrink-0"
                                                    disabled={!showDelete} // disable jika hanya 1 baris
                                                >
                                                    🗑️
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Tombol Submit dan Cancel */}
                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Creating...' : 'Submit Data'}
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
