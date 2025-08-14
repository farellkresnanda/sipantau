'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Link, router, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';
import { format } from 'date-fns';
import { id as indonesiaLocale } from 'date-fns/locale';

// Komponen UI & Ikon
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Info, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';

// === DEFINISI TIPE ===

// Tipe spesifik untuk User dengan roles
type UserWithRoles = {
    id: number;
    name: string;
    email: string;
    roles: { name: string }[];
};

// Tipe untuk props halaman yang menyertakan data user
interface PagePropsWithUser extends PageProps {
    auth: PageProps['auth'] & {
        user: UserWithRoles;
    };
}

// Tipe data untuk setiap baris, cocok dengan data dari Controller
export type AcInspectionRow = {
    id: number;
    uuid: string;
    car_auto_number: string;
    inspection_date: string;
    created_at: string;
    approval_status_code: string;
    entity: { name: string } | null;
    plant: { name: string } | null;
    location: { inventory_code: string; room: string; } | null;
    createdBy: { name: string; } | null;
    approvalStatus: { id: number; code: string; name: string; } | null;
};

// Deklarasi fungsi 'route' dari Ziggy
declare function route(name: string, params?: any): string;


// === DEFINISI KOLOM UNTUK DATA TABLE ===

export const columns: ColumnDef<AcInspectionRow>[] = [
    {
        header: 'No',
        cell: ({ row }) => row.index + 1,
        size: 10, // Mengatur lebar kolom agar tidak terlalu besar
    },
    {
        header: 'Status',
        cell: ({ row }) => {
            const status = row.original.approvalStatus;
            const statusCode = status?.code ?? row.original.approval_status_code;
            const statusName = status?.name || 'Draft';
            let icon: React.ReactNode = null;
            let color = 'bg-gray-100 text-gray-800';

            switch (statusCode) {
                case 'SOP': 
                    icon = <Info className="h-4 w-4" />;
                    color = 'bg-blue-100 text-blue-800';
                    break;
                case 'SAP':
                    icon = <CheckCircle className="h-4 w-4" />;
                    color = 'bg-green-100 text-green-800';
                    break;
                case 'SRE':
                    icon = <XCircle className="h-4 w-4" />;
                    color = 'bg-red-100 text-red-800';
                    break;
            }

            return (
                <Link href={route('inspection.ac.show', row.original.uuid)}>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium transition-all hover:ring-2 hover:ring-offset-1 ${color}`}>
                        {icon}
                        {statusName}
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
                <div className="font-medium">{row.original.car_auto_number}</div>
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
        header: '#',
        id: 'actions',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                    router.delete(`/inspection/ac/${row.original.uuid}`);
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
                            <Link href={`/inspection/ac/${row.original.uuid}/edit`}>Edit</Link>
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