'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ProductOnboardingDialog } from './product-onboarding-dialog';
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
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const router = useRouter();

  const fetchProducts = useCallback(
    async (
      page: number,
      search: string,
      status: string,
      sortBy?: string,
      sortOrder?: 'asc' | 'desc'
    ) => {
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
        .eq('seller_id', session.user.id)
        .neq('status', 'removed'); // Filter out removed products at database level
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      if (status !== 'all') {
        query = query.eq('status', status);
      }
      if (sortBy && sortOrder) {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }
      query = query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      const { data, error, count } = await query;

      if (error) {
        console.error('Query error:', error);
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

  // useEffect to fetch products only when search, page, status, or sorting changes
  useEffect(() => {
    fetchProducts(page, search, status, sortBy, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, status, sortBy, sortOrder]);

  // Handle sorting changes
  const handleSortChange = (columnId: string, order: 'asc' | 'desc') => {
    setPage(1); // Reset to first page when sorting
    setSortBy(columnId);
    setSortOrder(order);
  };

  // Handle clearing sort
  const handleClearSort = () => {
    setPage(1);
    setSortBy('name'); // Default back to name sorting
    setSortOrder('asc');
  };

  // No need to filter products on client side since we filter at database level
  const filteredProducts = products;
  const filteredTotal = totalProducts;

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
          Please wait, loading products...
        </div>
        <div className='text-muted-foreground text-sm'>
          This may take a few seconds.
        </div>
      </div>
    );

  // Handler to start onboarding
  const handleStartOnboarding = () => {
    setOnboardingOpen(true);
  };

  // Handler when extraction is done
  const handleExtracted = (data: any) => {
    setOnboardingOpen(false);
    setOnboardingData(data);
    // Save onboarding data to localStorage for the form to pick up
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentpay_product_onboarding', JSON.stringify(data));
    }
    router.push('/dashboard/product/new?onboarding=1');
  };

  // Handler to skip onboarding
  const handleSkip = () => {
    setOnboardingOpen(false);
    setOnboardingData(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentpay_product_onboarding');
    }
    router.push('/dashboard/product/new');
  };

  return (
    <div>
      <div className='mb-4 flex flex-col items-center gap-2 md:flex-row'>
        {/* Remove the Register Product button here, keep only search, status, etc. */}
        <div className='relative w-full md:w-64'>
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
            setStatus(e.target.value as 'all' | 'active' | 'inactive');
          }}
          className='cursor-pointer rounded border px-3 py-2'
        >
          <option value='all'>All</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </select>
      </div>

      <ProductTable
        data={filteredProducts}
        totalItems={totalProducts}
        columns={columns}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        onClearSort={handleClearSort}
      />
      {Math.ceil(totalProducts / PAGE_SIZE) > 1 && (
        <div className='mt-4 flex justify-center gap-2'>
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className='cursor-pointer rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
          >
            Previous
          </button>
          <span>
            Page {page} of {Math.max(1, Math.ceil(totalProducts / PAGE_SIZE))}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page * PAGE_SIZE >= totalProducts}
            className='cursor-pointer rounded border px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50'
          >
            Next
          </button>
        </div>
      )}
      <ProductOnboardingDialog
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onExtracted={handleExtracted}
        onSkip={handleSkip}
      />
    </div>
  );
}
