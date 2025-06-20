'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRef, useState } from 'react';

interface ProductOnboardingDialogProps {
  open: boolean;
  onClose: () => void;
  onExtracted: (data: any) => void;
  onSkip: () => void;
}

export function ProductOnboardingDialog({
  open,
  onClose,
  onExtracted,
  onSkip
}: ProductOnboardingDialogProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleExtract = async () => {
    setLoading(true);
    setError('');
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    // Salva status de extração em andamento
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'agentpay_product_extraction',
        JSON.stringify({ status: 'pending' })
      );
    }
    // Show loading in modal for 3s, then close
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 3000);
    try {
      const res = await fetch(
        'https://webhook.agentpay.com.br/webhook/onboarding/extract-data-from-pages',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: {
              links: [{ page_type: 'LANDING_PAGE', link: url }]
            }
          }),
          signal: abortController.signal
        }
      );
      if (!res.ok) throw new Error('Failed to extract product data.');
      const data = await res.json();
      if (!abortController.signal.aborted) {
        // Salva resultado no localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'agentpay_product_extraction',
            JSON.stringify({ status: 'done', result: data })
          );
        }
        onExtracted(data);
      }
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      setError(e.message || 'Unknown error');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('agentpay_product_extraction');
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  // Handler to close modal (cancel extraction)
  const handleRequestClose = (open: boolean) => {
    if (!open && loading) {
      setConfirmCancel(true);
    } else if (!open) {
      onClose();
    }
  };

  // Handler to confirm cancellation
  const confirmCancelExtraction = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setConfirmCancel(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleRequestClose} modal>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        {/* Exibe apenas loading/spinner durante loading */}
        {loading ? (
          <div className='flex flex-col items-center gap-2 py-12'>
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
            <div className='text-primary mt-4 text-base font-medium'>
              Extracting product data...
            </div>
            <div className='text-muted-foreground mt-2 max-w-xs text-center text-xs'>
              This may take up to 1 minute. You will be notified when it is
              finished.
            </div>
          </div>
        ) : confirmCancel ? (
          <>
            <div className='mb-4 text-sm'>
              Are you sure you want to cancel the automatic extraction and fill
              in the product manually?
            </div>
            <DialogFooter>
              <Button
                onClick={() => setConfirmCancel(false)}
                variant='outline'
                autoFocus
              >
                No, go back
              </Button>
              <Button onClick={confirmCancelExtraction} variant='destructive'>
                Yes, cancel extraction
              </Button>
            </DialogFooter>
          </>
        ) : confirmSkip ? (
          <>
            <div className='mb-4 text-sm'>
              Are you sure you want to skip entering the sales page URL? You
              will need to fill in all product information manually.
            </div>
            <DialogFooter>
              <Button onClick={() => setConfirmSkip(false)} variant='outline'>
                Back
              </Button>
              <Button onClick={onSkip} variant='default'>
                Yes, continue without URL
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Enter the product sales page URL</DialogTitle>
              <DialogDescription>
                By providing the URL, Agent Pay will automatically extract the
                main product information for you. This may take a few minutes.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder='https://your-page.com'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            {error && <div className='text-destructive text-sm'>{error}</div>}
            <DialogFooter>
              <Button
                onClick={() => setConfirmCancel(true)}
                variant='outline'
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setConfirmSkip(true)}
                variant='ghost'
                disabled={loading}
              >
                Skip and fill manually
              </Button>
              <Button onClick={handleExtract} disabled={!url || loading}>
                {loading ? 'Extracting...' : 'Confirm URL'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
