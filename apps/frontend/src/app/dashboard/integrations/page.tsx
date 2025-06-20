// This page is deprecated. Please use /dashboard/platforms instead.
import { redirect } from 'next/navigation';

export default function IntegrationsPage() {
  redirect('/dashboard/platforms');
  return null;
}
