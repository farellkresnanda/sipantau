'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarDays, CheckCircle, Info, MapPin, MoreVertical, Wrench, XCircle } from 'lucide-react';

export const columns: ColumnDef<{
    uuid: string;
    finding_status: {
        id: number;
        name: string;
    } | null;
    entity: {
        entity_code: string;
        name: string;
    } | null;
    plant: {
        plant_code: string;
        name: string;
    } | null;
    car_number_auto: string;
    date: string;
    nonconformity_type: {
        id: number;
        name: string;
    } | null;
    finding_description: string;
    location_details: string;
    created_by: {
        name: string;
    } | null;
}>[] = [
    {
        accessorKey: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        header: 'Status Temuan',
        accessorKey: 'finding_status.name',
        cell: ({ row }) => {
            const status = row.original.finding_status;
            const statusId = status?.id;
            const statusName = status?.name || '-';

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
                case 7:
                    icon = <Wrench className="h-4 w-4" />;
                    colorClasses = 'bg-indigo-100 text-indigo-700';
                    break;
                default:
                    icon = null;
                    colorClasses = 'bg-gray-100 text-gray-700';
            }

            return (
                <Link href={`/finding/${row.original.uuid}`} className="inline-flex items-center gap-2 hover:underline">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${colorClasses}`}>
                        {icon}
                        {statusName}
                    </span>
                </Link>
            );
        },
    },
    {
        accessorKey: 'entity',
        header: 'Entitas & Plant',
        cell: ({ row }) => {
            const entityName = row.original.entity?.name ?? '-';
            const plantName = row.original.plant?.name ?? '-';
            return (
                <div className="flex flex-col">
                    <span>{entityName}</span>
                    <span className="text-sm text-gray-500">{plantName}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'car_number_auto',
        header: 'Nomor & Tanggal',
        cell: ({ row }) => {
            const carNumber = row.original.car_number_auto;
            const date = row.original.date;
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
    },
    {
        accessorKey: 'nonconformity_type',
        header: 'Ketidaksesuaian',
        cell: ({ row }) => {
            return row.original.nonconformity_type?.name ?? '-';
        },
    },
    {
        accessorKey: 'finding_description',
        header: 'Deskripsi & Lokasi',
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    <div className="max-w-[200px] truncate">{row.original.finding_description}</div>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3 w-3" />
                    <div className="max-w-[200px] truncate">{row.original.location_details}</div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: 'created_by',
        header: 'Dibuat Oleh',
        cell: ({ row }) => {
            return row.original.created_by?.name ?? '-';
        },
    },
    {
        id: 'uuid',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Are you sure you want to delete this data?')) {
                    router.delete(`/finding/${row.original.uuid}`);
                }
            };
            const finding = row.original;
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
                            <Link href={`/finding/${finding.uuid}/edit`}>Edit</Link>
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
