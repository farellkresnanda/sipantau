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
  { title: 'Master Genset', href: '/master/genset' },
  { title: 'Create Genset', href: '/master/genset/create' },
];

// Skema validasi dengan zod
const formSchema = z.object({
  jenis_mesin: z.string().min(1, 'Jenis mesin wajib diisi'),
  merk: z.string().min(1, 'Merk wajib diisi'),
  model: z.string().min(1, 'Model wajib diisi'),
  negara_thn_pembuatan: z.string().min(1, 'Negara & tahun pembuatan wajib diisi'),
  pabrik_pembuat: z.string().min(1, 'Pabrik pembuat wajib diisi'),
  no_seri: z.string().min(1, 'No seri wajib diisi'),
  kapasitas: z.string().min(1, 'Kapasitas wajib diisi'),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function CreateMasterGenset() {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jenis_mesin: '',
      merk: '',
      model: '',
      negara_thn_pembuatan: '',
      pabrik_pembuat: '',
      no_seri: '',
      kapasitas: '',
    },
  });

  function onSubmit(values: FormSchemaType) {
    router.post(route('genset.store'), values, {
      onSuccess: () => form.reset(),
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Master Genset" />
      <div className="space-y-6 p-4">
        <SectionHeader
          title="Create Master Genset"
          subtitle="Masukkan data lengkap mesin genset."
        />

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kiri */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="jenis_mesin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Mesin</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Motor Diesel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="merk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Merk</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: PERKINS" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: 1006-6TA" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="negara_thn_pembuatan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Negara & Tahun Pembuatan</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: UK/2014" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Kanan */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="pabrik_pembuat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pabrik Pembuat</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: PERKINS ENGINE CC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="no_seri"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No Seri</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: U960673Y" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="kapasitas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kapasitas</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: 123 KW" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Creating...' : 'Submit Data'}
                  </Button>
                  <Link
                    href={route('genset.index')}
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