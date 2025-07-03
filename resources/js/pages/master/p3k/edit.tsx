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
    { title: 'Master P3K', href: '/master/p3k' },
    { title: 'Edit Master P3K', href: '#' },
];

const jenisOptions = ['01', '02', '03'];

const formSchema = z.object({
    kode_entitas: z.string().min(1, { message: 'Entitas wajib dipilih' }),
    kode_plant: z.string().min(1, { message: 'Plant wajib dipilih' }),
    no_p3k: z.string().min(1, { message: 'No P3K wajib diisi' }),
    kode_ruang: z.string().min(1, { message: 'Kode Ruang wajib diisi' }),
    lokasi: z.string().min(1, { message: 'Lokasi wajib diisi' }),
    jenis: z.string().min(1, { message: 'Jenis wajib dipilih' }),
    kode_inventaris: z.string().min(1, { message: 'Kode Inventaris wajib diisi' }),
});

type FormSchemaType = z.infer<typeof formSchema>;

type Plant = {
    id: string;
    nama_plant: string;
    kode_entitas: string;
    kode_plant: string;
    entitas_nama: string;
};

type MasterP3kProp = {
    id: number;
    kode_entitas: string;
    kode_plant: string;
    no_p3k: string;
    kode_ruang: string;
    lokasi: string;
    jenis: string;
    kode_inventaris: string;
    entitasData: {
        kode_entitas: string;
        nama: string;
    } | null;
    plantData: {
        kode_plant: string;
        nama: string;
    } | null;
};

export default function EditMasterP3k({
    masterP3k,
    plants,
}: {
    masterP3k: MasterP3kProp;
    plants: Plant[];
}) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kode_entitas: masterP3k.kode_entitas || '',
            kode_plant: masterP3k.kode_plant || '',
            no_p3k: masterP3k.no_p3k || '',
            kode_ruang: masterP3k.kode_ruang || '',
            lokasi: masterP3k.lokasi || '',
            jenis: masterP3k.jenis || '',
            kode_inventaris: masterP3k.kode_inventaris || '',
        },
    });

    const currentKodeEntitas = form.watch('kode_entitas');
    const currentKodePlant = form.watch('kode_plant');

    const groupedPlants = useMemo(() => {
        return plants.reduce((acc, plant) => {
            const alias = plant.entitas_nama;
            if (!acc[alias]) acc[alias] = [];
            acc[alias].push(plant);
            return acc;
        }, {} as Record<string, Plant[]>);
    }, [plants]);

    const selectedEntitasName = useMemo(() => {
        const found = Object.values(groupedPlants).flat().find(
            (plant) => plant.kode_entitas === currentKodeEntitas
        );
        return found ? found.entitas_nama : 'Pilih entitas';
    }, [groupedPlants, currentKodeEntitas]);

    const selectedPlantName = useMemo(() => {
        const found = plants.find(
            (plant) => plant.kode_plant === currentKodePlant && plant.kode_entitas === currentKodeEntitas
        );
        return found ? found.nama_plant : 'Pilih plant';
    }, [plants, currentKodePlant, currentKodeEntitas]);

    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof FormSchemaType, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    function onSubmit(values: FormSchemaType) {
        router.put(route('p3k.update', masterP3k.id), values);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Master P3K" />
            <div className="space-y-6 p-4">
                <SectionHeader
                    title="Edit Master P3K"
                    subtitle="Perbarui informasi lokasi dan identitas kotak P3K."
                />

                <Card>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Kolom Kiri */}
                                    <div className="space-y-4">
                                        {/* Entitas (Dropdown) */}
                                        <FormField
                                            control={form.control}
                                            name="kode_entitas"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Entitas</FormLabel>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                            form.setValue('kode_plant', '');
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih entitas">
                                                                {selectedEntitasName}
                                                            </SelectValue>
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
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Plant (Dropdown) */}
                                        <FormField
                                            control={form.control}
                                            name="kode_plant"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Plant</FormLabel>
                                                    <Select
                                                        value={field.value}
                                                        onValueChange={(value) => {
                                                            field.onChange(value);
                                                        }}
                                                        disabled={!currentKodeEntitas}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih plant">
                                                                {selectedPlantName}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {plants
                                                                .filter(plant => plant.kode_entitas === currentKodeEntitas)
                                                                .map(plant => (
                                                                    <SelectItem
                                                                        key={plant.kode_plant}
                                                                        value={plant.kode_plant}
                                                                    >
                                                                        {plant.nama_plant}
                                                                    </SelectItem>
                                                                ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* No P3K */}
                                        <FormField
                                            control={form.control}
                                            name="no_p3k"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>No P3K</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan no P3K" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Kode Ruang - Pindah ke kolom kiri */}
                                        <FormField
                                            control={form.control}
                                            name="kode_ruang"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Ruang</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan kode ruang" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Kolom Kanan */}
                                    <div className="space-y-4">
                                        {/* Lokasi - Tetap di kolom kanan */}
                                        <FormField
                                            control={form.control}
                                            name="lokasi"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Lokasi</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan lokasi P3K" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Kode Inventaris - Tetap di kolom kanan */}
                                        <FormField
                                            control={form.control}
                                            name="kode_inventaris"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Inventaris</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan kode inventaris" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Jenis - Tetap di kolom kanan */}
                                        <FormField
                                            control={form.control}
                                            name="jenis"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Jenis</FormLabel>
                                                    <FormControl>
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Pilih jenis" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {jenisOptions.map(jenis => (
                                                                    <SelectItem key={jenis} value={jenis}>
                                                                        {jenis}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Tombol Aksi */}
                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Updating...' : 'Update Data'}
                                    </Button>
                                    <Link
                                        href={route('p3k.index')}
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