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
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Kelola Data Pengguna',
        href: '/users',
    },
    {
        title: 'Tambah User',
        href: '/users/create',
    },
];

// Validasi zod
const formSchema = z
    .object({
        name: z.string().min(2).max(50),
        email: z.string().email(),
        password: z.string().min(8),
        password_confirmation: z.string().min(8),
        role: z.enum(['SuperAdmin', 'Admin', 'Officer', 'Technician', 'Validator', 'Viewer']).default('Viewer'),
        npp: z.string(),
        npp_sap: z.string(),
        position_code: z.string(),
        position_name: z.string(),
        position_level: z.string(),
        position_level_name: z.string(),
        entity_group_code: z.string(),
        entity_code: z.string(),
        entity_name: z.string(),
        entity_alias_name: z.string(),
        directorate_code: z.string(),
        directorate_name: z.string(),
        division_code: z.string(),
        division_name: z.string(),
        unit_code: z.string(),
        unit_name: z.string(),
        sub_unit_code: z.string(),
        sub_unit_name: z.string(),
        department_code: z.string(),
        department_name: z.string(),
        plant_code: z.string(),
        plant_name: z.string(),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Passwords do not match',
        path: ['password_confirmation'],
    });

export default function CreateUser({ roles }: { roles: { id: string; name: string }[] }) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            password_confirmation: '',
            role: 'Viewer',
            npp: '',
            npp_sap: '',
            position_code: '',
            position_name: '',
            position_level: '',
            position_level_name: '',
            entity_group_code: '',
            entity_code: '',
            entity_name: '',
            entity_alias_name: '',
            directorate_code: '',
            directorate_name: '',
            division_code: '',
            division_name: '',
            unit_code: '',
            unit_name: '',
            sub_unit_code: '',
            sub_unit_name: '',
            department_code: '',
            department_name: '',
            plant_code: '',
            plant_name: '',
        },
    });

    // Inject error dari Laravel ke React Hook Form
    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof typeof formSchema._type, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        router.post(route('users.store'), values, {
            onSuccess: () => {
                form.reset();
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah User" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Tambah User" subtitle="Lengkapi formulir di bawah ini untuk membuat pengguna baru." />
                </div>

                <Card className="w-full">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan nama" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="npp"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>NPP</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan NPP" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="npp_sap"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>NPP SAP</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan NPP SAP" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="position_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Jabatan</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Kode Jabatan" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="position_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Jabatan</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Nama Jabatan" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="position_level"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Level Jabatan</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Level Jabatan" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="position_level_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Level Jabatan</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Nama Level Jabatan" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="entity_group_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Grup Entitas</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Kode Grup Entitas" {...field} />
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
                                                    <FormLabel>Kode Entitas</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Kode Entitas" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="entity_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Entitas</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Nama Entitas" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="entity_alias_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Alias Entitas</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Alias Entitas" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="directorate_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Direktorat</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Kode Direktorat" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="directorate_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Direktorat</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Nama Direktorat" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="division_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Divisi</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Kode Divisi" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="division_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Divisi</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Nama Divisi" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="unit_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Unit</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Kode Unit" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="unit_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Unit</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Nama Unit" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="sub_unit_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Sub Unit</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Kode Sub Unit" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="sub_unit_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Sub Unit</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Nama Sub Unit" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="department_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Departemen</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Kode Departemen" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="department_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Departemen</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Nama Departemen" {...field} />
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
                                                    <FormLabel>Kode Plant</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Kode Plant" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="plant_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Plant</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Nama Plant" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="Masukkan Email" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="password"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Kata Sandi</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="Masukkan Kata Sandi" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="password_confirmation"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Konfirmasi Kata Sandi</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="Ulangi Kata Sandi" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="role"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Role</FormLabel>
                                                    <FormControl>
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                    </div>
                                </div>

                                {/* Submit & Cancel */}
                                <div className="flex items-center gap-2">
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? 'Creating...' : 'Tambah User'}
                                    </Button>
                                    <Link href={route('users.index')} className="text-muted-foreground text-sm hover:underline">
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
