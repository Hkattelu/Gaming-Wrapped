import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const host = process.env.HOST_URL ?? 'https://gamingwrapped.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${host}/sitemap.xml`,
  };
}
