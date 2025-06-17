'use client';

import PageContainer from '@/components/layout/page-container';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import WhatsappOnboarding from '@/features/whatsapp/components/whatsapp-onboarding';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
      <DialogContent className='w-full max-w-md' hideClose>
        <WhatsappOnboarding
          sellerId={sellerId}
          onClose={() => router.push('/dashboard/whatsapp')}
          onSuccess={() => router.push('/dashboard/whatsapp')}
        />
      </DialogContent>
    </Dialog>
  );
}
