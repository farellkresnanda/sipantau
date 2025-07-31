import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useEffect } from 'react';
import { columns } from './columns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Inspeksi APAR',
        href: '/insperction-apar',
    },
];

export default function PageAparInspection({ aparInspections }: { aparInspections: never[] }) {
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
            <Head title="Inspeksi APAR" />
            <div className="p-4">
                <div className="mb-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Bagian Header Kiri */}
                    <SectionHeader
                        title="Inspeksi APAR"
                        subtitle="Kelola data inspeksi APAR. Anda dapat menambah, mengubah, dan menghapus data inspeksi APAR."
                    />

                    {/* Tombol Aksi */}
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/inspection/apar/create">Buat Inspeksi</Link>
                    </Button>
                </div>

                <div className="w-full">
                    <DataTable columns={columns} data={aparInspections} />
                </div>
            </div>
        </AppLayout>
    );
}
