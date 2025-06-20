'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
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
import { IconEye, IconEyeOff, IconLock, IconShield } from '@tabler/icons-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import {
  passwordChangeSchema,
  type PasswordChangeFormValues
} from '../utils/password-change-schema';

export default function PasswordChangeForm() {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: PasswordChangeFormValues) => {
    setLoading(true);

    try {
      // Get current user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        toast.error('Erro ao obter informações do usuário');
        return;
      }

      // Verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword
      });

      if (signInError) {
        toast.error('Senha atual incorreta');
        form.setError('currentPassword', {
          type: 'manual',
          message: 'Senha atual incorreta'
        });
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (updateError) {
        toast.error(`Erro ao alterar senha: ${updateError.message}`);
      } else {
        toast.success('Senha alterada com sucesso!');
        form.reset();
      }
    } catch (err) {
      console.error('Password change error:', err);
      toast.error('Erro inesperado ao alterar senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Check password strength
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, text: '', color: '' };

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { score, text: 'Fraca', color: 'text-red-500' };
    if (score <= 4) return { score, text: 'Média', color: 'text-yellow-500' };
    return { score, text: 'Forte', color: 'text-green-500' };
  };

  const newPassword = form.watch('newPassword');
  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <IconShield className='h-5 w-5' />
          Segurança da Conta
        </CardTitle>
        <CardDescription>
          Altere sua senha para manter sua conta segura. Use uma senha forte e
          única.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Current Password */}
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='flex items-center gap-2'>
                    <IconLock className='h-4 w-4' />
                    Senha Atual
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder='Digite sua senha atual'
                        disabled={loading}
                        {...field}
                        className='pr-10'
                      />
                      <button
                        type='button'
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className='absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      >
                        {showCurrentPassword ? (
                          <IconEyeOff className='h-4 w-4' />
                        ) : (
                          <IconEye className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder='Digite a nova senha'
                        disabled={loading}
                        {...field}
                        className='pr-10'
                      />
                      <button
                        type='button'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className='absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      >
                        {showNewPassword ? (
                          <IconEyeOff className='h-4 w-4' />
                        ) : (
                          <IconEye className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  {newPassword && (
                    <div className='flex items-center gap-2 text-sm'>
                      <span>Força da senha:</span>
                      <span className={passwordStrength.color}>
                        {passwordStrength.text}
                      </span>
                      <div className='ml-2 flex gap-1'>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 w-4 rounded ${
                              i < passwordStrength.score
                                ? passwordStrength.score <= 2
                                  ? 'bg-red-500'
                                  : passwordStrength.score <= 4
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='Confirme a nova senha'
                        disabled={loading}
                        {...field}
                        className='pr-10'
                      />
                      <button
                        type='button'
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className='absolute top-1/2 right-2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      >
                        {showConfirmPassword ? (
                          <IconEyeOff className='h-4 w-4' />
                        ) : (
                          <IconEye className='h-4 w-4' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Requirements */}
            <div className='rounded-md bg-gray-50 p-4 dark:bg-gray-800'>
              <h4 className='mb-2 text-sm font-medium text-gray-900 dark:text-gray-100'>
                Requisitos da senha:
              </h4>
              <ul className='space-y-1 text-sm text-gray-600 dark:text-gray-400'>
                <li
                  className={`flex items-center gap-2 ${
                    newPassword && newPassword.length >= 6
                      ? 'text-green-600 dark:text-green-400'
                      : ''
                  }`}
                >
                  <span className='h-1 w-1 rounded-full bg-current' />
                  Pelo menos 6 caracteres
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    newPassword && /[a-z]/.test(newPassword)
                      ? 'text-green-600 dark:text-green-400'
                      : ''
                  }`}
                >
                  <span className='h-1 w-1 rounded-full bg-current' />
                  Uma letra minúscula
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    newPassword && /[A-Z]/.test(newPassword)
                      ? 'text-green-600 dark:text-green-400'
                      : ''
                  }`}
                >
                  <span className='h-1 w-1 rounded-full bg-current' />
                  Uma letra maiúscula
                </li>
                <li
                  className={`flex items-center gap-2 ${
                    newPassword && /\d/.test(newPassword)
                      ? 'text-green-600 dark:text-green-400'
                      : ''
                  }`}
                >
                  <span className='h-1 w-1 rounded-full bg-current' />
                  Um número
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type='submit'
              disabled={loading}
              className='w-full'
              size='lg'
            >
              {loading ? 'Alterando senha...' : 'Alterar Senha'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
