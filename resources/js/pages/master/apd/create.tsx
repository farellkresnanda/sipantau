import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Master APD',
        href: '/master/apd',
    },
    {
        title: 'Create Master APD',
        href: '/master/apd/create',
    },
];

// Validasi zod
const formSchema = z.object({
    nama_apd: z.string().min(1, { message: 'Nama APD wajib diisi' }).max(255),
    kriteria_inspeksi: z.string().min(1, { message: 'Kriteria inspeksi wajib diisi' }),
});

export default function CreateMasterApd() {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nama_apd: '',
            kriteria_inspeksi: '',
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
        router.post(route('apd.store'), values, {
            onSuccess: () => form.reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Master APD" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Buat Master APD"
                        subtitle="Masukkan data nama APD dan kriteria inspeksi yang sesuai."
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
                                                <Input placeholder="Contoh: Safety goggles / Pelindung mata" {...field} />
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
                                                    placeholder="Contoh: Apakah safety goggles dalam kondisi baik, tangkai lengkap..."
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
                                        {form.formState.isSubmitting ? 'Creating...' : 'Submit Data'}
                                    </Button>
                                    <Link href={route('apd.index')} className="text-muted-foreground text-sm hover:underline">
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
