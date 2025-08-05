'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PageProps } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import {
    CalendarDays,
    CheckCircle,
    Info,
    MapPin,
    MoreVertical,
    XCircle,
} from 'lucide-react';
import { route } from 'ziggy-js';

// Tipe data untuk setiap baris
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

            let icon = <Info className="h-4 w-4" />;
            let color = 'bg-gray-100 text-gray-700';
            const iconSize = 'h-4 w-4';

            switch (statusCode) {
                case 'SOP':
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
            return { name: statusName, icon, color };
        },
        cell: ({ row }) => {
            const statusInfo = row.getValue('approval_status') as {
                name: string;
                icon: React.ReactNode;
                color: string;
            };
            const inspection = row.original;

            return (
                <Link href={route('inspection.first-aid.show', inspection.uuid)}>
                    <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-all hover:ring-2 hover:ring-offset-1 ${statusInfo.color}`}
                    >
                        {statusInfo.icon}
                        {statusInfo.name}
                    </span>
                </Link>
            );
        },
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
                        {new Date(value.date).toLocaleDateString('id-ID', {
                             day: '2-digit',
                             month: 'long',
                             year: 'numeric',
                        })}
                    </span>
                </div>
            );
        },
    },
    {
        header: 'Proyek',
        id: 'project_name',
        accessorFn: (row) => row.project_name,
        cell: ({ getValue }) => {
            const value = getValue() as string;
            return (
                <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <div className="max-w-[200px] truncate">{value || '-'}</div>
                </div>
            );
        },
    },
    {
        header: 'Lokasi',
        id: 'location',
        accessorFn: (row) => row.location?.location ?? '-',
    },
    {
        header: 'Dibuat Oleh',
        id: 'created_by',
        accessorFn: (row) => row.created_by?.name ?? '-',
    },
    {
        header: 'Tanggal Dibuat',
        id: 'created_at',
        accessorFn: (row) => new Date(row.created_at).toLocaleString('id-ID'),
    },
    {
        id: 'actions',
        cell: function ActionsCell({ row }) {
            const { auth } = usePage<PageProps>().props;
            const inspection = row.original;

            const isApproved = inspection.approval_status_code === 'SAP';
            const canModify = auth.role === 'SuperAdmin';

            const showModifyActions = canModify && !isApproved;
            const showDetailAction = isApproved;
            
            // Jika tidak ada aksi yang tersedia, jangan render tombol '...' sama sekali
            if (!showModifyActions && !showDetailAction) {
                return null;
            }
            
            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                    router.delete(route('inspection.first-aid.destroy', inspection.uuid));
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
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>

                        {/* Aksi "Lihat Detail" HANYA untuk status Approved */}
                        {showDetailAction && (
                            <DropdownMenuItem asChild>
                                <Link href={route('inspection.first-aid.show', inspection.uuid)}>
                                    Lihat Detail
                                </Link>
                            </DropdownMenuItem>
                        )}
                        
                        {/* Aksi "Edit" dan "Delete" HANYA untuk SuperAdmin pada status BUKAN Approved */}
                        {showModifyActions && (
                            <>
                                <DropdownMenuItem asChild>
                                    <Link href={route('inspection.first-aid.edit', inspection.uuid)}>
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="w-full cursor-pointer text-left text-red-600 focus:bg-red-50 focus:text-red-700"
                                >
                                    Delete
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];