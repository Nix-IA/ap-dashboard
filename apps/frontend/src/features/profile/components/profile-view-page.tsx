import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import PasswordChangeForm from '@/features/auth/components/password-change-form';
import ProfileInfoSection from './profile-info-section';

export default function ProfileViewPage() {
  return (
    <div className='flex w-full flex-col space-y-6 p-6'>
      <div className='space-y-2'>
        <Heading
          title='Profile'
          description='Manage your personal information and security settings'
        />
      </div>

      <Separator />

      <div className='grid gap-6 lg:grid-cols-2'>
        <div className='space-y-6'>
          <ProfileInfoSection />
        </div>

        <div className='space-y-6'>
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  );
}
