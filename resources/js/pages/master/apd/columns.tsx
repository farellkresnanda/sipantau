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

export type MasterApd = {
    id: string;
    nama_apd: string;
    kriteria_inspeksi: string;
};

export const columns: ColumnDef<MasterApd, unknown>[] = [
    {
        id: 'index',
        header: '#',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'nama_apd',
        header: 'Nama APD',
    },
    {
        accessorKey: 'kriteria_inspeksi',
        header: 'Kriteria Inspeksi',
        cell: ({ row }) => (
            <div className="whitespace-pre-wrap">{row.original.kriteria_inspeksi}</div>
        ),
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Are you sure you want to delete this APD?')) {
                    router.delete(`/master/apd/${row.original.id}`);
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
                        <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
