import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { columns } from './columns';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Inspeksi APD',
        href: '/inspection/ppe',
    },
];

export default function PageFinding({ ppeInspections }: { ppeInspections: any[] }) {
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
            <Head title="Inspeksi APD" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Daftar Inspeksi APD"
                        subtitle="Kelola data Inspeksi APD di sini. Anda dapat menambah, mengubah, dan menghapus Inspeksi APD."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/inspection/ppe/create">Buat Inspeksi APD</Link>
                    </Button>
                </div>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[1000px]">
                        <DataTable columns={columns} data={ppeInspections} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
