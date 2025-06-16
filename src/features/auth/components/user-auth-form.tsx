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
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import UserSignUpForm from './user-signup-form';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [loading, setLoading] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
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
      toast.success('Login realizado com sucesso!');
      // Redirecionar ou atualizar página
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

  if (showSignUp) {
    return (
      <>
        <UserSignUpForm />
        <div className='mt-4 flex flex-col gap-2'>
          <Button variant='outline' onClick={() => setShowSignUp(false)}>
            Already have an account? Login
          </Button>
        </div>
      </>
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
                <FormLabel>Password</FormLabel>
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
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Form>
      <div className='relative my-4'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background text-muted-foreground px-2'>
            Ou continue com
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
      <div className='mt-4 flex flex-col gap-2'>
        <Button variant='outline' onClick={() => setShowSignUp(true)}>
          Don&apos;t have an account? Create one
        </Button>
      </div>
    </>
  );
}
