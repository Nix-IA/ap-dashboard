'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { WhatsappTable } from './whatsapp-tables';
import { columns, filterWhatsappRows } from './whatsapp-tables/columns';

const PAGE_SIZE = 10;

export default function WhatsappInstancesPage() {
  const [instances, setInstances] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchInstances = useCallback(async (page: number) => {
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
      .order('created_at', { ascending: false });
    query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    const { data, error, count } = await query;
    if (error) {
      setInstances([]);
      setTotal(0);
    } else {
      setInstances(data || []);
      setTotal(count || 0);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchInstances(page);
  }, [page, fetchInstances]);

  // Always filter out removed instances and update total accordingly
  const filteredInstances = filterWhatsappRows(instances);
  const filteredTotal = filteredInstances.length;

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
      <WhatsappTable
        data={filteredInstances}
        totalItems={filteredTotal}
        columns={columns}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
      {Math.ceil(filteredTotal / PAGE_SIZE) > 1 && (
        <div className='mt-4 flex justify-center gap-2'>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className='rounded border px-3 py-1 disabled:opacity-50'
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE))}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page * PAGE_SIZE >= filteredTotal}
            className='rounded border px-3 py-1 disabled:opacity-50'
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
