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
    { title: 'Master Gedung', href: '/master/gedung' },
    { title: 'Edit Master Gedung', href: '#' },
];

const formSchema = z.object({
    kode_entitas: z.string().min(1, { message: 'Entitas wajib dipilih' }),
    kode_plant: z.string().min(1, { message: 'Plant wajib dipilih' }),
    nama_lokasi: z.string().min(1, { message: 'Nama Gedung wajib diisi' }),
});

type FormSchemaType = z.infer<typeof formSchema>;

type Plant = {
    id: string;
    nama_plant: string;
    kode_entitas: string;
    kode_plant: string;
    entitas_nama: string;
};

type MasterGedungProp = {
    id: number;
    kode_entitas: string;
    kode_plant: string;
    nama_lokasi: string;
    entitasData: { kode_entitas: string; nama: string } | null;
    plantData: { kode_plant: string; nama: string } | null;
};

export default function EditMasterGedung({
    masterGedung,
    plants,
}: {
    masterGedung: MasterGedungProp;
    plants: Plant[];
}) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kode_entitas: masterGedung.kode_entitas || '',
            kode_plant: masterGedung.kode_plant || '',
            nama_lokasi: masterGedung.nama_lokasi || '',
        },
    });

    const selectedEntitasKode = form.watch('kode_entitas');

    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof FormSchemaType, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    const groupedPlants = useMemo(() => {
        return plants.reduce((acc, plant) => {
            const alias = plant.entitas_nama;
            if (!acc[alias]) acc[alias] = [];
            acc[alias].push(plant);
            return acc;
        }, {} as Record<string, Plant[]>);
    }, [plants]);

    const filteredPlants = useMemo(() => {
        return plants.filter(plant => plant.kode_entitas === selectedEntitasKode);
    }, [plants, selectedEntitasKode]);

    useEffect(() => {
        if (
            selectedEntitasKode &&
            filteredPlants.length === 1 &&
            form.getValues('kode_plant') !== filteredPlants[0].kode_plant
        ) {
            form.setValue('kode_plant', filteredPlants[0].kode_plant);
        } else if (selectedEntitasKode && filteredPlants.length === 0) {
            form.setValue('kode_plant', '');
        }
    }, [filteredPlants, form, selectedEntitasKode]);

    function onSubmit(values: FormSchemaType) {
        router.put(route('gedung.update', masterGedung.id), values);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Master Gedung" />
            <div className="space-y-6 p-4">
                <SectionHeader
                    title="Edit Master Gedung"
                    subtitle="Perbarui informasi lokasi gedung di entitas terkait."
                />

                <Card>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* ENTITAS */}
                                <FormField
                                    control={form.control}
                                    name="kode_entitas"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Entitas</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        form.setValue('kode_plant', '');
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih entitas" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {Object.keys(groupedPlants).map(entitasNama => (
                                                            <SelectItem
                                                                key={groupedPlants[entitasNama][0].kode_entitas}
                                                                value={groupedPlants[entitasNama][0].kode_entitas}
                                                            >
                                                                {entitasNama}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* PLANT */}
                                <FormField
                                    control={form.control}
                                    name="kode_plant"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Plant</FormLabel>
                                            <FormControl>
                                                {filteredPlants.length > 1 ? (
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={field.onChange}
                                                        disabled={!selectedEntitasKode}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih plant" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {filteredPlants.map(plant => (
                                                                <SelectItem
                                                                    key={plant.kode_plant}
                                                                    value={plant.kode_plant}
                                                                >
                                                                    {plant.nama_plant}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        readOnly
                                                        placeholder="Plant akan terisi otomatis atau pilih entitas"
                                                        value={filteredPlants.length === 1 ? filteredPlants[0].nama_plant : ''}
                                                    />
                                                )}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* NAMA GEDUNG */}
                                <FormField
                                    control={form.control}
                                    name="nama_lokasi"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Gedung</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Masukkan nama gedung" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* TOMBOL AKSI */}
                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Updating...' : 'Update Data'}
                                    </Button>
                                    <Link
                                        href={route('gedung.index')}
                                        className="text-sm text-muted-foreground hover:underline"
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
