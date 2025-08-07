'use client';

import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Plus } from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import { columns } from './columns';

// Breadcrumb manual
const breadcrumbs = [
  { title: 'Home', href: '/' },
  { title: 'Master Genset', href: '/master/genset' },
];

// 👇 Tipe data sesuai tabel master_gensets
export type MasterGenset = {
  id: number;
  entity_code: string;
  plant_code: string;
  machine_type: string;
  merk: string;
  model: string;
  country_year_of_manufacture: string;
  manufacturer: string;
  serial_number: string;
  capacity: string;

  // Relasi (opsional)
  entity?: {
    id: number;
    name: string;
  };
  plant?: {
    id: number;
    name: string;
  };
};

export default function PageGenset({ gensets }: { gensets: MasterGenset[] }) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Master Genset" />

      <div className="p-4">
        <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <SectionHeader
            title="Master Genset"
            subtitle="Daftar data mesin genset yang tersedia."
          />
          <Button
            asChild
            className="w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            <Link href="/master/genset/create">
              Create Data
            </Link>
          </Button>
        </div>

        <div className="w-full">
          <DataTable columns={columns} data={gensets} />
        </div>
      </div>
    </AppLayout>
  );
}
