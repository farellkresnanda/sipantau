'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router } from '@inertiajs/react';
import * as z from 'zod';
import { useEffect, useState } from 'react';

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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Master Genset', href: '/master/genset' },
  { title: 'Edit Master Genset', href: '#' },
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

type Props = {
  genset: FormSchemaType & { id: number };
  entities: { id: number; name: string; entity_code: string }[];
  plants: { id: number; name: string; plant_code: string; entity_code: string }[];
};

export default function EditMasterGenset({ genset, entities, plants }: Props) {
  const [filteredPlants, setFilteredPlants] = useState(() =>
    plants.filter((p) => p.entity_code === genset.entity_code)
  );

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: genset,
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      const selectedEntity = values.entity_code;
      const newFilteredPlants = plants.filter((p) => p.entity_code === selectedEntity);
      setFilteredPlants(newFilteredPlants);
    });
    return () => subscription.unsubscribe();
  }, [form, plants]);

  function onSubmit(values: FormSchemaType) {
    router.put(route('genset.update', genset.id), values);
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Master Genset" />
      <div className="space-y-6 p-4">
        <SectionHeader
          title="Edit Master Genset"
          subtitle="Perbarui informasi mesin genset."
        />

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                {entities.map((ent) => (
                                  <SelectItem key={ent.id} value={ent.entity_code}>
                                    {ent.name}
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
                            <Select onValueChange={field.onChange} value={field.value}>
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
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="country_year_of_manufacture"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Negara & Tahun Pembuatan</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Updating...' : 'Update Data'}
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