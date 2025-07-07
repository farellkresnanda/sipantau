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
    { title: 'Master Lokasi', href: '/master/lokasi' },
    { title: 'Edit Master Lokasi', href: '#' },
];

const formSchema = z.object({
    nama: z.string().min(1, { message: 'Nama lokasi wajib diisi' }),
    entitas_kode: z.string().min(1, { message: 'Entitas wajib dipilih' }),
    plant_kode: z.string().min(1, { message: 'Plant wajib dipilih' }),
});

type Entitas = {
    id: number;
    nama: string;
    kode_entitas: string;
};

type Plant = {
    id: number;
    nama: string;
    kode_entitas: string;
    kode_plant: string;
};

type Props = {
    entitasList: Entitas[];
    plantList: Plant[];
    lokasi: {
        id: number;
        nama: string;
        entitas_kode: string;
        plant_kode: string;
    };
};

export default function EditMasterLokasi({ entitasList, plantList, lokasi }: Props) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nama: lokasi.nama || '',
            entitas_kode: lokasi.entitas_kode?.toString() || '',
            plant_kode: lokasi.plant_kode?.toString() || '',
        },
    });

    const entitasKode = form.watch('entitas_kode');
    const plantKode = form.watch('plant_kode');

    const filteredPlants = useMemo(() => {
        return plantList.filter((plant) => plant.kode_entitas === entitasKode);
    }, [entitasKode, plantList]);

    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof typeof formSchema._type, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        router.put(route('lokasi.update', lokasi.id), values);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Master Lokasi" />
            <div className="space-y-6 p-4">
                <SectionHeader
                    title="Edit Data Master Lokasi"
                    subtitle="Perbarui informasi lokasi yang sudah ada"
                />

                <Card>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Nama Lokasi */}
                                    <FormField
                                        control={form.control}
                                        name="nama"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Lokasi</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Masukkan nama lokasi" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Entitas */}
                                    <FormField
                                        control={form.control}
                                        name="entitas_kode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Entitas</FormLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        form.setValue('plant_kode', '');
                                                    }}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih entitas" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {entitasList.map((entitas) => (
                                                            <SelectItem
                                                                key={entitas.kode_entitas}
                                                                value={entitas.kode_entitas}
                                                            >
                                                                {entitas.nama}
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
                                        name="plant_kode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Plant</FormLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    disabled={!entitasKode}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih plant" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {filteredPlants.map((plant) => (
                                                            <SelectItem
                                                                key={plant.kode_plant}
                                                                value={plant.kode_plant}
                                                            >
                                                                {plant.nama}
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
                                        href={route('lokasi.index')}
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
