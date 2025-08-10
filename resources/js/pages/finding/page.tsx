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
        title: 'Temuan',
        href: '/finding',
    },
];

export default function PageFinding({ findings }: { findings: any[] }) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Temuan" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Daftar Temuan"
                        subtitle="Kelola data temuan di sini. Anda dapat menambah, mengubah, dan menghapus temuan."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/finding/create">Buat Temuan</Link>
                    </Button>
                </div>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[1000px]">
                        <DataTable columns={columns} data={findings} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
