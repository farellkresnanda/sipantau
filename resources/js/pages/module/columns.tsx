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
import { MoreHorizontal, PencilIcon, Trash2, User } from 'lucide-react';

export type ModuleManager = {
    id: string;
    module: {
        id: number;
        name: string;
        code: string;
    };
    count_module: string;
    user: {
        id: number;
        name: string;
    };
    entity_name: string;
    latest_entity_code: string;
    plant_name: string;
    latest_plant_code: string;
    latest_created_at: string;
};

export const columns: ColumnDef<ModuleManager>[] = [
    {
        id: 'index',
        header: 'No.',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'count_module',
        header: 'Akses Modul',
        cell: ({ row }) => row.original.count_module,
    },
    {
        accessorKey: 'user.name',
        header: 'Nama Pegawai',
        cell: ({ row }) => (
            <div className="inline-flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{row.original.user?.name}</span>
            </div>
        ),
    },
    {
        accessorKey: 'entity_name',
        header: 'Entitas Area',
        cell: ({ row }) => {
            const entityName = row.original.entity_name;
            const entityCode = row.original.latest_entity_code;
            return entityName && entityCode
                ? `${entityName} (${entityCode})`
                : '-';
        },
    },
    {
        accessorKey: 'plant_name',
        header: 'Plant Area',
        cell: ({ row }) => {
            const plantName = row.original.plant_name;
            const plantCode = row.original.latest_plant_code;
            return plantName && plantCode
                ? `${plantName} (${plantCode})`
                : '-';
        },
    },
    {
        accessorKey: 'latest_created_at',
        header: 'Dibuat Terakhir',
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
                if (confirm('Are you sure you want to delete this module manager?')) {
                    router.delete(`/module-managers/${row.original.user.id}`);
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
                            <Link href={`/module-managers/${row.original.user?.id}/edit`}>
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600 hover:text-red-700">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
