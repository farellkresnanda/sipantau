'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage, Head, Link } from '@inertiajs/react';
import * as z from 'zod';

import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { BreadcrumbItem } from '@/types';

// Breadcrumb
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Inspeksi P3K', href: '/inspection/first-aid' },
  { title: 'Edit Inspeksi', href: '#' },
];

// Schema validasi
const formSchema = z.object({
  has_findings: z.boolean(),
  notes: z.string().optional(),
  details: z.array(
    z.object({
      item_id: z.number(),
      quantity_found: z.number().min(0, 'Jumlah tidak boleh negatif'),
      condition_id: z.number(),
    })
  ),
});

// Define props secara eksplisit agar tidak error
interface PageProps {
  errors?: Record<string, string>;
  inspection: {
    id: number;
    location: string;
    inventory_code: string;
    entity_code: string;
    plant_code: string;
    has_findings: boolean;
    notes?: string;
    details: {
      item: { id: number; name: string };
      quantity_found: number;
      condition: { id: number; name: string };
    }[];
  };
  items: { id: number; name: string }[];
  conditions: { id: number; name: string }[];
  entities: { code: string; name: string }[];
  plants: { code: string; name: string }[];
}

export default function EditInspectionFirstAid() {
  const {
    errors = {},
    inspection,
    items,
    conditions,
    entities,
    plants,
  } = usePage().props as unknown as PageProps;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      has_findings: inspection.has_findings,
      notes: inspection.notes || '',
      details: inspection.details.map((d) => ({
        item_id: d.item.id,
        quantity_found: d.quantity_found,
        condition_id: d.condition.id,
      })),
    },
  });

  // Menangani error validasi dari backend
  useEffect(() => {
    Object.entries(errors).forEach(([key, message]) => {
      form.setError(key as any, { type: 'manual', message });
    });
  }, [errors]);

  // Fungsi submit
  function onSubmit(values: z.infer<typeof formSchema>) {
    router.put(route('inspection.first-aid.update', inspection.id), values);
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Inspeksi P3K" />
      <div className="space-y-6 p-4">
        <SectionHeader
          title="Edit Inspeksi P3K"
          subtitle={`Kode Inventaris: ${inspection.inventory_code} | Lokasi: ${inspection.location}`}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardContent className="space-y-6">
                {/* Temuan */}
                <FormField
                  control={form.control}
                  name="has_findings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apakah Ada Temuan?</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value ? '1' : '0'}
                          onValueChange={(val) => field.onChange(val === '1')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih hasil" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Tidak Ada</SelectItem>
                            <SelectItem value="1">Ada Temuan</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Catatan */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan Temuan</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Catatan jika ada temuan" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Detail Item */}
                {form.watch('details').map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <FormLabel>{items.find((i) => i.id === form.watch(`details.${index}.item_id`))?.name || '-'}</FormLabel>
                    </div>
                    <FormField
                      control={form.control}
                      name={`details.${index}.quantity_found`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jumlah</FormLabel>
                          <FormControl>
                            <Input type="number" min={0} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`details.${index}.condition_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kondisi</FormLabel>
                          <FormControl>
                            <Select
                              value={String(field.value)}
                              onValueChange={(val) => field.onChange(Number(val))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih kondisi" />
                              </SelectTrigger>
                              <SelectContent>
                                {conditions.map((c) => (
                                  <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tombol Aksi */}
            <div className="flex gap-2">
              <Button type="submit">Simpan</Button>
              <Link href={route('inspection.first-aid.index')} className="text-sm text-muted-foreground hover:underline">
                Kembali
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
