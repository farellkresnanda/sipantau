import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { columns } from './columns';
import { showToast } from '@/components/ui/toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/module-managers',
    },
    {
        title: 'Hak Akses Modul',
        href: '/module-managers',
    },
];

export default function PageModule({ moduleManagers }: { moduleManagers: never[] }) {
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
            <Head title="Hak Akses Modul" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Hak Akses Modul"
                        subtitle="Kelola data hak akses pengguna modul di sini. Anda dapat menambah, mengubah, dan menghapus hak akses modul untuk pengguna."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/module-managers/create">Create User Module</Link>
                    </Button>
                </div>
                <div className="w-full">
                    <DataTable columns={columns} data={moduleManagers} />
                </div>
            </div>
        </AppLayout>
    );
}
