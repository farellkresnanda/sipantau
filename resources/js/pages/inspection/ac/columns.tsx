'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react'; // Pastikan 'router' diimpor
import { MoreHorizontal, Calendar, MapPin, Building2, Factory, UserCheck, ShieldCheck, FileText } from 'lucide-react'; // Sesuaikan icon yang digunakan
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Tipe data untuk setiap baris, pastikan cocok dengan data dari Controller
export type AcInspectionRow = {
    id: number;
    uuid: string;
    ac_inspection_number: string;
    inspection_date: string;
    created_at: string;
    approval_status_code: string;
    entity: { name: string } | null;
    plant: { name: string } | null;
    location: { inventory_code: string; room: string; } | null;
    createdBy: { name:string; } | null;
    approvalStatus: { id: number; code: string; name: string; } | null;
};

// [REVISI FINAL] Mengekspor konstanta 'columns' dengan urutan yang benar
export const columns: ColumnDef<AcInspectionRow>[] = [
    {
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.approvalStatus;
            const statusCode = status?.code ?? row.original.approval_status_code;
            const statusName = status?.name || 'Draft';
            let icon = null;
            let color = 'bg-gray-100 text-gray-700';
            switch (statusCode) {
                case 'SOP': icon = <Info className="h-4 w-4" />; color = 'bg-blue-100 text-blue-700'; break;
                case 'SAP': icon = <CheckCircle className="h-4 w-4" />; color = 'bg-green-100 text-green-700'; break;
                case 'SRE': icon = <XCircle className="h-4 w-4" />; color = 'bg-red-100 text-red-700'; break;
            }
            return (
                <Link href={route('inspection.ac.show', row.original.uuid)} className="hover:underline">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${color}`}>
                        {icon} {statusName}
                    </span>
                </Link>
            );
        },
    },
    {
        header: 'Entitas & Plant',
        cell: ({ row }) => (
            <div>
                <div>{row.original.entity?.name ?? '-'}</div>
                <div className="text-sm text-muted-foreground">{row.original.plant?.name ?? '-'}</div>
            </div>
        ),
    },
    {
        header: 'Nomor & Tanggal',
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.ac_inspection_number}</div>
                <div className="text-sm text-muted-foreground">
                    {format(new Date(row.original.inspection_date), 'dd MMM yyyy', { locale: indonesiaLocale })}
                </div>
            </div>
        ),
    },
    {
        header: 'Lokasi AC & Inventaris',
        cell: ({ row }) => (
            <div>
                <div>{row.original.location?.room ?? '-'}</div>
                <div className="text-sm text-muted-foreground">{row.original.location?.inventory_code ?? '-'}</div>
            </div>
        ),
    },
    {
        header: 'Dibuat Oleh',
        accessorFn: (row) => row.createdBy?.name ?? '-',
    },
    {
        header: 'Tanggal Dibuat',
        accessorKey: 'created_at',
        cell: ({ row }) => format(new Date(row.original.created_at), 'dd/MM/yyyy, HH:mm'),
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const inspection = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={route('inspection.ac.show', inspection.uuid)}>Lihat Detail</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('inspection.ac.edit', inspection.uuid)}>Edit</Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];