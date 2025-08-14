import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { CalendarDays, CheckCircle, Info, MoreVertical, XCircle } from 'lucide-react';

type RowType = {
    id: string | number;
    uuid: string;
    plant_code: string | number | null;
    entity_code: string | number | null;
    code: string;
    job_name: string | null;
    work_date: string; // ISO date string
    divison: string | null;
    unit: string | null;
    apd_text: string | null;
    status_doc: string | number | null; // e.g. 1/2/3 or text
    phase: string | number | null;
    created_by: string | number | null; // user id or name if already resolved
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
};

const badgeForStatus = (status: RowType['status_doc']) => {
    const s = typeof status === 'string' ? status.toLowerCase() : status;
    let icon: React.ReactNode = <Info className="h-4 w-4" />;
    let color = 'bg-gray-100 text-gray-700';
    let label = String(status ?? '-');

    // Jika status berupa angka umum: 1=draft, 2=approved, 3=rejected (silakan sesuaikan)
    if (typeof s === 'number') {
        if (s === 1) {
            color = 'bg-blue-100 text-blue-700';
            label = 'Draft';
        } else if (s === 2) {
            color = 'bg-green-100 text-green-700';
            icon = <CheckCircle className="h-4 w-4" />;
            label = 'Approved';
        } else if (s === 3) {
            color = 'bg-red-100 text-red-700';
            icon = <XCircle className="h-4 w-4" />;
            label = 'Rejected';
        }
    } else if (typeof s === 'string') {
        if (s.includes('approve')) {
            color = 'bg-green-100 text-green-700';
            icon = <CheckCircle className="h-4 w-4" />;
        } else if (s.includes('reject') || s.includes('tolak')) {
            color = 'bg-red-100 text-red-700';
            icon = <XCircle className="h-4 w-4" />;
        } else if (s.includes('draft') || s.includes('pending')) {
            color = 'bg-blue-100 text-blue-700';
        }
        label = s;
    }

    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${color}`}>
      {icon}
            {label}
    </span>
    );
};

const badgeForPhase = (phase: RowType['phase']) => {
    const p = typeof phase === 'string' ? phase.toLowerCase() : phase;
    let color = 'bg-gray-100 text-gray-700';
    let label = String(phase ?? '-');

    if (typeof p === 'number') {
        if (p === 1) color = 'bg-amber-100 text-amber-700';
        else if (p === 2) color = 'bg-indigo-100 text-indigo-700';
        else if (p >= 3) color = 'bg-purple-100 text-purple-700';
    } else if (typeof p === 'string') {
        if (p.includes('draft') || p.includes('awal')) color = 'bg-amber-100 text-amber-700';
        else if (p.includes('review') || p.includes('valid')) color = 'bg-indigo-100 text-indigo-700';
        else if (p.includes('final')) color = 'bg-purple-100 text-purple-700';
        label = p;
    }

    return <span className={`rounded-full px-2 py-1 text-xs font-medium ${color}`}>{label}</span>;
};

export const columns: ColumnDef<RowType>[] = [
    {
        accessorKey: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
        enableGlobalFilter: false,
    },
    {
        header: 'Status Dokumen',
        id: 'status_doc',
        accessorFn: (row) => String(row.status_doc ?? '-'),
        enableGlobalFilter: true,
        cell: ({ row }) => (
            <Link href={`/inspection/building/${row.original.uuid}`} className="inline-flex items-center gap-2">
                {badgeForStatus(row.original.status_doc)}
            </Link>
        ),
    },
    {
        header: 'Phase',
        id: 'phase',
        accessorFn: (row) => String(row.phase ?? '-'),
        enableGlobalFilter: true,
        cell: ({ row }) => badgeForPhase(row.original.phase),
    },
    {
        header: 'Nomor & Pekerjaan',
        id: 'code_job',
        accessorFn: (row) => `${row.code ?? '-'} - ${row.job_name ?? '-'}`,
        enableGlobalFilter: true,
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="font-medium">{row.original.code ?? '-'}</div>
                <div className="text-sm text-gray-500">{row.original.job_name ?? '-'}</div>
            </div>
        ),
    },
    {
        header: 'Tanggal Pekerjaan',
        id: 'work_date',
        accessorFn: (row) => new Date(row.work_date).toLocaleDateString('id-ID'),
        enableGlobalFilter: true,
        cell: ({ row }) => (
            <span className="flex items-center gap-1 text-sm">
        <CalendarDays className="h-3 w-3" />
                {new Date(row.original.work_date).toLocaleDateString('id-ID')}
      </span>
        ),
    },
    {
        header: 'Entitas & Plant',
        id: 'entity_plant',
        accessorFn: (row) => `${row.entity_code ?? '-'} - ${row.plant_code ?? '-'}`,
        enableGlobalFilter: true,
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div>{row.original.entity_code ?? '-'}</div>
                <div className="text-sm text-gray-500">{row.original.plant_code ?? '-'}</div>
            </div>
        ),
    },
    {
        header: 'Divisi & Unit',
        id: 'divison_unit',
        accessorFn: (row) => `${row.divison ?? '-'} - ${row.unit ?? '-'}`,
        enableGlobalFilter: true,
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div>{row.original.divison ?? '-'}</div>
                <div className="text-sm text-gray-500">{row.original.unit ?? '-'}</div>
            </div>
        ),
    },
    {
        header: 'APD',
        id: 'apd_text',
        accessorFn: (row) => row.apd_text ?? '-',
        enableGlobalFilter: true,
        cell: ({ row }) => <span className="line-clamp-2 text-sm">{row.original.apd_text ?? '-'}</span>,
    },
    {
        header: 'Dibuat Oleh',
        id: 'created_by',
        accessorFn: (row) => String(row.created_by ?? '-'),
        enableGlobalFilter: true,
        cell: ({ row }) => String(row.original.created_by ?? '-'),
    },
    {
        header: 'Dibuat',
        id: 'created_at',
        accessorFn: (row) => new Date(row.created_at).toLocaleString('id-ID'),
        enableGlobalFilter: true,
    },
    {
        header: 'Diupdate',
        id: 'updated_at',
        accessorFn: (row) => new Date(row.updated_at).toLocaleString('id-ID'),
        enableGlobalFilter: true,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                    router.delete(`/inspection/building/${row.original.uuid}`);
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
                            <Link href={`/inspection/building/${row.original.uuid}/edit`}>Edit</Link>
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
