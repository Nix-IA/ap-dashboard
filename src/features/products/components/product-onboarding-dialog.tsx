'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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

  const handleExtract = async () => {
    setLoading(true);
    setError('');
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
          })
        }
      );
      if (!res.ok) throw new Error('Failed to extract product data.');
      const data = await res.json();
      onExtracted(data);
    } catch (e: any) {
      setError(e.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter your product sales page URL</DialogTitle>
          <DialogDescription>
            Providing the sales page URL allows Agent Pay to automatically read
            and fill in the main product information for you. This saves time
            and ensures accuracy.
          </DialogDescription>
        </DialogHeader>
        {!confirmSkip ? (
          <>
            <Input
              placeholder='https://your-landing-page.com'
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            {error && <div className='text-destructive text-sm'>{error}</div>}
            <DialogFooter>
              <Button onClick={onClose} variant='outline' disabled={loading}>
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
        ) : (
          <>
            <div className='mb-4 text-sm'>
              Are you sure you want to skip entering the sales page URL? You
              will need to fill in all product information manually.
            </div>
            <DialogFooter>
              <Button
                onClick={() => setConfirmSkip(false)}
                variant='outline'
                disabled={loading}
              >
                Back
              </Button>
              <Button onClick={onSkip} variant='default' disabled={loading}>
                Yes, continue without URL
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
