import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Gaming Wrapped',
  description: 'Your year in gaming, wrapped.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster />
        <footer className="w-full py-4 text-center text-sm text-muted-foreground">
          Made with ❤️ by <a href="https://www.youtube.com/@Glowstringman" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Glowstringman</a>. [<a href="https://ko-fi.com/glowstringman" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Donate</a>] [<a href="https://github.com/Hkattelu/Gaming-Wrapped" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Contribute</a>]
        </footer>
      </body>
    </html>
  );
}
