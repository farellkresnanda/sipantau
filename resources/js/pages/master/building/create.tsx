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
    { title: 'Master Gedung', href: '/master/building' },
    { title: 'Buat Master Gedung', href: '/master/building/create' },
];

// Validasi menggunakan Zod
const formSchema = z.object({
    entity_code: z.string().min(1, { message: 'Entitas wajib dipilih' }),
    plant_code: z.string().min(1, { message: 'Plant wajib dipilih' }),
    location_name: z.string().min(1, { message: 'Nama Gedung wajib diisi' }),
});

type FormSchemaType = z.infer<typeof formSchema>;

type Plant = {
    id: string;
    name_plant: string;
    entity_code: string;
    plant_code: string;
    entity_name: string;
};

type GroupedPlants = Record<string, Plant[]>;

export default function CreateMasterBuilding({ plants }: { plants: Plant[] }) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            entity_code: '',
            plant_code: '',
            location_name: '',
        },
    });

    const selectedEntitasKode = form.watch('entity_code');

    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof FormSchemaType, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    const groupedPlants: GroupedPlants = useMemo(() => {
        return plants.reduce((acc, plant) => {
            const alias = plant.entity_name;
            if (!acc[alias]) acc[alias] = [];
            acc[alias].push(plant);
            return acc;
        }, {} as GroupedPlants);
    }, [plants]);

    const filteredPlants = useMemo(() => {
        return plants.filter(plant => plant.entity_code === selectedEntitasKode);
    }, [plants, selectedEntitasKode]);

    useEffect(() => {
        if (filteredPlants.length === 1) {
            form.setValue('plant_code', filteredPlants[0].plant_code);
        } else {
            form.setValue('plant_code', '');
        }
    }, [filteredPlants, form]);

    function onSubmit(values: FormSchemaType) {
        router.post(route('building.store'), values, {
            onSuccess: () => form.reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Master Gedung" />
            <div className="space-y-6 p-4">
                <SectionHeader
                    title="Buat Master Gedung"
                    subtitle="Masukkan data master gedung di entitas terkait."
                />

                <Card>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                {/* ENTITAS */}
                                <FormField
                                    control={form.control}
                                    name="entity_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Entitas</FormLabel>
                                            <FormControl>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        form.setValue('plant_code', '');
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih entity" />
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
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* PLANT */}
                                <FormField
                                    control={form.control}
                                    name="plant_code"
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
                                                                    key={plant.plant_code}
                                                                    value={plant.plant_code}
                                                                >
                                                                    {plant.name_plant}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        readOnly
                                                        value={filteredPlants.length === 1 ? filteredPlants[0].name_plant : ''}
                                                        placeholder="Plant akan terisi otomatis atau pilih entity"
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
                                    name="location_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nama Gedung</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Masukkan name building" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* TOMBOL AKSI */}
                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Creating...' : 'Submit Data'}
                                    </Button>
                                    <Link
                                        href={route('building.index')}
                                        className="text-sm text-muted-foreground hover:underline"
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
