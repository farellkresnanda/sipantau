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
    { title: 'Inspeksi APAR', href: '/master/inspeksi-apar' },
    { title: 'Edit Inspeksi APAR', href: '#' },
];

// Schema validasi
const formSchema = z.object({
    kode_entitas: z.string().min(1).max(255),
    entitas: z.string().min(1).max(255),
    no_ac: z.string().min(1).max(255),
    kode_ruang: z.string().min(1).max(255),
    ruang: z.string().min(1).max(255),
    kode_inventaris: z.string().min(1).max(255),
    merk: z.string().min(1).max(255),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function EditInspeksiApar({
    inspeksiApar,
}: {
    inspeksiApar: {
        id: number;
        kode_entitas: string;
        entitas: string;
        no_ac: string;
        kode_ruang: string;
        ruang: string;
        kode_inventaris: string;
        merk: string;
    };
}) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kode_entitas: inspeksiApar.kode_entitas || '',
            entitas: inspeksiApar.entitas || '',
            no_ac: inspeksiApar.no_ac || '',
            kode_ruang: inspeksiApar.kode_ruang || '',
            ruang: inspeksiApar.ruang || '',
            kode_inventaris: inspeksiApar.kode_inventaris || '',
            merk: inspeksiApar.merk || '',
        },
    });

    // Inject error dari Laravel ke React Hook Form
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
        router.put(route('inspeksi-apar.update', inspeksiApar.id), formData);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Edit User" subtitle="Update user data below." />
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
                                            name="no_ac"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>No AC</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter no AC" {...field} />
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
                                            name="ruang"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ruang</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter ruang" {...field} />
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
                                        <FormField
                                            control={form.control}
                                            name="merk"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Merk</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter merk" {...field} />
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
                                        {form.formState.isSubmitting ? 'Updating...' : 'Update User'}
                                    </Button>
                                    <Link href={route('master-entitas.index')} className="text-muted-foreground text-sm hover:underline">
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
