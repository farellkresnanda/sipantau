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
export type MasterApar = {
    name: string;
};

// export type MasterItem = {
//     name: string;
// };

export type AparInspections = {
    id: string;
    entity: MasterEntity;
    plant: MasterPlant;
    apars: MasterApar[];
    status: string;
    car_number_auto: string;
};

export const columns: ColumnDef<AparInspections>[] = [
    {
        accessorKey: 'no',
        header: 'No',
    },
    {
        header: 'Entitas',
        accessorFn: (row) => row.entity?.name ?? '-',
    },
    {
        header: 'Plant',
        accessorFn: (row) => row.plant?.name ?? '-',
    },

    {
        accessorKey: 'status',
        header: 'Status',
    },
    {
        accessorKey: 'car_number_auto',
        header: 'Nomor Mobil Otomatis',
    },
    {
        id: 'actions',
        header: '#',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Are you sure you want to delete this Master APAR?')) {
                    router.delete(`/inspection/apar/${row.original.id}`);
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
                            <Link href={`/inspection/apar/${row.original.id}/edit`}>Edit</Link>
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
