'use client';

import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { BreadcrumbItem } from '@/types';

const formSchema = z.object({
  nama: z.string().min(1, { message: 'Nama wajib diisi' }),
  konsekuensi: z.string().min(1, { message: 'Konsekuensi wajib diisi' }),
});

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Master Konsekuensi', href: '/master/konsekuensi' },
  { title: 'Create Master Konsekuensi', href: '#' },
];

export default function CreateKonsekuensi() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { nama: '', konsekuensi: '' },
  });

  function onSubmit(values: any) {
    router.post(route('konsekuensi.store'), values, {
      onSuccess: () => form.reset(),
      onError: (errors) => {
        console.error(errors);
      },
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Master Konsekuensi" />
      <div className="p-4 space-y-6">
        {/* Judul dan Deskripsi */}
        <div>
          <h1 className="text-2xl font-bold">Create Master Konsekuensi</h1>
          <p className="text-sm text-muted-foreground">
            Masukkan data nama konsekuensi dan kode konsekuensi yang relevan.
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
                    name="nama"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Konsekuensi</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan nama konsekuensi" {...field} />
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
                    name="konsekuensi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Konsekuensi</FormLabel>
                        <FormControl>
                          <Input placeholder="Masukkan kode konsekuensi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tombol Submit - full width */}
                <div className="md:col-span-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Menyimpan...' : 'Submit Data'}
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
