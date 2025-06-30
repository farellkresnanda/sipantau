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

export type InspeksiApar = {
    id: string;
    kode_entitas: string;
    entitas: string;
    no_apar: string;
    kode_ruang: string;
    lokasi: string;
    jenis: string;
    apar: string;
    kode_inventaris: string;
};

export const columns: ColumnDef<InspeksiApar>[] = [
    {
        id: 'index',
        header: '#',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'kode_entitas',
        header: 'Kode Entitas',
    },
    {
        accessorKey: 'entitas',
        header: 'Entitas',
    },
    {
        accessorKey: 'no_apar',
        header: 'No APAR',
    },
    {
        accessorKey: 'kode_ruang',
        header: 'Kode Ruang',
    },
    {
        accessorKey: 'lokasi',
        header: 'Lokasi',
    },
    {
        accessorKey: 'jenis',
        header: 'Jenis',
    },
    {
        accessorKey: 'apar',
        header: 'APAR',
    },
    {
        accessorKey: 'kode_inventaris',
        header: 'Kode Inventaris',
    },
    {
        id: 'actions',
        header: '#',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Are you sure you want to delete this Master APAR?')) {
                    router.delete(`/master/apar/${row.original.id}`);
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
                            <Link href={`/master/apar/${row.original.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
