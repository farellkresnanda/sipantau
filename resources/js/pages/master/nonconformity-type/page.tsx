import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { columns } from './columns';

interface NonconformitySubType {
    id: number;
    name: string;
}

interface masterNonconformityType {
    id: number;
    name: string;
    nonconformity_sub_type: NonconformitySubType[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Master Ketidaksesuaian', href: '/master/nonconformity-type' },
];

export default function PageNonconformityType({ masterNonconformityType }: { masterNonconformityType: masterNonconformityType[] }) {
  const { flash } = usePage().props as {
    flash?: { success?: string; error?: string; message?: string };
  };

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
      <Head title="Master Ketidaksesuaian" />
      <div className="p-4">
        <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <SectionHeader
            title="Master Ketidaksesuaian"
            subtitle="Kelola data master jenis ketidaksesuaian"
          />
          <Button asChild className="w-full sm:w-auto">
            <Link href="/master/nonconformity-type/create">Create Data</Link>
          </Button>
        </div>
        <div className="w-full">
          <DataTable columns={columns} data={masterNonconformityType} />
        </div>
      </div>
    </AppLayout>
  );
}
