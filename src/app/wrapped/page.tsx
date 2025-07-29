
"use client";

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import type { WrappedData } from '@/types';
import { WrappedSlideshow } from '@/components/wrapped-slideshow';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Loading from './loading';
import { useRouter } from 'next/navigation';

function WrappedPageContent() {
  const [data, setData] = useState<WrappedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for data in session storage
    const storedData = sessionStorage.getItem('wrappedData');
    
    if (storedData) {
      try {
        const parsedData: WrappedData = JSON.parse(storedData);
        setData(parsedData);
        // Optionally clear it after use
        // sessionStorage.removeItem('wrappedData');
      } catch (e) {
        setError('Failed to load your Game Rewind. The data format is invalid.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // If there's no data, maybe they landed here by mistake
      setError('No Game Rewind data found. Please start over.');
      setIsLoading(false);
    }
    
    // Cleanup sessionStorage when the user navigates away or closes the tab
    const handleBeforeUnload = () => {
        sessionStorage.removeItem('wrappedData');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };

  }, []);

  const handleShare = () => {
    const currentUrl = window.location.href;
    if (data) {
        const csvText = "Title,Platform,Review Score,Review Notes\n" // This is a placeholder for a more complex implementation
        const encodedData = btoa(csvText);
        const shareUrl = `${window.location.origin}/wrapped?data=${encodedData}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Shareable link copied to clipboard!');
        }, () => {
            alert('Failed to copy link.');
        });
    }
  }


  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">Try Again</Link>
        </Button>
      </div>
    );
  }

  if (data) {
    return <WrappedSlideshow data={data} />;
  }

  return null;
}

export default function WrappedPage() {
    return (
        <Suspense fallback={<Loading />}>
            <WrappedPageContent />
        </Suspense>
    )
}
