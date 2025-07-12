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
  { title: 'Master Uji Riksa Peralatan', href: '/master/test-equipment-report' },
  { title: 'Edit Uji Riksa Peralatan', href: '#' },
];

// ✅ Validasi form
const formSchema = z.object({
  equipment_name: z.string().min(1, 'Nama peralatan wajib diisi'),
  reference: z.string().optional(),
});

type FormSchemaType = z.infer<typeof formSchema>;
type UjiRiksaPeralatan = {
  id: number;
  equipment_name: string;
  reference: string | null;
};

export default function EditUjiRiksaPeralatan({
  peralatan,
}: {
  peralatan: UjiRiksaPeralatan;
}) {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      equipment_name: peralatan.equipment_name,
      reference: peralatan.reference ?? '',
    },
  });

  const onSubmit = (values: FormSchemaType) => {
    router.put(route('test-equipment-report.update', peralatan.id), values);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Uji Riksa Peralatan" />

      <div className="p-4 space-y-6">
        <SectionHeader
          title="Edit Uji Riksa Peralatan"
          subtitle="Perbarui informasi peralatan sesuai reference regulasi."
        />

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Grid 2 kolom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="equipment_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Peralatan</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan name peralatan" {...field} />
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
                        <FormLabel>Referensi</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan reference regulasi (opsional)" {...field} />
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
