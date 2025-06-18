'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import ForgotPasswordForm from './forgot-password-form';
import UserSignUpForm from './user-signup-form';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const [loading, setLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showMagicLinkForm, setShowMagicLinkForm] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const defaultValues = {
    email: '',
    password: ''
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Login successful!');
      // Redirect to dashboard
      window.location.href = '/dashboard';
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    });
    setLoading(false);
    if (error) toast.error(error.message);
  };

  const handleMagicLinkLogin = () => {
    setShowMagicLinkForm(true);
  };

  useEffect(() => {
    const fetchAndSetSeller = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: seller, error } = await supabase
          .from('sellers')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (!seller || error) {
          toast.error('No seller found for this user.');
          // Optionally, redirect or handle as needed
        } else {
          // You can set seller data in state/context here
          // Example: setSeller(seller);
        }
      }
    };
    fetchAndSetSeller();
  }, []);

  if (showForgotPassword) {
    return <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />;
  }

  if (showMagicLinkForm) {
    return (
      <ForgotPasswordForm
        onBack={() => setShowMagicLinkForm(false)}
        defaultOption='magic-link'
      />
    );
  }

  if (showSignUp) {
    return (
      <>
        <UserSignUpForm />
        <div className='mt-4 flex flex-col gap-2'>
          <Button variant='outline' onClick={() => setShowSignUp(false)}>
            Already have an account? Sign in
          </Button>
        </div>
      </>
    );
  }

  if (magicLinkSent) {
    return (
      <div className='w-full space-y-6 text-center'>
        <div className='space-y-3'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
            <svg
              className='h-6 w-6 text-blue-600 dark:text-blue-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
              />
            </svg>
          </div>
          <h2 className='text-2xl font-semibold'>Check your email</h2>
          <p className='text-muted-foreground'>
            We&apos;ve sent a magic link to{' '}
            <span className='font-medium'>{form.getValues('email')}</span>.
            Click the link to sign in instantly without a password.
          </p>
        </div>
        <div className='bg-muted/50 rounded-lg border p-4'>
          <div className='text-muted-foreground flex items-center justify-center space-x-2 text-sm'>
            <svg
              className='h-4 w-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <span>Check your spam folder if you don&apos;t see the email</span>
          </div>
        </div>
        <div className='space-y-2'>
          <Button
            onClick={() => setMagicLinkSent(false)}
            variant='outline'
            className='w-full'
          >
            Back to sign in
          </Button>
          <Button
            onClick={handleMagicLinkLogin}
            variant='ghost'
            className='w-full'
          >
            Send another magic link
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='w-full space-y-2'
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='Enter your email...'
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <div className='flex items-center justify-between'>
                  <FormLabel>Password</FormLabel>
                  <Button
                    type='button'
                    variant='link'
                    className='h-auto px-0 text-sm font-normal'
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </Button>
                </div>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Enter your password...'
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            disabled={loading}
            className='mt-2 ml-auto w-full'
            type='submit'
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </Form>
      <div className='relative my-4'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background text-muted-foreground px-2'>
            Or continue with
          </span>
        </div>
      </div>
      <Button
        className='mb-2 w-full'
        variant='outline'
        type='button'
        onClick={handleGoogleLogin}
      >
        <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24'>
          <path
            fill='#EA4335'
            d='M12 10.8V14.4H17.1C16.8 15.7 15.6 17.4 12 17.4C8.7 17.4 6 14.7 6 12C6 9.3 8.7 6.6 12 6.6C13.7 6.6 15 7.3 15.7 7.9L18.2 5.4C16.7 4.1 14.6 3 12 3C6.5 3 2 7.5 2 12C2 16.5 6.5 21 12 21C17.5 21 22 16.5 22 12C22 11.3 21.9 10.7 21.8 10.1H12Z'
          />
        </svg>
        Continue with Google
      </Button>
      <Button
        className='mb-2 w-full'
        variant='outline'
        type='button'
        onClick={handleMagicLinkLogin}
        disabled={loading}
      >
        <svg
          className='mr-2 h-4 w-4'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
          <polyline points='22,6 12,13 2,6' />
        </svg>
        Sign in with email link
      </Button>
      <div className='mt-4 flex flex-col gap-2'>
        <Button variant='outline' onClick={() => setShowSignUp(true)}>
          Don&apos;t have an account? Create one
        </Button>
      </div>
    </>
  );
}
