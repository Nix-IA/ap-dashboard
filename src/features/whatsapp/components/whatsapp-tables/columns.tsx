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
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Loader2 } from 'lucide-react';
import React from 'react';
import { getCountryFlagAndFormatPhone } from './phone-utils';

export const columns: ColumnDef<any>[] = [
  {
    id: 'display_name',
    accessorKey: 'display_name',
    header: 'Display Name',
    cell: ({ cell, row }) => {
      const [editing, setEditing] = React.useState(false);
      const [value, setValue] = React.useState(cell.getValue() ?? '');
      const [loading, setLoading] = React.useState(false);
      const [error, setError] = React.useState('');
      const [debug, setDebug] = React.useState<any>(null);
      const inputRef = React.useRef<HTMLInputElement>(null);
      React.useEffect(() => {
        if (editing && inputRef.current) inputRef.current.focus();
      }, [editing]);
      const handleSave = async () => {
        setLoading(true);
        setError('');
        setDebug(null);
        try {
          const { supabase } = await import('@/lib/supabase');
          console.log('Updating whatsapp_numbers', {
            id: row.original.id,
            value
          });
          const { data, error } = await supabase
            .from('whatsapp_numbers')
            .update({ display_name: value })
            .eq('id', row.original.id);
          setDebug({ data, error, id: row.original.id, value });
          if (error) setError(error.message);
          else {
            // Atualiza o valor localmente para refletir imediatamente na tabela
            if (row.original) row.original.display_name = value;
            setEditing(false);
          }
        } catch (e: any) {
          setError('Failed to update');
          setDebug({ exception: e?.message || e });
          console.error('Update exception', e);
        }
        setLoading(false);
      };
      if (editing) {
        return (
          <div className='flex w-full min-w-[180px] flex-col gap-1'>
            <div className='flex w-full items-center justify-between gap-2'>
              <input
                ref={inputRef}
                className='w-full rounded border px-2 py-1 text-sm'
                value={value as string}
                onChange={(e) => setValue(e.target.value)}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') setEditing(false);
                }}
              />
              <div className='ml-2 flex gap-1'>
                <button
                  className='text-primary text-xs hover:underline disabled:opacity-50'
                  onClick={handleSave}
                  disabled={loading}
                  title='Save'
                >
                  Save
                </button>
                <button
                  className='text-muted-foreground text-xs hover:underline'
                  onClick={() => setEditing(false)}
                  disabled={loading}
                  title='Cancel'
                >
                  Cancel
                </button>
              </div>
            </div>
            {error && (
              <span className='ml-2 text-xs text-red-500'>{error}</span>
            )}
            {debug && (
              <pre className='text-muted-foreground mt-1 max-h-32 max-w-xs overflow-x-auto rounded bg-zinc-900 p-2 text-xs whitespace-pre-wrap'>
                {JSON.stringify(debug, null, 2)}
              </pre>
            )}
          </div>
        );
      }
      return (
        <div className='group relative flex w-full min-w-[180px] items-center justify-between'>
          <span className='max-w-[120px] truncate'>
            {String(cell.getValue() ?? '')}
          </span>
          <div
            className='bg-background absolute right-0 flex items-center gap-1 pr-1'
            style={{ zIndex: 1 }}
          >
            <button
              className='px-2 py-1 opacity-70 transition-opacity group-hover:opacity-100'
              onClick={() => setEditing(true)}
              title='Edit display name'
            >
              <Pencil className='text-muted-foreground h-4 w-4' />
            </button>
          </div>
        </div>
      );
    }
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
    cell: ({ row }) => {
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
          // Wait 1s before reloading
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
              {error && (
                <div className='mb-2 text-sm text-red-500'>{error}</div>
              )}
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
    },
    enableColumnFilter: false
  }
];

// Filter out rows with status 'removed' before passing to the table
export const filterWhatsappRows = (rows: any[]) =>
  rows.filter((row) => String(row.status).toLowerCase() !== 'removed');
