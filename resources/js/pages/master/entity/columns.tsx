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
export type MasterEntity = {
    id: string;
    entity_code: string;
    group_code: string;
    name: string;
    alias_name: string;
    created_at: string;
    updated_at: string;
};

export const columns: ColumnDef<MasterEntity>[] = [
    {
        accessorKey: 'no',
        header: 'No.',
    },
    {
        header: 'Kode Entitas',
        id: 'entity_code',
        accessorFn: (row) => row.entity_code,
        enableGlobalFilter: true,
    },
    {
        header: 'Kode Group',
        id: 'group_code',
        accessorFn: (row) => row.group_code,
        enableGlobalFilter: true,
    },
    {
        header: 'Nama',
        id: 'name',
        accessorFn: (row) => row.name,
        enableGlobalFilter: true,
    },
    {
        header: 'Nama Alias',
        id: 'alias_name',
        accessorFn: (row) => row.alias_name,
        enableGlobalFilter: true,
    },
    {
        header: 'Dibuat',
        id: 'created_at',
        accessorFn: (row) => row.created_at?.replace('T', ' ').split('.')[0],
        enableGlobalFilter: true,
    },
    {
        header: 'Diubah',
        id: 'updated_at',
        accessorFn: (row) => row.updated_at?.replace('T', ' ').split('.')[0],
        enableGlobalFilter: true,
    },
    {
        id: 'actions',
        header: '#',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Are you sure you want to delete this entity?')) {
                    router.delete(`/master/entity/${row.original.id}`);
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
                            <Link href={`/master/entity/${row.original.id}/edit`}>Edit</Link>
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
