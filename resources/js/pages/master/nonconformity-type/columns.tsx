'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { router, Link } from '@inertiajs/react';

export interface nonconformitySubType {
  id: number;
  name: string;
}

export interface nonconformityType {
  id: number;
  name: string;
  nonconformity_sub_type: nonconformitySubType[];
}

export const columns: ColumnDef<nonconformityType>[] = [
  {
    header: 'No',
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: 'name',
    header: 'Nama',
  },
  {
    id: 'nonconformity_sub_type',
    header: 'Sub Jenis',
    cell: ({ row }) => {
      const nonconformity_sub_type = row.original.nonconformity_sub_type;
      return nonconformity_sub_type.length > 0 ? (
        <ul className="list-disc pl-4">
          {nonconformity_sub_type.map((sub) => (
            <li key={sub.id}>{sub.name}</li>
          ))}
        </ul>
      ) : (
        '-'
      );
    },
  },
  {
    id: 'actions',
    header: '#',
    cell: ({ row }) => {
      const data = row.original;

      const handleDelete = () => {
        if (confirm('Are you sure you want to delete this Master Ketidaksesuaian?')) {
          router.delete(`/master/nonconformity-type/${data.id}`);
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
              <Link href={`/master/nonconformity-type/${data.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
