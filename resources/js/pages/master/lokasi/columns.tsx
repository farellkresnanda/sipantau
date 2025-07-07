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

export type MasterEntitas = {
    nama: string;
};

export type MasterPlant = {
    nama: string;
};

export type MasterLokasi = {
    id: number;
    nama: string;
    entitas: MasterEntitas[];
    plants: MasterPlant[];
};
export const columns: ColumnDef<MasterLokasi>[] = [
    {
        accessorKey: 'no',
        header: 'No',
    },
    {
        header: 'Entitas',
        accessorFn: (row) => (row.entitas && row.entitas.length > 0 ? row.entitas.map((e) => e.nama).join(', ') : '-'), // tergantung struktur datamu
    },
    {
        header: 'Plant',
        accessorFn: (row) => (row.plants && row.plants.length > 0 ? row.plants.map((p) => p.nama).join(', ') : '-'), // tergantung struktur datamu
    },
    {
        header: 'Nama Lokasi/Ruang',
        accessorFn: (row) => row.nama,
    },
    {
        id: 'actions',
        header: '#',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Are you sure you want to delete this Master Lokasi?')) {
                    router.delete(`/master/lokasi/${row.original.id}`);
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
                            <Link href={`/master/lokasi/${row.original.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
