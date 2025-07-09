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

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Maser Laporan Uji Riksa Fasilitas', href: '/master/laporan-uji-riksa-fasilitas' },
  { title: 'Create Master Laporan Uji Riksa Fasilitas', href: '/master/laporan-uji-riksa-fasilitas/create' },
];

// Skema validasi dengan zod
const formSchema = z.object({
  nama_fasilitas: z.string().min(1, 'Nama fasilitas wajib diisi'),
  referensi: z.string().min(1, 'Referensi wajib diisi'),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function CreateUjiRiksaFasilitas() {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_fasilitas: '',
      referensi: '',
    },
  });

  function onSubmit(values: FormSchemaType) {
    router.post(route('laporan-uji-riksa-fasilitas.store'), values, {
      onSuccess: () => form.reset(),
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tambah Uji Riksa Fasilitas" />
      <div className="space-y-6 p-4">
        <SectionHeader
          title="Tambah Uji Riksa Fasilitas"
          subtitle="Masukkan data fasilitas berdasarkan standar dan regulasi."
        />

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nama_fasilitas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Fasilitas</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Instalasi Listrik" {...field} />
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
                          <Input placeholder='Contoh: "UU No.1 Tahun 1970"' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Menyimpan...' : 'Submit Data'}
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
