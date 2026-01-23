"use client";

import { Logo } from '@/components/logo';
import { UploadForm } from '@/components/upload-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, GanttChartSquare, Share2, Import, Upload, Gamepad2, Coins } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { cn } from '@/lib/utils';

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

      const exportedFile = new File([csvData], `${username}_games.csv`, { type: 'text/csv' });
      setFile(exportedFile);

      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${username}_games.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      const totalGames = progress?.total || 0;
      setSuccessMessage(`Successfully exported ${totalGames} games from Backloggd!`);
      setDialogOpen(false);

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

      const exportedFile = new File([csvData], `steam_${id}_games.csv`, { type: 'text/csv' });
      setFile(exportedFile);

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
    <div className="relative min-h-screen w-full overflow-hidden bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Retro Overlays */}
      <div className="absolute inset-0 bg-grid-white-0-05 z-0 pointer-events-none" />
      <div className="absolute inset-0 scanline z-50 pointer-events-none" />
      <div className="absolute inset-0 crt-overlay z-40 pointer-events-none" />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] z-10" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8 pt-16 sm:pt-20 relative z-20 min-h-screen overflow-y-auto">
        <div className="absolute top-8 right-8 z-50">
          <ModeToggle />
        </div>

        <div className="container max-w-5xl flex flex-col items-center text-center z-10">
          
          {/* Hero Section */}
          <div className="mb-12 relative group">
            <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full opacity-50 animate-pulse-slow group-hover:opacity-80 transition-opacity" />
            <Logo className="text-5xl md:text-7xl mb-4 text-neon animate-flicker relative z-10" />
            <div className="mt-6 inline-block bg-black/80 border border-primary/50 px-4 py-2 rounded-sm backdrop-blur-sm">
              <p className="text-xl md:text-2xl text-primary font-body tracking-widest typing-effect">
                &gt; INITIALIZE_YEAR_REVIEW.EXE_
                <span className="animate-pulse">_</span>
              </p>
            </div>
          </div>

          <div className="w-full max-w-4xl space-y-12">
            
            {/* Input Selection "Arcade Menu" */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-sm" />
              <div className="bg-card/90 border-4 border-primary/30 pixel-corners p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
                 {/* Decorative Corner Screws */}
                <div className="absolute top-2 left-2 w-2 h-2 bg-muted-foreground/30 rounded-full" />
                <div className="absolute top-2 right-2 w-2 h-2 bg-muted-foreground/30 rounded-full" />
                <div className="absolute bottom-2 left-2 w-2 h-2 bg-muted-foreground/30 rounded-full" />
                <div className="absolute bottom-2 right-2 w-2 h-2 bg-muted-foreground/30 rounded-full" />
                
                <h2 className="text-2xl font-headline text-center mb-8 text-foreground tracking-widest uppercase">
                  <span className="text-primary mr-2">▼</span> Select Data Source <span className="text-primary ml-2">▼</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                  
                  {/* Steam Option */}
                  <Dialog open={steamDialogOpen} onOpenChange={setSteamDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="group relative h-full min-h-[160px] bg-black/40 border-2 border-border hover:border-accent transition-all duration-300 p-6 flex flex-col items-center justify-center gap-4 pixel-corners hover:-translate-y-1 hover:shadow-[0_0_20px_oklch(var(--accent)/0.3)]">
                        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center border border-accent/30 group-hover:scale-110 transition-transform duration-300">
                          <Import className="w-8 h-8 text-accent" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-headline text-xl text-foreground group-hover:text-accent transition-colors">STEAM</h3>
                          <p className="font-body text-lg text-muted-foreground mt-1">Public Profile Import</p>
                        </div>
                        <div className="absolute bottom-2 w-12 h-1 bg-border group-hover:bg-accent transition-colors" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="pixel-corners border-4 border-primary bg-black/95">
                      <DialogHeader>
                        <DialogTitle className="font-headline text-xl text-primary tracking-wider">CONNECT TO STEAM</DialogTitle>
                        <DialogDescription className="font-body text-lg text-muted-foreground">
                          Enter 64-bit ID or Profile URL.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 pt-4">
                        <input
                          placeholder="STEAM_ID_OR_URL..."
                          value={steamId}
                          onChange={(e) => setSteamId(e.target.value)}
                          disabled={steamLoading}
                          className="terminal-input w-full"
                        />
                        <p className="text-sm font-body text-muted-foreground">
                          * Profile must be PUBLIC.<br/>
                          * Find ID at <a href="https://steamid.io" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">steamid.io</a>.
                        </p>
                        <Button 
                          onClick={handleSteamExport} 
                          disabled={steamLoading} 
                          className="arcade-button w-full h-14 text-xl"
                        >
                          {steamLoading ? 'SCANNING...' : 'INSERT COIN'}
                        </Button>
                        {steamProgress && (
                          <div className="space-y-2 font-body text-accent">
                            <p className="animate-pulse">{'>'} {steamProgress}</p>
                            <div className="w-full bg-primary/20 h-2 pixel-corners overflow-hidden">
                              <div className="w-full h-full bg-primary animate-progress-indeterminate" />
                            </div>
                          </div>
                        )}
                        {steamError && <p className="font-body text-red-500 bg-red-950/30 p-2 border border-red-900">{'>'} ERROR: {steamError}</p>}
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Backloggd Option */}
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <button className="group relative h-full min-h-[160px] bg-black/40 border-2 border-border hover:border-primary transition-all duration-300 p-6 flex flex-col items-center justify-center gap-4 pixel-corners hover:-translate-y-1 hover:shadow-[0_0_20px_oklch(var(--primary)/0.3)]">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform duration-300">
                          <GanttChartSquare className="w-8 h-8 text-primary" />
                        </div>
                        <div className="text-center">
                          <h3 className="font-headline text-xl text-foreground group-hover:text-primary transition-colors">BACKLOGGD</h3>
                          <p className="font-body text-lg text-muted-foreground mt-1">Username Import</p>
                        </div>
                        <div className="absolute bottom-2 w-12 h-1 bg-border group-hover:bg-primary transition-colors" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="pixel-corners border-4 border-primary bg-black/95">
                      <DialogHeader>
                        <DialogTitle className="font-headline text-xl text-primary tracking-wider">CONNECT BACKLOGGD</DialogTitle>
                        <DialogDescription className="font-body text-lg text-muted-foreground">
                          Enter your username to fetch data.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6 pt-4">
                        <input
                          placeholder="USERNAME..."
                          value={backloggdUsername}
                          onChange={(e) => setBackloggdUsername(e.target.value)}
                          disabled={isLoading}
                          className="terminal-input w-full"
                        />
                        <Button 
                          onClick={handleBackloggdExport} 
                          disabled={isLoading} 
                          className="arcade-button w-full h-14 text-xl"
                        >
                          {isLoading ? 'LOADING...' : 'PRESS START'}
                        </Button>
                        {progress && (
                          <div className="space-y-2 font-body text-primary">
                            <p className="animate-pulse">{'>'} {progress.page > 0 ? `READING SECTOR ${progress.page}...` : 'DATA ACQUIRED.'}</p>
                            <div className="w-full bg-primary/20 h-2 pixel-corners overflow-hidden">
                              <div className="w-full h-full bg-primary animate-progress-indeterminate" />
                            </div>
                          </div>
                        )}
                        {error && <p className="font-body text-red-500 bg-red-950/30 p-2 border border-red-900">{'>'} ERROR: {error}</p>}
                      </div>
                    </DialogContent>
                  </Dialog>

                </div>

                {/* Manual Upload Divider */}
                <div className="relative my-10 flex items-center gap-4">
                   <div className="h-px bg-border flex-1" />
                   <div className="w-3 h-3 bg-primary rotate-45" />
                   <span className="font-headline text-sm text-muted-foreground tracking-widest">MANUAL OVERRIDE</span>
                   <div className="w-3 h-3 bg-primary rotate-45" />
                   <div className="h-px bg-border flex-1" />
                </div>

                {/* Upload Card */}
                <Card className={cn(
                  "w-full bg-black/40 backdrop-blur-sm transition-all duration-500 pixel-corners border-2",
                  file ? "shadow-[0_0_30px_oklch(var(--accent)/0.2)] border-accent" : "border-border shadow-lg"
                )}>
                  <CardHeader className="text-center pb-2 border-b border-border/50 bg-black/20">
                    <CardTitle className={cn(
                      "font-headline text-xl tracking-widest transition-colors duration-500 flex items-center justify-center gap-3",
                      file ? "text-accent animate-pulse" : "text-foreground"
                    )}>
                      {file ? <><Coins className="w-6 h-6" /> READY PLAYER ONE</> : 'UPLOAD SAVE FILE'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <UploadForm file={file} onFileChange={setFile} />
                  </CardContent>
                </Card>

                {/* Footer Links */}
                <div className="flex flex-wrap justify-center gap-4 mt-8 font-body text-lg">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-primary hover:underline underline-offset-4 decoration-2 decoration-primary/50 transition-all uppercase tracking-wide">
                        [ HLTB EXPORT ]
                      </button>
                    </DialogTrigger>
                    <DialogContent className="pixel-corners border-4 border-border font-body">
                      <DialogHeader>
                         <DialogTitle className="font-headline text-xl">HLTB EXTRACTION GUIDE</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 text-xl">
                        <p>1. ACCESS <a href="https://howlongtobeat.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">howlongtobeat.com</a>.</p>
                        <p>2. NAVIGATE TO PROFILE.</p>
                        <p>3. SELECT &apos;OPTIONS&apos; -&gt; &apos;EXPORT GAME LIST&apos;.</p>
                        <p>4. UPLOAD .CSV FILE.</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <span className="text-border">|</span>

                  <Link href="/manual" className="text-muted-foreground hover:text-accent hover:underline underline-offset-4 decoration-2 decoration-accent/50 transition-all uppercase tracking-wide">
                    [ CREATE MANUALLY ]
                  </Link>

                  <span className="text-border">|</span>

                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-muted-foreground hover:text-primary hover:underline underline-offset-4 decoration-2 decoration-primary/50 transition-all uppercase tracking-wide">
                        [ OTHER SYSTEMS ]
                      </button>
                    </DialogTrigger>
                    <DialogContent className="pixel-corners border-4 border-border font-body">
                       <DialogHeader>
                         <DialogTitle className="font-headline text-xl">UNIVERSAL PARSER</DialogTitle>
                      </DialogHeader>
                      <p className="text-xl">
                        REQUIRED: .CSV file with &quot;Title&quot; column.<br/>
                        OPTIONAL: &quot;Rating&quot; (number), &quot;Platform&quot; (text), &quot;PlaytimeMinutes&quot; (number).
                      </p>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>

          {successMessage && (
            <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-300">
               <div className="bg-green-950/90 border-2 border-green-500 p-4 pixel-corners shadow-[0_0_20px_rgba(0,255,0,0.3)] flex items-center gap-3">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                 <p className="font-headline text-green-400 text-sm tracking-wide">{successMessage}</p>
               </div>
            </div>
          )}

          {/* How It Works - "Mission Briefing" */}
          <div className="mt-32 w-full max-w-6xl">
             <div className="flex items-center gap-4 mb-16 justify-center">
                <div className="h-1 bg-gradient-to-r from-transparent to-primary w-24 md:w-48 opacity-50" />
                <h2 className="text-3xl md:text-4xl font-headline text-center text-primary text-neon tracking-widest uppercase">
                  MISSION BRIEFING
                </h2>
                <div className="h-1 bg-gradient-to-l from-transparent to-primary w-24 md:w-48 opacity-50" />
             </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-border -z-10 border-t-2 border-dashed border-muted-foreground/30" />

              <div className="group relative">
                <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="bg-card border-4 border-border p-8 flex flex-col items-center text-center gap-6 pixel-corners shadow-xl relative z-10 h-full hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex items-center justify-center h-20 w-20 bg-black border-2 border-primary shadow-[0_0_15px_oklch(var(--primary)/0.4)] pixel-corners rotate-3 group-hover:rotate-0 transition-all duration-300">
                    <Import className="h-10 w-10 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-headline text-xl mb-3 text-foreground">1. INSERT DATA</h3>
                    <p className="font-body text-xl text-muted-foreground leading-relaxed">
                      Link your profiles to initialize the data extraction sequence.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-accent/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="bg-card border-4 border-border p-8 flex flex-col items-center text-center gap-6 pixel-corners shadow-xl relative z-10 h-full hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex items-center justify-center h-20 w-20 bg-black border-2 border-accent shadow-[0_0_15px_oklch(var(--accent)/0.4)] pixel-corners -rotate-2 group-hover:rotate-0 transition-all duration-300">
                    <GanttChartSquare className="h-10 w-10 text-accent animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="font-headline text-xl mb-3 text-foreground">2. PROCESS</h3>
                    <p className="font-body text-xl text-muted-foreground leading-relaxed">
                      Mainframe analyzes playstyle patterns and calculates high scores.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-secondary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="bg-card border-4 border-border p-8 flex flex-col items-center text-center gap-6 pixel-corners shadow-xl relative z-10 h-full hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex items-center justify-center h-20 w-20 bg-black border-2 border-secondary shadow-[0_0_15px_oklch(var(--secondary)/0.4)] pixel-corners rotate-1 group-hover:rotate-0 transition-all duration-300">
                    <Share2 className="h-10 w-10 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-headline text-xl mb-3 text-foreground">3. VICTORY</h3>
                    <p className="font-body text-xl text-muted-foreground leading-relaxed">
                      Unlock your Year-End Summary badge and share with the squad.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-32 w-full text-left max-w-4xl pb-20">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-privacy-terms" className="border-b-4 border-border">
                <AccordionTrigger className="font-headline text-xl hover:text-primary transition-colors hover:no-underline py-6">
                  [ DATA_PRIVACY_PROTOCOLS ]
                </AccordionTrigger>
                <AccordionContent className="text-xl font-body text-muted-foreground space-y-4 pt-4 pb-8 pl-4 border-l-2 border-primary/30">
                  <p>{'>'} User data is processed in volatile memory only.</p>
                  <p>{'>'} No raw CSVs are permanently stored on the mainframe.</p>
                  <p>{'>'} Generated &quot;Wrapped&quot; artifacts are cached for sharing capability.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
    </div>
  );
}
