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
  { title: 'Edit Master Genset', href: '#' },
];

const formSchema = z.object({
  machine_type: z.string().min(1, 'Jenis mesin wajib diisi'),
  merk: z.string().min(1, 'Merk wajib diisi'),
  model: z.string().min(1, 'Model wajib diisi'),
  country_year_of_manufacture: z.string().min(1, 'Negara & tahun pembuatan wajib diisi'),
  manufacturer: z.string().min(1, 'Pabrik pembuat wajib diisi'),
  serial_number: z.string().min(1, 'No seri wajib diisi'),
  capacity: z.string().min(1, 'Kapasitas wajib diisi'),
});

type FormSchemaType = z.infer<typeof formSchema>;

type MasterGenset = {
  id: number;
  machine_type: string;
  merk: string;
  model: string;
  country_year_of_manufacture: string;
  manufacturer: string;
  serial_number: string;
  capacity: string;
};

export default function EditMasterGenset({ masterGenset }: { masterGenset: MasterGenset }) {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      machine_type: masterGenset.machine_type || '',
      merk: masterGenset.merk || '',
      model: masterGenset.model || '',
      country_year_of_manufacture: masterGenset.country_year_of_manufacture || '',
      manufacturer: masterGenset.manufacturer || '',
      serial_number: masterGenset.serial_number || '',
      capacity: masterGenset.capacity || '',
    },
  });

  function onSubmit(values: FormSchemaType) {
    router.put(route('genset.update', masterGenset.id), values);
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Master Genset" />
      <div className="space-y-6 p-4">
        <SectionHeader
          title="Edit Master Genset"
          subtitle="Perbarui informasi mesin genset."
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
                      name="machine_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Mesin</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="country_year_of_manufacture"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Negara & Tahun Pembuatan</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                      name="manufacturer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pabrik Pembuat</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="serial_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>No Seri</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="capacity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kapasitas</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                    {form.formState.isSubmitting ? 'Updating...' : 'Update Data'}
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
