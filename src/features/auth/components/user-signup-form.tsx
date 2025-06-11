// UserSignUpForm.tsx
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
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';

const formSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserSignUpForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Check your email to confirm.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-2'>
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
          {loading ? 'Creating...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}
