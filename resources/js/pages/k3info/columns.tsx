'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

export const columns: ColumnDef<{
    id: number;
    title: string;
    description: string;
    image_path: string;
    created_at: string;
    updated_at: string;
}>[] = [
    {
        accessorKey: 'index',
        header: 'No',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const k3info = row.original;
            return (
                <Link href={`/reports/k3info/${k3info.id}`} className="hover:underline">
                    {k3info.title}
                </Link>
            );
        },
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
            const description = row.getValue('description') as string;
            return <div className="max-w-[150px] truncate">{description}</div>;
        },
    },
    {
        accessorKey: 'image_path',
        header: 'Image',
        cell: ({ row }) => {
            const imagePath = row.getValue('image_path') as string;
            return <img src={`/storage/${imagePath}`} alt="K3 Info" className="h-10 w-10 rounded object-cover" />;
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
        cell: ({ row }) => {
            const k3info = row.original;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="h-4 w-4"
                            >
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                            </svg>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                            <Link href={`/reports/k3info/${k3info.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/reports/k3info/${k3info.id}`}
                                method="delete"
                                as="button"
                                className="w-full text-left text-red-600 hover:text-red-700"
                            >
                                Delete
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
