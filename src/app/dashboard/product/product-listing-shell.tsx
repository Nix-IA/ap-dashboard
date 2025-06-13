'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductOnboardingDialog } from '@/features/products/components/product-onboarding-dialog';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import ProductListingPage from '@/features/products/components/product-listing';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { Suspense } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

export default function ProductListingShell() {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const router = useRouter();

  // Handler to start onboarding
  const handleStartOnboarding = () => {
    setOnboardingOpen(true);
  };
  // Handler when extraction is done
  const handleExtracted = (data: any) => {
    setOnboardingOpen(false);
    setOnboardingData(data);
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
    <div className='flex flex-1 flex-col space-y-4'>
      <div className='flex items-start justify-between'>
        <Heading
          title='Products'
          description='Manage products (Server side table functionalities.)'
        />
        <button
          className={cn(
            buttonVariants(),
            'flex items-center text-xs md:text-sm'
          )}
          onClick={handleStartOnboarding}
          type='button'
        >
          <IconPlus className='mr-2 h-4 w-4' /> Add New
        </button>
      </div>
      <Separator />
      <Suspense
        fallback={
          <DataTableSkeleton columnCount={5} rowCount={8} filterCount={2} />
        }
      >
        <ProductListingPage />
      </Suspense>
      <ProductOnboardingDialog
        open={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onExtracted={handleExtracted}
        onSkip={handleSkip}
      />
    </div>
  );
}
