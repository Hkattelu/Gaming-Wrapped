"use client";

import { Logo } from '@/components/logo';
import { UploadForm } from '@/components/upload-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, GanttChartSquare, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [backloggdUsername, setBackloggdUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBackloggdExport = async () => {
    if (!backloggdUsername) {
      setError('Please enter your Backloggd username.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/backloggd?username=${backloggdUsername}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to export data.');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${backloggdUsername}_games.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] z-0" />
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 relative z-10 min-h-screen">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="container max-w-4xl flex flex-col items-center text-center z-10">
          <Logo className="text-5xl" />
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl font-body tracking-wider">
            Got your game data? Upload your playthrough history from sites like HowLongToBeat and get a personalized, shareable &quot;Gaming Wrapped&quot; story.
          </p>

          <Card className="mt-10 w-full max-w-lg bg-card/80 backdrop-blur-sm shadow-lg shadow-primary/20 border-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-2xl tracking-widest">UPLOAD YOUR DATA</CardTitle>
              <CardDescription className="font-body text-base">Drop your .csv file here to start the magic.</CardDescription>
            </CardHeader>
            <CardContent>
              <UploadForm />
            </CardContent>
          </Card>
          
          <div className="mt-6 flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">From Backloggd</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Exporting from Backloggd</DialogTitle>
                  <DialogDescription>
                    Enter your Backloggd username to download your games CSV.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Your Backloggd username"
                    value={backloggdUsername}
                    onChange={(e) => setBackloggdUsername(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button onClick={handleBackloggdExport} disabled={isLoading} className="w-full">
                    {isLoading ? 'Exporting...' : 'Export CSV'}
                  </Button>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">From HowLongToBeat</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Exporting from HowLongToBeat</DialogTitle>
                  <DialogDescription>
                    You can export your game list directly from the HowLongToBeat website.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p>
                    1. Log in to your account on <a href="https://howlongtobeat.com" target="_blank" rel="noopener noreferrer" className="text-accent underline">howlongtobeat.com</a>.
                  </p>
                  <p>
                    2. Go to your Profile page.
                  </p>
                  <p>
                    3. Click on &apos;Options&apos; and select &apos;Export Game List&apos;.
                  </p>
                  <p>
                    4. This will download a CSV file of your game library.
                  </p>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Other</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Other Platforms</DialogTitle>
                  <DialogDescription>
                    Importing from other platforms like Steam, PlayStation, or Xbox is not directly supported yet.
                  </DialogDescription>
                </DialogHeader>
                <p>
                  You may need to use third-party tools to export your data and format it into a CSV with a &quot;Title&quot; column.
                </p>
              </DialogContent>
            </Dialog>
          </div>
          <div className="mt-10 w-full">
            <h2 className="text-3xl font-headline font-semibold tracking-widest">HOW IT WORKS</h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <Card className="bg-card/50 backdrop-blur-sm p-6 flex flex-col items-center text-center gap-4 hover:border-accent transition-all border-transparent border-2">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary">
                  <FileText className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mt-2 font-headline text-xl tracking-wider">1. UPLOAD</h3>
                <p className="text-base font-body text-muted-foreground">Export your gaming data and upload it. Easy peasy.</p>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm p-6 flex flex-col items-center text-center gap-4 hover:border-accent transition-all border-transparent border-2">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary">
                  <GanttChartSquare className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mt-2 font-headline text-xl tracking-wider">2. WRAP</h3>
                <p className="text-base font-body text-muted-foreground">Our AI bot analyzes your year, creating a unique story and stats.</p>
              </Card>
              <Card className="bg-card/50 backdrop-blur-sm p-6 flex flex-col items-center text-center gap-4 hover:border-accent transition-all border-transparent border-2">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary">
                  <Share2 className="h-8 w-8" />
                </div>
                <h3 className="font-semibold mt-2 font-headline text-xl tracking-wider">3. SHARE</h3>
                <p className="text-base font-body text-muted-foreground">Get a shareable link to your personalized slideshow to show off.</p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
