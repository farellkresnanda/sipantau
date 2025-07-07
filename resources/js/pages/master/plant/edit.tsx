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
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Manage Plant', href: '/master/plant' },
    { title: 'Edit Plant', href: '#' },
];

// Schema validasi
const formSchema = z.object({
    kode_entitas: z.string().min(1).max(255),
    kode_plant: z.string().min(1).max(255),
    nama: z.string().min(1).max(255),
});

export default function EditPlant() {
    const { errors, entitasList, plant } = usePage().props as unknown as {
        errors: Record<string, string>;
        entitasList: { kode_entitas: string; nama: string }[];
        plant: { id: number; kode_entitas: string; kode_plant: string; nama: string };
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kode_entitas: plant.kode_entitas,
            kode_plant: plant.kode_plant,
            nama: plant.nama,
        },
    });

    // Menampilkan error dari backend jika ada
    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof typeof formSchema._type, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    // Kirim data ke Laravel (dengan ID-nya)
    function onSubmit(values: z.infer<typeof formSchema>) {
        router.put(route('plant.update', plant.id), {
            ...values,
            id: plant.id, // <- penting agar backend bisa akses $request->id
        }, {
            preserveScroll: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Plant" />
            <div className="space-y-6 p-4">
                <SectionHeader title="Edit Plant" subtitle="Perbarui informasi plant di bawah ini." />
                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
                                    <div className="space-y-4">
                                        {/* Dropdown Entitas */}
                                        <FormField
                                            control={form.control}
                                            name="kode_entitas"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Entitas</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Pilih entitas" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {entitasList.map((entitas) => (
                                                                    <SelectItem
                                                                        key={entitas.kode_entitas}
                                                                        value={entitas.kode_entitas}
                                                                    >
                                                                        {entitas.nama}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Kode Plant */}
                                        <FormField
                                            control={form.control}
                                            name="kode_plant"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Plant</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan kode plant" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Nama Plant */}
                                        <FormField
                                            control={form.control}
                                            name="nama"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Plant</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan nama plant" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Updating...' : 'Update Data'}
                                    </Button>
                                    <Link
                                        href={route('plant.index')}
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
