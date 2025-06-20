import Providers from '@/components/layout/providers';
import ThemeProvider from '@/components/layout/ThemeToggle/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/lib/font';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import './globals.css';
import './theme.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

const SITE_CONFIG = {
  name: 'Agent Pay',
  title: 'Agent Pay - AI Sales Agents Platform',
  description:
    'Empower your business with intelligent AI sales agents. Automate customer interactions, qualify leads, and close deals 24/7 through WhatsApp and multiple channels. Create your account and start using today.',
  url: 'https://app.agentpay.com.br',
  ogImage: '/og-image.svg',
  keywords: [
    'AI sales agents',
    'sales automation',
    'WhatsApp automation',
    'conversational AI',
    'intelligent agents',
    'lead qualification',
    'sales chatbots',
    'automated sales',
    'AI customer service',
    'sales platform'
  ]
};

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.title,
    template: `%s | ${SITE_CONFIG.name}`
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [
    {
      name: 'Agent Pay Team',
      url: SITE_CONFIG.url
    }
  ],
  creator: 'Agent Pay',
  publisher: 'Agent Pay',
  metadataBase: new URL(SITE_CONFIG.url),
  alternates: {
    canonical: '/'
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: SITE_CONFIG.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - AI Sales Agents Platform`,
        type: 'image/png'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [SITE_CONFIG.ogImage],
    creator: '@agentpay',
    site: '@agentpay'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
    other: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        url: '/favicon.svg'
      }
    ]
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code'
  }
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.dark
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isScaled = activeThemeValue?.endsWith('-scaled');

  return (
    <html lang='en' suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'light') {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.light}')
                } else {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Agent Pay',
              description: SITE_CONFIG.description,
              url: SITE_CONFIG.url,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
                description: 'Platform available now'
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '150'
              },
              author: {
                '@type': 'Organization',
                name: 'Agent Pay Team',
                url: SITE_CONFIG.url
              },
              screenshot: `${SITE_CONFIG.url}/og-image.svg`,
              featureList: [
                'AI-powered WhatsApp automation',
                'Advanced sales analytics',
                'Lead management system',
                'Conversion optimization',
                'Real-time dashboard'
              ]
            })
          }}
        />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin=''
        />
        <link rel='dns-prefetch' href='//fonts.googleapis.com' />
        <link rel='dns-prefetch' href='//fonts.gstatic.com' />
      </head>
      <body
        className={cn(
          'bg-background font-sans antialiased',
          activeThemeValue ? `theme-${activeThemeValue}` : '',
          isScaled ? 'theme-scaled' : '',
          fontVariables
        )}
        style={{ minHeight: '100dvh', height: '100dvh', overflow: 'auto' }}
      >
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='dark'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={activeThemeValue as string}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
