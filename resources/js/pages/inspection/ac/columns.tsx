'use client';

import { ColumnDef } from '@tanstack/react-table'; // Pastikan Anda menggunakan @tanstack/react-table
import { Button } from '@/components/ui/button';
import { Link, router } from '@inertiajs/react'; // Pastikan 'router' diimpor
import { MoreHorizontal } from 'lucide-react'; // Sesuaikan icon yang digunakan
import { format } from 'date-fns';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { showToast } from '@/components/ui/toast'; // Jika Anda menggunakan ini

// --- Definisikan Tipe Data untuk setiap baris tabel ---
// Sesuaikan dengan kolom yang di-select di AcInspectionController@index
export type AcInspectionRow = {
    id: number;
    uuid: string;
    ac_inspection_number: string; // Nama kolom untuk nomor inspeksi AC
    inspection_date: string;
    notes: string | null;
    entity_code: string; // Ini kode entitas (string) dari DB
    plant_code: string;  // Ini kode plant (string) dari DB
    location_id: number;
    approval_status_code: string;
    created_by: number | null;
    created_at: string;

    // Properti relasi yang di-eager load dari controller
    entity?: { id: number; entity_code: string; name: string };
    plant?: { id: number; plant_code: string; name: string };
    location?: { id: number; location: string; inventory_code: string };
    approvalStatus?: { id: number; code: string; name: string };
    createdBy?: { id: number; name: string }; // User yang membuat
    // Jika ada relasi lain (misal items), tambahkan juga tipenya di sini
};

export const columns: ColumnDef<AcInspectionRow>[] = [
    {
        accessorKey: 'id', // Akses ID untuk nomor urut
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        header: 'Nomor Inspeksi',
        id: 'ac_inspection_number',
        accessorFn: (row) => row.ac_inspection_number,
        enableGlobalFilter: true,
        cell: ({ row }) => (
            <Link href={route('inspection.ac.show', row.original.uuid)} className="text-blue-600 hover:underline">
                {row.original.ac_inspection_number}
            </Link>
        ),
    },
    {
        header: 'Tanggal Inspeksi',
        id: 'inspection_date',
        accessorFn: (row) => row.inspection_date,
        enableGlobalFilter: true,
        cell: ({ getValue }) => {
            const date = getValue() as string;
            return date ? format(new Date(date), 'dd MMMM yyyy') : '-';
        },
    },
    {
        header: 'Lokasi',
        id: 'location',
        accessorFn: (row) => row.location?.location,
        enableGlobalFilter: true,
        cell: ({ row }) => row.original.location?.location ?? '-',
    },
    {
        header: 'Entitas',
        id: 'entity',
        accessorFn: (row) => row.entity?.name,
        enableGlobalFilter: true,
        cell: ({ row }) => row.original.entity?.name ?? '-',
    },
    {
        header: 'Plant',
        id: 'plant',
        accessorFn: (row) => row.plant?.name,
        enableGlobalFilter: true,
        cell: ({ row }) => row.original.plant?.name ?? '-',
    },
    {
        header: 'Dibuat Oleh',
        id: 'createdBy',
        accessorFn: (row) => row.createdBy?.name,
        enableGlobalFilter: true,
        cell: ({ row }) => row.original.createdBy?.name ?? '-',
    },
    {
        header: 'Status',
        id: 'approvalStatus',
        accessorFn: (row) => row.approvalStatus?.name,
        enableGlobalFilter: true,
        cell: ({ row }) => {
            const status = row.original.approvalStatus;
            const statusCode = status?.code || row.original.approval_status_code;
            const statusName = status?.name || 'Draft';

            let color = 'bg-gray-100 text-gray-700';
            switch (statusCode) {
                case 'SOP':
                    color = 'bg-blue-100 text-blue-700';
                    break;
                case 'SAP':
                    color = 'bg-green-100 text-green-700';
                    break;
                case 'SRE':
                    color = 'bg-red-100 text-red-700';
                    break;
                default:
                    break;
            }

            return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${color}`}>{statusName}</span>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const inspection = row.original;

            const handleDelete = () => {
                if (confirm(`Apakah Anda yakin ingin menghapus inspeksi AC nomor ${inspection.ac_inspection_number}?`)) {
                    router.delete(route('inspection.ac.destroy', inspection.uuid), {
                        onSuccess: () => {
                            showToast({ type: 'success', message: 'Inspeksi AC berhasil dihapus!' });
                        },
                        onError: (errors) => {
                            console.error('Error deleting AC inspection:', errors);
                            showToast({ type: 'error', message: 'Gagal menghapus inspeksi AC. Cek konsol.' });
                        },
                    });
                }
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={route('inspection.ac.show', inspection.uuid)}>Lihat Detail</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href={route('inspection.ac.edit', inspection.uuid)}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
