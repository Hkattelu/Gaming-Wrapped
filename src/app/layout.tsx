import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { VibeKanbanWrapper } from '@/components/VibeKanbanWrapper';

const HOST_URL = process.env.HOST_URL ?? 'https://gamingwrapped.com';

export const metadata: Metadata = {
  metadataBase: new URL(HOST_URL),
  title: {
    default: 'Gaming Wrapped',
    template: '%s | Gaming Wrapped',
  },
  description: 'Upload your play history and get a shareable, AI‑generated year‑in‑review.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Gaming Wrapped',
    description: 'Upload your play history and get a shareable, AI‑generated year‑in‑review.',
    images: [
      {
        url: 'https://placehold.co/1200x630/png?text=Gaming+Wrapped',
        width: 1200,
        height: 630,
        alt: 'Gaming Wrapped',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gaming Wrapped',
    description: 'Upload your play history and get a shareable, AI‑generated year‑in‑review.',
    images: ['https://placehold.co/1200x630/png?text=Gaming+Wrapped'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Gaming Wrapped",
    url: HOST_URL,
  } as const;

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="mask-icon" href="/icon.svg" color="#0ea5e9" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0b0b0f" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-X8VX0FC0D2"></script>
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-X8VX0FC0D2');
          `}
        </script>
      </head>
      <body className="font-body antialiased">
        {children}
        <VibeKanbanWrapper />
        <Toaster />
        <footer className="w-full py-4 text-center text-sm text-muted-foreground">
          Made with ❤️ by <a href="https://www.youtube.com/@Glowstringman" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Glowstringman</a>. [<a href="https://ko-fi.com/glowstringman" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Donate</a>] [<a href="https://github.com/Hkattelu/Gaming-Wrapped" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Contribute</a>]
        </footer>
      </body>
    </html>
  );
}
