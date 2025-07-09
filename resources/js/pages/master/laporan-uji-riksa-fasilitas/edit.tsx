'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import * as z from 'zod';

import AppLayout from '@/layouts/app-layout';
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
import type { BreadcrumbItem } from '@/types';

// 🧭 Breadcrumb untuk navigasi
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Master Laporan Uji Riksa Fasilitas', href: '/master/laporan-uji-riksa-fasilitas' },
  { title: 'Edit Uji Riksa Fasilitas', href: '#' },
];

// ✅ Validasi form
const formSchema = z.object({
  nama_fasilitas: z.string().min(1, 'Nama fasilitas wajib diisi'),
  referensi: z.string().min(1, 'Referensi wajib diisi'),
});

type FormSchemaType = z.infer<typeof formSchema>;
type UjiRiksaFasilitas = {
  id: number;
  nama_fasilitas: string;
  referensi: string;
};

export default function EditUjiRiksaFasilitas({
  fasilitas,
}: {
  fasilitas: UjiRiksaFasilitas;
}) {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_fasilitas: fasilitas.nama_fasilitas,
      referensi: fasilitas.referensi,
    },
  });

  const onSubmit = (values: FormSchemaType) => {
    router.put(route('laporan-uji-riksa-fasilitas.update', fasilitas.id), values);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Uji Riksa Fasilitas" />

      <div className="p-4 space-y-6">
        <SectionHeader
          title="Edit Uji Riksa Fasilitas"
          subtitle="Perbarui informasi fasilitas sesuai referensi regulasi."
        />

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Grid 2 kolom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nama_fasilitas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Fasilitas</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama fasilitas" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referensi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referensi</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan referensi regulasi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tombol aksi */}
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Updating...' : 'Update Data'}
                  </Button>
                  <Link
                    href={route('laporan-uji-riksa-fasilitas.index')}
                    className="text-sm text-muted-foreground hover:underline"
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
