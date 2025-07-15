import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Master Lokasi', href: '/master/location' },
    { title: 'Create Master Lokasi', href: '/master/location/create' },
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
    plant_code: string; // Kode plant yang akan dikirim
};

type Props = {
    entityList: Entitas[];
    plantList: Plant[];
};

export default function CreateMasterLokasi({ entityList, plantList }: Props) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            entity_code: '',
            plant_code: '',
        },
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([key, message]) => {
                form.setError(key as keyof typeof formSchema._type, {
                    type: 'manual',
                    message: message,
                });
            });
        }
    }, [errors, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        router.post(route('location.store'), values, {
            onSuccess: () => {
                form.reset();
                setFilteredPlants([]);
            },
            onError: (errors) => {
                Object.entries(errors).forEach(([key, message]) => {
                    form.setError(key as keyof typeof formSchema._type, {
                        type: 'manual',
                        message: message as string,
                    });
                });
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Master Lokasi" />
            <div className="space-y-6 p-4">
                <SectionHeader title="Buat Data Master Lokasi" subtitle="Buat data master Lokasi baru untuk pendataan inventaris yang dimiliki" />

                <Card>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
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
                                                <FormLabel>Pilih Entitas</FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        form.setValue('entity_code', value);
                                                        form.setValue('plant_code', '');
                                                        const filtered = plantList.filter((plant) => plant.entity_code === value);
                                                        setFilteredPlants(filtered);
                                                    }}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih entity" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {entityList.map((entity) => (
                                                            <SelectItem key={entity.id} value={entity.entity_code}>
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
                                                <FormLabel>Pilih Plant</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={filteredPlants.length === 0}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih plant" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {filteredPlants.map((plant) => (
                                                            <SelectItem key={plant.id} value={plant.plant_code}>
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
                                        {form.formState.isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                                    </Button>
                                    <Link href={route('location.index')} className="text-muted-foreground text-sm hover:underline">
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
