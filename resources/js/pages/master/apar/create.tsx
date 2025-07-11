import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Master APAR', href: '/master/apar' },
    { title: 'Create Master APAR', href: '/master/apar/create' },
];

const formSchema = z.object({
    kode_entitas: z.string().min(1, { message: 'Kode entitas is required' }).max(255),
    kode_plant: z.string().min(1, { message: 'Kode plant is required' }).max(255),
    no_apar: z.string().min(1, { message: 'No APAR is required' }).max(255),
    kode_ruang: z.string().min(1, { message: 'Kode ruang is required' }).max(255),
    lokasi: z.string().min(1, { message: 'Lokasi is required' }).max(255),
    jenis: z.string().min(1, { message: 'Jenis is required' }).max(255),
    apar: z.string().min(1, { message: 'APAR is required' }).max(255),
    kode_inventaris: z.string().min(1, { message: 'Kode inventaris is required' }).max(255),
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
};

export default function CreateMasterApar({ entitasList, plantList }: Props) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kode_entitas: '',
            kode_plant: '',
            no_apar: '',
            kode_ruang: '',
            lokasi: '',
            jenis: '',
            apar: '',
            kode_inventaris: '',
        },
    });

    const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);

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
        router.post(route('apar.store'), values, {
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
            <Head title="Create Master APAR" />
            <div className="space-y-6 p-4">
                <SectionHeader title="Buat Data Master APAR" subtitle="Buat catatan data master APAR baru untuk mengelola data inspeksi APAR" />
                <Card>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="kode_entitas"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pilih Entitas</FormLabel>
                                                <Select
                                                    onValueChange={(value) => {
                                                        form.setValue('kode_entitas', value);
                                                        form.setValue('kode_plant', '');
                                                        const filtered = plantList.filter((plant) => plant.kode_entitas === value);
                                                        setFilteredPlants(filtered);
                                                    }}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih entitas" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {entitasList.map((entitas) => (
                                                            <SelectItem key={entitas.id} value={entitas.kode_entitas}>
                                                                {entitas.nama}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="kode_plant"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pilih Plant</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                    disabled={filteredPlants.length === 0}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih plant" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {filteredPlants.map((plant) => (
                                                            <SelectItem key={plant.id} value={plant.kode_plant}>
                                                                {plant.nama}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="no_apar"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>No APAR / No APAB</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter no APAR / no APAB" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="kode_ruang"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kode Ruang</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter kode ruang" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="lokasi"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lokasi</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter lokasi" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="jenis"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Jenis</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih jenis" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Non Halon">Non Halon</SelectItem>
                                                            <SelectItem value="Dry Powder">Dry Powder</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="apar"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Type</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="APAR">APAR</SelectItem>
                                                            <SelectItem value="APAB">APAB</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="kode_inventaris"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kode Inventaris</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter kode inventaris" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Creating...' : 'Submit Data'}
                                    </Button>
                                    <Link href={route('apar.index')} className="text-muted-foreground text-sm hover:underline">
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
