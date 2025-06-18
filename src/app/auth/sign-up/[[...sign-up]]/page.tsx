import SignUpViewPage from '@/features/auth/components/sign-up-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent Pay | Sign Up',
  description:
    'Create your Agent Pay account and start automating your sales process with intelligent WhatsApp integration.'
};

export default async function Page() {
  return <SignUpViewPage />;
}
