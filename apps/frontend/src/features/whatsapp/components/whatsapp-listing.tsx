'use client';

import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';
import { WhatsappTable } from './whatsapp-tables';
import { columns, filterWhatsappRows } from './whatsapp-tables/columns';

const PAGE_SIZE = 10;

export default function WhatsappInstancesPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<
    'all' | 'open' | 'connecting' | 'refused' | 'closed'
  >('all');
  const [sortBy, setSortBy] = useState<string>('display_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const fetchInstances = useCallback(
    async (
      page: number,
      search?: string,
      status?: string,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc'
    ) => {
      setLoading(true);
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setInstances([]);
        setTotal(0);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('whatsapp_numbers')
        .select('*', { count: 'exact' })
        .eq('seller_id', session.user.id)
        .neq('status', 'removed'); // Filter out removed instances at database level

      if (search) {
        query = query.or(
          `display_name.ilike.%${search}%,phone.ilike.%${search}%`
        );
      }
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      if (sortBy && sortOrder) {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }

      query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      const { data, error, count } = await query;

      if (error) {
        console.error('Query error:', error);
        setInstances([]);
        setTotal(0);
      } else {
        setInstances(data || []);
        setTotal(count || 0);
      }
      setLoading(false);
    },
    []
  );

  useEffect(() => {
    fetchInstances(page, search, status, sortBy, sortOrder);
  }, [page, search, status, sortBy, sortOrder, fetchInstances]);

  // Handle sorting changes
  const handleSortChange = (columnId: string, order: 'asc' | 'desc') => {
    setPage(1); // Reset to first page when sorting
    setSortBy(columnId);
    setSortOrder(order);
  };

  // Handle clearing sort
  const handleClearSort = () => {
    setPage(1);
    setSortBy('display_name'); // Default back to display_name sorting
    setSortOrder('asc');
  };

  // Always filter out removed instances and update total accordingly
  const filteredInstances = filterWhatsappRows(instances);
  // For server-side filtered data, we don't need to recalculate total
  const filteredTotal = total;

  if (loading)
    return (
      <div className='flex min-h-[220px] flex-col items-center justify-center gap-4 p-12'>
        <span className='text-primary animate-spin'>
          <svg
            className='h-8 w-8'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8v8z'
            />
          </svg>
        </span>
        <div className='text-primary text-lg font-medium'>
          Please wait, loading WhatsApp instances...
        </div>
        <div className='text-muted-foreground text-sm'>
          This may take a few seconds.
        </div>
      </div>
    );

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className='mb-4 flex flex-col items-center gap-2 md:flex-row'>
        <div className='relative w-full md:w-64'>
          <input
            type='text'
            placeholder='Search instances by name or phone...'
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setPage(1);
                setSearch(searchInput);
              }
            }}
            className='w-full rounded border px-3 py-2 pr-8'
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setSearchInput('');
                setPage(1);
              }}
              className='absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer rounded px-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              title='Clear search filter'
            >
              ×
            </button>
          )}
        </div>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(
              e.target.value as
                | 'all'
                | 'open'
                | 'connecting'
                | 'refused'
                | 'closed'
            );
          }}
          className='cursor-pointer rounded border px-3 py-2'
        >
          <option value='all'>All Statuses</option>
          <option value='open'>Open</option>
          <option value='connecting'>Connecting</option>
          <option value='refused'>Refused</option>
          <option value='closed'>Closed</option>
        </select>
      </div>

      <WhatsappTable
        data={filteredInstances}
        totalItems={filteredTotal}
        columns={columns}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onClearSort={handleClearSort}
      />
      {Math.ceil(filteredTotal / PAGE_SIZE) > 1 && (
        <div className='mt-4 flex justify-center gap-2'>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className='cursor-pointer rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE))}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page * PAGE_SIZE >= filteredTotal}
            className='cursor-pointer rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
