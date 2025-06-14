import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Loader2 } from 'lucide-react';
import React from 'react';
import { getCountryFlagAndFormatPhone } from './phone-utils';
import { supabase } from '@/lib/supabase';

export const columns: ColumnDef<any>[] = [
  {
    id: 'display_name',
    accessorKey: 'display_name',
    header: 'Display Name',
    cell: DisplayNameCell
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    cell: ({ cell }) => {
      const value = String(cell.getValue() ?? '').toLowerCase();
      let icon = null;
      let color = '';
      if (value === 'active') {
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
      } else if (value === 'inactive') {
        icon = (
          <svg
            width='18'
            height='18'
            fill='none'
            viewBox='0 0 24 24'
            className='mr-1 inline-block align-middle text-gray-400'
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
        color = 'text-gray-400';
      } else if (value === 'pending') {
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
    header: 'Phone',
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
    header: 'Created At',
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
    header: 'Updated At',
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
    try {
      const apiUrl = process.env.NEXT_PUBLIC_WHATSAPP_API_URL;
      const apiKey = process.env.NEXT_PUBLIC_WHATSAPP_API_KEY;
      const instanceName =
        row.original.instance_name || row.original.name || row.original.id;
      const res = await fetch(`${apiUrl}instance/delete/${instanceName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          auth: 'apikey',
          apikey: apiKey || ''
        }
      });
      if (!res.ok) {
        setError('Failed to remove instance.');
        setLoading(false);
        return;
      }
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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
                className='px-2 py-1 text-red-500 hover:text-red-700'
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
              className='flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:ring-red-600 disabled:opacity-50'
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

// Inline editable display name cell with modal
function DisplayNameCell({ cell, row }: any) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState(cell.getValue() ?? '');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleEdit = () => {
    setValue(cell.getValue() ?? '');
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
      .update({ display_name: value })
      .eq('instance_name', instanceName);
    setLoading(false);
    if (error) {
      setError(error.message || 'Failed to update display name.');
    } else {
      setOpen(false);
      window.location.reload();
    }
  };

  return (
    <>
      <div className='group relative flex w-full max-w-full min-w-[220px] items-center justify-between pr-8'>
        <span className='truncate' style={{ maxWidth: 'calc(100% - 32px)' }}>
          {String(cell.getValue() ?? '')}
        </span>
        <div
          className='bg-background absolute right-0 flex items-center gap-1 pr-1'
          style={{ zIndex: 1 }}
        >
          <button
            className='px-2 py-1 opacity-70 transition-opacity group-hover:opacity-100'
            onClick={handleEdit}
            title='Edit display name'
            tabIndex={0}
          >
            <Pencil className='text-muted-foreground h-4 w-4' />
          </button>
        </div>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Display Name</DialogTitle>
          </DialogHeader>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={loading}
            autoFocus
          />
          {error && <div className='mt-2 text-xs text-red-500'>{error}</div>}
          <DialogFooter>
            <button
              className='bg-primary hover:bg-primary/90 rounded px-4 py-2 text-white disabled:opacity-50'
              onClick={handleSave}
              disabled={loading || !value.trim()}
              type='button'
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button
              className='rounded bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 disabled:opacity-50'
              onClick={() => setOpen(false)}
              disabled={loading}
              type='button'
            >
              Cancel
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
