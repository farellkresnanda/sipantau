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
        title: 'Informasi K3',
        href: '/analysis/hse-information',
    },
];

export default function PageK3Info({ hseInformation }: { hseInformation: any[] }) {
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
            <Head title="Informasi K3" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Informasi K3"
                        subtitle="Kelola informasi K3 disini. Anda dapat menambah, mengubah, dan menghapus informasi."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/analysis/hse-information/create">Create Info K3</Link>
                    </Button>
                </div>
                <div className="w-full">
                    <DataTable columns={columns} data={hseInformation} />
                </div>
            </div>
        </AppLayout>
    );
}
