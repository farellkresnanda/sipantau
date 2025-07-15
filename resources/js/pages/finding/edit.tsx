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
    { title: 'Temuan', href: '/master/ac' },
    { title: 'Edit Temuan', href: '#' },
];

const formSchema = z.object({
    entity_code: z.string().min(1).max(255),
    entity: z.string().min(1).max(255),
    room: z.string().min(1).max(255),
    inventory_code: z.string().min(1).max(255),
    merk: z.string().min(1).max(255),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function EditInspeksiApar({
    masterAc,
}: {
    masterAc: {
        id: number;
        entity_code: string;
        entity: string;
        room: string;
        inventory_code: string;
        merk: string;
    };
}) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            entity_code: masterAc.entity_code || '',
            entity: masterAc.entity || '',
            room: masterAc.room || '',
            inventory_code: masterAc.inventory_code || '',
            merk: masterAc.merk || '',
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
        router.put(route('ac.update', masterAc.id), formData);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Temuan" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Edit Temuan" subtitle="Update data temuan beserta semua informasinya di bawah ini." />
                </div>

                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="entity_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Entitas</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter kode entity" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="entity"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Entitas</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter entity" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="room"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ruang</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter room" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="inventory_code"
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

                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Updating...' : 'Update Data'}
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
