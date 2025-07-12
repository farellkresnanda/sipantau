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
export type User = {
    roles: Array<{
        id: number;
        name: string;
    }>;
    id: string;
    name: string;
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
        header: 'Name',
    },
    {
        accessorKey: 'npp',
        header: 'NPP',
    },
    {
        accessorKey: 'email',
        header: 'Email',
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
                        <DropdownMenuItem onClick={handleDelete}>Delete User</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
