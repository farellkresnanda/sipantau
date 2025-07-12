'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Master AC', href: '/master/ac' },
    { title: 'Edit Master AC', href: '#' },
];

const formSchema = z.object({
    entity_code: z.string().min(1, { message: 'Entitas wajib dipilih' }),
    plant_code: z.string().min(1, { message: 'Plant wajib dipilih' }),
    room: z.string().min(1, { message: 'Ruang wajib diisi' }),
    inventory_code: z.string().min(1, { message: 'Kode Inventaris wajib diisi' }),
    merk: z.string().min(1, { message: 'Merk wajib diisi' }),
});

type FormSchemaType = z.infer<typeof formSchema>;

type Entitas = {
    id: number;
    name: string;
    entity_code: string;
};

type Plant = {
    id: number;
    name: string;
    entity_code: string;
    plant_code: string;
};

type MasterAcProps = {
    id: number;
    entity_code: string;
    plant_code: string;
    room: string;
    inventory_code: string;
    merk: string;
};

export default function EditMasterAc({
    masterAc,
    entityList,
    plantList,
}: {
    masterAc: MasterAcProps;
    entityList: Entitas[];
    plantList: Plant[];
}) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            entity_code: masterAc.entity_code,
            plant_code: masterAc.plant_code,
            room: masterAc.room,
            inventory_code: masterAc.inventory_code,
            merk: masterAc.merk,
        },
    });

    const currentKodeEntitas = form.watch('entity_code');

    const filteredPlants = useMemo(() => {
        return plantList.filter((plant) => plant.entity_code === currentKodeEntitas);
    }, [currentKodeEntitas, plantList]);

    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof FormSchemaType, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    function onSubmit(values: FormSchemaType) {
        router.put(route('ac.update', masterAc.id), values);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Master AC" />
            <div className="space-y-6 p-4">
                <SectionHeader
                    title="Edit Master AC"
                    subtitle="Perbarui data AC berdasarkan entity dan location penempatan."
                />

                <Card>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Kolom Kiri */}
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="entity_code"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Entitas</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={(val) => {
                                                                field.onChange(val);
                                                                form.setValue('plant_code', '');
                                                            }}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Pilih entity" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {entityList.map((ent) => (
                                                                    <SelectItem key={ent.entity_code} value={ent.entity_code}>
                                                                        {ent.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="plant_code"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Plant</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                            disabled={filteredPlants.length === 0}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Pilih plant" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {filteredPlants.map((plant) => (
                                                                    <SelectItem key={plant.plant_code} value={plant.plant_code}>
                                                                        {plant.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="room"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Ruang</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan room" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Kolom Kanan */}
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="inventory_code"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Kode Inventaris</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan kode inventaris" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="merk"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Merk</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan merk AC" {...field} />
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
                                    <Link
                                        href={route('ac.index')}
                                        className="text-muted-foreground text-sm hover:underline"
                                    >
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
