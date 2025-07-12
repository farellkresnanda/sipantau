'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, CheckCircle, XCircle } from 'lucide-react';

export const columns: ColumnDef<{
    id: number;
    title: string;
    description: string;
    image_path: string;
    status: string;
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
                    Judul
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const hseInformation = row.original;
            return (
                <Link href={`/analysis/hse-information/${hseInformation.id}`} className="hover:underline">
                    {hseInformation.title}
                </Link>
            );
        },
    },
    {
        accessorKey: 'description',
        header: 'Deskripsi',
        cell: ({ row }) => {
            const description = row.getValue('description') as string;
            return <div className="max-w-[150px] truncate">{description}</div>;
        },
    },
    {
        accessorKey: 'image_path',
        header: 'Gambar',
        cell: ({ row }) => {
            const imagePath = row.getValue('image_path') as string;
            return <img src={imagePath ? `/storage/${imagePath}` : '/images/default.png'} alt="K3 Info" className="h-10 w-10 rounded object-cover" />;
        },
},
{
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
        const status = row.getValue('status') as string;
        let icon;
        let colorClasses;
        let label;

        if (status === 'On Display') {
            icon = <CheckCircle className="h-4 w-4" />;
            colorClasses = 'bg-green-100 text-green-700';
            label = 'On Display';
        } else if (status === 'Not Display') {
            icon = <XCircle className="h-4 w-4" />;
            colorClasses = 'bg-red-100 text-red-700';
            label = 'Not Display';
        } else {
            return (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    ⚠️ Unknown
                </div>
            );
        }

        return (
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
                {icon}
                {label}
            </div>
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
        cell: ({ row }) => {
            const hseInformation = row.original;

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
                            <Link href={`/analysis/hse-information/${hseInformation.id}/edit`}>Edit</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link
                                href={`/analysis/hse-information/${hseInformation.id}`}
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
