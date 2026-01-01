
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ManualGame } from '@/types';
import { generateWrappedDataFromManual } from '@/app/actions';
import { AlertTriangle, ArrowLeft, Dices, Download, Gamepad, Gamepad2, Joystick, Loader2, PcCase, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Represents a game selected by the user, before detailed info is added
interface SelectedGame {
  title: string;
}

// Helper to convert ManualGame[] to CSV string for download
function gamesToCsvForDownload(games: ManualGame[]): string {
    const header = "Title,Platform,Review Score,Review Notes\n";
    const rows = games.map(game => {
        const title = `"${game.title.replace(/\"/g, '""')}"`;
        const platform = `"${game.platform.replace(/\"/g, '""')}"`;
        const score = game.score;
        const reviewNotes = game.notes && game.notes.trim().length > 0 ? game.notes : game.status;
        const notes = `"${reviewNotes.replace(/\"/g, '""')}"`;
        return `${title},${platform},${score},${notes}`;
    });
    return header + rows.join('\n');
}


// Reusable allowlist validator for IGDB image URLs used in this file.
// Accept only https URLs to images.igdb.com with pathname starting with /igdb/image/upload/
function safeIgdbImageUrl(raw: unknown): string | null {
  try {
    if (typeof raw !== 'string') return null;
    const u = new URL(raw);
    if (u.protocol === 'https:' && u.hostname === 'images.igdb.com' && u.pathname.startsWith('/igdb/image/upload/')) {
      return u.toString();
    }
  } catch {
    // ignore parse errors
  }
  return null;
}


export default function ManualEntryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<SelectedGame | null>(null);
  const [gamesList, setGamesList] = useState<ManualGame[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Autosuggest state
  const [allGames, setAllGames] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // IGDB cover thumbnails for added items (by local id)
  const [coverUrlsById, setCoverUrlsById] = useState<Record<string, string | null>>({});
  // Quick-picks for current year (from IGDB, best-effort)
  const [topThisYear, setTopThisYear] = useState<Array<{ title: string; imageUrl: string | null }>>([]);
  const [picksError, setPicksError] = useState<string | null>(null);
  // Mounted guard to avoid setState after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  const router = useRouter();
  const { toast } = useToast();

  // Load games list from public/games.json for autosuggest
  // Gracefully handle absence or errors
  // We only load once on mount
  useEffect(() => {
    async function loadGames() {
      try {
        const res = await fetch('/games.json', { cache: 'force-cache' });
        if (!res.ok) return;
        const data: string[] = await res.json();
        if (Array.isArray(data)) {
          setAllGames(data);
        }
      } catch (e) {
        // ignore
      }
    }
    loadGames();
  }, []);

  // Load quick-pick suggestions once per session (best-effort)
  useEffect(() => {
    const year = new Date().getUTCFullYear();
    const cacheKey = `gw:top-this-year:${year}`;

    const sanitizeImageUrl = (url: string | null): string | null => {
      if (!url) return null;
      try {
        const u = new URL(url);
        if (u.protocol === 'https:' && u.hostname === 'images.igdb.com' && u.pathname.startsWith('/igdb/image/upload/')) {
          return u.toString();
        }
      } catch {}
      return null;
    };
    const normalizeSuggestions = (arr: any[]) =>
      arr
        .map((s: any) => ({
          title: String(s?.title || ''),
          imageUrl: sanitizeImageUrl(typeof s?.imageUrl === 'string' ? s.imageUrl : null),
        }))
        .filter((x: any) => x.title)
        .slice(0, 8);

    // Try session cache first to avoid refreshes during the session
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const safe = normalizeSuggestions(parsed);
          if (safe.length > 0) {
            setTopThisYear(safe);
            return; // no network needed
          }
          // if normalization results in empty list, fall through to network
        }
      }
    } catch {
      // ignore cache errors and fall back to network
    }

    const ac = new AbortController();
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/igdb/top-this-year', { cache: 'no-store', signal: ac.signal });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (mounted && Array.isArray(data?.suggestions)) {
          // Client-side host allowlist for images (defense in depth)
          const safe = normalizeSuggestions(data.suggestions);
          setTopThisYear(safe);
          // Persist for the session to avoid refreshes
          try { sessionStorage.setItem(cacheKey, JSON.stringify(safe)); } catch {}
        }
      } catch (err: any) {
        if (mounted && !ac.signal.aborted) {
          setPicksError('Top picks unavailable right now.');
        }
      }
    })();

    return () => {
      mounted = false;
      ac.abort();
    };
  }, []);

  // Update suggestions when query changes
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || allGames.length === 0) {
      setSuggestions([]);
      return;
    }
    const next = allGames
      .filter(name => name && name.toLowerCase().startsWith(q))
      .slice(0, 5);
    setSuggestions(next);
    setHighlightedIndex(next.length > 0 ? 0 : -1);
  }, [searchQuery, allGames]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length < 2) {
      toast({ title: "Please enter a game title.", variant: 'destructive' });
      return;
    }
    setSelectedGame({ title: searchQuery });
    setIsDialogOpen(true);
  };
  
  const handleAddGame = (gameDetails: Omit<ManualGame, 'id'>) => {
    const newGame: ManualGame = {
      id: Date.now().toString(),
      ...gameDetails,
    };
    setGamesList(prev => [...prev, newGame]);
    setSearchQuery('');
    setSelectedGame(null);
    setIsDialogOpen(false);
    toast({
      title: `${newGame.title} added!`,
      description: "Ready for the next one.",
    });

    // Best-effort: fetch IGDB cover thumbnail in the background
    const currentId = newGame.id;
    (async () => {
      try {
        const res = await fetch('/api/igdb/cover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newGame.title }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        const rawUrl = typeof data?.imageUrl === 'string' ? data.imageUrl : null;
        const safeUrl: string | null = safeIgdbImageUrl(rawUrl);
        if (isMountedRef.current) {
          setCoverUrlsById(prev => ({ ...prev, [currentId]: safeUrl }));
        }
      } catch {
        if (isMountedRef.current) {
          setCoverUrlsById(prev => ({ ...prev, [currentId]: null }));
        }
      }
    })();
  };

  const handleRemoveGame = (id: string) => {
    setGamesList(prev => prev.filter(game => game.id !== id));
    setCoverUrlsById(prev => {
      const next = { ...prev } as Record<string, string | null>;
      delete next[id];
      return next;
    });
  };
  
  const handleGenerate = async () => {
     if (gamesList.length === 0) {
      toast({ title: "Please add at least one game.", variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      // Generate on the server and get the story identifier (id)
      const { id } = await generateWrappedDataFromManual(gamesList);
      // Clear any legacy cache key and persist id as string for refresh/back-forward scenarios
      sessionStorage.removeItem('wrappedData');
      sessionStorage.setItem('wrappedId', String(id));
      // Use replace so Back returns to the manual page instead of an intermediate state
      router.replace(`/wrapped?id=${id}`);
    } catch (error: any)
{
      toast({
        title: 'ERROR GENERATING REWIND',
        description: error.message || 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    if (gamesList.length === 0) {
        toast({ title: "No games to download.", variant: 'destructive' });
        return;
    }
    const csvContent = gamesToCsvForDownload(gamesList);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "my-game-rewind.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    toast({ title: "CSV downloaded!" });
  }

  return (
    <div className="relative min-h-screen w-full overflow-y-auto">
      <div className="absolute inset-0 bg-grid-white-0-05 z-0" />
      <main className="flex flex-col items-center justify-start p-4 sm:p-8 relative z-10 min-h-screen">
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        
        <div className="container max-w-4xl w-full flex flex-col items-center text-center z-10">
          <div className="w-full flex justify-start">
             <Button asChild variant="ghost">
                <Link href="/"><ArrowLeft className="mr-2"/> Back to Home</Link>
             </Button>
          </div>
          <Logo className="text-4xl" />
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl font-body tracking-wider">
            No CSV? No problem. Add your games manually.
          </p>

          {/* Unsaved list warning */}
          <div className="w-full max-w-lg mt-4 text-left">
            <Alert className="bg-amber-500/10 border-amber-500/30 pixel-corners">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="font-headline tracking-wider">Heads up</AlertTitle>
              <AlertDescription>
                This list isn&apos;t saved. If you exit this page, your added games will be lost.
              </AlertDescription>
            </Alert>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            {/* Quick-picks */}
            <div className="w-full max-w-4xl mt-8">
              {topThisYear.length > 0 && (
                <div className="text-left">
                  <p className="text-sm font-headline tracking-widest text-muted-foreground uppercase mb-4">Top games this year</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {topThisYear.map((g, idx) => (
                      <button
                        key={`${g.title}-${idx}`}
                        type="button"
                        className="flex items-center gap-3 p-3 bg-muted/40 hover:bg-accent/10 border-2 border-transparent hover:border-accent transition-all pixel-corners group"
                        onClick={() => {
                          setSearchQuery(g.title);
                          setSelectedGame({ title: g.title });
                          setIsDialogOpen(true);
                        }}
                        aria-label={`Quick add ${g.title}`}
                      >
                        <div className="relative flex-shrink-0">
                          <Image
                            src={g.imageUrl || 'https://placehold.co/40x40.png'}
                            alt={g.title}
                            width={64}
                            height={64}
                            className="pixel-corners group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute inset-0 crt-overlay opacity-20 pointer-events-none" />
                        </div>
                        <span className="text-sm font-headline uppercase line-clamp-2 text-left leading-tight">{g.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {picksError && topThisYear.length === 0 && (
                <p className="text-sm text-muted-foreground text-left font-body">{picksError}</p>
              )}
            </div>

            <form onSubmit={handleSearchSubmit} className="w-full max-w-lg mt-10 relative">
              <Input
                ref={inputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (suggestions.length > 0) {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
                    } else if (e.key === 'Enter') {
                      // If we have a highlighted suggestion, select it and open dialog
                      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
                        e.preventDefault();
                        const choice = suggestions[highlightedIndex];
                        setSearchQuery(choice);
                        setSelectedGame({ title: choice });
                        setIsDialogOpen(true);
                      }
                    }
                  }
                }}
                placeholder="What did you play this year?"
                className="h-14 text-center text-xl font-body tracking-wider border-2 border-primary/20 focus:border-primary pixel-corners"
                aria-autocomplete="list"
                aria-expanded={suggestions.length > 0}
                aria-controls="game-suggestions"
              />
              {suggestions.length > 0 && (
                <ul id="game-suggestions" className="absolute left-0 right-0 mt-1 bg-popover border-2 border-border pixel-corners shadow-xl z-20 max-h-60 overflow-auto">
                  {suggestions.map((s, idx) => (
                    <li key={s}>
                      <button
                        type="button"
                        className={`w-full text-left px-4 py-3 font-headline text-xs hover:bg-primary hover:text-white transition-colors ${idx === highlightedIndex ? 'bg-primary text-white' : ''}`}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onClick={() => {
                          setSearchQuery(s);
                          setSelectedGame({ title: s });
                          setIsDialogOpen(true);
                        }}
                      >
                        {s.toUpperCase()}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
               <Button type="submit" size="lg" className="mt-4 w-full font-headline tracking-widest text-lg py-6 pixel-corners shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1 transition-all">
                <Plus className="mr-2"/> ADD TO LIST
               </Button>
            </form>
            
            {selectedGame && <AddGameDialog game={selectedGame} onAddGame={handleAddGame} />}

          </Dialog>

          <div className="w-full max-w-2xl mt-16">
            {gamesList.length > 0 ? (
              <Card className="bg-card/80 backdrop-blur-sm border-2 border-border shadow-lg pixel-corners">
                <CardHeader className="flex-row items-center justify-between border-b-2 border-dashed border-border pb-4">
                  <CardTitle className="font-headline tracking-widest text-lg">COLLECTION ({gamesList.length})</CardTitle>
                  <Button variant="outline" onClick={handleDownloadCsv} className="pixel-corners font-headline text-[10px] h-8">
                    <Download className="mr-2 h-3 w-3" />
                    EXPORT CSV
                  </Button>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-4">
                    {gamesList.map(game => (
                      <li key={game.id} className="flex items-center justify-between p-4 bg-muted/30 border border-border pixel-corners hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-4">
                           <div className="relative">
                             <Image 
                                src={coverUrlsById[game.id] || `https://placehold.co/40x40.png`} 
                                data-ai-hint="game boxart" 
                                alt={game.title} 
                                width={48} 
                                height={48} 
                                className="pixel-corners border border-foreground/10" 
                                onError={() => setCoverUrlsById(prev => ({ ...prev, [game.id]: null }))} 
                             />
                             <div className="absolute inset-0 crt-overlay opacity-10 pointer-events-none" />
                           </div>
                           <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-headline text-sm uppercase text-foreground">{game.title}</p>
                              {/* Platform badge */}
                              {game.platform === 'PC' && (
                                <Badge className="bg-cyan-600 text-white border-transparent text-[8px] h-4 pixel-corners">PC</Badge>
                              )}
                              {game.platform === 'PlayStation' && (
                                <Badge className="bg-blue-600 text-white border-transparent text-[8px] h-4 pixel-corners">PS</Badge>
                              )}
                              {game.platform === 'Xbox' && (
                                <Badge className="bg-green-600 text-white border-transparent text-[8px] h-4 pixel-corners">XBOX</Badge>
                              )}
                              {game.platform === 'Switch' && (
                                <Badge className="bg-red-600 text-white border-transparent text-[8px] h-4 pixel-corners">NSW</Badge>
                              )}
                            </div>
                            <p className="text-[10px] font-headline text-muted-foreground uppercase mt-1">Grade: {game.score}/10 — {game.status}</p>
                           </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveGame(game.id)} className="hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
                <div className="text-center text-muted-foreground font-headline text-sm p-12 border-4 border-dashed border-primary/10 pixel-corners bg-muted/5">
                    <p className="tracking-widest">YOUR COLLECTION IS EMPTY</p>
                    <p className="text-[10px] mt-2 opacity-50">SEARCH FOR A GAME ABOVE TO START YOUR STORY</p>
                </div>
            )}
          </div>
          
           {gamesList.length >= 3 && (
              <div className="mt-10 w-full max-w-lg z-20 pb-20">
                <Button
                  size="lg"
                  className="w-full font-headline tracking-widest text-lg h-auto py-6 pixel-corners bg-accent hover:bg-accent/90 shadow-[0_0_20px_rgba(255,46,80,0.4)] transition-all hover:-translate-y-1"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Dices className="mr-2 h-5 w-5"/>}
                    {"GENERATE MY WRAPPED STORY"}
                </Button>
              </div>
           )}

        </div>
      </main>
    </div>
  );
}

function AddGameDialog({ game, onAddGame }: { game: SelectedGame, onAddGame: (details: Omit<ManualGame, 'id'>) => void }) {
    const [status, setStatus] = useState('Finished');
    const [platform, setPlatform] = useState('PC');
    const [score, setScore] = useState(7); // Default to 7/10
    const [notes, setNotes] = useState('');
    
    const handleSave = () => {
        onAddGame({ title: game.title, platform, status, score: score.toString(), notes });
    }

    return (
        <DialogContent className="font-body border-4 border-border pixel-corners max-w-lg">
            <DialogHeader>
                 <DialogTitle className="font-headline tracking-wider text-2xl text-primary">{game.title.toUpperCase()}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
                <div>
                    <Label className="text-xs font-headline tracking-widest text-muted-foreground uppercase">Status</Label>
                    <ToggleGroup type="single" value={status} onValueChange={(v) => v && setStatus(v)} className="grid grid-cols-2 gap-2 mt-2">
                        <ToggleGroupItem value="Played It" className="text-xs font-headline h-12 pixel-corners border-2 data-[state=on]:bg-primary data-[state=on]:text-white">PLAYED IT</ToggleGroupItem>
                        <ToggleGroupItem value="Finished" className="text-xs font-headline h-12 pixel-corners border-2 data-[state=on]:bg-primary data-[state=on]:text-white">FINISHED IT</ToggleGroupItem>
                        <ToggleGroupItem value="Completed" className="text-xs font-headline h-12 pixel-corners border-2 data-[state=on]:bg-primary data-[state=on]:text-white">COMPLETED</ToggleGroupItem>
                        <ToggleGroupItem value="Dropped" className="text-xs font-headline h-12 pixel-corners border-2 data-[state=on]:bg-primary data-[state=on]:text-white">DROPPED IT</ToggleGroupItem>
                    </ToggleGroup>
                </div>

                 <div>
                    <Label className="text-xs font-headline tracking-widest text-muted-foreground uppercase">Platform</Label>
                     <ToggleGroup type="single" value={platform} onValueChange={(v) => v && setPlatform(v)} className="grid grid-cols-4 gap-2 mt-2">
                        <ToggleGroupItem value="PC" className="h-14 pixel-corners border-2 data-[state=on]:bg-cyan-600 data-[state=on]:text-white flex flex-col gap-1">
                          <PcCase className="h-4 w-4"/>
                          <span className="text-[8px] font-headline">PC</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="PlayStation" className="h-14 pixel-corners border-2 data-[state=on]:bg-blue-600 data-[state=on]:text-white flex flex-col gap-1">
                          <Joystick className="h-4 w-4"/>
                          <span className="text-[8px] font-headline">PS</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="Xbox" className="h-14 pixel-corners border-2 data-[state=on]:bg-green-600 data-[state=on]:text-white flex flex-col gap-1">
                          <Gamepad className="h-4 w-4"/>
                          <span className="text-[8px] font-headline">XBOX</span>
                        </ToggleGroupItem>
                        <ToggleGroupItem value="Switch" className="h-14 pixel-corners border-2 data-[state=on]:bg-red-600 data-[state=on]:text-white flex flex-col gap-1">
                          <Gamepad2 className="h-4 w-4"/>
                          <span className="text-[8px] font-headline">NSW</span>
                        </ToggleGroupItem>
                    </ToggleGroup>
                </div>
                
                 <div>
                    <Label htmlFor="score-slider" className="text-xs font-headline tracking-widest text-muted-foreground uppercase flex justify-between">
                      <span>Rating</span>
                      <span className="text-primary font-bold">{score}/10</span>
                    </Label>
                    <Slider
                        id="score-slider"
                        min={1} max={10} step={1}
                        value={[score]}
                        onValueChange={(v) => setScore(v[0])}
                        className="mt-4"
                    />
                 </div>

                <div>
                    <Label htmlFor="review-notes" className="text-xs font-headline tracking-widest text-muted-foreground uppercase">Notes (Optional)</Label>
                    <textarea
                        id="review-notes"
                        className="mt-2 w-full bg-muted/20 border-2 border-border p-3 text-sm pixel-corners focus:border-primary outline-none transition-colors"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Masterpiece? Garbage? You decide."
                    />
                </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
                 <DialogClose asChild>
                    <Button variant="outline" className="pixel-corners font-headline text-xs">CANCEL</Button>
                </DialogClose>
                <Button onClick={handleSave} className="pixel-corners font-headline text-xs px-8">ADD TO QUEST LOG</Button>
            </DialogFooter>
        </DialogContent>
    )
}
