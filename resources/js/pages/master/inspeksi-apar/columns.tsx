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

// You can use a Zod schema here if you want.
export type InspeksiApar = {
    id: string;
    kode_entitas: string;
    entitas: string;
    no_ac: string;
    kode_ruang: string;
    ruang: string;
    kode_inventaris: string;
    merk: string;
};

export const columns: ColumnDef<InspeksiApar>[] = [
    {
        accessorKey: 'kode_entitas',
        header: 'Kode Inspeksi Apar',
    },
    {
        accessorKey: 'entitas',
        header: 'Inspeksi Apar',
    },
    {
        accessorKey: 'no_ac',
        header: 'No AC',
    },
    {
        accessorKey: 'kode_ruang',
        header: 'Kode Ruang',
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
                if (confirm('Are you sure you want to delete this inspeksi APAR?')) {
                    router.delete(`/inspeksi-apar/${row.original.id}`);
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
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/inspeksi-apar/${row.original.id}/edit`}>Edit Inspeksi APAR</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete}>Delete Inspeksi Apar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
