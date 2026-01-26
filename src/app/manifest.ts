import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  const name = 'Gaming Wrapped';
  const short_name = 'Wrapped';
  const theme_color = '#0b0b0f';
  const background_color = '#0b0b0f';
  const start_url = '/';
  const display = 'standalone';

  return {
    name,
    short_name,
    description: 'Upload your play history and get a shareable story.',
    start_url,
    display,
    background_color,
    theme_color,
    icons: [
      { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}

