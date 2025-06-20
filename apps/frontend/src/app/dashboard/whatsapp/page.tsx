import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import WhatsappInstancesPage from '@/features/whatsapp/components/whatsapp-listing';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard: Whatsapp Instances'
};

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-start justify-between'>
          <Heading
            title='Whatsapp Instances'
            description='Manage your Whatsapp numbers and connections.'
          />
          <a
            href='/dashboard/whatsapp/new'
            className='bg-primary hover:bg-primary/90 inline-flex items-center rounded px-4 py-2 text-xs text-white transition md:text-sm'
          >
            + Add New
          </a>
        </div>
        <Separator />
        <Suspense fallback={<div>Loading...</div>}>
          <WhatsappInstancesPage />
        </Suspense>
      </div>
    </PageContainer>
  );
}
