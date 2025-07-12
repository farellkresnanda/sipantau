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

// Tipe relasi description (anak)
type DeskripsiItem = {
    id: number;
    description: string;
};

// Tipe data utama dari MasterK3l (induk)
export type MasterK3l = {
    id: string;
    objective: string;
    description: DeskripsiItem[]; // ← ini relasi one-to-many
};

export const columns: ColumnDef<MasterK3l>[] = [
    {
        accessorKey: 'no',
        header: 'No',
    },
    {
        accessorKey: 'objective',
        header: 'Tujuan',
    },
    {
        id: 'description',
        header: 'Deskripsi',
        cell: ({ row }) => <ul className="list-disc pl-4">{row.original.description?.map((d) => <li key={d.id}>{d.description}</li>)}</ul>,
    },
    {
        id: 'actions',
        header: '#',
        cell: ({ row }) => {
            const handleDelete = () => {
                if (confirm('Are you sure you want to delete this Master K3L?')) {
                    router.delete(`/master/k3l/${row.original.id}`);
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
                            <Link href={`/master/k3l/${row.original.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
