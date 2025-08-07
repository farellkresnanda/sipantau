// resources/js/pages/inspection/first-aid/page.tsx

'use client';

import SectionHeader from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { showToast } from '@/components/ui/toast';
import AppLayout from '@/layouts/app-layout';
import type { PageProps, BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { columns, FirstAidInspectionRow } from './columns';
import { cn } from '@/lib/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
    {
        title: 'Inspeksi P3K',
        href: '/inspection/first-aid',
    },
];

// Tipe untuk link paginasi dari Laravel
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface LaravelPaginator<T> {
    current_page: number;
    data: T[];
    first_page_url: string | null;
    from: number | null;
    last_page: number;
    last_page_url: string | null;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface CurrentPageProps extends PageProps {
    inspections: LaravelPaginator<FirstAidInspectionRow>;
}

// ✅ PERBAIKAN: Komponen paginasi sekarang sesuai dengan gambar yang Anda berikan
function Pagination({ paginator }: { paginator: LaravelPaginator<any> }) {
    return (
        <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
                Page {paginator.current_page} of {paginator.last_page} (Total {paginator.total} records)
            </div>
            <div className="flex items-center gap-2">
                <Button asChild variant="outline" disabled={!paginator.prev_page_url}>
                    <Link href={paginator.prev_page_url || '#'} preserveScroll>
                        Previous
                    </Link>
                </Button>
                <Button asChild variant="outline" disabled={!paginator.next_page_url}>
                    <Link href={paginator.next_page_url || '#'} preserveScroll>
                        Next
                    </Link>
                </Button>
            </div>
        </div>
    );
}


export default function Page({ inspections }: CurrentPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inspeksi P3K" />
            <div className="p-4">
                <div className="mb-3 flex flex-col items-center justify-between gap-4 sm:flex-row">
                    <SectionHeader
                        title="Daftar Inspeksi P3K"
                        subtitle="Kelola data Inspeksi P3K di sini. Anda dapat menambah, mengubah, dan menghapus Inspeksi P3K."
                    />
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/inspection/first-aid/create">Buat Inspeksi</Link>
                    </Button>
                </div>
                <div className="w-full overflow-x-auto">
                    <div className="min-w-[1000px]">
                        <DataTable columns={columns} data={inspections.data} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
