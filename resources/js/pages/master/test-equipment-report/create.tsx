'use client';

import { Head, Link, router } from '@inertiajs/react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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

// Breadcrumb navigasi
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Master Uji Riksa Peralatan', href: '/master/test-equipment-report' },
  { title: 'Create Master Uji Riksa Peralatan', href: '/master/test-equipment-report/create' },
];

// Skema validasi
const formSchema = z.object({
  equipment_name: z.string().min(1, 'Nama peralatan wajib diisi'),
  reference: z.string().optional(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function CreateUjiRiksaPeralatan() {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipment_name: '',
      reference: '',
    },
  });

  const onSubmit = (values: FormSchemaType) => {
    router.post(route('test-equipment-report.store'), values, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tambah Uji Riksa Peralatan" />
      <div className="space-y-6 p-4">
        <SectionHeader
          title="Tambah Uji Riksa Peralatan"
          subtitle="Masukkan data peralatan berdasarkan standar dan regulasi."
        />

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="equipment_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Peralatan</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: APAR, Panel Listrik, Hydrant, dll." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Referensi (Opsional)</FormLabel>
                        <FormControl>
                          <Input placeholder='Contoh: "Permenaker No. PER.04/MEN/1987"' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tombol aksi */}
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Submitting...' : 'Submit Data'}
                  </Button>
                  <Link
                    href={route('test-equipment-report.index')}
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
