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
        title: 'Master AC',
        href: '/master/ac',
    },
    {
        title: 'Create Master AC',
        href: '/master/ac/create',
    },
];

const formSchema = z.object({
    kode_entitas: z.string().min(1, { message: 'Kode entitas is required' }).max(255),
    entitas: z.string().min(1, { message: 'Entitas is required' }).max(255),
    ruang: z.string().min(1, { message: 'Ruang is required' }).max(255),
    kode_inventaris: z.string().min(1, { message: 'Kode inventaris is required' }).max(255),
    merk: z.string().min(1, { message: 'Merk is required' }).max(255),
});

export default function CreateMasterInspeksiApar() {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kode_entitas: '',
            entitas: '',
            ruang: '',
            kode_inventaris: '',
            merk: '',
        },
    });

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
        router.post(route('ac.store'), values, {
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
            <Head title="Create Master AC" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Buat Data Master AC" subtitle="Buat data master AC baru untuk pendataan inventaris yang dimiliki" />
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
                                            name="ruang"
                                            render={({ field, formState }) => (
                                                <FormItem className={formState.errors.ruang ? 'error' : ''}>
                                                    <FormLabel>Ruang</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter ruang" {...field} />
                                                    </FormControl>
                                                    <FormMessage>{formState.errors.ruang?.message}</FormMessage>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-4">
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

                                        <FormField
                                            control={form.control}
                                            name="merk"
                                            render={({ field, formState }) => (
                                                <FormItem className={formState.errors.merk ? 'error' : ''}>
                                                    <FormLabel>Merk</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter merk" {...field} />
                                                    </FormControl>
                                                    <FormMessage>{formState.errors.merk?.message}</FormMessage>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Creating...' : 'Submit Data'}
                                    </Button>
                                    <Link href={route('ac.index')} className="text-muted-foreground text-sm hover:underline">
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
