import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { supabase } from '@/lib/supabase';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Loader2, Pencil } from 'lucide-react';
import React from 'react';
import { getCountryFlagAndFormatPhone } from './phone-utils';

// --- Cell component for display_name ---
function DisplayNameCell({ cell, row }: { cell: any; row: any }) {
  const [open, setOpen] = React.useState(false);
  const [editValue, setEditValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const value = cell.getValue();

  const handleEdit = () => {
    setEditValue(String(value ?? ''));
    setError('');
    setOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    const instanceName =
      row.original.instance_name || row.original.name || row.original.id;
    const { error } = await supabase
      .from('whatsapp_numbers')
      .update({ display_name: editValue })
      .eq('instance_name', instanceName);
    setLoading(false);
    if (error) {
      setError('Failed to update display name.');
      return;
    }
    setOpen(false);
    window.location.reload();
  };

  return (
    <div className='group flex min-w-[180px] items-center justify-between'>
      <span className='text-foreground/90 truncate'>
        {value && String(value).trim() !== '' ? (
          String(value)
        ) : (
          <span className='text-muted-foreground italic'>No name</span>
        )}
      </span>
      <button
        onClick={handleEdit}
        className='hover:bg-accent ml-2 cursor-pointer rounded p-1 opacity-60 transition-opacity group-hover:opacity-100'
        aria-label='Edit display name'
        tabIndex={0}
        type='button'
      >
        <Pencil className='h-4 w-4' />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Display Name</DialogTitle>
          </DialogHeader>
          {error && <div className='mb-2 text-sm text-red-500'>{error}</div>}
          <div className='grid gap-4'>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder='Enter display name'
              disabled={loading}
              aria-label='Display name'
            />
          </div>
          <DialogFooter>
            <button
              className='inline-flex h-10 cursor-pointer items-center justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:cursor-not-allowed'
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className='inline-flex h-10 cursor-pointer items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50'
              onClick={handleSave}
              disabled={loading}
            >
              {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Save
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export const columns: ColumnDef<any>[] = [
  {
    id: 'display_name',
    accessorKey: 'display_name',
    header: ({ column }: { column: Column<any, unknown> }) => (
      <DataTableColumnHeader column={column} title='Display Name' />
    ),
    cell: (props) => <DisplayNameCell {...props} />
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: ({ column }: { column: Column<any, unknown> }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ cell }) => {
      const value = String(cell.getValue() ?? '').toLowerCase();
      let icon = null;
      let color = '';
      if (value === 'open') {
        icon = (
          <svg
            width='18'
            height='18'
            fill='none'
            viewBox='0 0 24 24'
            className='mr-1 inline-block align-middle text-green-500'
          >
            <circle cx='12' cy='12' r='10' fill='currentColor' opacity='0.18' />
            <path
              d='M8 12.5l2 2 4-4'
              stroke='currentColor'
              strokeWidth='2.2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        );
        color = 'text-green-500';
      } else if (value === 'closed') {
        icon = (
          <svg
            width='18'
            height='18'
            fill='none'
            viewBox='0 0 24 24'
            className='mr-1 inline-block align-middle text-red-500'
          >
            <circle cx='12' cy='12' r='10' fill='currentColor' opacity='0.18' />
            <path
              d='M15 9l-6 6M9 9l6 6'
              stroke='currentColor'
              strokeWidth='2.2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        );
        color = 'text-red-500';
      } else if (value === 'connecting') {
        icon = (
          <svg
            width='18'
            height='18'
            fill='none'
            viewBox='0 0 24 24'
            className='mr-1 inline-block align-middle text-yellow-500'
          >
            <circle cx='12' cy='12' r='10' fill='currentColor' opacity='0.18' />
            <path
              d='M12 8v4l2 2'
              stroke='currentColor'
              strokeWidth='2.2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        );
        color = 'text-yellow-500';
      } else if (value === 'refused') {
        icon = (
          <svg
            width='18'
            height='18'
            fill='none'
            viewBox='0 0 24 24'
            className='mr-1 inline-block align-middle text-orange-500'
          >
            <circle cx='12' cy='12' r='10' fill='currentColor' opacity='0.18' />
            <path
              d='M12 9v2m0 4h.01'
              stroke='currentColor'
              strokeWidth='2.2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        );
        color = 'text-orange-500';
      }
      return (
        <span className={`flex items-center capitalize ${color}`}>
          {icon}
          {value}
        </span>
      );
    }
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: ({ column }: { column: Column<any, unknown> }) => (
      <DataTableColumnHeader column={column} title='Phone' />
    ),
    cell: ({ cell }) => {
      const raw = String(cell.getValue() ?? '');
      if (!raw || raw === 'null') return <span></span>;
      const { flag, formatted } = getCountryFlagAndFormatPhone(raw);
      return (
        <div className='flex items-center gap-2'>
          <span>{flag}</span>
          <span>{formatted}</span>
        </div>
      );
    }
  },
  {
    id: 'created_at',
    accessorKey: 'created_at',
    header: ({ column }: { column: Column<any, unknown> }) => (
      <DataTableColumnHeader column={column} title='Created At' />
    ),
    cell: ({ cell }) => {
      const raw = cell.getValue();
      let formatted = '';
      if (raw) {
        const date = new Date(raw as string);
        if (!isNaN(date.getTime())) {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const hh = String(date.getHours()).padStart(2, '0');
          const min = String(date.getMinutes()).padStart(2, '0');
          formatted = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
        }
      }
      return <div>{formatted}</div>;
    }
  },
  {
    id: 'updated_at',
    accessorKey: 'updated_at',
    header: ({ column }: { column: Column<any, unknown> }) => (
      <DataTableColumnHeader column={column} title='Updated At' />
    ),
    cell: ({ cell }) => {
      const raw = cell.getValue();
      let formatted = '';
      if (raw) {
        const date = new Date(raw as string);
        if (!isNaN(date.getTime())) {
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          const hh = String(date.getHours()).padStart(2, '0');
          const min = String(date.getMinutes()).padStart(2, '0');
          formatted = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
        }
      }
      return <div>{formatted}</div>;
    }
  },
  {
    id: 'actions',
    header: '',
    cell: ActionCell,
    enableColumnFilter: false
  }
];

// Filter out rows with status 'removed' before passing to the table
export const filterWhatsappRows = (rows: any[]) =>
  rows.filter((row) => String(row.status).toLowerCase() !== 'removed');

// ActionCell component moved outside to allow hooks
function ActionCell({ row }: { row: any }) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleRemove = async () => {
    setLoading(true);
    setError('');
    const instanceName =
      row.original.instance_name || row.original.name || row.original.id;
    if (!instanceName) {
      setError('Instance identifier not found.');
      setLoading(false);
      return;
    }
    try {
      const apiHost = process.env.NEXT_PUBLIC_WHATSAPP_API_HOST;
      if (!apiHost) {
        setError('API host not configured.');
        setLoading(false);
        return;
      }
      const apiKey = process.env.NEXT_PUBLIC_WHATSAPP_API_KEY;
      const res = await fetch(`${apiHost}instance/delete/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          apikey: apiKey || ''
        }
      });
      if (!res.ok) {
        setError('Failed to remove instance.');
        setLoading(false);
        return;
      }
      // Mostra tela de processando por 2s antes de atualizar a lista
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (e) {
      setError('Failed to remove instance.');
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <AlertDialogTrigger asChild>
              <button
                title='Remove WhatsApp instance'
                className='cursor-pointer px-2 py-1 text-red-500 hover:text-red-700'
                aria-label='Remove WhatsApp instance'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-4 w-4'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </AlertDialogTrigger>
          </TooltipTrigger>
          <TooltipContent side='top' align='center'>
            Remove WhatsApp instance
          </TooltipContent>
        </Tooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to remove this WhatsApp instance?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <div className='mb-2 text-sm text-red-500'>{error}</div>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <button
              className='flex cursor-pointer items-center gap-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:ring-red-600 disabled:cursor-not-allowed disabled:opacity-50'
              disabled={loading}
              onClick={handleRemove}
              type='button'
            >
              {loading ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Removing instance...
                </>
              ) : (
                'Remove'
              )}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
