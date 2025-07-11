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

export type MasterAc = {
    id: string;
    kode_plant: string;
    ruang: string;
    kode_inventaris: string;
    merk: string;
    entitas: {
        nama: string;
    } | null;
    plant_nama: string | null;
};

export const columns: ColumnDef<MasterAc>[] = [
    {
        id: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'entitas.nama',
        header: 'Nama Entitas',
        cell: ({ row }) => {
            const entitasNama = row.original.entitas?.nama;
            return entitasNama ?? '-';
        },
    },
    {
        accessorKey: 'plant_nama',
        header: 'Plant',
        cell: ({ row }) => {
            const plantNama = row.original.plant_nama;
            return plantNama ?? row.original.kode_plant ?? '-';
        },
    },
    {
        accessorKey: 'ruang',
        header: 'Ruang',
    },
    {
        accessorKey: 'kode_inventaris',
        header: 'Kode Inventaris',
    },
    {
        accessorKey: 'merk',
        header: 'Merk',
    },
    {
        id: 'actions',
        header: '#',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Apakah Anda yakin ingin menghapus data Master AC ini?')) {
                    router.delete(`/master/ac/${row.original.id}`);
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
                        <DropdownMenuLabel>Action</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/master/ac/${row.original.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
