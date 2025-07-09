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
  { title: 'Master Jenis Ketidaksesuaian', href: '/master/jenis-ketidaksesuaian' },
  { title: 'Edit Jenis Ketidaksesuaian', href: '#' },
];

const formSchema = z.object({
  nama: z.string().min(1, { message: 'Nama Jenis harus diisi' }).max(255),
  sub_jenis: z
    .array(
      z.object({
        id: z.number().optional(),
        nama: z.string().optional(),
      })
    )
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditPageProps {
  data: {
    id: number;
    nama: string;
    sub_jenis: { id?: number; nama: string }[];
  };
  errors: Record<string, string>;
}

export default function EditJenisKetidaksesuaian() {
  const { data } = usePage().props as unknown as EditPageProps;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nama: data.nama,
      sub_jenis: data.sub_jenis.length > 0 ? data.sub_jenis : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'sub_jenis',
  });

  useEffect(() => {
    form.reset({
      nama: data.nama,
      sub_jenis: data.sub_jenis.length > 0 ? data.sub_jenis : [],
    });
  }, [data]);

  function onSubmit(values: FormData) {
    // Filter hanya sub_jenis yang ada nama-nya
    const filteredSub = (values.sub_jenis ?? []).filter((sub) => sub.nama?.trim() !== '');
    const payload = {
      ...values,
      sub_jenis: filteredSub,
    };

    router.put(`/master/jenis-ketidaksesuaian/${data.id}`, payload, {
      onSuccess: () => form.reset(payload),
      onError: (errors) => {
        Object.entries(errors).forEach(([key, message]) => {
          form.setError(key as keyof FormData, {
            type: 'manual',
            message: message as string,
          });
        });
      },
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Master Jenis Ketidaksesuaian" />
      <div className="space-y-6 p-4">
        <SectionHeader
          title="Edit Master Jenis Ketidaksesuaian"
          subtitle="Ubah nama jenis dan sub jenis jika diperlukan."
        />

        <Card className="w-full">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Nama Jenis */}
                <FormField
                  control={form.control}
                  name="nama"
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

                {/* Sub Jenis */}
                <div className="space-y-4">
                  <FormLabel>Sub Jenis</FormLabel>

                  {fields.map((item, index) => {
                    const isLast = index === fields.length - 1;
                    const showDelete = fields.length > 0;

                    return (
                      <div key={item.id ?? index} className="flex items-start gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => append({ nama: '' })}
                          className="h-10 w-10 shrink-0"
                          title="Tambah Sub Jenis"
                          disabled={!isLast}
                        >
                          ➕
                        </Button>

                        <FormField
                          control={form.control}
                          name={`sub_jenis.${index}.nama`}
                          render={({ field }) => (
                            <FormItem className="w-full">
                              <FormControl>
                                <Input placeholder={`Sub Jenis ${index + 1}`} {...field} />
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
                          title="Delete"
                          disabled={!showDelete}
                        >
                          🗑️
                        </Button>
                      </div>
                    );
                  })}

                  {/* Tombol Tambah jika belum ada satupun */}
                  {fields.length === 0 && (
                    <Button type="button" onClick={() => append({ nama: '' })}>
                      + Tambah Sub Jenis
                    </Button>
                  )}
                </div>

                {/* Tombol Submit */}
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Menyimpan...' : 'Update Data'}
                  </Button>
                  <Link href="/master/jenis-ketidaksesuaian" className="text-muted-foreground text-sm hover:underline">
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
