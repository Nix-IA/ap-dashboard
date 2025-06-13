'use client';

import PageContainer from '@/components/layout/page-container';
import { useRouter } from 'next/navigation';
import WhatsappOnboarding from '@/features/whatsapp/components/whatsapp-onboarding';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function Page() {
  const router = useRouter();
  const [sellerId, setSellerId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSellerId(session?.user?.id || null);
    });
  }, []);

  if (!sellerId) {
    return (
      <PageContainer scrollable={false}>
        <div className='p-8 text-center'>Loading...</div>
      </PageContainer>
    );
  }

  return (
    <Dialog open>
      <DialogContent className='w-full max-w-md'>
        <WhatsappOnboarding
          sellerId={sellerId}
          onClose={() => router.push('/dashboard/whatsapp')}
          onSuccess={() => router.push('/dashboard/whatsapp')}
        />
      </DialogContent>
    </Dialog>
  );
}
