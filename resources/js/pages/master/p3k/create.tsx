'use client';

import { useEffect } from 'react';
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

const jenisOptions = ['01', '02', '03'];

const formSchema = z.object({
    kode_entitas: z.string().min(1, { message: 'Entitas wajib dipilih' }), // Pesan error untuk entitas
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
    nama_plant: string; // Sesuai dengan 'master_plant.nama as nama_plant'
    kode_entitas: string;
    kode_plant: string;
    entitas_nama: string; // Sesuai dengan 'master_entitas.nama as entitas_nama'
};

type GroupedPlants = Record<string, Plant[]>;

export default function CreateMasterP3k({ plants }: { plants: Plant[] }) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kode_entitas: '',
            kode_plant: '',
            no_p3k: '',
            kode_ruang: '',
            lokasi: '',
            jenis: '',
            kode_inventaris: '',
        },
    });

    const selectedEntitasKode = form.watch('kode_entitas'); // Watch `kode_entitas`

    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof FormSchemaType, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    const groupedPlants: GroupedPlants = plants.reduce((acc, plant) => {
        const alias = plant.entitas_nama;
        if (!acc[alias]) acc[alias] = [];
        acc[alias].push(plant);
        return acc;
    }, {} as GroupedPlants);

    function onSubmit(values: FormSchemaType) {
        const payload = {
            kode_entitas: values.kode_entitas,
            kode_plant: values.kode_plant,
            no_p3k: values.no_p3k,
            kode_ruang: values.kode_ruang,
            lokasi: values.lokasi,
            jenis: values.jenis,
            kode_inventaris: values.kode_inventaris,
        };

        router.post(route('p3k.store'), payload, {
            onSuccess: () => form.reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Master P3K" />
            <div className="space-y-6 p-4">
                <SectionHeader
                    title="Create Master P3K"
                    subtitle="Masukkan data lokasi dan identitas kotak P3K di entitas terkait."
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

                                        {/* Plant */}
                                        <FormField
                                            control={form.control}
                                            name="kode_plant"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Plant</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={(kodePlant) => {
                                                                field.onChange(kodePlant);
                                                                const selectedPlant = plants.find(
                                                                    p => p.kode_entitas === selectedEntitasKode && p.kode_plant === kodePlant
                                                                );
                                                                if (selectedPlant) {
                                                                    form.setValue('kode_entitas', selectedPlant.kode_entitas);
                                                                }
                                                            }}
                                                            disabled={!selectedEntitasKode}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Pilih plant" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {plants
                                                                    .filter(plant => plant.kode_entitas === selectedEntitasKode)
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

                                        {/* Kode Ruang - Pindah ke kolom kiri */}
                                        <FormField
                                            control={form.control}
                                            name="kode_ruang"
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
                                        {/* Lokasi - Tetap di kolom kanan */}
                                        <FormField
                                            control={form.control}
                                            name="lokasi"
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

                                        {/* Kode Inventaris - Tetap di kolom kanan */}
                                        <FormField
                                            control={form.control}
                                            name="kode_inventaris"
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
                                                                <SelectValue placeholder="Pilih Jenis" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {jenisOptions.map(option => (
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
