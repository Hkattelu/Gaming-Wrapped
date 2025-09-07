import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const host = process.env.HOST_URL ?? 'https://gamingwrapped.com';
  const now = new Date();
  return [
    {
      url: `${host}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${host}/manual`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
