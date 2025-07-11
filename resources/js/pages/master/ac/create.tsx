// CreateMasterAc.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SectionHeader from '@/components/section-header';

const formSchema = z.object({
  kode_entitas: z.string().min(1, 'Entitas harus dipilih'),
  kode_plant: z.string().min(1, 'Plant harus dipilih'),
  ruang: z.string().min(1, 'Ruang harus diisi'),
  kode_inventaris: z.string().min(1, 'Kode Inventaris harus diisi'),
  merk: z.string().min(1, 'Merk harus diisi'),
});

type FormSchemaType = z.infer<typeof formSchema>;

type Entitas = {
  id: number;
  nama: string;
  kode_entitas: string;
};

type Plant = {
  id: number;
  nama: string;
  kode_plant: string;
  kode_entitas: string;
};

export default function CreateMasterAc({ entitasList = [], plantList = [] }: { entitasList?: Entitas[]; plantList?: Plant[] }) {
  const { errors } = usePage().props as { errors: Record<string, string> };
  const [filteredPlants, setFilteredPlants] = useState<Plant[]>([]);

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

  useEffect(() => {
    Object.entries(errors).forEach(([key, message]) => {
      form.setError(key as keyof FormSchemaType, {
        type: 'manual',
        message,
      });
    });
  }, [errors, form]);

  useEffect(() => {
    const kodeEntitas = form.watch('kode_entitas');
    const filtered = plantList.filter((plant) => plant.kode_entitas === kodeEntitas);
    setFilteredPlants(filtered);
  }, [form.watch('kode_entitas')]);

  function onSubmit(values: FormSchemaType) {
    router.post(route('ac.store'), values, {
      onSuccess: () => {
        form.reset();
        setFilteredPlants([]);
      },
    });
  }

  return (
    <AppLayout breadcrumbs={[{ title: 'Master AC', href: route('ac.index') }, { title: 'Create', href: '' }]}> 
      <Head title="Create Master AC" />
      <div className="space-y-6 p-4">
        <SectionHeader title="Buat Data Master AC" subtitle="Masukkan data AC sesuai entitas dan inventaris" />
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="kode_entitas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Entitas</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue('kode_plant', '');
                              }}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Pilih entitas" />
                              </SelectTrigger>
                              <SelectContent>
                                {entitasList.map((entitas) => (
                                  <SelectItem key={entitas.id} value={entitas.kode_entitas}>
                                    {entitas.nama}
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
                      name="kode_plant"
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
                                  <SelectItem key={plant.kode_plant} value={plant.kode_plant}>
                                    {plant.nama}
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

                  <div className="space-y-4">
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

                <div className="flex items-center gap-2">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Menyimpan...' : 'Submit Data'}
                  </Button>
                  <Link href={route('ac.index')} className="text-sm text-muted-foreground hover:underline">
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
