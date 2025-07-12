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
    { title: 'Buat Master P3K', href: '/master/p3k/create' },
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

type GroupedPlants = Record<string, Plant[]>;

export default function CreateMasterP3k({ plants }: { plants: Plant[] }) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            entity_code: '',
            plant_code: '',
            no_p3k: '',
            room_code: '',
            location: '',
            type: '',
            inventory_code: '',
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
        router.post(route('p3k.store'), values, {
            onSuccess: () => form.reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Buat Master P3K" />
            <div className="space-y-6 p-4">
                <SectionHeader
                    title="Buat Master P3K"
                    subtitle="Masukkan data lokasi dan identitas P3K di entitas terkait."
                />

                <Card>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* KIRI */}
                                    <div className="space-y-4">
                                        {/* Entitas */}
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

                                        {/* Plant */}
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
                                                                placeholder="Plant akan terisi otomatis atau pilih entity"
                                                                value={filteredPlants.length === 1 ? filteredPlants[0].name_plant : ''}
                                                            />
                                                        )}
                                                    </FormControl>
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
                                                        <Input placeholder="Masukkan No P3K" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Kode Ruang */}
                                        <FormField
                                            control={form.control}
                                            name="room_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Ruang</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Kode Ruang" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* KANAN */}
                                    <div className="space-y-4">
                                        {/* Lokasi */}
                                        <FormField
                                            control={form.control}
                                            name="location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Lokasi</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Lokasi" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Kode Inventaris */}
                                        <FormField
                                            control={form.control}
                                            name="inventory_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Inventaris</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Kode Inventaris" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Jenis */}
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Jenis</FormLabel>
                                                    <FormControl>
                                                        <Select value={field.value} onValueChange={field.onChange}>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Pilih Jenis" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {typeOptions.map(option => (
                                                                    <SelectItem key={option} value={option}>
                                                                        {option}
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
                                        {form.formState.isSubmitting ? 'Menyimpan...' : 'Submit Data'}
                                    </Button>
                                    <Link href={route('p3k.index')} className="text-sm text-muted-foreground hover:underline">
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
