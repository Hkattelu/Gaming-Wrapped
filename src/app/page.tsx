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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Home() {
  const [backloggdUsername, setBackloggdUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ page: number; total: number } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [steamId, setSteamId] = useState('');
  const [steamLoading, setSteamLoading] = useState(false);
  const [steamError, setSteamError] = useState<string | null>(null);
  const [steamDialogOpen, setSteamDialogOpen] = useState(false);
  const [steamProgress, setSteamProgress] = useState<string | null>(null);

  const handleBackloggdExport = async () => {
    if (!backloggdUsername) {
      setError('Please enter your Backloggd username.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setProgress(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/backloggd?username=${encodeURIComponent(backloggdUsername)}&stream=true`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to export data.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let csvData = '';

      if (!reader) {
        throw new Error('Failed to read response');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'progress') {
              setProgress({ page: data.page, total: data.total });
            } else if (data.type === 'complete') {
              csvData = data.csv;
              setProgress({ page: 0, total: data.total });
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }

      if (!csvData) {
        throw new Error('No data received');
      }

      // Download the CSV
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${backloggdUsername}_games.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Show success message and close dialog
      const totalGames = progress?.total || 0;
      setSuccessMessage(`Successfully exported ${totalGames} games from Backloggd!`);
      setDialogOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  const handleSteamExport = async () => {
    if (!steamId) {
      setSteamError('Please enter your Steam ID.');
      return;
    }
    setSteamLoading(true);
    setSteamError(null);
    setSteamProgress(null);

    try {
      const response = await fetch(`/api/steam?steamId=${encodeURIComponent(steamId)}&stream=true`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to export data.');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let csvData = '';
      let totalGames = 0;

      if (!reader) {
        throw new Error('Failed to read response');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'progress') {
              setSteamProgress(data.message);
            } else if (data.type === 'complete') {
              csvData = data.csv;
              totalGames = data.total;
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }

      if (!csvData) {
        throw new Error('No data received');
      }

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `steam_${steamId}_games.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage(`Successfully exported ${totalGames} games from Steam!`);
      setSteamDialogOpen(false);
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e: any) {
      setSteamError(e.message);
    } finally {
      setSteamLoading(false);
      setSteamProgress(null);
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
          
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Dialog open={steamDialogOpen} onOpenChange={setSteamDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">From Steam</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Exporting from Steam</DialogTitle>
                  <DialogDescription>
                    Enter your public Steam ID (64-bit) to download your played games CSV.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Your Steam ID (e.g., 76561198012345678)"
                    value={steamId}
                    onChange={(e) => setSteamId(e.target.value)}
                    disabled={steamLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your Steam profile and game details must be set to public. Find your Steam ID at <a href="https://steamid.io" target="_blank" rel="noopener noreferrer" className="text-accent underline">steamid.io</a>.
                  </p>
                  <Button onClick={handleSteamExport} disabled={steamLoading} className="w-full">
                    {steamLoading ? 'Exporting...' : 'Export CSV'}
                  </Button>
                  {steamProgress && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{steamProgress}</p>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div className="w-full h-full bg-primary animate-pulse" />
                      </div>
                    </div>
                  )}
                  {steamError && <p className="text-sm text-red-500">{steamError}</p>}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                  {progress && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {progress.page > 0 
                          ? `Fetching page ${progress.page}... (${progress.total} games found)`
                          : `Complete! Downloaded ${progress.total} games.`
                        }
                      </p>
                      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-primary h-full transition-all duration-300 ease-out"
                          style={{ width: progress.page > 0 ? '100%' : '100%' }}
                        >
                          <div className="w-full h-full bg-primary animate-pulse" />
                        </div>
                      </div>
                    </div>
                  )}
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
            
            <Link href="/manual">
              <Button variant="outline" size="sm">Manual</Button>
            </Link>
          </div>

          {successMessage && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
              {successMessage}
            </div>
          )}
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
                <p className="text-base font-body text-muted-foreground">We analyze your year, creating a unique story and stats.</p>
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

          <div className="mt-24 w-full text-left max-w-4xl">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-2">
                <AccordionTrigger className="font-headline text-xl">How We Use Your Data</AccordionTrigger>
                <AccordionContent className="text-base text-xl font-body text-muted-foreground space-y-4 pt-4">
                  <p>Your privacy is paramount. Here&apos;s the deal:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>The CSV data you upload is sent to our server for processing and is NOT stored long-term.</li>
                    <li>We use the data *only* to generate your personalized Game Wrapped. It is not used for any other purpose, sold, or shared with third parties.</li>
                    <li>The AI model that processes your data is prohibited from training on it.</li>
                    <li>Your generated Wrapped is accessible via a unique, shareable link, but the underlying data is discarded after your session.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="font-headline text-xl">Terms of Service</AccordionTrigger>
                <AccordionContent className="text-base text-xl font-body text-muted-foreground space-y-4 pt-4">
                  <p>By using Gaming Wrapped, you agree to the following terms:</p>
                   <ul className="list-disc pl-6 space-y-2">
                    <li>This service is provided &quot;as is&quot; for entertainment purposes. We make no guarantees about the accuracy or availability of the service.</li>
                    <li>You are responsible for the data you upload. Ensure you have the right to use and share it. Do not upload sensitive personal information.</li>
                    <li>We reserve the right to modify or discontinue the service at any time.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
    </div>
  );
}
