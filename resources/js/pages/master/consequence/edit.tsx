'use client';

import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { BreadcrumbItem } from '@/types';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Nama wajib diisi' }),
  consequence: z.string().min(1, { message: 'Konsekuensi wajib diisi' }),
});

type EditKonsekuensiPageProps = {
  data: { id: number; name: string; consequence: string };
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Master Konsekuensi', href: '/master/consequence' },
  { title: 'Edit', href: '#' },
];

export default function EditKonsekuensi() {
  const { data } = usePage<EditKonsekuensiPageProps>().props;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data.name,
      consequence: data.consequence,
    },
  });

  function onSubmit(values: any) {
    router.put(route('consequence.update', data.id), values, {
      onSuccess: () => {
        // Optional: toast or redirect
      },
      onError: (errors) => {
        console.error(errors);
      },
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Konsekuensi" />
      <div className="p-4 space-y-6">
        {/* Judul dan Deskripsi */}
        <div>
          <h1 className="text-2xl font-bold">Edit Master Konsekuensi</h1>
          <p className="text-sm text-muted-foreground">
            Perbarui data name consequence dan kode consequence sesuai kebutuhan.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kolom Kiri */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Konsekuensi</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Masukkan name consequence" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="consequence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Konsekuensi</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Masukkan kode consequence" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tombol Submit */}
                <div className="md:col-span-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Updating...' : 'Update Data'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
