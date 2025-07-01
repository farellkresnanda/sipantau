'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';

export const columns: ColumnDef<{
    id: number;
    status_temuan: string;
    status_approval: string;
    nomor_car_auto: string;
    tanggal: string;
    jenis_ketidaksesuaian_id: string;
    deskripsi_temuan: string;
    detail_lokasi_temuan: string;
    akar_masalah: string;
    rencana_perbaikan: string;
    batas_waktu_perbaikan: string;
    tindakan_perbaikan: string;
    verifikasi_perbaikan: string;
    catatan: string;
}>[] = [
    {
        accessorKey: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'status_temuan',
        header: 'Status Temuan',
        cell: ({ row }) => (
            <Link href={`/reports/k3temuan/${row.original.id}`} className="hover:underline">
                {row.original.status_temuan}
            </Link>
        ),
    },
    {
        accessorKey: 'status_approval',
        header: 'Status Approval',
        cell: ({ row }) => <div className="max-w-[150px] truncate">{row.getValue('status_approval')}</div>,
    },
    {
        accessorKey: 'nomor_car_auto',
        header: 'Nomor CAR (Auto)',
    },
    {
        accessorKey: 'tanggal',
        header: 'Tanggal',
    },
    {
        accessorKey: 'jenis_ketidaksesuaian_id',
        header: 'Jenis',
    },
    {
        accessorKey: 'deskripsi_temuan',
        header: 'Deskripsi',
        cell: ({ row }) => <div className="max-w-[200px] truncate">{row.getValue('deskripsi_temuan')}</div>,
    },
    {
        accessorKey: 'detail_lokasi_temuan',
        header: 'Detail Lokasi Temuan',
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const k3temuan = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                            </svg>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/reports/k3temuan/${k3temuan.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/reports/k3temuan/${k3temuan.id}`}
                                method="delete"
                                as="button"
                                className="w-full text-left text-red-600 hover:text-red-700"
                            >
                                Delete
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
