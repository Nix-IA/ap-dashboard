import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useRef, useState } from 'react';

export function ProductExtractionStatus({
  onClear,
  onShowResult
}: {
  onClear?: () => void;
  onShowResult?: (data: any) => void;
}) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'done'>('idle');
  const [result, setResult] = useState<any>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check localStorage for extraction status/result
    const extraction = localStorage.getItem('agentpay_product_extraction');
    if (extraction) {
      try {
        const parsed = JSON.parse(extraction);
        if (parsed.status === 'pending') {
          setStatus('pending');
        } else if (parsed.status === 'done') {
          setStatus('done');
          setResult(parsed.result);
        } else {
          setStatus('idle');
          setResult(null);
        }
      } catch {
        setStatus('idle');
        setResult(null);
      }
    } else {
      setStatus('idle');
      setResult(null);
    }
  }, []);

  useEffect(() => {
    if (status === 'done' && alertRef.current) {
      alertRef.current.focus();
    }
  }, [status]);

  // Só renderiza o alerta quando status for 'done'
  if (status !== 'done') return null;

  return (
    <div
      ref={alertRef}
      tabIndex={-1}
      className='animate-fade-in fixed top-4 right-4 z-[1100] w-full max-w-sm shadow-2xl ring-2 ring-green-500 outline-none'
      style={{
        transition: 'box-shadow 0.2s, transform 0.2s',
        transform: 'translateY(0)'
      }}
      aria-live='assertive'
    >
      <Alert
        variant='success'
        className='flex items-start gap-3 border-green-400 bg-green-50 p-5'
      >
        <span className='mt-1'>
          <svg
            width='28'
            height='28'
            fill='none'
            viewBox='0 0 24 24'
            className='text-green-600'
          >
            <circle cx='12' cy='12' r='10' fill='currentColor' opacity='0.18' />
            <path
              d='M8 12.5l2 2 4-4'
              stroke='currentColor'
              strokeWidth='2.2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </span>
        <div className='min-w-0 flex-1'>
          <AlertTitle className='mb-1 text-base font-bold text-green-700'>
            Product extraction completed!
          </AlertTitle>
          <AlertDescription className='mb-3 text-green-900'>
            Product data has been extracted and is ready for review.
          </AlertDescription>
          <div className='flex gap-2'>
            <button
              className='rounded bg-green-600 px-3 py-1 font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:outline-none'
              onClick={() => onShowResult && onShowResult(result)}
              autoFocus
            >
              Review and register product
            </button>
            <button
              className='text-muted-foreground px-2 py-1 text-xs underline'
              onClick={() => {
                localStorage.removeItem('agentpay_product_extraction');
                setStatus('idle');
                setResult(null);
                onClear && onClear();
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </Alert>
    </div>
  );
}
