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

export type InspeksiApar = {
    id: string;
    entity: MasterEntity[];
    plants: MasterPlant[];
    apar_no: string;
    room_code: string;
    location: string;
    type: string;
    apar: string;
    inventory_code: string;
};

export const columns: ColumnDef<InspeksiApar>[] = [
    {
        accessorKey: 'no',
        header: 'No',
    },
    {
        header: 'Entitas',
        id: 'entity',
        accessorFn: (row) => (row.entity && row.entity.length > 0 ? row.entity.map((e) => e.name).join(', ') : '-'),
        enableGlobalFilter: true,
    },
    {
        header: 'Plant',
        id: 'plants',
        accessorFn: (row) => (row.plants && row.plants.length > 0 ? row.plants.map((p) => p.name).join(', ') : '-'),
        enableGlobalFilter: true,
    },
    {
        header: 'No APAR / No APAB',
        id: 'apar_no',
        accessorFn: (row) => row.apar_no,
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
    },
    {
        header: 'Jenis',
        id: 'type',
        accessorFn: (row) => row.type,
        enableGlobalFilter: true,
    },
    {
        header: 'Type',
        id: 'apar',
        accessorFn: (row) => row.apar,
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
                        <DropdownMenuItem onClick={handleDelete} className="w-full text-left text-red-600 hover:text-red-700">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
