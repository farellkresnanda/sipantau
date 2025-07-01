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
        title: 'Master APAR',
        href: '/master/apar',
    },
    {
        title: 'Create Master APAR',
        href: '/master/apar/create',
    },
];

// Validasi zod
const formSchema = z.object({
    kode_entitas: z.string().min(1, { message: 'Kode entitas is required' }).max(255),
    entitas: z.string().min(1, { message: 'Entitas is required' }).max(255),
    no_apar: z.string().min(1, { message: 'No APAR is required' }).max(255),
    kode_ruang: z.string().min(1, { message: 'Kode ruang is required' }).max(255),
    lokasi: z.string().min(1, { message: 'Lokasi is required' }).max(255),
    jenis: z.string().min(1, { message: 'Jenis is required' }).max(255),
    apar: z.string().min(1, { message: 'APAR is required' }).max(255),
    kode_inventaris: z.string().min(1, { message: 'Kode inventaris is required' }).max(255),
});

export default function CreateMasterApar() {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kode_entitas: '',
            entitas: '',
            no_apar: '',
            kode_ruang: '',
            lokasi: '',
            jenis: '',
            apar: '',
            kode_inventaris: '',
        },
    });

    // Inject error dari Laravel ke React Hook Form
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([key, message]) => {
                form.setError(key as keyof typeof formSchema._type, {
                    type: 'manual',
                    message: message,
                });
            });
        }
    }, [errors, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        router.post(route('apar.store'), values, {
            onSuccess: () => {
                form.reset();
            },
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
            <Head title="Create Master APAR" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Buat Data Master APAR" subtitle="Buat catatan data master APAR baru untuk mengelola data inspeksi APAR" />
                </div>

                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="kode_entitas"
                                            render={({ field, formState }) => (
                                                <FormItem className={formState.errors.kode_entitas ? 'error' : ''}>
                                                    <FormLabel>Kode Entitas</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter kode entitas" {...field} />
                                                    </FormControl>
                                                    <FormMessage>{formState.errors.kode_entitas?.message}</FormMessage>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="entitas"
                                            render={({ field, formState }) => (
                                                <FormItem className={formState.errors.entitas ? 'error' : ''}>
                                                    <FormLabel>Entitas</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter entitas" {...field} />
                                                    </FormControl>
                                                    <FormMessage>{formState.errors.entitas?.message}</FormMessage>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="no_apar"
                                            render={({ field, formState }) => (
                                                <FormItem className={formState.errors.no_apar ? 'error' : ''}>
                                                    <FormLabel>No APAR</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter no APAR" {...field} />
                                                    </FormControl>
                                                    <FormMessage>{formState.errors.no_apar?.message}</FormMessage>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="kode_ruang"
                                            render={({ field, formState }) => (
                                                <FormItem className={formState.errors.kode_ruang ? 'error' : ''}>
                                                    <FormLabel>Kode Ruang</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter kode ruang" {...field} />
                                                    </FormControl>
                                                    <FormMessage>{formState.errors.kode_ruang?.message}</FormMessage>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="lokasi"
                                            render={({ field, formState }) => (
                                                <FormItem className={formState.errors.lokasi ? 'error' : ''}>
                                                    <FormLabel>Lokasi</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter lokasi" {...field} />
                                                    </FormControl>
                                                    <FormMessage>{formState.errors.lokasi?.message}</FormMessage>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="jenis"
                                            render={({ field, formState }) => (
                                                <FormItem className={formState.errors.jenis ? 'error' : ''}>
                                                    <FormLabel>Jenis</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter jenis" {...field} />
                                                    </FormControl>
                                                    <FormMessage>{formState.errors.jenis?.message}</FormMessage>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="apar"
                                            render={({ field, formState }) => (
                                                <FormItem className={formState.errors.apar ? 'error' : ''}>
                                                    <FormLabel>APAR</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter APAR" {...field} />
                                                    </FormControl>
                                                    <FormMessage>{formState.errors.apar?.message}</FormMessage>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="kode_inventaris"
                                            render={({ field, formState }) => (
                                                <FormItem className={formState.errors.kode_inventaris ? 'error' : ''}>
                                                    <FormLabel>Kode Inventaris</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter kode inventaris" {...field} />
                                                    </FormControl>
                                                    <FormMessage>{formState.errors.kode_inventaris?.message}</FormMessage>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Submit & Cancel */}
                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Creating...' : 'Create Data'}
                                    </Button>
                                    <Link href={route('apar.index')} className="text-muted-foreground text-sm hover:underline">
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
