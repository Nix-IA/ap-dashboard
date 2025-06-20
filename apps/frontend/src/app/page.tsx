import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Agent Pay - Intelligent Sales Automation Platform',
  description:
    'Transform your sales with AI-powered WhatsApp automation. Intelligent lead management, automated responses, and advanced analytics for better conversions.',
  keywords: [
    'sales automation',
    'whatsapp automation',
    'ai sales agent',
    'lead management',
    'conversion optimization',
    'sales analytics',
    'intelligent sales platform'
  ],
  openGraph: {
    title: 'Agent Pay - Intelligent Sales Automation Platform',
    description:
      'Transform your sales with AI-powered WhatsApp automation. Intelligent lead management and automated responses.',
    url: '/',
    type: 'website',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
        alt: 'Agent Pay - Intelligent Sales Automation Platform'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agent Pay - Intelligent Sales Automation',
    description: 'Transform your sales with AI-powered WhatsApp automation',
    images: ['/og-image.svg']
  },
  alternates: {
    canonical: '/'
  }
};

export default function Page() {
  // A autenticação e proteção já são feitas no layout.
  // Apenas redireciona para o dashboard.
  redirect('/dashboard');
}
