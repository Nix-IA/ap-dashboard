import PageContainer from '@/components/layout/page-container';
import { Heading } from '@/components/ui/heading';
import PlatformsSection from '@/features/integrations/components/platforms-section';

export const metadata = {
  title: 'Dashboard: Platforms'
};

export default function PlatformsPage() {
  return (
    <PageContainer scrollable={false}>
      <div className='flex flex-1 flex-col space-y-4'>
        <Heading
          title='Platforms'
          description='Manage your platform integrations.'
        />
        <PlatformsSection />
      </div>
    </PageContainer>
  );
}
