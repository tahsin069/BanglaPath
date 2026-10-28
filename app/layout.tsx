import type {Metadata} from 'next';
import { Cormorant_Garamond, Lora, JetBrains_Mono, Noto_Serif_Bengali } from 'next/font/google';
import './globals.css';

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

export const metadata: Metadata = {
  title: 'BanglaGrantha — Global Bengali Digital Library & Audiobook Archive',
  description: 'Global digital library and universal audiobook sanctuary for classic and complete Bengali literature, connecting federated e-book archives with synchronized multi-device reading and narration.',
  openGraph: {
    title: 'BanglaGrantha — Global Bengali Digital Library & Audiobook Archive',
    description: 'Global digital library and universal audiobook sanctuary for classic and complete Bengali literature, connecting federated e-book archives with synchronized multi-device reading and narration.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BanglaGrantha — Global Bengali Digital Library & Audiobook Archive',
    description: 'Global digital library and universal audiobook sanctuary for classic and complete Bengali literature, connecting federated e-book archives with synchronized multi-device reading and narration.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${lora.variable} ${notoBengali.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#FBF9F5] text-[#1C1917] antialiased selection:bg-[#9A3412]/15 selection:text-[#9A3412]"
      >
        {children}
      </body>
    </html>
  );
}
