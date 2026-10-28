import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Lora, JetBrains_Mono, Noto_Serif_Bengali } from 'next/font/google';
import './globals.css';
import { CURATED_BENGALI_BOOKS } from '@/lib/bengali-catalog';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-body',
});

const notoBengali = Noto_Serif_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

const appUrl = process.env.APP_URL || 'https://banglagrantha.org';

export const viewport: Viewport = {
  themeColor: '#9A3412',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: 'BanglaGrantha – Global Bengali Digital Library & Audiobooks',
  description:
    'Read and listen to classic Bengali literature globally. Stream unabridged Bengali and English audiobooks across all genres and connected e-book archives.',
  applicationName: 'BanglaGrantha',
  keywords: [
    'Bengali books',
    'Bangla audiobook',
    'Bengali literature',
    'Pather Panchali audiobook',
    'Gitanjali audio',
    'Rabindranath Tagore e-books',
    'Satyajit Ray Feluda audiobook',
    'BanglaGrantha',
    'বাংলা বই',
    'বাংলা অডিওবুক',
  ],
  authors: [{ name: 'BanglaGrantha Archival Initiative' }],
  alternates: {
    canonical: '/',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BanglaGranth',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: 'BanglaGrantha – Global Bengali Digital Library & Audiobooks',
    description:
      'Read and listen to classic Bengali literature globally. Stream unabridged Bengali and English audiobooks across all genres and connected e-book archives.',
    url: appUrl,
    siteName: 'BanglaGrantha',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BanglaGrantha – Global Bengali Digital Library & Audiobooks',
    description:
      'Read and listen to classic Bengali literature globally. Stream unabridged Bengali and English audiobooks across all genres and connected e-book archives.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'BanglaGrantha',
        alternateName: 'বাংলা গ্রন্থগার',
        url: appUrl,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All',
        inLanguage: ['bn', 'en'],
        description:
          'Read and listen to classic Bengali literature globally. Stream unabridged Bengali and English audiobooks across all genres and connected e-book archives.',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'ItemList',
        name: 'Unabridged Bengali Classics & Audiobooks Catalog',
        numberOfItems: CURATED_BENGALI_BOOKS.length,
        itemListElement: CURATED_BENGALI_BOOKS.map((book, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': ['Book', 'Audiobook'],
            name: `${book.titleBn} — ${book.titleEn}`,
            author: {
              '@type': 'Person',
              name: book.authorEn,
            },
            datePublished: String(book.publishedYear),
            inLanguage: ['bn', 'en'],
            genre: book.genreLabelEn,
            description: book.synopsisEn,
          },
        })),
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${lora.variable} ${notoBengali.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="bg-[#FBF9F5] text-[#1C1917] antialiased selection:bg-[#9A3412]/15 selection:text-[#9A3412]"
      >
        {children}
      </body>
    </html>
  );
}
