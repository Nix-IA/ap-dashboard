'use client';
import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import { ProductExtractionStatus } from '@/features/products/components/product-extraction-status';
import ProductListingPage from '@/features/products/components/product-listing';
import { ProductOnboardingDialog } from '@/features/products/components/product-onboarding-dialog';
import { cn } from '@/lib/utils';
import { IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

export default function ProductListingShell() {
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);
  const [extractionPending, setExtractionPending] = useState(false);
  const [showExtractionPendingModal, setShowExtractionPendingModal] =
    useState(false);
  const [showExtractionDoneModal, setShowExtractionDoneModal] = useState(false);
  const router = useRouter();

  // Handler to start onboarding
  const handleStartOnboarding = () => {
    const extraction = localStorage.getItem('agentpay_product_extraction');
    if (extraction) {
      try {
        const parsed = JSON.parse(extraction);
        if (parsed.status === 'pending') {
          setShowExtractionPendingModal(true);
          return;
        } else if (parsed.status === 'done') {
          setShowExtractionDoneModal(true);
          return;
        }
      } catch {}
    }
    setOnboardingOpen(true);
  };
  // Handler when extraction is done
  const handleExtracted = (data: any) => {
    setOnboardingOpen(false);
    setOnboardingData(data);
    // Salva onboarding data, mas NÃO redireciona automaticamente
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentpay_product_onboarding', JSON.stringify(data));
    }
    // NÃO faz router.push aqui!
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
  // Handler to show extracted result
  const handleShowExtracted = (data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentpay_product_onboarding', JSON.stringify(data));
      localStorage.removeItem('agentpay_product_extraction');
    }
    router.push('/dashboard/product/new?onboarding=1');
  };

  // Handler para limpar status
  const handleClearExtraction = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentpay_product_extraction');
    }
  };

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* Barra de status de extração no topo */}
      {extractionPending && (
        <div className='animate-fade-in fixed top-0 left-0 z-[1200] flex w-full items-center justify-center border-b-2 border-yellow-400 bg-yellow-50 py-2 shadow'>
          <span className='flex w-full flex-col items-center gap-2 text-center font-medium text-yellow-900'>
            <span className='flex w-full items-center justify-center'>
              <svg
                className='mr-2 h-5 w-5 animate-spin text-yellow-500'
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
              <span>
                Extracting product data...
                <br />
                Please wait while we process the sales page information.
                <br />
                You can continue using the system normally.
              </span>
            </span>
          </span>
        </div>
      )}
      <ProductExtractionStatus
        onShowResult={handleShowExtracted}
        onClear={handleClearExtraction}
      />
      <div className='flex items-start justify-between'>
        <Heading
          title='Products'
          description='View, manage, and organize your product catalog.'
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
      {/* Modal: extração pendente */}
      <Dialog
        open={showExtractionPendingModal}
        onOpenChange={setShowExtractionPendingModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ongoing registration</DialogTitle>
            <DialogDescription>
              There is already a product registration process in progress.
              Please wait for the extraction to finish before starting a new
              product.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className={buttonVariants()}
              onClick={() => setShowExtractionPendingModal(false)}
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Extraction finished but not processed */}
      <Dialog
        open={showExtractionDoneModal}
        onOpenChange={setShowExtractionDoneModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Previous process not completed</DialogTitle>
            <DialogDescription>
              There is a finished product extraction that has not been processed
              yet. What would you like to do?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className={buttonVariants({ variant: 'outline' })}
              onClick={() => {
                // Ignore previous extraction and start new onboarding
                localStorage.removeItem('agentpay_product_extraction');
                localStorage.removeItem('agentpay_product_onboarding');
                setShowExtractionDoneModal(false);
                setOnboardingOpen(true);
              }}
            >
              Start new registration
            </button>
            <button
              className={buttonVariants()}
              onClick={() => {
                // Continue previous process
                const extraction = localStorage.getItem(
                  'agentpay_product_extraction'
                );
                if (extraction) {
                  try {
                    const parsed = JSON.parse(extraction);
                    if (parsed.result) {
                      localStorage.setItem(
                        'agentpay_product_onboarding',
                        JSON.stringify(parsed.result)
                      );
                      localStorage.removeItem('agentpay_product_extraction');
                      setShowExtractionDoneModal(false);
                      router.push('/dashboard/product/new?onboarding=1');
                      return;
                    }
                  } catch {}
                }
                setShowExtractionDoneModal(false);
              }}
            >
              Continue previous registration
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
