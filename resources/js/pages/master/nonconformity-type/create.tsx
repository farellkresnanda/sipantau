'use client';

import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Master Ketidaksesuaian', href: '/master/nonconformity-type' },
  { title: 'Create Ketidaksesuaian', href: '/master/nonconformity-type/create' },
];

// ✅ nonconformity_sub_type tetap array, tapi boleh kosong
const formSchema = z.object({
  name: z.string().min(1, { message: 'Nama Jenis harus diisi' }).max(255),
  nonconformity_sub_type: z
    .array(
      z.object({
        name: z.string().optional(), // boleh kosong
      })
    ),
});

export default function CreateNonconformityType() {
  const { errors } = usePage().props as {
    errors: Record<string, string>;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      nonconformity_sub_type: [], // <- penting!
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'nonconformity_sub_type',
  });

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([key, message]) => {
        form.setError(key as keyof typeof formSchema._type, {
          type: 'manual',
          message,
        });
      });
    }
  }, [errors, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const filtered = {
      ...values,
      nonconformity_sub_type: values.nonconformity_sub_type.filter((sj) => sj.name && sj.name.trim() !== ''),
    };

    router.post('/master/nonconformity-type', filtered, {
      onSuccess: () => form.reset(),
      onError: (errors) => {
        Object.entries(errors).forEach(([key, message]) => {
          form.setError(key as keyof typeof formSchema._type, {
            type: 'manual',
            message: message as string,
          });
        });
      },
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Ketidaksesuaian" />
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <SectionHeader
            title="Buat Ketidaksesuaian"
            subtitle="Tambahkan type ketidaksesuaian baru beserta jenisnya (opsional)"
          />
        </div>

        <Card className="w-full">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Jenis</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan Nama Jenis" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel>Sub Jenis</FormLabel>

                  {fields.map((item, index) => {
                    const isLast = index === fields.length - 1;

                    return (
                      <div key={item.id} className="flex items-start gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => append({ name: '' })}
                          className="h-10 w-10 shrink-0"
                          title="Tambah Sub Jenis"
                          disabled={!isLast}
                        >
                          ➕
                        </Button>

                        <FormField
                          control={form.control}
                          name={`nonconformity_sub_type.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormControl>
                                <Input placeholder="Masukkan Sub Jenis (opsional)" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-10 w-10 shrink-0"
                          title="Hapus"
                        >
                          🗑️
                        </Button>
                      </div>
                    );
                  })}

                  {/* Tombol tambah jika belum ada field */}
                  {fields.length === 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => append({ name: '' })}
                    >
                      + Tambah Sub Jenis
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Submitting...' : 'Submit Data'}
                  </Button>
                  <Link href="/master/nonconformity-type" className="text-muted-foreground text-sm hover:underline">
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
