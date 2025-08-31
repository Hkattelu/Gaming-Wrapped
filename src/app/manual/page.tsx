
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { ManualGame } from '@/types';
import { generateWrappedDataFromManual } from '@/app/actions';
import { ArrowLeft, Dices, Download, Gamepad, Loader2, PcCase, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Logo } from '@/components/logo';
import Link from 'next/link';

// Represents a game selected by the user, before detailed info is added
interface SelectedGame {
  title: string;
}

// Helper to convert ManualGame[] to CSV string for download
function gamesToCsvForDownload(games: ManualGame[]): string {
    const header = "Title,Platform,Review Score,Review Notes\n";
    const rows = games.map(game => {
        const title = `"${game.title.replace(/"/g, '""')}"`;
        const platform = `"${game.platform.replace(/"/g, '""')}"`;
        const score = game.score;
        const notes = `"${game.status}"`;
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

  const router = useRouter();
  const { toast } = useToast();

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
      const result = await generateWrappedDataFromManual(gamesList);
      sessionStorage.setItem('wrappedData', JSON.stringify(result));
      router.push('/wrapped');
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
            <form onSubmit={handleSearchSubmit} className="w-full max-w-lg mt-8">
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What was the first game you played this year?"
                className="h-14 text-center text-xl font-body tracking-wider"
              />
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
                            <p className="font-bold font-body text-lg">{game.title}</p>
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
                <Button size="lg" className="w-full font-headline tracking-widest text-xl h-14" onClick={handleGenerate} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Dices className="mr-2 h-5 w-5"/>}
                    That's enough! Generate My Rewind!
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
    
    const handleSave = () => {
        onAddGame({ title: game.title, platform, status, score: score.toString() });
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
                        <ToggleGroupItem value="PC" className="text-base h-12"><PcCase /></ToggleGroupItem>
                        <ToggleGroupItem value="PlayStation" className="text-base h-12"><Gamepad/></ToggleGroupItem>
                        <ToggleGroupItem value="Xbox" className="text-base h-12"><Dices/></ToggleGroupItem>
                        <ToggleGroupItem value="Switch" className="text-base h-12">Switch</ToggleGroupItem>
                    </ToggleGroup>
                </div>
                
                 <div>
                    <Label htmlFor="score-slider" className="text-lg font-headline tracking-wider">Your Score: <span className="text-primary font-bold">{score}/10</span></Label>
                    <Slider
                        id="score-slider"
                        min={1} max={10} step={1}
                        value={[score]}
                        onValue-change={(v) => setScore(v[0])}
                        className="mt-4"
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
