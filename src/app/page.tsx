import { redirect } from 'next/navigation';

export default function Page() {
  // A autenticação e proteção já são feitas no layout.
  // Apenas redireciona para o dashboard.
  redirect('/dashboard');
}
