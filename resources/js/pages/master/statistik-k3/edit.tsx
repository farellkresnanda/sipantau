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
    { title: 'Manage Statistik K3', href: '/master/statistik-k3' },
    { title: 'Edit Statistik K3', href: '#' },
];

// Schema validasi
const formSchema = z.object({
    data_statistik_k3: z.string().min(1).max(255),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function EditSertifikasiK3({ masterStatistikK3 }: { masterStatistikK3: { id: number; data_statistik_k3: string } }) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            data_statistik_k3: masterStatistikK3.data_statistik_k3 || '',
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
        router.put(route('statistik-k3.update', masterStatistikK3.id), formData);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Statistik K3" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Edit Statistik K3" subtitle="Perbarui data statistik k3 di bawah ini." />
                </div>
                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-4">
                                        {/* Nama Field */}
                                        <FormField
                                            control={form.control}
                                            name="data_statistik_k3"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Data Statistik K3</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter Data Statistik K3" {...field} />
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
                                        {form.formState.isSubmitting ? 'Updating...' : 'Update Data'}
                                    </Button>
                                    <Link href={route('statistik-k3.index')} className="text-muted-foreground text-sm hover:underline">
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
