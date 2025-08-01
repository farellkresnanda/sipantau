'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
  CalendarDays,
  CheckCircle,
  Info,
  MapPin,
  MoreVertical,
  XCircle,
} from 'lucide-react';
import { route } from 'ziggy-js'; // ✅ fixed import

export type FirstAidInspectionRow = {
  id: number;
  uuid: string;
  approval_status_code: string;
  approval_status: {
    id: number;
    name: string;
    code: string;
  } | null;
  entity: {
    name: string;
  } | null;
  plant: {
    name: string;
  } | null;
  car_auto_number: string;
  inspection_date: string;
  location: {
    location: string;
    inventory_code: string;
  } | null;
  project_name: string | null;
  created_by: {
    name: string;
  } | null;
  created_at: string;
};

export const columns: ColumnDef<FirstAidInspectionRow>[] = [
    {
        accessorKey: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        header: 'Status Inspeksi',
        id: 'approval_status',
        accessorFn: (row) => {
            const status = row.approval_status;
            const statusCode = status?.code || row.approval_status_code;
            const statusName = status?.name || '-';

            let icon = null;
            let color = 'bg-gray-100 text-gray-700';
            const iconSize = 'h-4 w-4';

            switch (statusCode) {
                case 'SOP':
                    icon = <Info className={iconSize} />;
                    color = 'bg-blue-100 text-blue-700';
                    break;
                case 'pending':
                    icon = <Info className={iconSize} />;
                    color = 'bg-yellow-100 text-yellow-700';
                    break;
                case 'SAP':
                    icon = <CheckCircle className={iconSize} />;
                    color = 'bg-green-100 text-green-700';
                    break;
                case 'SRE':
                    icon = <XCircle className={iconSize} />;
                    color = 'bg-red-100 text-red-700';
                    break;
            }

            return {
                status: statusCode,
                name: statusName,
                icon,
                color,
            };
        },
        cell: ({ getValue }) => {
            const value = getValue() as { status: string; name: string; icon: React.ReactNode; color: string };

            return (
                <Link href={`/inspection/first-aid/${value.status}`} className="inline-flex items-center gap-2 hover:underline">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${value.color}`}>
                        {value.icon}
                        {value.name}
                    </span>
                </Link>
            );
        },
        enableGlobalFilter: true,
    },
    {
        header: 'Entitas & Plant',
        id: 'entity',
        accessorFn: (row) => ({
            entity: row.entity?.name ?? '-',
            plant: row.plant?.name ?? '-',
        }),
        cell: ({ getValue }) => {
            const value = getValue() as { entity: string; plant: string };
            return (
                <div className="flex flex-col gap-1">
                    <div>{value.entity}</div>
                    <div className="text-sm text-gray-500">{value.plant}</div>
                </div>
            );
        },
        enableGlobalFilter: true,
    },
    {
        header: 'Nomor & Tanggal',
        id: 'car_auto_number',
        accessorFn: (row) => ({
            number: row.car_auto_number,
            date: row.inspection_date,
        }),
        cell: ({ getValue }) => {
            const value = getValue() as { number: string; date: string };
            return (
                <div className="flex flex-col">
                    <span>{value.number}</span>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                        <CalendarDays className="h-3 w-3" />
                        {value.date}
                    </span>
                </div>
            );
        },
        enableGlobalFilter: true,
    },
    {
        header: 'Proyek',
        id: 'project_name',
        accessorFn: (row) => row.project_name,
        cell: ({ getValue }) => {
            const value = getValue() as string;
            return (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <div className="max-w-[200px] truncate">{value}</div>
                    </div>
                </div>
            );
        },
        enableGlobalFilter: true,
    },
    {
        header: 'Lokasi',
        id: 'location',
        accessorFn: (row) => row.location?.location ?? '-',
        enableGlobalFilter: true,
    },
    {
        header: 'Dibuat Oleh',
        id: 'created_by',
        accessorFn: (row) => row.created_by?.name ?? '-',
        enableGlobalFilter: true,
    },
    {
        header: 'Tanggal Dibuat',
        id: 'created_at',
        accessorFn: (row) => row.created_at?.replace('T', ' ').split('.')[0],
        enableGlobalFilter: true,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                    router.delete(`/inspection/first-aid/${row.original.uuid}`);
                }
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={route('inspection.first-aid.edit', row.original.uuid)}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="w-full text-left text-red-600 hover:text-red-700">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
