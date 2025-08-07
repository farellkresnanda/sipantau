'use client';

import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import SectionHeader from '@/components/section-header';
import AppLayout from '@/layouts/app-layout';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import type { BreadcrumbItem } from '@/types';
import { columns } from './columns';

interface Konsekuensi {
  id: number;
  name: string;
  consequence: string;
  human_effect: string;
  company_effect: string;
  environment_effect: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Master Konsekuensi', href: '/master/consequence' },
];

export default function MasterKonsekuensiPage() {
  const { data} = usePage<{
    data: Konsekuensi[];
  }>().props;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Master Konsekuensi" />
      <div className="p-4">
        <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <SectionHeader
            title="Master Konsekuensi"
            subtitle="Kelola daftar konsekuensi yang tersedia"
          />
          <Button asChild className="w-full sm:w-auto">
            <Link href={route('consequence.create')}>Create Data</Link>
          </Button>
        </div>
        <div className="w-full">
          <DataTable columns={columns} data={data} />
        </div>
      </div>
    </AppLayout>
  );
}
