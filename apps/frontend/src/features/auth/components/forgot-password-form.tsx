'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
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
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' })
});

type ForgotPasswordFormValue = z.infer<typeof formSchema>;

interface ForgotPasswordFormProps {
  onBack: () => void;
  defaultOption?: 'reset' | 'magic-link';
}

export default function ForgotPasswordForm({
  onBack,
  defaultOption
}: ForgotPasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [selectedOption, setSelectedOption] = useState<
    'reset' | 'magic' | null
  >(defaultOption === 'magic-link' ? 'magic' : null);
  const [sentType, setSentType] = useState<'reset' | 'magic'>('reset');

  const form = useForm<ForgotPasswordFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data: ForgotPasswordFormValue) => {
    const currentOption =
      selectedOption || (defaultOption === 'magic-link' ? 'magic' : null);

    if (!currentOption) {
      toast.error('Please select an option first');
      return;
    }

    setLoading(true);

    if (currentOption === 'reset') {
      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      setLoading(false);

      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
        setSentType('reset');
        toast.success('Password reset email sent! Check your inbox.');
      }
    } else {
      // Send magic link
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      setLoading(false);

      if (error) {
        toast.error(error.message);
      } else {
        setSent(true);
        setSentType('magic');
        toast.success('Magic link sent! Check your inbox.');
      }
    }
  };

  if (sent) {
    return (
      <div className='w-full space-y-4 text-center'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold'>Check your email</h2>
          <p className='text-muted-foreground'>
            {sentType === 'reset'
              ? "We've sent a password reset link to your email address."
              : "We've sent a magic link to your email address. Click the link to sign in automatically."}
          </p>
        </div>
        <div className='space-y-2'>
          <Button onClick={onBack} variant='outline' className='w-full'>
            Back to sign in
          </Button>
          <Button
            onClick={() => {
              setSent(false);
              setSelectedOption(null);
              form.reset();
            }}
            variant='ghost'
            className='w-full'
          >
            Send another email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full space-y-6'>
      <div className='space-y-2 text-center'>
        <h2 className='text-2xl font-semibold'>
          {defaultOption === 'magic-link'
            ? 'Sign in with Email'
            : 'Account Recovery'}
        </h2>
        <p className='text-muted-foreground'>
          {defaultOption === 'magic-link'
            ? 'Get a secure link sent to your email to sign in instantly'
            : "Choose how you'd like to access your account"}
        </p>
      </div>

      {!selectedOption && defaultOption !== 'magic-link' ? (
        <div className='space-y-4'>
          <div className='grid gap-3'>
            <Card
              className='cursor-pointer border-2 transition-all hover:border-blue-200 hover:shadow-md dark:hover:border-blue-800'
              onClick={() => setSelectedOption('magic')}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center space-x-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900'>
                    <svg
                      className='h-4 w-4 text-blue-600 dark:text-blue-400'
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
                  <CardTitle className='text-lg'>Magic Link Login</CardTitle>
                </div>
                <CardDescription>
                  Get a secure link sent to your email. Click it to sign in
                  instantly without a password.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className='cursor-pointer border-2 transition-all hover:border-blue-200 hover:shadow-md dark:hover:border-blue-800'
              onClick={() => setSelectedOption('reset')}
            >
              <CardHeader className='pb-3'>
                <div className='flex items-center space-x-2'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900'>
                    <svg
                      className='h-4 w-4 text-orange-600 dark:text-orange-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l4.293-4.293A6 6 0 0119 9z'
                      />
                    </svg>
                  </div>
                  <CardTitle className='text-lg'>Reset Password</CardTitle>
                </div>
                <CardDescription>
                  Create a new password for your account. You&apos;ll receive a
                  secure link to reset it.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Button onClick={onBack} variant='outline' className='w-full'>
            Back to sign in
          </Button>
        </div>
      ) : selectedOption || defaultOption === 'magic-link' ? (
        <div className='space-y-4'>
          <div className='bg-muted/50 rounded-lg border p-4'>
            <div className='flex items-center space-x-2 text-sm'>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  selectedOption === 'magic' || defaultOption === 'magic-link'
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-orange-100 dark:bg-orange-900'
                }`}
              >
                {selectedOption === 'magic' ||
                defaultOption === 'magic-link' ? (
                  <svg
                    className='h-3 w-3 text-blue-600 dark:text-blue-400'
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
                ) : (
                  <svg
                    className='h-3 w-3 text-orange-600 dark:text-orange-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l4.293-4.293A6 6 0 0119 9z'
                    />
                  </svg>
                )}
              </div>
              <span className='font-medium'>
                {selectedOption === 'magic' || defaultOption === 'magic-link'
                  ? 'Magic Link Login'
                  : 'Password Reset'}
              </span>
            </div>
            <p className='text-muted-foreground mt-1 text-xs'>
              {selectedOption === 'magic' || defaultOption === 'magic-link'
                ? 'You will receive a secure link to sign in instantly'
                : 'You will receive a link to create a new password'}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='Enter your email address...'
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='space-y-2'>
                <Button disabled={loading} className='w-full' type='submit'>
                  {loading
                    ? 'Sending...'
                    : selectedOption === 'magic' ||
                        defaultOption === 'magic-link'
                      ? 'Send Magic Link'
                      : 'Send Reset Link'}
                </Button>
                {defaultOption !== 'magic-link' && (
                  <Button
                    type='button'
                    onClick={() => setSelectedOption(null)}
                    variant='outline'
                    className='w-full'
                  >
                    Choose different option
                  </Button>
                )}
                <Button
                  type='button'
                  onClick={onBack}
                  variant='ghost'
                  className='w-full'
                >
                  Back to sign in
                </Button>
              </div>
            </form>
          </Form>
        </div>
      ) : null}
    </div>
  );
}
