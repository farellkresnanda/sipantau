'use client';

import { Head, router } from '@inertiajs/react';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
  nama_peralatan: z.string().min(1, 'Nama peralatan wajib diisi'),
  referensi: z.string().optional(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export default function CreatePage() {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama_peralatan: '',
      referensi: '',
    },
  });

  const onSubmit = (values: FormSchemaType) => {
    router.post(route('laporan-uji-riksa-peralatan.store'), values);
  };

  return (
    <AppLayout>
      <Head title="Tambah Uji Riksa Peralatan" />
      <div className="space-y-6 p-4">
        <SectionHeader title="Tambah Peralatan" subtitle="Masukkan data peralatan baru untuk uji riksa." />

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="nama_peralatan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Peralatan</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referensi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referensi (Opsional)</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={form.formState.isSubmitting}>Submit</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}