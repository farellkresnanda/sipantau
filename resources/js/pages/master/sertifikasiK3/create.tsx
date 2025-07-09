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
    { title: 'Manage Sertifikasi K3', href: '/master/sertifikasi-k3' },
    { title: 'Create Sertifikasi K3', href: '/master/sertifikasi-k3/create' },
];

// Validasi minimal: hanya wajib isi
const formSchema = z.object({
    jenis_sertifikasi: z.string().min(1, 'Jenis Sertikfikasi K3 wajib diisi').max(255),
});

export default function CreateSertifikasiK3() {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            jenis_sertifikasi: '',
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
        router.post(route('sertifikasi-k3.store'), values, {
            onSuccess: () => form.reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Sertifikasi K3" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Buat Sertifikasi K3 Baru"
                        subtitle="Isi formulir di bawah ini untuk membuat sertifikasiK3 baru. Pastikan semua kolom yang wajib diisi telah dilengkapi."
                    />
                </div>

                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Field Jenis Sertikfikasi K3 */}
                                    <FormField
                                        control={form.control}
                                        name="jenis_sertifikasi"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Jenis Sertikfikasi K3</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Masukkan jenis sertifikasi k3" {...field} />
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
                                    <Link href={route('sertifikasi-k3.index')} className="text-muted-foreground text-sm hover:underline">
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
