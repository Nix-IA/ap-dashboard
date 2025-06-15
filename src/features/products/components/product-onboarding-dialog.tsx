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
        onExtracted(data);
      }
    } catch (e: any) {
      if (e.name === 'AbortError') return;
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Handler para fechar o modal (cancelar extração)
  const handleRequestClose = (open: boolean) => {
    if (!open && loading) {
      setConfirmCancel(true);
    } else if (!open) {
      onClose();
    }
  };

  // Handler para confirmar o cancelamento
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
        <DialogHeader>
          <DialogTitle>Enter your product sales page URL</DialogTitle>
          <DialogDescription>
            Providing the sales page URL allows Agent Pay to automatically read
            and fill in the main product information for you. This saves time
            and ensures accuracy.
          </DialogDescription>
        </DialogHeader>
        {confirmCancel ? (
          <>
            <div className='mb-4 text-sm'>
              Are you sure you want to cancel the automatic extraction of data
              from the sales page and fill in the product manually?
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
        ) : !confirmSkip ? (
          <>
            <Input
              placeholder='https://your-landing-page.com'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            {error && <div className='text-destructive text-sm'>{error}</div>}
            <DialogFooter>
              <Button onClick={() => setConfirmCancel(true)} variant='outline'>
                Cancel
              </Button>
              <Button onClick={() => setConfirmSkip(true)} variant='ghost'>
                Skip and fill manually
              </Button>
              <Button onClick={handleExtract} disabled={!url || loading}>
                {loading ? 'Extracting...' : 'Confirm URL'}
              </Button>
            </DialogFooter>
          </>
        ) : (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
