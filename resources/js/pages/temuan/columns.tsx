'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Info, XCircle } from 'lucide-react';

export const columns: ColumnDef<{
    id: number;
    status_temuan: {
        id: number;
        nama: string;
    } | null;
    status_approval: {
        id: number;
        nama: string;
    } | null;
    nomor_car_auto: string;
    tanggal: string;
    jenis_ketidaksesuaian: {
        id: number;
        nama: string;
    } | null;
    deskripsi_temuan: string;
    detail_lokasi_temuan: string;
}>[] = [
    {
        accessorKey: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        header: 'Status Temuan',
        accessorKey: 'status_temuan.nama',
        cell: ({ row }) => {
            const status = row.original.status_temuan;
            const statusId = status?.id;
            const statusNama = status?.nama || '-';

            let icon = null;
            let colorClasses = '';

            switch (statusId) {
                case 1:
                    icon = <Info className="h-4 w-4" />;
                    colorClasses = 'bg-blue-100 text-blue-700';
                    break;
                case 2:
                    icon = <XCircle className="h-4 w-4" />;
                    colorClasses = 'bg-red-100 text-red-700';
                    break;
                case 3:
                    icon = <CheckCircle className="h-4 w-4" />;
                    colorClasses = 'bg-green-100 text-green-700';
                    break;
                case 4:
                    icon = <XCircle className="h-4 w-4" />;
                    colorClasses = 'bg-orange-100 text-orange-700';
                    break;
                case 5:
                    icon = <Info className="h-4 w-4" />;
                    colorClasses = 'bg-yellow-100 text-yellow-700';
                    break;
                case 6:
                    icon = <XCircle className="h-4 w-4" />;
                    colorClasses = 'bg-purple-100 text-purple-700';
                    break;
                default:
                    icon = null;
                    colorClasses = 'bg-gray-100 text-gray-700';
            }

            return (
                <Link href={`/temuan/${row.original.id}`} className="inline-flex items-center gap-2 hover:underline">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colorClasses}`}>
                        {icon}
                        {statusNama}
                    </span>
                </Link>
            );
        },
    },
    {
        accessorKey: 'status_approval',
        header: 'Status Approval',
        cell: ({ row }) => {
            const status = row.original.status_approval;
            const statusId = status?.id;
            const statusNama = status?.nama || '-';

            let icon = null;
            let colorClasses = '';

            switch (statusId) {
                case 1:
                    icon = <Info className="h-4 w-4" />;
                    colorClasses = 'bg-yellow-100 text-yellow-700';
                    break;
                case 2:
                    icon = <CheckCircle className="h-4 w-4" />;
                    colorClasses = 'bg-green-100 text-green-700';
                    break;
                case 3:
                    icon = <Info className="h-4 w-4" />;
                    colorClasses = 'bg-blue-100 text-blue-700';
                    break;
                case 4:
                    icon = <CheckCircle className="h-4 w-4" />;
                    colorClasses = 'bg-purple-100 text-purple-700';
                    break;
                case 5:
                    icon = <Info className="h-4 w-4" />;
                    colorClasses = 'bg-orange-100 text-orange-700';
                    break;
                case 6:
                    icon = <CheckCircle className="h-4 w-4" />;
                    colorClasses = 'bg-teal-100 text-teal-700';
                    break;
                default:
                    icon = null;
                    colorClasses = 'bg-gray-100 text-gray-700';
            }

            return (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colorClasses}`}>
                    {icon}
                    {statusNama}
                </span>
            );
        },
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
        accessorKey: 'jenis_ketidaksesuaian',
        header: 'Jenis Ketidaksesuaian',
        cell: ({ row }) => {
            return row.original.jenis_ketidaksesuaian?.nama ?? '-';
        },
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
            const temuan = row.original;
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
                            <Link href={`/reports/temuan/${temuan.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/reports/temuan/${temuan.id}`}
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
