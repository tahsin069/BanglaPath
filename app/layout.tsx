import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CURATED_BENGALI_BOOKS } from '@/lib/bengali-catalog';

const appUrl = process.env.APP_URL || 'https://banglagrantha.org';

export const viewport: Viewport = {
  themeColor: '#0A0D14',
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
      suppressHydrationWarning
      className="dark"
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
        className="bg-[#0A0D14] text-[#F3F4F6] antialiased selection:bg-[#F59E0B]/30 selection:text-[#FBBF24] overflow-x-hidden"
      >
        {children}
      </body>
    </html>
  );
}
