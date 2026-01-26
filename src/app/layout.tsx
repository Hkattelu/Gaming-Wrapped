import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { VibeKanbanWrapper } from '@/components/VibeKanbanWrapper';
import Script from 'next/script';
import { Press_Start_2P, VT323, Rubik_Glitch, Space_Mono } from 'next/font/google';

const pressStart2P = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
  display: 'swap',
});

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-vt323',
  display: 'swap',
});

const rubikGlitch = Rubik_Glitch({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-rubik-glitch',
  display: 'swap',
});

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
  display: 'swap',
});

const HOST_URL = process.env.HOST_URL ?? 'https://gamingwrapped.com';

export const metadata: Metadata = {
  metadataBase: new URL(HOST_URL),
  title: {
    default: 'Gaming Wrapped',
    template: '%s | Gaming Wrapped',
  },
  description: 'Upload your play history and get a shareable story.',
  alternates: {
    canonical: '/',
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="mask-icon" href="/icon.svg" color="#0ea5e9" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#0b0b0f" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={`${pressStart2P.variable} ${vt323.variable} ${rubikGlitch.variable} ${spaceMono.variable} font-body antialiased`}>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-X8VX0FC0D2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X8VX0FC0D2');
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <VibeKanbanWrapper />
          {children}
          <Toaster />
          <footer className="w-full py-4 text-center text-sm text-muted-foreground">
            Made with ❤️ by <a href="https://www.youtube.com/@Glowstringman" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Glowstringman</a>. [<a href="https://ko-fi.com/glowstringman" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Donate</a>] [<a href="https://github.com/Hkattelu/Gaming-Wrapped" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Contribute</a>]
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
