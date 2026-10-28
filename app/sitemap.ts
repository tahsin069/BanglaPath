import type { MetadataRoute } from 'next';
import { CURATED_BENGALI_BOOKS } from '@/lib/bengali-catalog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.APP_URL || 'https://banglagrantha.org';

  const bookEntries: MetadataRoute.Sitemap = CURATED_BENGALI_BOOKS.map((book) => ({
    url: `${baseUrl}/?book=${encodeURIComponent(book.id)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...bookEntries,
  ];
}
