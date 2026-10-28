import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'BanglaGrantha – Global Bengali Digital Library & Audiobooks',
    short_name: 'BanglaGranth',
    description:
      'Read and listen to classic Bengali literature globally. Stream unabridged Bengali and English audiobooks across all genres and connected e-book archives.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#FBF9F5',
    theme_color: '#9A3412',
    categories: ['books', 'education', 'entertainment'],
    lang: 'bn',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
