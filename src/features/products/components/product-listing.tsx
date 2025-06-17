'use client';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ProductOnboardingDialog } from './product-onboarding-dialog';
import { ProductTable } from './product-tables';
import { columns, filterProductRows } from './product-tables/columns';

const PAGE_SIZE = 10;

export default function ProductListingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const router = useRouter();

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

  // Always filter out removed products and update total accordingly
  const filteredProducts = filterProductRows(products);
  const filteredTotal = filteredProducts.length;

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
          <option value='all'>All</option>
          <option value='active'>Active</option>
          <option value='inactive'>Inactive</option>
        </select>
      </div>

      <ProductTable
        data={filteredProducts}
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
      <ProductOnboardingDialog
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onExtracted={handleExtracted}
        onSkip={handleSkip}
      />
    </div>
  );
}
