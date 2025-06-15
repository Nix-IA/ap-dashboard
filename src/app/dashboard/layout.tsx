'use client';

import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { ProductExtractionStatus } from '@/features/products/components/product-extraction-status';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  // Estado global para barra de extração
  const [extractionStatus, setExtractionStatus] = useState<
    'idle' | 'pending' | 'done'
  >('idle');
  const [extractionResult, setExtractionResult] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/sign-in');
      } else {
        setAuthenticated(true);
      }
      setLoading(false);
    };
    checkSession();
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.replace('/auth/sign-in');
        }
      }
    );
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    // Monitora o status de extração no localStorage
    const checkExtraction = () => {
      const extraction = localStorage.getItem('agentpay_product_extraction');
      if (extraction) {
        try {
          const parsed = JSON.parse(extraction);
          if (parsed.status === 'pending') {
            setExtractionStatus('pending');
            setExtractionResult(null);
          } else if (parsed.status === 'done') {
            setExtractionStatus('done');
            setExtractionResult(parsed.result);
          } else {
            setExtractionStatus('idle');
            setExtractionResult(null);
          }
        } catch {
          setExtractionStatus('idle');
          setExtractionResult(null);
        }
      } else {
        setExtractionStatus('idle');
        setExtractionResult(null);
      }
    };
    checkExtraction();
    const interval = setInterval(checkExtraction, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClearExtraction = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentpay_product_extraction');
    }
    setExtractionStatus('idle');
    setExtractionResult(null);
  };
  const handleShowExtracted = (data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('agentpay_product_onboarding', JSON.stringify(data));
      localStorage.removeItem('agentpay_product_extraction');
    }
    window.location.href = '/dashboard/product/new?onboarding=1';
  };

  if (loading) return null; // or a loading spinner
  if (!authenticated) return null;

  return (
    <KBar>
      {/* Barra de status de extração global: só aparece durante o pending */}
      {extractionStatus === 'pending' && (
        <div className='animate-fade-in fixed top-0 left-0 z-[1200] flex w-full items-center justify-center border-b-2 border-yellow-400 bg-yellow-50 py-2 shadow'>
          <span className='flex items-center gap-2 font-medium text-yellow-900'>
            <svg
              className='h-5 w-5 animate-spin text-yellow-500'
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
            Extracting product data... Please wait while we process the sales
            page information. You can continue using the system normally.
          </span>
        </div>
      )}
      {/* Alerta flutuante: só aparece quando status for 'done' */}
      {extractionStatus === 'done' && (
        <ProductExtractionStatus
          onShowResult={handleShowExtracted}
          onClear={handleClearExtraction}
        />
      )}
      <SidebarProvider defaultOpen={false}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          {/* page main content */}
          {children}
          {/* page main content ends */}
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
