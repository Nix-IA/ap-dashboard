import ResetPasswordView from '@/features/auth/components/reset-password-view';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Agent Pay | Reset Password',
  description: 'Reset your Agent Pay account password.'
};

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
