
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
import { ArrowLeft, Dices, Download, Gamepad, Gamepad2, Joystick, Loader2, PcCase, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

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
  };

  const handleRemoveGame = (id: string) => {
    setGamesList(prev => prev.filter(game => game.id !== id));
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
      <div className="absolute inset-0 bg-grid-white/[0.05] z-0" />
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

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <form onSubmit={handleSearchSubmit} className="w-full max-w-lg mt-8 relative">
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
                placeholder="What was the first game you played this year?"
                className="h-14 text-center text-xl font-body tracking-wider"
                aria-autocomplete="list"
                aria-expanded={suggestions.length > 0}
                aria-controls="game-suggestions"
              />
              {suggestions.length > 0 && (
                <ul id="game-suggestions" className="absolute left-0 right-0 mt-1 bg-popover border rounded-md shadow z-20 max-h-60 overflow-auto">
                  {suggestions.map((s, idx) => (
                    <li key={s}>
                      <button
                        type="button"
                        className={`w-full text-left px-3 py-2 hover:bg-muted ${idx === highlightedIndex ? 'bg-muted' : ''}`}
                        onMouseEnter={() => setHighlightedIndex(idx)}
                        onClick={() => {
                          setSearchQuery(s);
                          setSelectedGame({ title: s });
                          setIsDialogOpen(true);
                        }}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
               <Button type="submit" size="lg" className="mt-4 w-full font-headline tracking-widest text-lg">
                <Plus className="mr-2"/> Add Game
               </Button>
            </form>
            
            {selectedGame && <AddGameDialog game={selectedGame} onAddGame={handleAddGame} />}

          </Dialog>

          <div className="w-full max-w-2xl mt-12">
            {gamesList.length > 0 ? (
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="font-headline tracking-widest">YOUR YEAR IN GAMING</CardTitle>
                  <Button variant="outline" onClick={handleDownloadCsv}>
                    <Download className="mr-2" />
                    Download as CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {gamesList.map(game => (
                      <li key={game.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-4">
                           <Image src={`https://placehold.co/40x40.png`} data-ai-hint="game boxart" alt={game.title} width={40} height={40} className="rounded-md" />
                           <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold font-body text-lg">{game.title}</p>
                              {/* Platform badge */}
                              {game.platform === 'PC' && (
                                <Badge className="bg-sky-600 text-white border-transparent">PC</Badge>
                              )}
                              {game.platform === 'PlayStation' && (
                                <Badge className="bg-blue-600 text-white border-transparent">PS</Badge>
                              )}
                              {game.platform === 'Xbox' && (
                                <Badge className="bg-green-600 text-white border-transparent">Xbox</Badge>
                              )}
                              {game.platform === 'Switch' && (
                                <Badge className="bg-red-600 text-white border-transparent">Switch</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{game.platform} - {game.status}</p>
                           </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveGame(game.id)}>
                          <Trash2 className="h-4 w-4 text-destructive"/>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ) : (
                <div className="text-center text-muted-foreground font-body text-lg p-8 border-2 border-dashed border-primary/20 rounded-lg">
                    <p>Your added games will appear here.</p>
                    <p>Start by searching for a game above!</p>
                </div>
            )}
          </div>
          
           {gamesList.length >= 3 && (
              <div className="mt-8 w-full max-w-lg z-20">
                <Button
                  size="lg"
                  className="w-full font-headline tracking-widest text-xl h-auto min-h-[3.5rem] whitespace-normal break-words text-center"
                  onClick={handleGenerate}
                  disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Dices className="mr-2 h-5 w-5"/>}
                    {"That's enough! Generate my Wrapped!"}
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
        <DialogContent className="font-body">
            <DialogHeader>
                 <DialogTitle className="font-headline tracking-wider text-2xl">{game.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
                <div>
                    <Label className="text-lg font-headline tracking-wider">Status</Label>
                    <ToggleGroup type="single" value={status} onValueChange={(v) => v && setStatus(v)} className="grid grid-cols-2 gap-2 mt-2">
                        <ToggleGroupItem value="Played It" className="text-base h-12">Played It</ToggleGroupItem>
                        <ToggleGroupItem value="Finished" className="text-base h-12">Finished It</ToggleGroupItem>
                        <ToggleGroupItem value="Completed" className="text-base h-12">100% Completed</ToggleGroupItem>
                        <ToggleGroupItem value="Dropped" className="text-base h-12">Dropped It</ToggleGroupItem>
                    </ToggleGroup>
                </div>

                 <div>
                    <Label className="text-lg font-headline tracking-wider">Platform</Label>
                     <ToggleGroup type="single" value={platform} onValueChange={(v) => v && setPlatform(v)} className="grid grid-cols-4 gap-2 mt-2">
                        <ToggleGroupItem value="PC" className="text-base h-12 flex items-center gap-2 justify-center"><PcCase className="h-5 w-5"/><span>PC</span></ToggleGroupItem>
                        <ToggleGroupItem value="PlayStation" className="text-base h-12 flex items-center gap-2 justify-center"><Joystick className="h-5 w-5"/><span>PlayStation</span></ToggleGroupItem>
                        <ToggleGroupItem value="Xbox" className="text-base h-12 flex items-center gap-2 justify-center"><Gamepad className="h-5 w-5"/><span>Xbox</span></ToggleGroupItem>
                        <ToggleGroupItem value="Switch" className="text-base h-12 flex items-center gap-2 justify-center"><Gamepad2 className="h-5 w-5"/><span>Switch</span></ToggleGroupItem>
                    </ToggleGroup>
                </div>
                
                 <div>
                    <Label htmlFor="score-slider" className="text-lg font-headline tracking-wider">Your Score: <span className="text-primary font-bold">{score}/10</span></Label>
                    <Slider
                        id="score-slider"
                        min={1} max={10} step={1}
                        value={[score]}
                        onValueChange={(v) => setScore(v[0])}
                        className="mt-4"
                    />
                 </div>

                <div>
                    <Label htmlFor="review-notes" className="text-lg font-headline tracking-wider">Review Notes (optional)</Label>
                    <textarea
                        id="review-notes"
                        className="mt-2 w-full rounded-md border bg-background p-3 text-base"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="What did you think about it?"
                    />
                </div>
            </div>

            <DialogFooter>
                 <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSave} className="font-headline tracking-wider">Add Game</Button>
            </DialogFooter>
        </DialogContent>
    )
}
