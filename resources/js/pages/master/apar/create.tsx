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
    entity_code: z.string().min(1, { message: 'Kode entity is required' }).max(255),
    plant_code: z.string().min(1, { message: 'Kode plant is required' }).max(255),
    apar_no: z.string().min(1, { message: 'No APAR is required' }).max(255),
    room_code: z.string().min(1, { message: 'Kode room is required' }).max(255),
    location: z.string().min(1, { message: 'Lokasi is required' }).max(255),
    type: z.string().min(1, { message: 'Jenis is required' }).max(255),
    apar: z.string().min(1, { message: 'APAR is required' }).max(255),
    inventory_code: z.string().min(1, { message: 'Kode inventaris is required' }).max(255),
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
    plant_code: string;
};

type Props = {
    entityList: Entitas[];
    plantList: Plant[];
};

export default function CreateMasterApar({ entityList, plantList }: Props) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            entity_code: '',
            plant_code: '',
            apar_no: '',
            room_code: '',
            location: '',
            type: '',
            apar: '',
            inventory_code: '',
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
                <SectionHeader title="Buat Data Master APAR" subtitle="Buat note data master APAR baru untuk mengelola data inspeksi APAR" />
                <Card>
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                                    <FormField
                                        control={form.control}
                                        name="plant_code"
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

                                    <FormField
                                        control={form.control}
                                        name="apar_no"
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
                                        name="room_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kode Ruang</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter kode room" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="location"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lokasi</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter location" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Jenis</FormLabel>
                                                <FormControl>
                                                    <Select
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih type" />
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
                                        name="inventory_code"
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
