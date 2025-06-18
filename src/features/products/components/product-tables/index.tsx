'use client';

import { ColumnDef } from '@tanstack/react-table';
interface ProductTableParams<TData, TValue> {
  data: TData[];
  totalItems: number;
  columns: ColumnDef<TData, TValue>[];
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}
export function ProductTable<TData extends { id?: string | number }, TValue>({
  data,
  totalItems,
  columns,
  page = 1,
  pageSize = 10,
  onPageChange
}: ProductTableParams<TData, TValue>) {
  // Debug logging for table rendering
  console.log('ProductTable rendering:', {
    dataLength: data.length,
    totalItems,
    page,
    pageSize,
    dataIds: data.map((item) => (item as any).id || 'no-id').slice(0, 5) // First 5 IDs
  });

  // Helper to get value from row for a column
  const getValue = (row: TData, col: ColumnDef<TData, TValue>) => {
    // @ts-ignore
    if (col.accessorKey) return row[col.accessorKey];
    if (col.id && row[col.id as keyof TData] !== undefined)
      return row[col.id as keyof TData];
    return '';
  };

  // Helper for status icon
  const renderStatus = (status: string) => {
    if (status === 'active') {
      return (
        <span className='group flex items-center justify-center'>
          <svg
            width='28'
            height='28'
            fill='none'
            viewBox='0 0 24 24'
            className='text-green-600 dark:text-green-400'
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
          <span className='absolute z-10 mt-10 hidden rounded bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg transition-all group-hover:flex'>
            Active
          </span>
        </span>
      );
    } else if (status === 'inactive') {
      return (
        <span className='group flex items-center justify-center'>
          <svg
            width='28'
            height='28'
            fill='none'
            viewBox='0 0 24 24'
            className='text-gray-400 dark:text-gray-500'
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
          <span className='absolute z-10 mt-10 hidden rounded bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg transition-all group-hover:flex'>
            Inactive
          </span>
        </span>
      );
    }
    return (
      <span className='text-muted-foreground flex items-center justify-center'>
        ?
      </span>
    );
  };

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
                        getCanSort: () => false,
                        getCanHide: () => false
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
                No products found.
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={row.id ?? i}
                className='cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800'
                onClick={(e) => {
                  // Evita que clique em links (landing page) dispare o detalhe do produto
                  if ((e.target as HTMLElement).closest('a')) return;
                  if (row.id) {
                    window.location.href = `/dashboard/product/${row.id}`;
                  }
                }}
              >
                {columns.map((col, j) => {
                  // STATUS COLUMN
                  if (col.id === 'status') {
                    return (
                      <td
                        key={col.id ?? j}
                        className='px-4 py-2 text-center whitespace-nowrap'
                      >
                        {renderStatus(getValue(row, col))}
                      </td>
                    );
                  }
                  // PRICE COLUMN (no $) - align left, show tooltip with price string
                  if (col.id === 'price') {
                    const priceValue = getValue(row, col);
                    return (
                      <td
                        key={col.id ?? j}
                        className='px-4 py-2 text-left whitespace-nowrap'
                      >
                        <span className='group relative cursor-pointer'>
                          {priceValue}
                          <span className='absolute left-1/2 z-10 mt-2 hidden -translate-x-1/2 rounded bg-zinc-900 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg transition-all group-hover:flex'>
                            {String(priceValue)}
                          </span>
                        </span>
                      </td>
                    );
                  }
                  // NAME COLUMN - align left
                  if (col.id === 'name') {
                    return (
                      <td
                        key={col.id ?? j}
                        className='px-4 py-2 text-left whitespace-nowrap'
                      >
                        {getValue(row, col)}
                      </td>
                    );
                  }
                  // LANDING PAGE COLUMN (show modern external link icon with tooltip)
                  if (
                    col.id === 'landing_page' ||
                    col.id === 'landing_page_url'
                  ) {
                    const url =
                      (row as any)?.landing_page_url ||
                      (row as any)?.landing_page ||
                      getValue(row, col);
                    return (
                      <td
                        key={col.id ?? j}
                        className='px-4 py-2 text-center whitespace-nowrap'
                      >
                        {url ? (
                          <a
                            href={url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='group inline-flex items-center justify-center text-blue-600 transition hover:text-blue-800'
                            title={url}
                          >
                            <svg
                              xmlns='http://www.w3.org/2000/svg'
                              width='22'
                              height='22'
                              fill='none'
                              viewBox='0 0 24 24'
                              className='mx-auto'
                            >
                              <path
                                d='M14 3h7v7'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                              <path
                                d='M5 19l14-14'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                              <path
                                d='M5 5v14h14'
                                stroke='currentColor'
                                strokeWidth='2'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                              />
                            </svg>
                            <span className='sr-only'>Open link</span>
                          </a>
                        ) : (
                          <span className='text-muted-foreground'>-</span>
                        )}
                      </td>
                    );
                  }
                  // PLATFORM COLUMN (show icon + tooltip)
                  if (col.id === 'platform') {
                    const platform = getValue(row, col);
                    if (platform === 'hotmart') {
                      return (
                        <td
                          key={col.id ?? j}
                          className='px-4 py-2 text-center whitespace-nowrap'
                        >
                          <span className='group relative flex items-center justify-center'>
                            <img
                              src='/assets/icons/hotmart.svg'
                              alt='Hotmart'
                              width={28}
                              height={28}
                              className='inline-block'
                            />
                            <span className='absolute z-10 mt-10 hidden rounded bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg transition-all group-hover:flex'>
                              Hotmart
                            </span>
                          </span>
                        </td>
                      );
                    }
                    if (platform === 'kiwify') {
                      return (
                        <td
                          key={col.id ?? j}
                          className='px-4 py-2 text-center whitespace-nowrap'
                        >
                          <span className='group relative flex items-center justify-center'>
                            <img
                              src='/assets/icons/kiwify.svg'
                              alt='Kiwify'
                              width={28}
                              height={28}
                              className='inline-block'
                            />
                            <span className='absolute z-10 mt-10 hidden rounded bg-zinc-900 px-2 py-1 text-xs text-white shadow-lg transition-all group-hover:flex'>
                              Kiwify
                            </span>
                          </span>
                        </td>
                      );
                    }
                    return (
                      <td
                        key={col.id ?? j}
                        className='px-4 py-2 text-center whitespace-nowrap'
                      >
                        <span className='text-muted-foreground'>
                          {platform}
                        </span>
                      </td>
                    );
                  }
                  // CREATED_AT and UPDATED_AT columns: format as YYYY-MM-DD HH:MM, align left
                  if (col.id === 'created_at' || col.id === 'updated_at') {
                    const raw = getValue(row, col);
                    let formatted = '';
                    if (raw) {
                      const date = new Date(raw);
                      if (!isNaN(date.getTime())) {
                        const yyyy = date.getFullYear();
                        const mm = String(date.getMonth() + 1).padStart(2, '0');
                        const dd = String(date.getDate()).padStart(2, '0');
                        const hh = String(date.getHours()).padStart(2, '0');
                        const min = String(date.getMinutes()).padStart(2, '0');
                        formatted = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
                      }
                    }
                    return (
                      <td
                        key={col.id ?? j}
                        className='px-4 py-2 text-left whitespace-nowrap'
                      >
                        {formatted || (
                          <span className='text-muted-foreground'>-</span>
                        )}
                      </td>
                    );
                  }
                  // Render custom cell for 'actions' as a fallback, else just value
                  return (
                    <td
                      key={col.id ?? j}
                      className='px-4 py-2 text-center whitespace-nowrap'
                    >
                      {col.id === 'actions' && typeof col.cell === 'function'
                        ? col.cell({ row: { original: row } } as any)
                        : typeof col.cell === 'function'
                          ? col.cell({
                              cell: { getValue: () => getValue(row, col) }
                            } as any)
                          : getValue(row, col)}
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
          Showing {data.length} of {totalItems} product(s)
        </span>
      </div>
    </div>
  );
}
