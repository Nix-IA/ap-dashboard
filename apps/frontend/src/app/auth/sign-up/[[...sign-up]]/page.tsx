import SignUpViewPage from '@/features/auth/components/sign-up-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Account | Agent Pay',
  description:
    'Join thousands of businesses using Agent Pay AI sales agents to automate customer interactions, qualify leads, and close deals 24/7. Create your account today.',
  keywords: [
    'agent pay signup',
    'ai sales agents',
    'sales automation',
    'conversational ai platform'
  ],
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    title: 'Create Your Agent Pay Account',
    description: 'Deploy intelligent AI sales agents for your business',
    url: '/auth/sign-up',
    type: 'website'
  }
};

export default async function Page() {
  return <SignUpViewPage />;
}
