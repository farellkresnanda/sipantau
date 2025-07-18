'use client';

import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';

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

export default function CreateInspectionFirstAid() {
  type KitType = {
    id: number;
    location: string;
    inventory_code: string;
    entity: { code: string; name: string };
    plant: { code: string; name: string };
  };

  const { kit, items, conditions, errors } = usePage<{ kit: KitType; items: any[]; conditions: any[]; errors?: Record<string, string> }>().props;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      has_findings: false,
      notes: '',
      details: items.map((item) => ({
        item_id: item.id,
        quantity_found: 0,
        condition_id: conditions[0]?.id ?? 1,
      })),
    },
  });

  useEffect(() => {
    Object.entries(errors || {}).forEach(([key, message]) => {
      form.setError(key as any, { type: 'manual', message });
    });
  }, [errors]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    router.post(route('inspection.first-aid.store'), {
      ...values,
      kit: {
        location: kit.location,
        inventory_code: kit.inventory_code,
      },
      entity_code: kit.entity.code,
      plant_code: kit.plant.code,
    });
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    { title: 'Inspeksi P3K', href: route('inspection.first-aid.index') },
    { title: 'Buat Inspeksi', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Buat Inspeksi P3K" />
      <div className="space-y-6 p-4">
        <SectionHeader
          title="Buat Inspeksi P3K"
          subtitle={`Lokasi: ${kit.location} | Inventaris: ${kit.inventory_code}`}
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <FormLabel>Entitas</FormLabel>
                    <Input value={kit.entity.name} disabled />
                  </div>
                  <div>
                    <FormLabel>Plant</FormLabel>
                    <Input value={kit.plant.name} disabled />
                  </div>
                </div>

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

                {form.watch('details').map((_, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b py-3">
                    <div>
                      <FormLabel>
                        {items.find((i) => i.id === form.watch(`details.${index}.item_id`))?.name || '-'}
                      </FormLabel>
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
