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


export type MasterBuilding = {
    id: number;
    entity_code: string;
    plant_code: string;
    location_name: string;
    entity_name: string;
    plant_name: string;
};

export const columns: ColumnDef<MasterBuilding>[] = [
    {
        id: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        header: 'Nama Entitas',
        id: 'entity_name',
        accessorFn: (row) => row.entity_name || '-',
        enableGlobalFilter: true,
    },
    {
        header: 'Nama Plant',
        id: 'plant_name',
        accessorFn: (row) => row.plant_name || '-',
        enableGlobalFilter: true,
    },
    {
        header: 'Nama Lokasi',
        id: 'location_name',
        accessorFn: (row) => row.location_name,
        enableGlobalFilter: true,
    },
    {
        id: 'actions',
        header: '#', // Kolom untuk aksi (Edit, Hapus)
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus master gedung ini?')) {
                    // Menggunakan route helper untuk menghapus data
                    router.delete(route('building.destroy', row.original.id));
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
                            {/* Menggunakan route helper untuk navigasi ke halaman edit */}
                            <Link href={route('building.edit', row.original.id)}>Edit</Link>
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
