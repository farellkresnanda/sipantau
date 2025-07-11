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
    kode_entitas: z.string().min(1, { message: 'Entitas wajib dipilih' }),
    kode_plant: z.string().min(1, { message: 'Plant wajib dipilih' }),
    ruang: z.string().min(1, { message: 'Ruang wajib diisi' }),
    kode_inventaris: z.string().min(1, { message: 'Kode Inventaris wajib diisi' }),
    merk: z.string().min(1, { message: 'Merk wajib diisi' }),
});

type FormSchemaType = z.infer<typeof formSchema>;

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

type MasterAcProps = {
    id: number;
    kode_entitas: string;
    kode_plant: string;
    ruang: string;
    kode_inventaris: string;
    merk: string;
};

export default function EditMasterAc({
    masterAc,
    entitasList,
    plantList,
}: {
    masterAc: MasterAcProps;
    entitasList: Entitas[];
    plantList: Plant[];
}) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kode_entitas: masterAc.kode_entitas,
            kode_plant: masterAc.kode_plant,
            ruang: masterAc.ruang,
            kode_inventaris: masterAc.kode_inventaris,
            merk: masterAc.merk,
        },
    });

    const currentKodeEntitas = form.watch('kode_entitas');

    const filteredPlants = useMemo(() => {
        return plantList.filter((plant) => plant.kode_entitas === currentKodeEntitas);
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
                    subtitle="Perbarui data AC berdasarkan entitas dan lokasi penempatan."
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
                                            name="kode_entitas"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Entitas</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={(val) => {
                                                                field.onChange(val);
                                                                form.setValue('kode_plant', '');
                                                            }}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Pilih entitas" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {entitasList.map((ent) => (
                                                                    <SelectItem key={ent.kode_entitas} value={ent.kode_entitas}>
                                                                        {ent.nama}
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
                                            name="kode_plant"
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
                                                                    <SelectItem key={plant.kode_plant} value={plant.kode_plant}>
                                                                        {plant.nama}
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
                                            name="ruang"
                                            render={({ field }) => (
                                                <FormItem className="w-full">
                                                    <FormLabel>Ruang</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan ruang" {...field} />
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
                                            name="kode_inventaris"
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
