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
import { showToast } from '@/components/ui/toast'; // ✅ import toast

export type MasterEntity = {
    name: string;
};

export type MasterPlant = {
    name: string;
};

export type MasterAc = {
    id: string;
    entity: MasterEntity[];
    plants: MasterPlant[];
    room: string;
    inventory_code: string;
    merk: string;
};

export const columns: ColumnDef<MasterAc>[] = [
    {
        id: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        header: 'Entitas',
        accessorFn: (row) =>
            row.entity?.length > 0
                ? row.entity.map((e) => e.name).join(', ')
                : '-',
    },
    {
        header: 'Plant',
        accessorFn: (row) =>
            row.plants?.length > 0
                ? row.plants.map((p) => p.name).join(', ')
                : '-',
    },
    {
        accessorKey: 'room',
        header: 'Ruang',
    },
    {
        accessorKey: 'inventory_code',
        header: 'Kode Inventaris',
    },
    {
        accessorKey: 'merk',
        header: 'Merk',
    },
    {
        id: 'actions',
        header: '#',
        cell: ({ row }) => {
            const handleDelete = () => {
                const confirmed = confirm(
                    `Yakin ingin menghapus AC dengan kode inventaris "${row.original.inventory_code}"?`
                );
                if (confirmed) {
                    router.delete(`/master/ac/${row.original.id}`, {
                        onSuccess: () => {
                            showToast({
                                type: 'success',
                                message: 'Data AC berhasil dihapus.',
                            });
                        },
                        onError: () => {
                            showToast({
                                type: 'error',
                                message: 'Terjadi kesalahan saat menghapus data.',
                            });
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
                        <DropdownMenuLabel>Action</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/master/ac/${row.original.id}/edit`}>Edit</Link>
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
