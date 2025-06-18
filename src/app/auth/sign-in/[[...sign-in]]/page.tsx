import SignInViewPage from '@/features/auth/components/sign-in-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent Pay | Sign In',
  description:
    'Sign in to your Agent Pay dashboard to manage your intelligent sales automation.'
};

export default async function Page() {
  return <SignInViewPage />;
}
