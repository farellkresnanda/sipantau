'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { router, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarDays, CheckCircle, Info, MoreVertical, XCircle } from 'lucide-react';

export const columns: ColumnDef<any>[] = [
    {
        accessorKey: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        header: 'Status Inspeksi',
        id: 'approval_status',
        accessorFn: (row) => ({
            status: row.approval_status,
            uuid: row.uuid,
        }),
        cell: ({ row }) => {
            const status = row.original.approval_status;
            const statusId = status?.id;
            const statusName = status?.name || '-';

            let icon = null;
            let color = null;

            switch (statusId) {
                case 1:
                    icon = <Info className="h-4 w-4" />;
                    color = 'bg-blue-100 text-blue-700';
                    break;
                case 2:
                    icon = <CheckCircle className="h-4 w-4" />;
                    color = 'bg-green-100 text-green-700';
                    break;
                case 3:
                    icon = <XCircle className="h-4 w-4" />;
                    color = 'bg-red-100 text-red-700';
                    break;
                default:
                    color = 'bg-gray-100 text-gray-700';
            }

            return (
                <Link href={`/inspection/k3l/${row.original.uuid}`} className="inline-flex items-center gap-2 hover:underline">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-all hover:ring-1 hover:ring-offset-1 ${color}`}>
                        {icon}
                        {statusName}
                    </span>
                </Link>
            );
        },
        enableGlobalFilter: true,
    },
    {
        header: 'Entitas & Plant',
        id: 'entity',
        accessorFn: (row) => `${row.entity?.name ?? '-'} - ${row.plant?.name ?? '-'}`,
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div>{row.original.entity?.name ?? '-'}</div>
                <div className="text-sm text-gray-500">{row.original.plant?.name ?? '-'}</div>
            </div>
        ),
        enableGlobalFilter: true,
    },
    {
        header: 'Nomor & Tanggal',
        id: 'car_auto_number',
        accessorFn: (row) => `${row.car_number_auto} - ${row.inspection_date}`,
        cell: ({ row }) => {
            const carNumber = row.original.car_number_auto;
            const date = row.original.inspection_date;
            return (
                <div className="flex flex-col">
                    <span>{carNumber}</span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                        <CalendarDays className="h-3 w-3" />
                        {date}
                    </span>
                </div>
            );
        },
        enableGlobalFilter: true,
    },
    {
        header: 'Lokasi',
        id: 'location',
        accessorFn: (row) => row.location?.name?.toString() || '-',
        enableGlobalFilter: true,
    },
    {
        header: 'Disetujui Oleh & Tanggal',
        id: 'approved',
        accessorFn: (row) => `${row.approved_by?.name || '-'} - ${row.approved_at || '-'}`,
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div>{row.original.approved_by?.name || '-'}</div>
                <div className="text-sm text-gray-500">{row.original.approved_at || '-'}</div>
            </div>
        ),
        enableGlobalFilter: true,
    },
    {
        header: 'Dibuat Oleh & Tanggal',
        id: 'created',
        accessorFn: (row) => `${row.created_by?.name || '-'} - ${row.created_at?.replace('T', ' ').split('.')[0] || '-'}`,
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div>{row.original.created_by?.name || '-'}</div>
                <div className="text-sm text-gray-500">{row.original.created_at?.replace('T', ' ').split('.')[0] || '-'}</div>
            </div>
        ),
        enableGlobalFilter: true,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                    router.delete(`/inspection/k3l/${row.original.uuid}`);
                }
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/inspection/k3l/${row.original.uuid}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
