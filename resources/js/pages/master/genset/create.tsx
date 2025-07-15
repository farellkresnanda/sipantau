'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SectionHeader from '@/components/section-header';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Master Genset', href: '/master/genset' },
  { title: 'Create Genset', href: '/master/genset/create' },
];

const formSchema = z.object({
  entity_code: z.string().min(1, 'Entitas wajib dipilih'),
  plant_code: z.string().min(1, 'Plant wajib dipilih'),
  machine_type: z.string().min(1, 'Jenis mesin wajib diisi'),
  merk: z.string().min(1, 'Merk wajib diisi'),
  model: z.string().min(1, 'Model wajib diisi'),
  country_year_of_manufacture: z.string().min(1, 'Negara & tahun pembuatan wajib diisi'),
  manufacturer: z.string().min(1, 'Pabrik pembuat wajib diisi'),
  serial_number: z.string().min(1, 'No seri wajib diisi'),
  capacity: z.string().min(1, 'Kapasitas wajib diisi'),
});

type FormSchemaType = z.infer<typeof formSchema>;

type Entitas = {
  id: number;
  name: string;
  entity_code: string;
};

type Plant = {
  id: number;
  name: string;
  plant_code: string;
  entity_code: string;
};

export default function CreateMasterGenset({
  entityList = [],
  plantList = [],
}: {
  entityList?: Entitas[];
  plantList?: Plant[];
}) {
  const { errors } = usePage().props as { errors: Record<string, string> };
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      entity_code: '',
      plant_code: '',
      machine_type: '',
      merk: '',
      model: '',
      country_year_of_manufacture: '',
      manufacturer: '',
      serial_number: '',
      capacity: '',
    },
  });

  useEffect(() => {
    Object.entries(errors).forEach(([key, message]) => {
      form.setError(key as keyof FormSchemaType, {
        type: 'manual',
        message,
      });
    });
  }, [errors, form]);

  useEffect(() => {
    const kodeEntitas = form.watch('entity_code');
    const filtered = plantList.filter((plant) => plant.entity_code === kodeEntitas);
    setFilteredPlants(filtered);
  }, [form.watch('entity_code')]);

  function onSubmit(values: FormSchemaType) {
    router.post(route('genset.store'), values, {
      onSuccess: () => {
        form.reset();
        setFilteredPlants([]);
      },
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Master Genset" />
      <div className="space-y-6 p-4">
        <SectionHeader
          title="Create Master Genset"
          subtitle="Masukkan data lengkap mesin genset."
        />

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Kolom kiri */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="entity_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entitas</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue('plant_code', '');
                              }}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih entitas" />
                              </SelectTrigger>
                              <SelectContent>
                                {entityList.map((entity) => (
                                  <SelectItem key={entity.id} value={entity.entity_code}>
                                    {entity.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="plant_code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plant</FormLabel>
                          <FormControl>
                            <Select
                              disabled={filteredPlants.length === 0}
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih plant" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredPlants.map((plant) => (
                                  <SelectItem key={plant.id} value={plant.plant_code}>
                                    {plant.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="machine_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Mesin</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: Motor Diesel" {...field} className="w-full" />
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
                            <Input placeholder="Contoh: PERKINS" {...field} className="w-full" />
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
                            <Input placeholder="Contoh: 1006-6TA" {...field} className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Kolom kanan */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="country_year_of_manufacture"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Negara & Tahun Pembuatan</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: UK/2014" {...field} className="w-full" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="manufacturer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pabrik Pembuat</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: PERKINS ENGINE CC" {...field} className="w-full" />
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
                            <Input placeholder="Contoh: U960673Y" {...field} className="w-full" />
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
                            <Input placeholder="Contoh: 123 KW" {...field} className="w-full" />
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
                    {form.formState.isSubmitting ? 'Menyimpan...' : 'Submit Data'}
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
