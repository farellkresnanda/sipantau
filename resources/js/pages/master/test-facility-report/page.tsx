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
  facility_name: string;
  reference: string;
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
  { title: 'Master Uji Riksa Fasilitas', href: '/master/test-facility-report' },
];

export default function MasterUjiRiksaFasilitasPage() {
  const { data } = usePage<PageProps>().props;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Master Uji Riksa Fasilitas" />

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <SectionHeader
            title="Master Uji Riksa Fasilitas"
            subtitle="Kelola daftar fasilitas yang digunakan dalam proses uji riksa"
          />
          <Button asChild>
            <Link href={route('test-facility-report.create')}>Create Data</Link>
          </Button>
        </div>
        <DataTable columns={columns} data={data} />
      </div>
    </AppLayout>
  );
}
