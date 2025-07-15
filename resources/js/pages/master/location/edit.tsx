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
    { title: 'Master Lokasi', href: '/master/location' },
    { title: 'Edit Master Lokasi', href: '#' },
];

const formSchema = z.object({
    name: z.string().min(1, { message: 'Nama location wajib diisi' }),
    entity_code: z.string().min(1, { message: 'Entitas wajib dipilih' }),
    plant_code: z.string().min(1, { message: 'Plant wajib dipilih' }),
});

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

type Props = {
    entityList: Entitas[];
    plantList: Plant[];
    location: {
        id: number;
        name: string;
        entity_code: string;
        plant_code: string;
    };
};

export default function EditMasterLokasi({ entityList, plantList, location }: Props) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: location.name || '',
            entity_code: location.entity_code?.toString() || '',
            plant_code: location.plant_code?.toString() || '',
        },
    });

    const entityKode = form.watch('entity_code');
    const plantKode = form.watch('plant_code');

    const filteredPlants = useMemo(() => {
        return plantList.filter((plant) => plant.entity_code === entityKode);
    }, [entityKode, plantList]);

    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof typeof formSchema._type, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        router.put(route('location.update', location.id), values);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Master Lokasi" />
            <div className="space-y-6 p-4">
                <SectionHeader
                    title="Edit Data Master Lokasi"
                    subtitle="Perbarui informasi location yang sudah ada"
                />

                <Card>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Nama Lokasi */}
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Lokasi</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Masukkan name location" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Entitas */}
                                    <FormField
                                        control={form.control}
                                        name="entity_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Entitas</FormLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        form.setValue('plant_code', '');
                                                    }}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih entity" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {entityList.map((entity) => (
                                                            <SelectItem
                                                                key={entity.entity_code}
                                                                value={entity.entity_code}
                                                            >
                                                                {entity.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Plant */}
                                    <FormField
                                        control={form.control}
                                        name="plant_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Plant</FormLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    disabled={!entityKode}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih plant" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {filteredPlants.map((plant) => (
                                                            <SelectItem
                                                                key={plant.plant_code}
                                                                value={plant.plant_code}
                                                            >
                                                                {plant.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Menyimpan...' : 'Perbarui Data'}
                                    </Button>
                                    <Link
                                        href={route('location.index')}
                                        className="text-muted-foreground text-sm hover:underline"
                                    >
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
