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
    { title: 'Temuan', href: '/k3temuan' },
    { title: 'Create Temuan', href: '/k3temuan/create' },
];

const formSchema = z.object({
    tanggal: z.string().min(1, { message: 'Tanggal is required' }),
    jenis_ketidaksesuaian_id: z.string().min(1, { message: 'Jenis ketidaksesuaian is required' }),
    jenis_ketidaksesuaian_sub_id: z.string().min(1, { message: 'Sub jenis ketidaksesuaian is required' }),
    deskripsi_temuan: z.string().min(1, { message: 'Deskripsi temuan is required' }),
    foto_temuan_sebelum: z.instanceof(File, { message: 'Foto temuan is required' }),
    detail_lokasi_temuan: z.string().min(1, { message: 'Detail lokasi temuan is required' }),
    akar_masalah: z.string().min(1, { message: 'Akar masalah is required' }),
});

export default function CreateK3Temuan() {
    const { errors = {}, jenisKetidaksesuaian = [] } = usePage().props as unknown as {
        errors: Record<string, string>;
        jenisKetidaksesuaian: Array<{
            id: string;
            nama_ketidaksesuaian: string;
            sub_id: string;
            sub_nama: string;
        }>;
    };

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tanggal: '',
            jenis_ketidaksesuaian_id: '',
            jenis_ketidaksesuaian_sub_id: '',
            deskripsi_temuan: '',
            foto_temuan_sebelum: undefined,
            detail_lokasi_temuan: '',
            akar_masalah: '',
        },
    });

    const [filteredSubJenis, setFilteredSubJenis] = useState<Array<{ id: string; sub_nama: string }>>([]);

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

    // Group data by jenis ketidaksesuaian
    const groupedData = jenisKetidaksesuaian.reduce(
        (acc, curr) => {
            const existing = acc.find((item) => item.id === curr.id);
            if (existing) {
                if (curr.sub_id) {
                    existing.subs.push({
                        id: curr.sub_id,
                        sub_nama: curr.sub_nama,
                    });
                }
            } else {
                acc.push({
                    id: curr.id,
                    nama: curr.nama_ketidaksesuaian,
                    subs: curr.sub_id
                        ? [
                              {
                                  id: curr.sub_id,
                                  sub_nama: curr.sub_nama,
                              },
                          ]
                        : [],
                });
            }
            return acc;
        },
        [] as Array<{ id: string; nama: string; subs: Array<{ id: string; sub_nama: string }> }>,
    );

    // Update filteredSubJenis when jenis ketidaksesuaian changes
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === 'jenis_ketidaksesuaian_id') {
                const selectedId = value.jenis_ketidaksesuaian_id;
                const selectedJenis = groupedData.find((item) => String(item.id) === String(selectedId));
                setFilteredSubJenis(selectedJenis?.subs || []);

                if (selectedJenis?.subs.length === 1) {
                    form.setValue('jenis_ketidaksesuaian_sub_id', String(selectedJenis.subs[0].id));
                } else {
                    form.setValue('jenis_ketidaksesuaian_sub_id', '');
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

        router.post(route('k3temuan.store'), formData);
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
                                        name="tanggal"
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

                                    {/* Jenis & Sub Jenis Ketidaksesuaian (sejajar) */}
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {/* Jenis Ketidaksesuaian */}
                                        <FormField
                                            control={form.control}
                                            name="jenis_ketidaksesuaian_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Jenis Ketidaksesuaian</FormLabel>
                                                    <FormControl>
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                form.setValue('jenis_ketidaksesuaian_sub_id', '');
                                                            }}
                                                        >
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Pilih jenis ketidaksesuaian" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {groupedData.map((jenis) => (
                                                                    <SelectItem key={jenis.id} value={String(jenis.id)}>
                                                                        {jenis.nama}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Sub Jenis Ketidaksesuaian */}
                                        <FormField
                                            control={form.control}
                                            name="jenis_ketidaksesuaian_sub_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sub Jenis Ketidaksesuaian</FormLabel>
                                                    <FormControl>
                                                        {filteredSubJenis.length > 1 ? (
                                                            <Select
                                                                value={field.value}
                                                                onValueChange={field.onChange}
                                                                disabled={!form.watch('jenis_ketidaksesuaian_id')}
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Pilih sub jenis" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {filteredSubJenis.map((sub) => (
                                                                        <SelectItem key={sub.id} value={String(sub.id)}>
                                                                            {sub.sub_nama}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        ) : (
                                                            <Input
                                                                readOnly
                                                                value={filteredSubJenis.length === 1 ? filteredSubJenis[0].sub_nama : ''}
                                                                placeholder="Sub jenis akan terisi otomatis atau pilih jenis"
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
                                </div>

                                {/* Deskripsi Temuan */}
                                <FormField
                                    control={form.control}
                                    name="deskripsi_temuan"
                                    render={({ field }) => (
                                        <FormItem className="md:col-span-2">
                                            <FormLabel>Deskripsi Temuan</FormLabel>
                                            <FormControl>
                                                <Textarea {...field} placeholder="Masukkan deskripsi temuan" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Akar Masalah */}
                                <FormField
                                    control={form.control}
                                    name="akar_masalah"
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
                            <Link href={route('k3temuan.index')} className="text-muted-foreground text-sm hover:underline">
                                Batal
                            </Link>
                        </div>
                    </form>
                </Form>
            </div>
        </AppLayout>
    );
}
