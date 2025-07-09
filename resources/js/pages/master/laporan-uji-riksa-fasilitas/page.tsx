'use client';

import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/section-header';
import AppLayout from '@/layouts/app-layout';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { showToast } from '@/components/ui/toast';
import type { BreadcrumbItem } from '@/types';

type Fasilitas = {
  id: number;
  nama_fasilitas: string;
  referensi: string;
};

type PageProps = {
  data: Fasilitas[];
  flash?: {
    success?: string;
    error?: string;
    message?: string;
  };
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Master Laporan Uji Riksa Fasilitas', href: '/master/laporan-uji-riksa-fasilitas' },
];

export default function MasterUjiRiksaFasilitasPage() {
  const { data, flash } = usePage<PageProps>().props;

  useEffect(() => {
    if (flash?.success) {
      showToast({ type: 'success', message: flash.success });
    }
    if (flash?.error) {
      showToast({ type: 'error', message: flash.error });
    }
    if (flash?.message) {
      showToast({ message: flash.message });
    }
  }, [flash]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Master Laporan Uji Riksa Fasilitas" />

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <SectionHeader
            title="Master Laporan Uji Riksa Fasilitas"
            subtitle="Kelola daftar fasilitas yang digunakan dalam proses uji riksa"
          />
          <Button asChild>
            <Link href={route('laporan-uji-riksa-fasilitas.create')}>Create Data</Link>
          </Button>
        </div>
        <DataTable columns={columns} data={data} />
      </div>
    </AppLayout>
  );
}
