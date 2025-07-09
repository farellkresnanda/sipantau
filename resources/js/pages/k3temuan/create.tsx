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
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Temuan',
        href: '/k3temuan',
    },
    {
        title: 'Create Temuan',
        href: '/k3temuan/create',
    },
];

const formSchema = z.object({
    tanggal: z.string().min(1, { message: 'Tanggal is required' }),
    jenis_ketidaksesuaian_id: z.string().min(1, { message: 'Jenis ketidaksesuaian is required' }),
    deskripsi_temuan: z.string().min(1, { message: 'Deskripsi temuan is required' }),
    foto_temuan_sebelum: z.instanceof(File, { message: 'Foto temuan is required' }),
    detail_lokasi_temuan: z.string().min(1, { message: 'Detail lokasi temuan is required' }),
    akar_masalah: z.string().min(1, { message: 'Akar masalah is required' }),
});

export default function CreateK3Temuan() {
    const { errors, jenisKetidaksesuaian } = usePage().props as unknown as {
        errors: Record<string, string>;
        jenisKetidaksesuaian: Array<{ id: string; nama: string }>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tanggal: '',
            jenis_ketidaksesuaian_id: '',
            deskripsi_temuan: '',
            foto_temuan_sebelum: undefined,
            detail_lokasi_temuan: '',
            akar_masalah: '',
        },
    });

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

    function onSubmit(values: z.infer<typeof formSchema>) {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
            if (value instanceof File) {
                formData.append(key, value);
            } else if (value) {
                formData.append(key, value.toString());
            }
        });

        router.post(route('k3temuan.store'), formData);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Temuan" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <SectionHeader
                        title="Buat Temuan Baru"
                        subtitle="Buat data temuan baru dan lengkapi formulir di bawah ini dengan data yang dibutuhkan"
                    />
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Data Temuan Card */}
                        <Card>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="tanggal"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tanggal Temuan</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="jenis_ketidaksesuaian_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Jenis Ketidaksesuaian</FormLabel>
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Pilih jenis ketidaksesuaian" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {jenisKetidaksesuaian.map((jenis) => (
                                                            <SelectItem key={jenis.id} value={jenis.id.toString()}>
                                                                {jenis.nama}
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
                                        name="deskripsi_temuan"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>Deskripsi Temuan</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Masukkan deskripsi temuan" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="foto_temuan_sebelum"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Foto Temuan</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                field.onChange(file);
                                                            }
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="detail_lokasi_temuan"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Detail Lokasi Temuan</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="Masukkan detail lokasi" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="akar_masalah"
                                        render={({ field }) => (
                                            <FormItem className="col-span-2">
                                                <FormLabel>Akar Masalah</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} placeholder="Tulis akar masalah" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-2">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? 'Creating...' : 'Submit Data'}
                            </Button>
                            <Link href={route('k3temuan.index')} className="text-muted-foreground text-sm hover:underline">
                                Cancel
                            </Link>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
