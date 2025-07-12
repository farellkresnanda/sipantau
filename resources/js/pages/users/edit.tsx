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
    { title: 'Home', href: '/' },
    { title: 'Manage Users', href: '/users' },
    { title: 'Edit User', href: '#' },
];

// Schema validasi
const formSchema = z
    .object({
        name: z.string().min(2).max(50),
        email: z.string().email(),
        role: z.string(),
        password: z.string().min(8).optional().or(z.literal('')),
        password_confirmation: z.string().optional(),
        npp: z.string().optional(),
        npp_sap: z.string().optional(),
        position_code: z.string().optional(),
        position_name: z.string().optional(),
        position_level: z.string().optional(),
        position_level_name: z.string().optional(),
        entity_group_code: z.string().optional(),
        entity_code: z.string().optional(),
        entity_name: z.string().optional(),
        entity_alias_name: z.string().optional(),
        directorate_code: z.string().optional(),
        directorate_name: z.string().optional(),
        division_code: z.string().optional(),
        division_name: z.string().optional(),
        unit_code: z.string().optional(),
        unit_name: z.string().optional(),
        sub_unit_code: z.string().optional(),
        sub_unit_name: z.string().optional(),
        department_code: z.string().optional(),
        department_name: z.string().optional(),
        branch_manager_code: z.string().optional(),
        branch_manager_name: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.password || data.password_confirmation) {
                return data.password === data.password_confirmation;
            }
            return true;
        },
        {
            message: "Passwords don't match",
            path: ['password_confirmation'],
        },
    );

type FormSchemaType = z.infer<typeof formSchema>;

export default function EditUser({
    user,
    roles,
}: {
    user: {
        id: number;
        name: string;
        email: string;
        roles: Array<{ id: string; name: string }>;
        npp?: string;
        npp_sap?: string;
        position_code?: string;
        position_name?: string;
        position_level?: string;
        position_level_name?: string;
        entity_group_code?: string;
        entity_code?: string;
        entity_name?: string;
        entity_alias_name?: string;
        directorate_code?: string;
        directorate_name?: string;
        division_code?: string;
        division_name?: string;
        unit_code?: string;
        unit_name?: string;
        sub_unit_code?: string;
        sub_unit_name?: string;
        department_code?: string;
        department_name?: string;
        branch_manager_code?: string;
        branch_manager_name?: string;
    };
    roles: { id: string; name: string }[];
}) {
    const { errors } = usePage().props as {
        errors: Record<string, string>;
    };

    const form = useForm<FormSchemaType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name || '',
            email: user.email || '',
            role: user.roles[0]?.name || '',
            password: '',
            password_confirmation: '',
            npp: user.npp || '',
            npp_sap: user.npp_sap || '',
            position_code: user.position_code || '',
            position_name: user.position_name || '',
            position_level: user.position_level || '',
            position_level_name: user.position_level_name || '',
            entity_group_code: user.entity_group_code || '',
            entity_code: user.entity_code || '',
            entity_name: user.entity_name || '',
            entity_alias_name: user.entity_alias_name || '',
            directorate_code: user.directorate_code || '',
            directorate_name: user.directorate_name || '',
            division_code: user.division_code || '',
            division_name: user.division_name || '',
            unit_code: user.unit_code || '',
            unit_name: user.unit_name || '',
            sub_unit_code: user.sub_unit_code || '',
            sub_unit_name: user.sub_unit_name || '',
            department_code: user.department_code || '',
            department_name: user.department_name || '',
            branch_manager_code: user.branch_manager_code || '',
            branch_manager_name: user.branch_manager_name || '',
        },
    });

    // Inject error dari Laravel ke React Hook Form
    useEffect(() => {
        Object.entries(errors).forEach(([key, message]) => {
            form.setError(key as keyof FormSchemaType, {
                type: 'manual',
                message,
            });
        });
    }, [errors, form]);

    function onSubmit(values: FormSchemaType) {
        const formData = { ...values };
        if (!formData.password) {
            delete formData.password;
            delete formData.password_confirmation;
        }
        router.put(route('users.update', user.id), formData);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader title="Edit User" subtitle="Update user data below." />
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
                                            name="branch_manager_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Kode Branch Manager</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Kode Branch Manager" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="branch_manager_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Nama Branch Manager</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Masukkan Nama Branch Manager" {...field} />
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
                                        {form.formState.isSubmitting ? 'Updating...' : 'Update User'}
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
