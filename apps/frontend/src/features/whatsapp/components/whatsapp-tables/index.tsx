import { ColumnDef } from '@tanstack/react-table';

interface WhatsappTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (columnId: string, order: 'asc' | 'desc') => void;
  onClearSort?: () => void;
}

export function WhatsappTable<TData extends { id?: string | number }, TValue>({
  data,
  totalItems,
  columns,
  page = 1,
  pageSize = 10,
  onPageChange,
  sortBy = '',
  sortOrder = 'asc',
  onSortChange,
  onClearSort
}: WhatsappTableParams<TData, TValue>) {
  return (
    <div className='w-full overflow-x-auto rounded-lg border'>
      <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700 dark:bg-zinc-900'>
        <thead className='bg-gray-50 dark:bg-zinc-800'>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.id ?? idx}
                className='px-4 py-2 text-left text-xs font-medium tracking-wider text-gray-500 uppercase dark:text-gray-200'
              >
                {typeof col.header === 'function'
                  ? col.header({
                      column: {
                        id: col.id ?? '',
                        getCanSort: () => true,
                        getCanHide: () => false,
                        getIsSorted: () => {
                          if (sortBy === col.id) {
                            return sortOrder === 'asc' ? 'asc' : 'desc';
                          }
                          return false;
                        },
                        toggleSorting: (desc?: boolean) => {
                          if (onSortChange && col.id) {
                            const newOrder =
                              desc === true
                                ? 'desc'
                                : desc === false
                                  ? 'asc'
                                  : sortBy === col.id && sortOrder === 'asc'
                                    ? 'desc'
                                    : 'asc';
                            onSortChange(col.id, newOrder);
                          }
                        },
                        clearSorting: () => {
                          if (onClearSort) {
                            onClearSort();
                          }
                        }
                      }
                    } as any)
                  : (col.header ?? '')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-zinc-900'>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className='py-8 text-center text-gray-400'
              >
                No Whatsapp numbers found.
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id ?? i}
                className='hover:bg-gray-50 dark:hover:bg-zinc-800'
              >
                {columns.map((col, j) => {
                  // Use accessorKey if present, otherwise fallback to id
                  const key: string = (col as any).accessorKey || col.id || '';
                  return (
                    <td
                      key={col.id ?? j}
                      className='px-4 py-2 text-left whitespace-nowrap'
                    >
                      {typeof col.cell === 'function'
                        ? col.cell({
                            cell: { getValue: () => (row as any)[key] },
                            row: { original: row }
                          } as any)
                        : (row as any)[key]}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className='flex items-center justify-between border-t bg-gray-50 p-2 text-sm text-gray-500 dark:bg-zinc-800'>
        <span>
          Showing {data.length} of {totalItems} Whatsapp number(s)
        </span>
      </div>
    </div>
  );
}
