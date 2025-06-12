'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Product } from '@/constants/data';
import { Column, ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Text, XCircle } from 'lucide-react';
import Image from 'next/image';
import { CellAction } from './cell-action';
import { CATEGORY_OPTIONS } from './options';

export const columns: ColumnDef<any>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ cell }) => <div>{String(cell.getValue() ?? '')}</div>,
    meta: {
      label: 'Name',
      placeholder: 'Search products...',
      variant: 'text',
      icon: Text
    },
    enableColumnFilter: true
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => (
      <div className='capitalize'>{String(cell.getValue() ?? '')}</div>
    ),
    enableColumnFilter: true
  },
  {
    id: 'price',
    accessorKey: 'price',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Price' />
    ),
    cell: ({ cell }) => <div>${String(cell.getValue() ?? '')}</div>,
    enableColumnFilter: false
  },
  {
    id: 'platform',
    accessorKey: 'platform',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Platform' />
    ),
    cell: ({ cell }) => <div>{String(cell.getValue() ?? '')}</div>,
    enableColumnFilter: true
  },
  {
    id: 'landing_page',
    accessorKey: 'landing_page',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Landing Page' />
    ),
    cell: ({ cell }) => {
      const url = String(cell.getValue() ?? '');
      return (
        <a
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='text-blue-600 underline'
        >
          {url}
        </a>
      );
    },
    enableColumnFilter: false
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => <div>{String(cell.getValue() ?? '')}</div>,
    enableColumnFilter: false
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Updated At' />
    ),
    cell: ({ cell }) => <div>{String(cell.getValue() ?? '')}</div>,
    enableColumnFilter: false
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
