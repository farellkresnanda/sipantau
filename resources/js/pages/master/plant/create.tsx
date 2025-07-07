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
    { title: 'Create Plant', href: '/master/plant/create' },
];

const formSchema = z.object({
    kode_entitas: z.string().min(1).max(255),
    kode_plant: z.string().min(1).max(255),
    nama: z.string().min(1).max(255),
});

export default function CreateUser() {
    const { errors, entitasList } = usePage().props as unknown as {
        errors: Record<string, string>;
        entitasList: {
            kode_entitas: string;
            nama: string;
        }[];
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kode_entitas: '',
            kode_plant: '',
            nama: '',
            
        },
    });

    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof typeof formSchema._type, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        router.post(route('plant.store'), values, {
            onSuccess: () => form.reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Plant" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Buat Plant Baru"
                        subtitle="Isi formulir di bawah ini untuk membuat plant baru. Pastikan semua kolom yang wajib diisi telah dilengkapi."
                    />
                </div>

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
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
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
                                    </div>

                                    <div className="space-y-4">
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
                                        {form.formState.isSubmitting ? 'Creating...' : 'Submit Data'}
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
