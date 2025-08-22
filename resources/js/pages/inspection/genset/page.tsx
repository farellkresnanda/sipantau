// resources/js/pages/inspection/genset/page.tsx

'use client';

import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import type { PageProps, BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { columns, GensetInspectionRow } from './columns';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Inspeksi Genset', href: '/inspection/genset' },
];

interface LaravelPaginator<T> {
  current_page: number;
  data: T[];
  total: number;
}

interface CurrentPageProps extends PageProps {
  inspections: LaravelPaginator<GensetInspectionRow>;
}

export default function Page({ inspections }: CurrentPageProps) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Inspeksi Genset" />
      <div className="p-4">
        <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <SectionHeader
            title="Daftar Inspeksi Genset"
            subtitle="Kelola data inspeksi genset di sini. Anda dapat menambah, mengubah, dan menghapus inspeksi genset."
          />
          <Button asChild className="w-full sm:w-auto">
            <Link href="/inspection/genset/create">Buat Inspeksi</Link>
          </Button>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1000px]">
            <DataTable columns={columns} data={inspections.data} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
