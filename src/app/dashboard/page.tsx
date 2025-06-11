import { redirect } from 'next/navigation';

export default function Dashboard() {
  // Authentication is handled in the layout. Just redirect to overview.
  redirect('/dashboard/overview');
}
