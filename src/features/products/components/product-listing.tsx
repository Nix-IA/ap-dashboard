'use client';

import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState } from 'react';
import { ProductTable } from './product-tables';
import { columns } from './product-tables/columns';

const PAGE_SIZE = 10;

export default function ProductListingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchProducts = useCallback(
    async (page: number, search: string, status: string) => {
      setLoading(true);
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        setProducts([]);
        setTotalProducts(0);
        setLoading(false);
        return;
      }
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('seller_id', session.user.id);
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      const { data, error, count } = await query;
      if (error) {
        setProducts([]);
        setTotalProducts(0);
      } else {
        setProducts(data || []);
        setTotalProducts(count || 0);
      }
      setLoading(false);
    },
    []
  );

  // useEffect to fetch products only when search, page, or status changes
  useEffect(() => {
    fetchProducts(page, search, status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status]);

  if (loading) return <div>Loading products...</div>;

  return (
    <div>
      <div className='mb-4 flex flex-col items-center gap-2 md:flex-row'>
        <input
          type='text'
          placeholder='Search products...'
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setPage(1);
              setSearch(searchInput);
            }
          }}
          className='w-full rounded border px-3 py-2 md:w-64'
        />
        {search && (
          <button
            onClick={() => {
              setSearch('');
              setSearchInput('');
              setPage(1);
            }}
            className='ml-2 rounded bg-gray-200 px-2 py-1 text-gray-700 transition hover:bg-gray-300 dark:bg-zinc-700 dark:text-gray-200 dark:hover:bg-zinc-600'
            title='Clear search filter'
          >
            ×
          </button>
        )}
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as 'all' | 'active' | 'inactive');
          }}
          className='rounded border px-3 py-2'
        >
          <option value='all'>All Status</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </select>
      </div>
      <ProductTable
        data={products}
        totalItems={totalProducts}
        columns={columns}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
      <div className='mt-4 flex justify-center gap-2'>
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className='rounded border px-3 py-1 disabled:opacity-50'
        >
          Previous
        </button>
        <span>
          Page {page} of {Math.max(1, Math.ceil(totalProducts / PAGE_SIZE))}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page * PAGE_SIZE >= totalProducts}
          className='rounded border px-3 py-1 disabled:opacity-50'
        >
          Next
        </button>
      </div>
    </div>
  );
}
