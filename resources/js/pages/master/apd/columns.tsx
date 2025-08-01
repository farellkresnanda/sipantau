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
import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

export type masterApd = {
    id: string;
    apd_name: string;
    inspection_criteria: string;
    created_at: string;
    updated_at: string;
};

export const columns: ColumnDef<masterApd, unknown>[] = [
    {
        id: 'index',
        header: 'No.',
        cell: ({ row }) => row.index + 1,
    },
    {
        header: 'Nama APD',
        id: 'apd_name',
        accessorFn: (row) => row.apd_name,
        enableGlobalFilter: true,
    },
    {
        header: 'Kriteria Inspeksi',
        id: 'inspection_criteria',
        accessorFn: (row) => row.inspection_criteria,
        cell: ({ row }) => <div className="whitespace-pre-wrap">{row.original.inspection_criteria}</div>,
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
                if (confirm('Are you sure you want to delete this APD?')) {
                    router.delete(`/master/apd/${row.original.id}`, {
                        onSuccess: () => {
                            // Refresh the page or fetch data again to update the table
                            router.reload({ only: ['apds'] }); // adjust 'apds' to your actual prop/data key
                        },
                    });
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
                            <Link href={`/master/apd/${row.original.id}/edit`}>Edit</Link>
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
