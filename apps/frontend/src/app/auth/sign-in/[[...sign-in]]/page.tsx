import SignInViewPage from '@/features/auth/components/sign-in-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Agent Pay',
  description:
    'Access your Agent Pay dashboard to manage AI sales agents, automate customer interactions, and track performance across all channels.',
  keywords: [
    'agent pay login',
    'ai sales agents',
    'sales automation login',
    'conversational ai dashboard'
  ],
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    title: 'Sign In to Agent Pay',
    description: 'Access your AI sales agents platform dashboard',
    url: '/auth/sign-in',
    type: 'website'
  }
};

export default async function Page() {
  return <SignInViewPage />;
}
