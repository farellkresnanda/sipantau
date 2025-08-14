'use client';

import { Head, router } from '@inertiajs/react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { showToast } from '@/components/ui/toast';
import type { BreadcrumbItem } from '@/types';

interface EditAcInspectionProps {
  inspection: {
    uuid: string;
    id?: number;
    inspection_date?: string | null;
    // optional top-level master_ac_id (some versions may include)
    master_ac_id?: number | null;
    items?: Array<{
      id?: number;
      inspection_id?: number;
      master_ac_unit_id?: number;
      maintenance_status?: string;
      condition_status?: string;
      notes?: string | null;
    }>;
  };
  masterAcs: Array<{ id: number; inventory_code: string; merk: string; room: string }>;
  errors: Record<string, string>;
}

// skema validasi (sama seperti create)
const formSchema = z.object({
  inspection_date: z.string().min(1, 'Tanggal wajib diisi.'),
  master_ac_id: z.string({ required_error: 'Lokasi AC wajib dipilih.' }).min(1, 'Lokasi AC wajib dipilih.'),
  maintenance_status: z.string({ required_error: 'Status wajib dipilih.' }),
  condition_status: z.string({ required_error: 'Kondisi wajib dipilih.' }),
  notes: z.string().nullable(),
});

export default function EditAcInspectionPage({ inspection, masterAcs, errors }: EditAcInspectionProps) {
  // Ambil item pertama jika ada, beri fallback kalau tidak ada
  const firstItem = inspection?.items && inspection.items.length > 0
    ? inspection.items[0]
    : { master_ac_unit_id: '', maintenance_status: '', condition_status: '', notes: '' };

  // state untuk menampilkan kode inventaris dari masterAcs
  const [selectedAc, setSelectedAc] = useState<EditAcInspectionProps['masterAcs'][0] | null>(null);

  // form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inspection_date: inspection?.inspection_date
        ? format(new Date(inspection.inspection_date), 'yyyy-MM-dd')
        : '',
      // Prioritaskan item.master_ac_unit_id, fallback ke inspection.master_ac_id, fallback kosong
      master_ac_id: firstItem?.master_ac_unit_id
        ? String(firstItem.master_ac_unit_id)
        : (inspection?.master_ac_id ? String(inspection.master_ac_id) : ''),
      maintenance_status: firstItem?.maintenance_status ?? '',
      condition_status: firstItem?.condition_status ?? '',
      notes: firstItem?.notes ?? '',
    },
  });

  const watchedAcId = form.watch('master_ac_id');

  // sync selected AC (inventory_code) saat master_ac_id berubah
  useEffect(() => {
    if (watchedAcId) {
      const ac = masterAcs.find((a) => String(a.id) === String(watchedAcId));
      setSelectedAc(ac || null);
    } else {
      setSelectedAc(null);
    }
  }, [watchedAcId, masterAcs]);

  // Jika props inspection berubah (misalnya Inertia reload), reset form agar prefill selalu up-to-date
  useEffect(() => {
    const item = inspection?.items && inspection.items.length > 0 ? inspection.items[0] : undefined;

    form.reset({
      inspection_date: inspection?.inspection_date ? format(new Date(inspection.inspection_date), 'yyyy-MM-dd') : '',
      master_ac_id: item?.master_ac_unit_id ? String(item.master_ac_unit_id) : (inspection?.master_ac_id ? String(inspection.master_ac_id) : ''),
      maintenance_status: item?.maintenance_status ?? '',
      condition_status: item?.condition_status ?? '',
      notes: item?.notes ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspection]);

  // If server side errors sent, map to form errors and show toast
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([key, message]) => {
        form.setError(key as any, { type: 'server', message });
      });
      showToast({ type: 'error', message: 'Silakan periksa kembali isian form Anda.' });
    }
  }, [errors, form]);

  // submit -> kirim top-level fields sesuai controller update
  function onSubmit(values: z.infer<typeof formSchema>) {
    // optionally you can transform payload types here (e.g., master_ac_id => number)
    router.put(route('inspection.ac.update', inspection.uuid), {
      master_ac_id: values.master_ac_id,
      inspection_date: values.inspection_date,
      maintenance_status: values.maintenance_status,
      condition_status: values.condition_status,
      notes: values.notes,
    });
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: route('home') },
    { title: 'Laporan Inspeksi AC', href: route('inspection.ac.index') },
    { title: 'Edit', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Edit Inspeksi AC" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <SectionHeader
          title="Edit Inspeksi AC"
          subtitle="Perbarui data temuan dan formulir di bawah ini sesuai kebutuhan."
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Header card: tanggal, lokasi (select), kode inventaris */}
            <Card>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                <FormField name="inspection_date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Inspeksi</FormLabel>
                    <FormControl>
                      <Input type="date" className="w-full" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField name="master_ac_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lokasi AC</FormLabel>
                    <FormControl>
                      {/* controlled Select: value + onValueChange */}
                      <Select
                        value={field.value ?? ''}
                        onValueChange={(val) => field.onChange(val)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Lokasi AC..." />
                        </SelectTrigger>
                        <SelectContent>
                          {masterAcs.map((ac) => (
                            <SelectItem key={ac.id} value={String(ac.id)}>
                              {ac.room} — {ac.merk ? `${ac.merk}` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormItem>
                  <FormLabel>Kode Inventaris</FormLabel>
                  <Input
                    className="w-full"
                    value={selectedAc?.inventory_code ?? 'Pilih Lokasi AC terlebih dahulu'}
                    readOnly
                  />
                </FormItem>
              </CardContent>
            </Card>

            {/* Table: status and condition + notes */}
            <Card>
              <CardContent className="overflow-x-auto pt-2">
                <Table className="border">
                  <TableHeader>
                    <TableRow>
                      <TableHead colSpan={2} className="border bg-yellow-300 text-center font-bold text-black">
                        Status
                      </TableHead>
                      <TableHead colSpan={2} className="border bg-yellow-300 text-center font-bold text-black">
                        Kondisi
                      </TableHead>
                      <TableHead rowSpan={2} className="border bg-yellow-300 align-middle text-center font-bold text-black w-auto">
                        Keterangan
                      </TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead className="border bg-yellow-100 text-center w-[120px]">Perbaikan</TableHead>
                      <TableHead className="border bg-yellow-100 text-center w-[120px]">Perawatan</TableHead>
                      <TableHead className="border bg-yellow-100 text-center w-[120px]">Baik</TableHead>
                      <TableHead className="border bg-yellow-100 text-center w-[120px]">Rusak</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    <TableRow>
                      {/* Maintenance - Perbaikan */}
                      <TableCell className="border text-center">
                        <FormField name="maintenance_status" render={({ field }) => (
                          <FormControl>
                            <Checkbox
                              className="h-5 w-5 rounded-sm border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-700"
                              checked={field.value === 'Perbaikan'}
                              onCheckedChange={(checked) => {
                                // toggle: jika checked true => set 'Perbaikan', jika false => clear ''
                                field.onChange(checked ? 'Perbaikan' : '');
                              }}
                            />
                          </FormControl>
                        )} />
                      </TableCell>

                      {/* Maintenance - Perawatan */}
                      <TableCell className="border text-center">
                        <FormField name="maintenance_status" render={({ field }) => (
                          <FormControl>
                            <Checkbox
                              className="h-5 w-5 rounded-sm border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-700"
                              checked={field.value === 'Perawatan'}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? 'Perawatan' : '');
                              }}
                            />
                          </FormControl>
                        )} />
                      </TableCell>

                      {/* Condition - Baik */}
                      <TableCell className="border text-center">
                        <FormField name="condition_status" render={({ field }) => (
                          <FormControl>
                            <Checkbox
                              className="h-5 w-5 rounded-sm border-2 border-gray-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-700"
                              checked={field.value === 'Baik'}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? 'Baik' : '');
                              }}
                            />
                          </FormControl>
                        )} />
                      </TableCell>

                      {/* Condition - Rusak */}
                      <TableCell className="border text-center">
                        <FormField name="condition_status" render={({ field }) => (
                          <FormControl>
                            <Checkbox
                              className="h-5 w-5 rounded-sm border-2 border-gray-400 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-700"
                              checked={field.value === 'Rusak'}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? 'Rusak' : '');
                              }}
                            />
                          </FormControl>
                        )} />
                      </TableCell>

                      {/* Notes */}
                      <TableCell className="border">
                        <FormField name="notes" render={({ field }) => (
                          <FormControl>
                            <Textarea placeholder="Catatan inspeksi..." {...field} value={field.value ?? ''} />
                          </FormControl>
                        )} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <div className="pt-2 text-red-600 text-sm">
                  <FormMessage>{form.formState.errors.maintenance_status?.message}</FormMessage>
                  <FormMessage>{form.formState.errors.condition_status?.message}</FormMessage>
                </div>
              </CardContent>
            </Card>

            {/* Submit */}
            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full md:w-auto" size="lg">
              {form.formState.isSubmitting ? 'Menyimpan...' : 'Update Data'}
            </Button>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
