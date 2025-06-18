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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const formSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

type ResetPasswordFormValue = z.infer<typeof formSchema>;

export default function ResetPasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  const form = useForm<ResetPasswordFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  useEffect(() => {
    // Check if we have a valid session for password reset
    const checkSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (session) {
        setIsValidSession(true);
      } else {
        // If no session, redirect to sign in
        router.push('/auth/sign-in');
      }
    };

    checkSession();
  }, [router]);

  const onSubmit = async (data: ResetPasswordFormValue) => {
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: data.password
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully!');
      // Redirect to dashboard
      router.push('/dashboard');
    }
  };

  if (!isValidSession) {
    return (
      <div className='w-full space-y-4 text-center'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold'>Invalid or expired link</h2>
          <p className='text-muted-foreground'>
            This password reset link is invalid or has expired.
          </p>
        </div>
        <Link href='/auth/sign-in'>
          <Button className='w-full'>Back to sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='w-full space-y-4'>
      <div className='space-y-2 text-center'>
        <h2 className='text-2xl font-semibold'>Reset your password</h2>
        <p className='text-muted-foreground'>Enter your new password below.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Enter your new password...'
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
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Confirm your new password...'
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={loading} className='w-full' type='submit'>
            {loading ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
