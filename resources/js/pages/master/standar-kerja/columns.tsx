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
export type MasterStandarKerja = {
    id: string;
    nama: string;
    keterangan: string;
    periode: string;
    created_at: string;
    updated_at: string;
};

export const columns: ColumnDef<MasterStandarKerja>[] = [
    {
        accessorKey: 'no',
        header: 'No',
    },
    {
        accessorKey: 'nama',
        header: 'Nama',
    },
    {
        accessorKey: 'keterangan',
        header: 'Keterangan',
        cell: ({ getValue }) => {
            const value = getValue() as string;
            return value?.length > 50 ? value.substring(0, 50) + '...' : value;
        },
    },
    {
        accessorKey: 'periode',
        header: 'Periode',
    },
    {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ getValue }) => {
            const value = getValue() as string;
            return value?.replace('T', ' ').split('.')[0];
        },
    },
    {
        accessorKey: 'updated_at',
        header: 'Updated At',
        cell: ({ getValue }) => {
            const value = getValue() as string;
            return value?.replace('T', ' ').split('.')[0];
        },
    },
    {
        id: 'actions',
        header: '#',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Are you sure you want to delete this standar kerja?')) {
                    router.delete(`/master/standar-kerja/${row.original.id}`);
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
                            <Link href={`/master/standar-kerja/${row.original.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
