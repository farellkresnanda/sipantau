'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Master AC', href: '/master/ac' },
  { title: 'Create Master AC', href: '/master/ac/create' },
];

const formSchema = z.object({
  kode_entitas: z.string().min(1, 'Entitas wajib dipilih'),
  kode_plant: z.string().min(1, 'Plant wajib dipilih'),
  ruang: z.string().min(1, 'Ruang wajib diisi'),
  kode_inventaris: z.string().min(1, 'Kode inventaris wajib diisi'),
  merk: z.string().min(1, 'Merk wajib diisi'),
});

type FormSchemaType = z.infer<typeof formSchema>;

type Plant = {
  id: string;
  nama_plant: string;
  kode_entitas: string;
  kode_plant: string;
  entitas_nama: string;
};

type GroupedPlants = Record<string, Plant[]>;

export default function CreateMasterAc({ plants = [] }: { plants?: Plant[] }) {
  const { errors } = usePage().props as {
    errors: Record<string, string>;
  };

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kode_entitas: '',
      kode_plant: '',
      ruang: '',
      kode_inventaris: '',
      merk: '',
    },
  });

  const selectedEntitasKode = form.watch('kode_entitas');

  // Tangani error dari server
  useEffect(() => {
    Object.entries(errors).forEach(([key, message]) => {
      form.setError(key as keyof FormSchemaType, {
        type: 'manual',
        message,
      });
    });
  }, [errors, form]);

  const groupedPlants: GroupedPlants = useMemo(() => {
    return plants.reduce((acc, plant) => {
      const alias = plant.entitas_nama;
      if (!acc[alias]) acc[alias] = [];
      acc[alias].push(plant);
      return acc;
    }, {} as GroupedPlants);
  }, [plants]);

  const filteredPlants = useMemo(() => {
    return plants.filter((p) => p.kode_entitas === selectedEntitasKode);
  }, [plants, selectedEntitasKode]);

  useEffect(() => {
    if (filteredPlants.length === 1) {
      form.setValue('kode_plant', filteredPlants[0].kode_plant);
    } else {
      form.setValue('kode_plant', '');
    }
  }, [filteredPlants, form]);

  function onSubmit(values: FormSchemaType) {
    router.post(route('ac.store'), values, {
      onSuccess: () => form.reset(),
    });
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Master AC" />
      <div className="space-y-6 p-4">
        <SectionHeader
          title="Buat Data Master AC"
          subtitle="Masukkan data AC sesuai entitas dan inventaris"
        />

        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* KIRI */}
                  <div className="space-y-4">
                    {/* Entitas */}
                    <FormField
                      control={form.control}
                      name="kode_entitas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entitas</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue('kode_plant', '');
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih entitas" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.keys(groupedPlants).map((entitasNama) => (
                                  <SelectItem
                                    key={groupedPlants[entitasNama][0].kode_entitas}
                                    value={groupedPlants[entitasNama][0].kode_entitas}
                                  >
                                    {entitasNama}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Plant */}
                    <FormField
                      control={form.control}
                      name="kode_plant"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plant</FormLabel>
                          <FormControl>
                            {filteredPlants.length > 1 ? (
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={!selectedEntitasKode}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Pilih plant" />
                                </SelectTrigger>
                                <SelectContent>
                                  {filteredPlants.map((plant) => (
                                    <SelectItem
                                      key={plant.kode_plant}
                                      value={plant.kode_plant}
                                    >
                                      {plant.nama_plant}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                readOnly
                                placeholder="Plant akan terisi otomatis"
                                value={filteredPlants.length === 1 ? filteredPlants[0].nama_plant : ''}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Ruang */}
                    <FormField
                      control={form.control}
                      name="ruang"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ruang</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan nama ruang" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* KANAN */}
                  <div className="space-y-4">
                    {/* Kode Inventaris */}
                    <FormField
                      control={form.control}
                      name="kode_inventaris"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kode Inventaris</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan kode inventaris" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Merk */}
                    <FormField
                      control={form.control}
                      name="merk"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Merk</FormLabel>
                          <FormControl>
                            <Input placeholder="Masukkan merk AC" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Tombol */}
                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Menyimpan...' : 'Submit Data'}
                  </Button>
                  <Link
                    href={route('ac.index')}
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
