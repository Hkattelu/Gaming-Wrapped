"use client";

import { Logo } from '@/components/logo';
import { UploadForm } from '@/components/upload-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, GanttChartSquare, Share2, Play, Import, Upload, Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [backloggdUsername, setBackloggdUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ page: number; total: number } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [steamId, setSteamId] = useState('');
  const [steamLoading, setSteamLoading] = useState(false);
  const [steamError, setSteamError] = useState<string | null>(null);
  const [steamDialogOpen, setSteamDialogOpen] = useState(false);
  const [steamProgress, setSteamProgress] = useState<string | null>(null);

  const handleBackloggdExport = async () => {
    let username = backloggdUsername.trim();
    if (username.includes('backloggd.com/u/')) {
      const match = username.match(/backloggd\.com\/u\/([^/]+)/);
      if (match) username = match[1];
    }

    if (!username) {
      setError('Please enter your Backloggd username or profile URL.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setProgress(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/backloggd?username=${encodeURIComponent(username)}&stream=true`);
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

      // Create a File object and set it to the state
      const exportedFile = new File([csvData], `${username}_games.csv`, { type: 'text/csv' });
      setFile(exportedFile);

      // Also trigger a download for the user's records
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${username}_games.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Show success message and close dialog
      const totalGames = progress?.total || 0;
      setSuccessMessage(`Successfully exported ${totalGames} games from Backloggd!`);
      setDialogOpen(false);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  const handleSteamExport = async () => {
    let id = steamId.trim();
    if (id.includes('steamcommunity.com/profiles/')) {
      const match = id.match(/steamcommunity\.com\/profiles\/(\d+)/);
      if (match) id = match[1];
    }

    if (!id) {
      setSteamError('Please enter your Steam ID or profile URL.');
      return;
    }
    setSteamLoading(true);
    setSteamError(null);
    setSteamProgress(null);

    try {
      const response = await fetch(`/api/steam?steamId=${encodeURIComponent(id)}&stream=true`);
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

      // Create a File object and set it to the state
      const exportedFile = new File([csvData], `steam_${id}_games.csv`, { type: 'text/csv' });
      setFile(exportedFile);

      // Also trigger a download
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `steam_${id}_games.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setSuccessMessage(`Successfully exported ${totalGames} games from Steam!`);
      setSteamDialogOpen(false);

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e: any) {
      setSteamError(e.message);
    } finally {
      setSteamLoading(false);
      setSteamProgress(null);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-grid-white-0-05 z-0" />
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8 pt-16 sm:pt-20 relative z-10 min-h-screen overflow-y-auto">
        <div className="absolute top-16 right-4 z-50 md:top-20">
          <ModeToggle />
        </div>
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="container max-w-4xl flex flex-col items-center text-center z-10">
          <Logo className="text-5xl md:text-6xl mb-2" />
          <p className="mt-4 mb-4 text-xl text-muted-foreground max-w-2xl font-body tracking-wider">
            Your gaming year, wrapped. Connect your accounts or upload your history to get a personalized story.
          </p>

          <div className="w-full max-w-lg space-y-8">
            {/* Auto Import Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 w-full">
                <div className="h-px bg-border flex-1" />
                <span className="text-sm font-headline tracking-widest text-muted-foreground uppercase">Connect Your Profile</span>
                <div className="h-px bg-border flex-1" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Dialog open={steamDialogOpen} onOpenChange={setSteamDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg" className="h-auto py-4 flex flex-col gap-1 border-2 hover:border-accent hover:bg-accent/5">
                      <Import className="dark:text-primary-foreground h-6 w-6 mb-1" />
                      <span className="dark:text-primary-foreground font-headline tracking-wider">Steam</span>
                      <span className="text-xs text-muted-foreground font-normal">Public Profile</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Connect Steam Profile</DialogTitle>
                      <DialogDescription className="text-base">
                        Enter your public Steam ID (64-bit) or profile URL to import your games.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Steam ID or Profile URL"
                        value={steamId}
                        onChange={(e) => setSteamId(e.target.value)}
                        disabled={steamLoading}
                        className="text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your Steam profile and game details must be set to public. Find your Steam ID at <a href="https://steamid.io" target="_blank" rel="noopener noreferrer" className="text-accent underline">steamid.io</a>.
                      </p>
                      <Button onClick={handleSteamExport} disabled={steamLoading} className="w-full text-base py-6">
                        {steamLoading ? 'Importing...' : 'Import Games'}
                      </Button>
                      {steamProgress && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">{steamProgress}</p>
                          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
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
                    <Button variant="outline" size="lg" className="h-auto py-4 flex flex-col gap-1 border-2 hover:border-accent hover:bg-accent/5">
                      <Import className="dark:text-primary-foreground h-6 w-6 mb-1" />
                      <span className="dark:text-primary-foreground font-headline tracking-wider">Backloggd</span>
                      <span className="text-xs text-muted-foreground font-normal">Username</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Connect Backloggd Profile</DialogTitle>
                      <DialogDescription className="text-base">
                        Enter your Backloggd username to import your played games.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Backloggd Username"
                        value={backloggdUsername}
                        onChange={(e) => setBackloggdUsername(e.target.value)}
                        disabled={isLoading}
                        className="text-base"
                      />
                      <Button onClick={handleBackloggdExport} disabled={isLoading} className="w-full text-base py-6">
                        {isLoading ? 'Importing...' : 'Import Games'}
                      </Button>
                      {progress && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {progress.page > 0
                              ? `Fetching page ${progress.page}... (${progress.total} games found)`
                              : `Complete! Downloaded ${progress.total} games.`
                            }
                          </p>
                          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                            <div className="w-full h-full bg-primary animate-pulse" />
                          </div>
                        </div>
                      )}
                      {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Manual Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 w-full">
                <div className="h-px bg-border flex-1" />
                <span className="text-sm font-headline tracking-widest text-muted-foreground uppercase">Or Upload File</span>
                <div className="h-px bg-border flex-1" />
              </div>

              <Card className={`w-full bg-card/80 backdrop-blur-sm shadow-lg border-2 transition-all duration-500 ${file ? 'shadow-accent/40 border-accent' : 'shadow-primary/20 border-primary/20'}`}>
                <CardHeader className="text-center pb-2">
                  <CardTitle className={`font-headline text-xl tracking-widest transition-colors duration-500 ${file ? 'text-accent' : 'text-foreground'}`}>
                    {file ? 'DATA RECEIVED!' : 'UPLOAD CSV'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UploadForm file={file} onFileChange={setFile} />
                </CardContent>
              </Card>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground border-2 pixel-corners hover:border-accent hover:bg-accent/5">HOWLONGTOBEAT?</Button>
                  </DialogTrigger>
                  <DialogContent className="pixel-corners border-4 border-border">
                    <DialogHeader>
                      <DialogTitle className="font-headline text-lg">EXPORT FROM HLTB</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-base font-body">
                      <p>1. Log in to <a href="https://howlongtobeat.com" target="_blank" rel="noopener noreferrer" className="text-accent underline">howlongtobeat.com</a>.</p>
                      <p>2. Go to your Profile page.</p>
                      <p>3. Click &apos;Options&apos; -&gt; &apos;Export Game List&apos;.</p>
                      <p>4. Upload the downloaded CSV here.</p>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Link href="/manual">
                  <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground border-2 pixel-corners hover:border-accent hover:bg-accent/5 uppercase">Create Manually</Button>
                </Link>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground border-2 pixel-corners hover:border-accent hover:bg-accent/5 uppercase">Other Platforms</Button>
                  </DialogTrigger>
                  <DialogContent className="pixel-corners border-4 border-border">
                    <DialogHeader>
                      <DialogTitle className="font-headline text-lg uppercase">Other Platforms</DialogTitle>
                    </DialogHeader>
                    <p className="text-base font-body">
                      To import from other sources, create a CSV file with at least a &quot;Title&quot; column. Optional columns: &quot;Rating&quot; (number), &quot;Platform&quot; (text), &quot;PlaytimeMinutes&quot; (number).
                    </p>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {successMessage && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
              {successMessage}
            </div>
          )}

          <div className="mt-20 w-full">
            <h2 className="text-2xl font-headline font-semibold tracking-widest mb-12 uppercase drop-shadow-[2px_2px_0px_rgba(255,46,80,0.3)]">HOW IT WORKS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="relative group">
                <div className="relative bg-card border-4 border-border p-6 flex flex-col items-center text-center gap-4 hover:border-accent transition-all pixel-corners shadow-xl hover:-translate-y-1">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary border-2 border-primary/20 group-hover:scale-110 transition-transform">
                    <Import className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold font-headline text-lg tracking-wider uppercase">1. CONNECT</h3>
                  <p className="text-sm font-body text-muted-foreground leading-relaxed">Securely link your Steam or Backloggd profile to auto-import your library.</p>
                </div>
                <div className="absolute -bottom-2 left-2 right-[-4px] h-full w-full bg-foreground/5 dark:bg-black/40 -z-10 transform translate-y-1 pixel-corners" />
              </div>

              <div className="relative group">
                <div className="relative bg-card border-4 border-border p-6 flex flex-col items-center text-center gap-4 hover:border-accent transition-all pixel-corners shadow-xl hover:-translate-y-1">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary border-2 border-primary/20 group-hover:scale-110 transition-transform">
                    <GanttChartSquare className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold font-headline text-lg tracking-wider uppercase">2. ANALYZE</h3>
                  <p className="text-sm font-body text-muted-foreground leading-relaxed">Our AI decodes your playstyle, scores, and habits to craft your unique story.</p>
                </div>
                <div className="absolute -bottom-2 left-2 right-[-4px] h-full w-full bg-foreground/5 dark:bg-black/40 -z-10 transform translate-y-1 pixel-corners" />
              </div>

              <div className="relative group">
                <div className="relative bg-card border-4 border-border p-6 flex flex-col items-center text-center gap-4 hover:border-accent transition-all pixel-corners shadow-xl hover:-translate-y-1">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary border-2 border-primary/20 group-hover:scale-110 transition-transform">
                    <Share2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold font-headline text-lg tracking-wider uppercase">3. SHARE</h3>
                  <p className="text-sm font-body text-muted-foreground leading-relaxed">Download your high-res persona cards and show off your year in gaming.</p>
                </div>
                <div className="absolute -bottom-2 left-2 right-[-4px] h-full w-full bg-foreground/5 dark:bg-black/40 -z-10 transform translate-y-1 pixel-corners" />
              </div>
            </div>
          </div>

          <div className="mt-24 w-full text-left max-w-4xl pb-20">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-privacy-terms" className="border-b-2 border-border/50">
                <AccordionTrigger className="font-headline text-lg">What about my data?</AccordionTrigger>
                <AccordionContent className="text-base font-body text-muted-foreground space-y-4 pt-4">
                  <p>We only use your uploaded data to generate your Wrapped experience. It is processed in memory. We store the final generated "Wrapped" data (stats, cards) so it can be shared via a link, but we do not store your raw CSV or profile data permanently.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
    </div>
  );
}
