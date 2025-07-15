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
import {IdCard, Mail, MoreHorizontal, User} from 'lucide-react';

// You can use a Zod schema here if you want.
export type User = {
    roles: Array<{
        id: number;
        name: string;
    }>;
    entity: {
        id: number;
        name: string;
        entity_code: string;
    };
    plant: {
        id: number;
        name: string;
        plant_code: string;
    };
    id: string;
    name: string;
    position_name?: string;
    npp: string;
    email: string;
};

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'no',
        header: 'No',
    },
    {
        accessorKey: 'name',
        header: 'Nama Pegawai',
        cell: ({ row }) => (
            <Link href={`/users/${row.original.id}`} className="inline-flex items-center gap-2 hover:underline">
                <User className="h-4 w-4" />
                <div className="flex flex-col">
                    <span>{row.original.name}</span>
                    <span className="text-xs text-gray-500" title={row.original.position_name || '-'}>
                        {row.original.position_name && row.original.position_name.length > 30
                            ? `${row.original.position_name.slice(0, 30)}...`
                            : row.original.position_name || '-'}
                    </span>
                </div>
            </Link>
        ),
    },
    {
        accessorKey: 'npp_email',
        header: 'NPP & Email',
        cell: ({ row }) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                    <IdCard className="h-4 w-4" />
                    {row.original.npp}
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    {row.original.email}
                </div>
            </div>
        ),
    },
    {
        accessorKey: 'roles',
        header: 'Role',
        cell: ({ row }) => {
            const role = row.original.roles[0]?.name;
            const badgeStyles = {
                SuperAdmin: 'bg-purple-100 text-purple-800',
                Admin: 'bg-blue-100 text-blue-800',
                Officer: 'bg-green-100 text-green-800',
                Technician: 'bg-orange-100 text-orange-800',
                Validator: 'bg-pink-100 text-pink-800',
                Viewer: 'bg-gray-100 text-gray-800',
            };
            const icons = {
                SuperAdmin: '👑',
                Admin: '⚡',
                Officer: '👮',
                Technician: '🔧',
                Validator: '✓',
                Viewer: '👁️',
            };
            return role ? (
                <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${badgeStyles[role as keyof typeof badgeStyles] || 'bg-gray-100 text-gray-800'}`}
                >
                    <span>{icons[role as keyof typeof icons]}</span>
                    {role}
                </span>
            ) : (
                '-'
            );
        },
    },
    {
        accessorKey: 'entity_plant',
        header: 'Entitas & Plant',
        cell: ({ row }) => {
            const entity = row.original.entity;
            const plant = row.original.plant;
            return (
                <div className="flex flex-col gap-1">
                    <div>{entity ? `${entity.name} (${entity.entity_code})` : '-'}</div>
                    <div className="text-sm text-gray-500">{plant ? `${plant.name} (${plant.plant_code})` : '-'}</div>
                </div>
            );
        },
    },
    {
        accessorKey: 'updated_at',
        header: 'Diubah',
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
                if (confirm('Are you sure you want to delete this user?')) {
                    router.delete(`/users/${row.original.id}`);
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
                            <Link href={`/users/${row.original.id}/edit`}>Edit User</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleDelete} className="w-full text-left text-red-600 hover:text-red-700">
                            Delete User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
