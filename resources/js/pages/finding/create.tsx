import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Temuan', href: '/finding' },
    { title: 'Create Temuan', href: '/finding/create' },
];

const formSchema = z.object({
    date: z.string().min(1, { message: 'Tanggal is required' }),
    nonconformity_type_id: z.string().min(1, { message: 'Jenis ketidaksesuaian is required' }),
    nonconformity_subtype_id: z.string().optional(),
    finding_description: z.string().min(1, { message: 'Deskripsi finding is required' }),
    photo_before: z.instanceof(File, { message: 'Foto finding is required' }),
    location_details: z.string().min(1, { message: 'Detail location finding is required' }),
    root_cause: z.string().min(1, { message: 'Akar masalah is required' }),
});

export default function CreateFinding() {
    const { errors = {}, nonconformityType = [] } = usePage().props as unknown as {
        errors: Record<string, string>;
        nonconformityType: Array<{
            id: string;
            name: string;
            sub_id: string;
            sub_name: string;
        }>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: '',
            nonconformity_type_id: '',
            nonconformity_subtype_id: '',
            finding_description: '',
            photo_before: undefined,
            location_details: '',
            root_cause: '',
        },
    });

    const [filteredSubJenis, setFilteredSubJenis] = useState<Array<{ id: string; sub_name: string }>>([]);

    // Handle error dari server
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([key, message]) => {
                form.setError(key as keyof typeof formSchema._type, {
                    type: 'manual',
                    message,
                });
            });
        }
    }, [errors, form]);

    // Group data by type ketidaksesuaian
    const groupedData = nonconformityType.reduce(
        (acc, curr) => {
            const existing = acc.find((item) => item.id === curr.id);
            if (existing) {
                if (curr.sub_id) {
                    existing.subs.push({
                        id: curr.sub_id,
                        sub_name: curr.sub_name,
                    });
                }
            } else {
                acc.push({
                    id: curr.id,
                    name: curr.name,
                    subs: curr.sub_id
                        ? [
                              {
                                  id: curr.sub_id,
                                  sub_name: curr.sub_name,
                              },
                          ]
                        : [],
                });
            }
            return acc;
        },
        [] as Array<{ id: string; name: string; subs: Array<{ id: string; sub_name: string }> }>,
    );

    // Update filteredSubJenis when type ketidaksesuaian changes
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'nonconformity_type_id') {
                const selectedId = value.nonconformity_type_id;
                const selectedJenis = groupedData.find((item) => String(item.id) === String(selectedId));
                setFilteredSubJenis(selectedJenis?.subs || []);

                if (selectedJenis?.subs.length === 1) {
                    form.setValue('nonconformity_subtype_id', String(selectedJenis.subs[0].id));
                } else {
                    form.setValue('nonconformity_subtype_id', '');
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [form, groupedData]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value instanceof File) {
                formData.append(key, value);
            } else {
                formData.append(key, value.toString());
            }
        });

        router.post(route('finding.store'), formData);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Temuan" />
            <div className="space-y-6 p-4">
                <SectionHeader
                    title="Buat Temuan Baru"
                    subtitle="Buat data temuan baru dan lengkapi formulir di bawah ini dengan data yang dibutuhkan"
                />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* KIRI */}
                                <div className="space-y-4">
                                    {/* Tanggal Temuan */}
                                    <FormField
                                        control={form.control}
                                        name="date"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tanggal Temuan</FormLabel>
                                                <FormControl>
                                                    <Input type="date" className="w-full min-w-0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Jenis & Sub Ketidaksesuaian (sejajar) */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {/* Ketidaksesuaian */}
                                        <FormField
                                            control={form.control}
                                            name="nonconformity_type_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Ketidaksesuaian</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                form.setValue('nonconformity_subtype_id', '');
                                                            }}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Pilih type ketidaksesuaian" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {groupedData.map((type) => (
                                                                    <SelectItem key={type.id} value={String(type.id)}>
                                                                        {type.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Sub Ketidaksesuaian */}
                                        <FormField
                                            control={form.control}
                                            name="nonconformity_subtype_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sub Ketidaksesuaian</FormLabel>
                                                    <FormControl>
                                                        {filteredSubJenis.length > 1 ? (
                                                            <Select
                                                                value={field.value}
                                                                onValueChange={field.onChange}
                                                                disabled={!form.watch('nonconformity_type_id')}
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Pilih sub type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {filteredSubJenis.map((sub) => (
                                                                        <SelectItem key={sub.id} value={String(sub.id)}>
                                                                            {sub.sub_name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <Input
                                                                readOnly
                                                                value={filteredSubJenis.length === 1 ? filteredSubJenis[0].sub_name : ''}
                                                                placeholder="Sub type akan terisi otomatis atau pilih type"
                                                            />
                                                        )}
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* KANAN */}
                                <div className="space-y-4">
                                    {/* Foto Temuan */}
                                    <FormField
                                        control={form.control}
                                        name="photo_before"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Foto Temuan</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) field.onChange(file);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Detail Lokasi */}
                                    <FormField
                                        control={form.control}
                                        name="location_details"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Detail Lokasi Temuan</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Masukkan detail location" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Deskripsi Temuan */}
                                <FormField
                                    control={form.control}
                                    name="finding_description"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Deskripsi Temuan</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Masukkan description finding" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Akar Masalah */}
                                <FormField
                                    control={form.control}
                                    name="root_cause"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Akar Masalah</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Tulis akar masalah" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>



                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Creating...' : 'Submit Data'}
                            </Button>
                            <Link href={route('finding.index')} className="text-muted-foreground text-sm hover:underline">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
