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
    CalendarDays, CheckCircle,
    Info,
    MoreVertical, XCircle,
} from 'lucide-react';

export const columns: ColumnDef<{
    id: string;
    approval_status: {
        id: number;
        name: string;
    } | null;
    uuid: string;
    code: string;
    date_inspection: string;
    expired_year: number;
    entity: {
        name: string;
    } | null;
    plant: {
        name: string;
    } | null;
    apar: {
        apar_no: string;
        type: string;
        location: string;
    } | null;
    created_by: {
        name: string;
    } | null;
    created_at: string;
}>[] = [
    {
        accessorKey: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        header: 'Status Inspeksi',
        id: 'approval_status',
        enableGlobalFilter: true,
        accessorFn: (row) => row.approval_status?.name,
        cell: ({ row }) => {
            const status = row.original.approval_status;
            const statusId = status?.id;
            const statusName = status?.name || '-';

            let icon = null;
            let color: any;

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
                <Link href={`/inspection/apar/${row.original.uuid}`} className="inline-flex items-center gap-2 hover:underline">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${color}`}>
                        {icon}
                        {statusName}
                    </span>
                </Link>
            );
        },
    },
    {
        header: 'Entitas & Plant',
        id: 'entity',
        enableGlobalFilter: true,
        accessorFn: (row) => `${row.entity?.name ?? '-'} - ${row.plant?.name ?? '-'}`,
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div>{row.original.entity?.name ?? '-'}</div>
                <div className="text-sm text-gray-500">{row.original.plant?.name ?? '-'}</div>
            </div>
        ),
    },
    {
        header: 'Nomor & Tipe APAR',
        id: 'apar',
        enableGlobalFilter: true,
        accessorFn: (row) => `${row.apar?.type ?? '-'} - ${row.code ?? '-'}`,
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="font-medium">{row.original.code ?? '-'}</div>
                <div className="text-sm text-gray-500">{row.original.apar?.type ?? '-'}</div>
            </div>
        ),
    },
    {
        header: 'Tanggal Inspeksi',
        id: 'date_inspection',
        accessorFn: (row) => new Date(row.date_inspection).toLocaleDateString('id-ID'),
        enableGlobalFilter: true,
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="flex items-center gap-1 text-sm">
                    <CalendarDays className="h-3 w-3" />
                    {new Date(row.original.date_inspection).toLocaleDateString('id-ID')}
                </span>
                <span className="text-xs text-gray-500">Expired: {row.original.expired_year}</span>
            </div>
        ),
    },
    {
        header: 'Lokasi APAR',
        id: 'location',
        accessorFn: (row) => row.apar?.location,
        enableGlobalFilter: true,
        cell: ({ row }) => row.original.apar?.location ?? '-',
    },
    {
        header: 'Dibuat Oleh',
        id: 'created_by',
        accessorFn: (row) => row.created_by?.name,
        enableGlobalFilter: true,
        cell: ({ row }) => row.original.created_by?.name ?? '-',
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
                    router.delete(`/inspection/apar/${row.original.id}`);
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
                            <Link href={`/inspection/apar/${row.original.uuid}/edit`}>Edit</Link>
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
