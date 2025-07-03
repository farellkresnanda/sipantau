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
    { title: 'Master APAR', href: '/master/apar' },
    { title: 'Edit Master APAR', href: '#' },
];

const formSchema = z.object({
    kode_entitas: z.string().min(1).max(255),
    entitas: z.string().min(1).max(255),
    no_apar: z.string().min(1).max(255),
    kode_ruang: z.string().min(1).max(255),
    lokasi: z.string().min(1).max(255),
    jenis: z.string().min(1).max(255),
    apar: z.string().min(1).max(255),
    kode_inventaris: z.string().min(1).max(255),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function EditMasterApar({
    masterApar,
}: {
    masterApar: {
        id: number;
        kode_entitas: string;
        entitas: string;
        no_apar: string;
        kode_ruang: string;
        lokasi: string;
        jenis: string;
        apar: string;
        kode_inventaris: string;
    };
}) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kode_entitas: masterApar.kode_entitas || '',
            entitas: masterApar.entitas || '',
            no_apar: masterApar.no_apar || '',
            kode_ruang: masterApar.kode_ruang || '',
            lokasi: masterApar.lokasi || '',
            jenis: masterApar.jenis || '',
            apar: masterApar.apar || '',
            kode_inventaris: masterApar.kode_inventaris || '',
        },
    });

    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof FormSchemaType, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);
    function onSubmit(values: FormSchemaType) {
        const formData = { ...values };
        router.put(route('apar.update', masterApar.id), formData);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Master APAR" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Edit Master APAR" subtitle="Update data Master APAR beserta semua informasinya di bawah ini." />
                </div>

                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
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
                                        <FormField
                                            control={form.control}
                                            name="entitas"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Entitas</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter entitas" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="no_apar"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>No APAR</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter no APAR" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="kode_ruang"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Ruang</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter kode ruang" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="lokasi"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Lokasi</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter lokasi" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="jenis"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Jenis</FormLabel>
                                                    <FormControl>
                                                        <select
                                                            ref={field.ref}
                                                            name={field.name}
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            onBlur={field.onBlur}
                                                            className="input w-full rounded border px-3 py-2"
                                                        >
                                                            <option value="">-- Pilih Jenis --</option>
                                                            <option value="Non Halon">Non Halon</option>
                                                            <option value="Dry Powder">Dry Powder</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="apar"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>APAR</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter APAR" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="kode_inventaris"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Inventaris</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter kode inventaris" {...field} />
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
