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

export type MasterEntity = {
    name: string;
};

export type MasterPlant = {
    name: string;
};

export type MasterLokasi = {
    id: number;
    name: string;
    entity: MasterEntity[];
    plants: MasterPlant[];
};
export const columns: ColumnDef<MasterLokasi>[] = [
    {
        accessorKey: 'no',
        header: 'No',
    },
    {
        header: 'Entitas',
        accessorFn: (row) => (row.entity && row.entity.length > 0 ? row.entity.map((e) => e.name).join(', ') : '-'), // tergantung struktur datamu
    },
    {
        header: 'Plant',
        accessorFn: (row) => (row.plants && row.plants.length > 0 ? row.plants.map((p) => p.name).join(', ') : '-'), // tergantung struktur datamu
    },
    {
        header: 'Nama Lokasi/Ruang',
        accessorFn: (row) => row.name,
    },
    {
        id: 'actions',
        header: '#',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Are you sure you want to delete this Master Lokasi?')) {
                    router.delete(`/master/location/${row.original.id}`);
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
                            <Link href={`/master/location/${row.original.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="w-full text-left text-red-600 hover:text-red-700">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
