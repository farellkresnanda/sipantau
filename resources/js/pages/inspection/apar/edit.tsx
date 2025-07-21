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
    { title: 'Master APAR', href: '/master/apar' },
    { title: 'Edit Master APAR', href: '#' },
];

const formSchema = z.object({
    entity_code: z.string().min(1).max(255),
    plant_code: z.string().min(1).max(255),
    apar_no: z.string().min(1).max(255),
    room_code: z.string().min(1).max(255),
    location: z.string().min(1).max(255),
    type: z.string().min(1).max(255),
    apar: z.string().min(1).max(255),
    inventory_code: z.string().min(1).max(255),
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
    masterApar: {
        id: number;
        entity_code: string;
        plant_code: string;
        apar_no: string;
        room_code: string;
        location: string;
        type: string;
        apar: string;
        inventory_code: string;
    };
    entityList: Entitas[];
    plantList: Plant[];
};

export default function EditMasterApar({ masterApar, entityList, plantList }: Props) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const [filteredPlants, setFilteredPlants] = useState<Plant[]>(
        plantList.filter((plant) => plant.entity_code === masterApar.entity_code)
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            entity_code: masterApar.entity_code || '',
            plant_code: masterApar.plant_code || '',
            apar_no: masterApar.apar_no || '',
            room_code: masterApar.room_code || '',
            location: masterApar.location || '',
            type: masterApar.type || '',
            apar: masterApar.apar || '',
            inventory_code: masterApar.inventory_code || '',
        },
    });

    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof typeof formSchema._type, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        router.put(route('apar.update', masterApar.id), values);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Master APAR" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Edit Master APAR" subtitle="Update data Master APAR beserta semua informasinya di bawah ini." />
                </div>

                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="entity_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Entitas</FormLabel>
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
                                                                <SelectValue placeholder="Pilih kode entity" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {entityList.map((entity) => (
                                                                <SelectItem key={entity.id} value={entity.entity_code}>
                                                                    {entity.entity_code} - {entity.name}
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

                                        <FormField
                                            control={form.control}
                                            name="apar_no"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>No APAR / No APAB</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter no APAR / No APAB" {...field} />
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
                                    </div>

                                    <div className="space-y-4">
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
                                                        <select {...field} className="input w-full rounded border px-3 py-2">
                                                            <option value="">-- Pilih Jenis --</option>
                                                            <option value="Non Halon">Non Halon</option>
                                                            <option value="Dry Powder">Dry Powder</option>
                                                        </select>
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
                                                        <select {...field} className="w-full rounded border px-3 py-2">
                                                            <option value="">Select Type</option>
                                                            <option value="APAR">APAR</option>
                                                            <option value="APAB">APAB</option>
                                                        </select>
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
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Updating...' : 'Update Data'}
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
