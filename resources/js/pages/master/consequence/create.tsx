'use client';

import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { BreadcrumbItem } from '@/types';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Nama wajib diisi' }),
  consequence: z.string().min(1, { message: 'Kode konsekuensi wajib diisi' }),
  human_effect: z.string().min(1, { message: 'Efek terhadap manusia wajib diisi' }),
  company_effect: z.string().min(1, { message: 'Efek terhadap perusahaan wajib diisi' }),
  environment_effect: z.string().min(1, { message: 'Efek terhadap lingkungan wajib diisi' }),
});

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Master Konsekuensi', href: '/master/consequence' },
  { title: 'Create Master Konsekuensi', href: '#' },
];

export default function CreateKonsekuensi() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      consequence: '',
      human_effect: '',
      company_effect: '',
      environment_effect: '',
    },
  });

  function onSubmit(values: any) {
    router.post(route('consequence.store'), values, {
      onSuccess: () => form.reset(),
      onError: (errors) => {
        console.error(errors);
      },
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Buat Konsekuensi" />
      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Buat Konsekuensi</h1>
          <p className="text-sm text-muted-foreground">
            Masukkan nama, kode konsekuensi, dan efek terhadap manusia, perusahaan, serta lingkungan.
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Kiri */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
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

                  <FormField
                    control={form.control}
                    name="consequence"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kode Konsekuensi</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: K001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="human_effect"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Efek terhadap Manusia</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Cedera serius" {...field} />
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
                    name="company_effect"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Efek terhadap Perusahaan</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Kerugian finansial" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="environment_effect"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Efek terhadap Lingkungan</FormLabel>
                        <FormControl>
                          <Input placeholder="Contoh: Pencemaran berat" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Tombol Submit */}
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
