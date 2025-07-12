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
  { title: 'Edit Ketidaksesuaian', href: '#' },
];

const formSchema = z.object({
  name: z.string().min(1, { message: 'Nama Jenis harus diisi' }).max(255),
  nonconformity_sub_type: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string().optional(),
      })
    )
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditPageProps {
  masterNonconformityType: {
    id: number;
    name: string;
    nonconformity_sub_type: { id?: number; name: string }[];
  };
  errors: Record<string, string>;
}

export default function EditNonconformityType() {
  const { masterNonconformityType } = usePage().props as unknown as EditPageProps;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: masterNonconformityType.name,
      nonconformity_sub_type: masterNonconformityType.nonconformity_sub_type.length > 0 ? masterNonconformityType.nonconformity_sub_type : [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'nonconformity_sub_type',
  });

  useEffect(() => {
    form.reset({
      name: masterNonconformityType.name,
      nonconformity_sub_type: masterNonconformityType.nonconformity_sub_type.length > 0 ? masterNonconformityType.nonconformity_sub_type : [],
    });
  }, [form, masterNonconformityType]);

  function onSubmit(values: FormData) {
    // Filter hanya nonconformity_sub_type yang ada name-nya
    const filteredSub = (values.nonconformity_sub_type ?? []).filter((sub) => sub.name?.trim() !== '');
    const payload = {
      ...values,
      nonconformity_sub_type: filteredSub,
    };

    router.put(`/master/nonconformity-type/${masterNonconformityType.id}`, payload, {
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
      <Head title="Edit Master Ketidaksesuaian" />
      <div className="space-y-6 p-4">
        <SectionHeader
          title="Edit Master Ketidaksesuaian"
          subtitle="Ubah name type dan sub type jika diperlukan."
        />

        <Card className="w-full">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Nama Jenis */}
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
                    <Button type="button" onClick={() => append({ name: '' })}>
                      + Tambah Sub Jenis
                    </Button>
                  )}
                </div>

                {/* Tombol Submit */}
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Menyimpan...' : 'Update Data'}
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
