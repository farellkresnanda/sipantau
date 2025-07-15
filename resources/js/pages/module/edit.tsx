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
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Hak Akses Modul', href: '/module-managers' },
    { title: 'Edit Module', href: '/module-managers/edit' },
];

const formSchema = z.object({
    module_ids: z
        .array(z.union([z.string(), z.number().transform(String)]))
        .transform((arr) => arr.map(String))
        .refine((arr) => arr.length >= 1, {
            message: 'Pilih minimal satu module',
        }),
    role_name: z.string().min(1, 'Role wajib diisi'),
    user_id: z.string().min(1, 'User wajib diisi'),
    entity_code: z.string().min(1, 'Entity wajib diisi'),
    plant_code: z.string().min(1, 'Plant wajib diisi'),
    is_active: z.string().refine((val) => val === '1' || val === '0', {
        message: 'Status aktif harus 1 atau 0',
    }),
});

type Plant = {
    id: string;
    name_plant: string;
    entity_code: string;
    plant_code: string;
    entity_name: string;
};

type GroupedPlants = Record<string, Plant[]>;

export default function EditModule({
         module_manager,
         roles,
         users,
         modules,
         plants,
     }: {
    module_manager: {
        id: string;
        user_id: string;
        entity_code: string;
        plant_code: string;
        role_name: string;
        module_ids: string[];
        is_active: string;
        user: { id: string; name: string; npp: string };
        entity: { entity_code: string; name: string };
        plant: { plant_code: string; name: string };
        modules: Array<{ id: string; code: string; name: string }>;
    };
    roles: { id: string; name: string }[];
    users: { id: string; name: string; npp: string }[];
    modules: {
        id: string;
        code: string;
        name: string;
        description?: string;
        is_active?: boolean;
    }[];
    plants: Plant[];
}) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            module_ids: module_manager?.modules?.map((m) => String(m.id)) ?? [],
            role_name: module_manager?.role_name ?? '',
            user_id:  String(module_manager?.user.id ?? ''),
            entity_code: module_manager?.entity_code ?? '',
            plant_code: module_manager?.plant_code ?? '',
            is_active: module_manager?.is_active ?? '1',
        },
    });

    console.log('Default module_ids:', form.getValues('module_ids'));

    const selectedEntityCode = form.watch('entity_code');

    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof typeof formSchema._type, {
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
        return plants.filter((plant) => plant.entity_code === selectedEntityCode);
    }, [plants, selectedEntityCode]);

    useEffect(() => {
        if (filteredPlants.length === 1) {
            form.setValue('plant_code', filteredPlants[0].plant_code);
        }
    }, [filteredPlants, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        router.put(route('module-managers.update', module_manager.user_id), values, {
            onSuccess: () => form.reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Module" />

            <div className="space-y-6 p-4">
                <SectionHeader
                    title="Edit Module"
                    subtitle="Lengkapi formulir di bawah ini untuk mengubah hak akses modul."
                />

                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="user_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Pegawai</FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih User" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {users.map((user) => (
                                                                <SelectItem key={user.id} value={String(user.id)}>
                                                                    {user.name} ({user.npp})
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
                                        name="entity_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Area Entitas</FormLabel>
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
                                                            {Object.keys(groupedPlants).map((entityNama) => (
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

                                    <FormField
                                        control={form.control}
                                        name="plant_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Area Plant</FormLabel>
                                                <FormControl>
                                                    {filteredPlants.length > 1 ? (
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                            disabled={!selectedEntityCode}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Pilih plant" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {filteredPlants.map((plant) => (
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
                                                            value={
                                                                filteredPlants.length === 1
                                                                    ? filteredPlants[0].name_plant
                                                                    : ''
                                                            }
                                                            placeholder="Plant akan terisi otomatis atau pilih entity"
                                                        />
                                                    )}
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="role_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Role</FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih Role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {roles.map((role) => (
                                                                <SelectItem key={role.id} value={role.name}>
                                                                    {role.name}
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
                                        name="is_active"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status Aktif</FormLabel>
                                                <FormControl>
                                                    <Select value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Pilih Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1">Aktif</SelectItem>
                                                            <SelectItem value="0">Nonaktif</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="module_ids"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Modules</FormLabel>
                                                <div className="rounded-md border">
                                                    <table className="w-full table-auto">
                                                        <thead className="bg-muted">
                                                        <tr>
                                                            <th className="p-2 text-left">Code</th>
                                                            <th className="p-2 text-left">Name</th>
                                                            <th className="p-2 text-left">Description</th>
                                                            <th className="p-2 text-left">Status</th>
                                                            <th className="p-2 text-left">
                                                                <div className="flex items-center gap-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded border-gray-300"
                                                                        onChange={(e) => {
                                                                            const value = e.target.checked
                                                                                ? modules.map((m) => m.id)
                                                                                : [];
                                                                            field.onChange(value);
                                                                            form.trigger('module_ids');
                                                                        }}
                                                                        checked={
                                                                            field.value.length === modules.length
                                                                        }
                                                                    />
                                                                    <span className="text-sm">Select All</span>
                                                                </div>
                                                            </th>
                                                        </tr>
                                                        </thead>
                                                        <tbody>
                                                        {modules.map((module) => (
                                                            <tr key={module.id} className="border-t">
                                                                <td className="p-2">{module.code}</td>
                                                                <td className="p-2">{module.name}</td>
                                                                <td className="p-2">
                                                                    {module.description?.substring(0, 50) || '-'}
                                                                    {module.description &&
                                                                    module.description.length > 50
                                                                        ? '...'
                                                                        : ''}
                                                                </td>
                                                                <td className="p-2">
                                                                        <span
                                                                            className={`rounded-full px-2 py-1 text-xs ${
                                                                                module.is_active
                                                                                    ? 'bg-green-100 text-green-800'
                                                                                    : 'bg-red-100 text-red-800'
                                                                            }`}
                                                                        >
                                                                            {module.is_active
                                                                                ? 'Active'
                                                                                : 'Inactive'}
                                                                        </span>
                                                                </td>
                                                                <td className="p-2">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={field.value.includes(String(module.id))}
                                                                        onChange={(e) => {
                                                                            const value = [...field.value];
                                                                            const id = String(module.id);
                                                                            if (e.target.checked) {
                                                                                if (!value.includes(id)) value.push(id);
                                                                            } else {
                                                                                const idx = value.indexOf(id);
                                                                                if (idx > -1) value.splice(idx, 1);
                                                                            }
                                                                            field.onChange(value);
                                                                            form.trigger('module_ids');
                                                                        }}
                                                                        className="rounded border-gray-300"
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Updating...' : 'Update Data'}
                                    </Button>
                                    <Link
                                        href={route('module-managers.index')}
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
