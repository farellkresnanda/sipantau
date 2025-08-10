'use client';

import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/section-header';
import AppLayout from '@/layouts/app-layout';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './columns';
import { showToast } from '@/components/ui/toast';
import type { BreadcrumbItem } from '@/types';

type Peralatan = {
  id: number;
  equipment_name: string;
  reference: string | null;
  created_at: string;
  updated_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Master Uji Riksa Peralatan', href: '/master/test-equipment-report' },
];

export default function MasterUjiRiksaPeralatanPage() {
  const { data, } = usePage<{ data: Peralatan[]; }>().props;

  // 🟨 Urutkan ulang data berdasarkan id DESC secara eksplisit
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.id - a.id);
  }, [data]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Master Uji Riksa Peralatan" />

      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <SectionHeader
            title="Master Uji Riksa Peralatan"
            subtitle="Kelola daftar peralatan yang digunakan dalam proses uji riksa"
          />
          <Button asChild>
            <Link href={route('test-equipment-report.create')}>Create Data</Link>
          </Button>
        </div>

        <DataTable columns={columns} data={sortedData} />
      </div>
    </AppLayout>
  );
}
