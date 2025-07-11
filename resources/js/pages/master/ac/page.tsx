import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { columns } from './columns';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Download, Upload } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Master AC',
    href: '/master-ac',
  },
];

export default function PageAc({ acList }: { acList: never[] }) {
  const { flash } = usePage().props as {
    flash?: { success?: string; error?: string; message?: string };
  };

  const [file, setFile] = useState<File | null>(null);

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

  const handleImport = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    window.axios
      .post('/master/ac/import', formData)
      .then(() => window.location.reload())
      .catch(() => showToast({ type: 'error', message: 'Import gagal!' }));
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Master AC" />
      <div className="p-4">
        <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <SectionHeader
            title="Master AC"
            subtitle="Kelola data master AC di sistem ini. Anda dapat menambah, mengubah, dan menghapus data master AC sesuai dengan kebutuhan sistem dan pengguna."
          />
          <Button asChild className="w-full sm:w-auto">
            <Link href="/master/ac/create">Create Data</Link>
          </Button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <div />
          <div className="flex items-center gap-2">
            <a
              href="/template/master_ac_template.xlsx"
              download
              className="text-sm text-blue-600 hover:underline"
            >
              Download Template
            </a>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Upload className="w-4 h-4" /> Import
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-sm">
            <h2 className="text-lg font-semibold mb-2">Import Data Master AC</h2>
            <a
                href="/template/master_ac_template.xlsx"
                download
                className="text-sm text-blue-500 hover:underline mb-3 block"
            >
                📥 Download Template Excel
            </a>
            <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button onClick={handleImport} className="mt-3 w-full">
                Upload
            </Button>
            </DialogContent>

            </Dialog>
            <Button asChild variant="outline" size="sm" className="flex items-center gap-1">
              <a href="/master/ac/export">
                <Download className="w-4 h-4" /> Export
              </a>
            </Button>
          </div>
        </div>

        <div className="w-full">
          <DataTable columns={columns} data={acList} />
        </div>
      </div>
    </AppLayout>
  );
}
