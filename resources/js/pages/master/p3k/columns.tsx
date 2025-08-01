'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

export type MasterP3k = {
    id: number;
    // entity_code: string; // Tidak perlu ditampilkan, tapi mungkin masih perlu di tipe jika digunakan internal
    plant_code: string; // Tetap ada di tipe untuk fallback atau internal logic
    no_p3k: string;
    room_code: string;
    location: string;
    type: string;
    inventory_code: string;
    entity: {
        name: string; // Pastikan ini adalah name entity yang ingin ditampilkan
    } | null;
    plant_name: string | null; // Kolom untuk name plant, pastikan dari backend
};

export const columns: ColumnDef<MasterP3k>[] = [
    {
        id: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        header: 'Nama Entitas',
        id: 'entity_name',
        accessorFn: (row) => row.entity?.name || '-',
        enableGlobalFilter: true,
    },
    {
        header: 'Plant',
        id: 'plant',
        accessorFn: (row) => row.plant_name || row.plant_code,
        enableGlobalFilter: true,
    },
    {
        header: 'No P3K',
        id: 'no_p3k',
        accessorFn: (row) => row.no_p3k,
        enableGlobalFilter: true,
    },
    {
        header: 'Kode Ruang',
        id: 'room_code',
        accessorFn: (row) => row.room_code,
        enableGlobalFilter: true,
    },
    {
        header: 'Lokasi',
        id: 'location',
        accessorFn: (row) => row.location,
        enableGlobalFilter: true,
        cell: ({ row }) => <div className="whitespace-pre-wrap">{row.original.location}</div>,
    },
    {
        header: 'Jenis',
        id: 'type',
        accessorFn: (row) => row.type,
        enableGlobalFilter: true,
    },
    {
        header: 'Kode Inventaris',
        id: 'inventory_code',
        accessorFn: (row) => row.inventory_code,
        enableGlobalFilter: true,
    },
    {
        id: 'actions',
        header: '#',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
                    router.delete(route('p3k.destroy', row.original.id));
                }
            };

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={route('p3k.edit', row.original.id)}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="w-full text-left text-red-600 hover:text-red-700">
                            Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
