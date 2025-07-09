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
    { title: 'Manage Skala Prioritas', href: '/master/skala-prioritas' },
    { title: 'Create Skala Prioritas', href: '/master/skala-prioritas/create' },
];

// Validasi minimal: hanya wajib isi
const formSchema = z.object({
    nama: z.string().min(1, 'Nama wajib diisi').max(255),
    skala: z.string().min(1, 'Skala Prioritas wajib diisi'),
});

export default function CreateProbabilitas() {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nama: '',
            skala: '',
        },
    });

    useEffect(() => {
        for (const [key, message] of Object.entries(errors)) {
            form.setError(key as keyof z.infer<typeof formSchema>, {
                type: 'manual',
                message,
            });
        }
    }, [errors, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        router.post(route('skala-prioritas.store'), values, {
            onSuccess: () => form.reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Skala Prioritas" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Buat Skala Prioritas Baru"
                        subtitle="Isi formulir di bawah ini untuk membuat skala prioritas baru. Pastikan semua kolom yang wajib diisi telah dilengkapi."
                    />
                </div>

                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Field Nama */}
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

                                    {/* Field Skala Prioritas */}
                                    <FormField
                                        control={form.control}
                                        name="skala"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Skala Prioritas</FormLabel>
                                                <FormControl>
                                                    <Input type="text" placeholder="Masukkan angka skala" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Tombol */}
                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Menyimpan...' : 'Submit Data'}
                                    </Button>
                                    <Link href={route('skala-prioritas.index')} className="text-muted-foreground text-sm hover:underline">
                                        Batal
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
