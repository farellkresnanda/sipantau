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
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Manage Entitas',
        href: '/master/entitas',
    },
    {
        title: 'Create Entitas',
        href: '/master/entitas/create',
    },
];

// Validasi zod
const formSchema = z.object({
    kode_entitas: z.string().min(1).max(255),
    kode_group: z.string().min(1).max(255),
    nama: z.string().min(1).max(255),
    nama_alias: z.string().min(1).max(255),
});

export default function CreateUser() {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kode_entitas: '',
            kode_group: '',
            nama: '',
            nama_alias: '',
        },
    });

    // Inject error dari Laravel ke React Hook Form
    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof typeof formSchema._type, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        router.post(route('entitas.store'), values, {
            onSuccess: () => {
                form.reset();
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create User" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Buat Entitas Baru"
                        subtitle="Isi formulir di bawah ini untuk membuat entitas baru. Pastikan semua kolom yang wajib diisi telah dilengkapi."
                    />
                </div>

                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-4">
                                        {/* Kode Entitas Field */}
                                        <FormField
                                            control={form.control}
                                            name="kode_entitas"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Entitas</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter kode entitas" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Kode Group Field */}
                                        <FormField
                                            control={form.control}
                                            name="kode_group"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Group</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter kode group" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        {/* Nama Field */}
                                        <FormField
                                            control={form.control}
                                            name="nama"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter nama" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Nama Alias Field */}
                                        <FormField
                                            control={form.control}
                                            name="nama_alias"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Alias</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter nama alias" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Submit & Cancel */}
                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Creating...' : 'Submit Data'}
                                    </Button>
                                    <Link href={route('entitas.index')} className="text-muted-foreground text-sm hover:underline">
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
