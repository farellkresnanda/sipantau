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

const typeOptions = ['01', '02', '03'];

const formSchema = z.object({
    entity_code: z.string().min(1, { message: 'Entitas wajib dipilih' }),
    plant_code: z.string().min(1, { message: 'Plant wajib dipilih' }),
    no_p3k: z.string().min(1, { message: 'No P3K wajib diisi' }),
    room_code: z.string().min(1, { message: 'Kode Ruang wajib diisi' }),
    location: z.string().min(1, { message: 'Lokasi wajib diisi' }),
    type: z.string().min(1, { message: 'Jenis wajib dipilih' }),
    inventory_code: z.string().min(1, { message: 'Kode Inventaris wajib diisi' }),
});

type FormSchemaType = z.infer<typeof formSchema>;

type Plant = {
    id: string;
    name_plant: string;
    entity_code: string;
    plant_code: string;
    entity_name: string;
};

type MasterP3kProp = {
    id: number;
    entity_code: string;
    plant_code: string;
    no_p3k: string;
    room_code: string;
    location: string;
    type: string;
    inventory_code: string;
    entityData: {
        entity_code: string;
        name: string;
    } | null;
    plantData: {
        plant_code: string;
        name: string;
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
            entity_code: masterP3k.entity_code || '',
            plant_code: masterP3k.plant_code || '',
            no_p3k: masterP3k.no_p3k || '',
            room_code: masterP3k.room_code || '',
            location: masterP3k.location || '',
            type: masterP3k.type || '',
            inventory_code: masterP3k.inventory_code || '',
        },
    });

    const currentKodeEntitas = form.watch('entity_code');
    const currentKodePlant = form.watch('plant_code');

    const groupedPlants = useMemo(() => {
        return plants.reduce((acc, plant) => {
            const alias = plant.entity_name;
            if (!acc[alias]) acc[alias] = [];
            acc[alias].push(plant);
            return acc;
        }, {} as Record<string, Plant[]>);
    }, [plants]);

    const selectedEntitasName = useMemo(() => {
        const found = Object.values(groupedPlants).flat().find(
            (plant) => plant.entity_code === currentKodeEntitas
        );
        return found ? found.entity_name : 'Pilih entity';
    }, [groupedPlants, currentKodeEntitas]);

    const selectedPlantName = useMemo(() => {
        const found = plants.find(
            (plant) => plant.plant_code === currentKodePlant && plant.entity_code === currentKodeEntitas
        );
        return found ? found.name_plant : 'Pilih plant';
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
                    subtitle="Perbarui informasi lokasi dan identitas P3K"
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
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih entity">
                                                                {selectedEntitasName}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {Object.keys(groupedPlants).map(entityNama => (
                                                                <SelectItem
                                                                    key={groupedPlants[entityNama][0].entity_code}
                                                                    value={groupedPlants[entityNama][0].entity_code}
                                                                >
                                                                    {entityNama}
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
                                            name="plant_code"
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
                                                                .filter(plant => plant.entity_code === currentKodeEntitas)
                                                                .map(plant => (
                                                                    <SelectItem
                                                                        key={plant.plant_code}
                                                                        value={plant.plant_code}
                                                                    >
                                                                        {plant.name_plant}
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
                                            name="room_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Ruang</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan kode room" {...field} />
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
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Lokasi</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan location P3K" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Kode Inventaris - Tetap di kolom kanan */}
                                        <FormField
                                            control={form.control}
                                            name="inventory_code"
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
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Jenis</FormLabel>
                                                    <FormControl>
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Pilih type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {typeOptions.map(type => (
                                                                    <SelectItem key={type} value={type}>
                                                                        {type}
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
