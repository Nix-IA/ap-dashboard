import { Icons } from '@/components/icons';
import { ModeToggle } from '@/components/layout/ThemeToggle/theme-toggle';
import { Metadata } from 'next';
import Link from 'next/link';
import UserSignUpForm from './user-signup-form';

export const metadata: Metadata = {
  title: 'Agent Pay | Sign Up',
  description:
    'Create your Agent Pay account and start automating your sales process.'
};

export default function SignUpViewPage() {
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      {/* Theme Toggle - positioned absolutely in top right */}
      <div className='absolute top-4 right-4 z-30'>
        <ModeToggle />
      </div>

      <div className='relative hidden h-full flex-col bg-gradient-to-br from-blue-600 to-blue-800 p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900' />
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <div className='mr-3 flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-blue-600'>
            <Icons.agentPay className='size-5' />
          </div>
          Agent Pay
        </div>
        {/* Testimonial temporarily hidden */}
        {/* <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;Setting up Agent Pay was incredibly simple. Within hours, 
              we had our first automated WhatsApp sales conversation running smoothly.&rdquo;
            </p>
            <footer className='text-sm'>Carlos Rodriguez, Business Owner</footer>
          </blockquote>
        </div> */}
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <div className='flex flex-col space-y-2 text-center'>
            <div className='mb-4 flex items-center justify-center'>
              <div className='mr-3 flex aspect-square size-12 items-center justify-center rounded-lg bg-blue-600 text-white'>
                <Icons.agentPay className='size-6' />
              </div>
              <h1 className='text-2xl font-semibold tracking-tight text-blue-900 dark:text-blue-100'>
                Agent Pay
              </h1>
            </div>
            <h2 className='text-2xl font-semibold tracking-tight'>
              Create your account
            </h2>
            <p className='text-muted-foreground text-sm'>
              Start automating your sales process with intelligent WhatsApp
              integration
            </p>
          </div>
          <UserSignUpForm />
          <div className='flex items-center justify-center'>
            <Link
              href='/auth/sign-in'
              className='text-muted-foreground hover:text-primary text-sm underline underline-offset-4'
            >
              Already have an account? Sign in
            </Link>
          </div>
          <p className='text-muted-foreground px-8 text-center text-sm'>
            By creating an account, you agree to our{' '}
            <Link
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
