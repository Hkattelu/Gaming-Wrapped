
"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud, Gamepad2, Layers, Star } from 'lucide-react';
import { generateWrappedData } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { Progress } from "@/components/ui/progress"
import { cn } from '@/lib/utils';
import Papa from 'papaparse';

interface PreviewData {
  totalGames: number;
  platforms: string[];
  topGames: string[];
}

interface UploadFormProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

export function UploadForm({ file, onFileChange }: UploadFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [fakeProgress, setFakeProgress] = useState(0);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const intervalRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (text) {
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              const data = results.data as any[];
              const totalGames = data.length;
              
              // Get unique platforms
              const platforms = Array.from(new Set(data
                .map(g => g.Platform || g.platform)
                .filter(Boolean)
              )).slice(0, 5) as string[];

              // Get top 3 games by rating/score
              const topGames = data
                .filter(g => (g.Rating || g.score || g.Review))
                .sort((a, b) => {
                  const scoreA = parseFloat(a.Rating || a.score || a.Review || 0);
                  const scoreB = parseFloat(b.Rating || b.score || b.Review || 0);
                  return scoreB - scoreA;
                })
                .slice(0, 3)
                .map(g => g.Title || g.title) as string[];

              setPreviewData({
                totalGames,
                platforms,
                topGames
              });
            }
          });
        }
      };
      reader.readAsText(file);
    } else {
      setPreviewData(null);
    }
  }, [file]);

  const loadingMessages = [
    'Analyzing your playthroughs...',
    'Crunching the numbers...',
    'Opening some treasure...',
    'Counting your achievements...',
    'Drafting your player persona...',
    'Consulting the lore experts...',
    'Judging your build...',
    'Adding a layer of polish...',
    'Almost there, finale in sight...',
  ];

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add('is-generating');
    } else {
      document.body.classList.remove('is-generating');
    }
    return () => document.body.classList.remove('is-generating');
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) {
      setFakeProgress(0);
      setLoadingStep(0);

      // Rotate status text every 6s (total ~54s for one full cycle)
      intervalRef.current = window.setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length);
      }, 6000);

      // Increment progress smoothly
      progressIntervalRef.current = window.setInterval(() => {
        setFakeProgress((prev) => {
          if (prev >= 99) return 99;
          // Slowly decrease the increment as we get closer to 100
          const increment = Math.max(0.1, (100 - prev) / 100);
          return Math.min(99, prev + increment);
        });
      }, 100);

      timeoutRef.current = window.setTimeout(() => {
        toast({
          title: 'THIS IS TAKING LONGER THAN EXPECTED',
          description: 'The generation is taking over 90 seconds. Please try again in a bit.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }, 90000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      intervalRef.current = null;
      progressIntervalRef.current = null;
      timeoutRef.current = null;
      setLoadingStep(0);
      setFakeProgress(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoading, loadingMessages.length, toast]);

  const MAX_CSV_BYTES = 2_000_000;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!(selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv'))) {
        toast({
          title: 'INVALID FILE TYPE',
          description: 'Please upload a CSV file.',
          variant: 'destructive',
        });
        onFileChange(null);
        event.target.value = '';
        return;
      }
      if (selectedFile.size > MAX_CSV_BYTES) {
        const mb = (selectedFile.size / (1024 * 1024)).toFixed(2);
        toast({
          title: 'CSV TOO LARGE',
          description: `Your file is ${mb} MB. Please upload a CSV under 2 MB or trim the file and try again.`,
          variant: 'destructive',
        });
        onFileChange(null);
        event.target.value = '';
        return;
      }
      onFileChange(selectedFile);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast({
        title: 'NO FILE SELECTED',
        description: 'Please select a CSV file to upload.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvText = e.target?.result as string;
      if (!csvText) {
        toast({
          title: 'ERROR READING FILE',
          description: 'Could not read the selected file.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      try {
        const { id } = await generateWrappedData(csvText);
        setIsLoading(false);
        router.push(`/wrapped?id=${id}`);
      } catch (error: any) {
        toast({
          title: 'ERROR GENERATING REWIND',
          description: error.message || 'An unknown error occurred.',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      toast({
        title: 'ERROR READING FILE',
        description: 'An error occurred while reading the file.',
        variant: 'destructive',
      });
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-body">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className={cn(
            "flex flex-col items-center justify-center w-full border-4 border-dashed cursor-pointer transition-all duration-300 pixel-corners min-h-[200px]",
            file
              ? "border-accent bg-accent/10 hover:bg-accent/20"
              : "border-primary/50 bg-black/40 hover:bg-primary/10 hover:border-primary"
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
            {file ? (
              <div className="relative w-full flex flex-col items-center space-y-4">
                <div className="p-4 bg-accent/20 mb-2 pixel-corners border-2 border-accent">
                  <UploadCloud className="w-10 h-10 text-accent" />
                </div>
                <p className="mb-1 text-lg font-headline text-accent truncate max-w-[200px] text-center tracking-wider">
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground mb-2">Click or drag to change file</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="h-10 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors border-2 border-red-500/50 pixel-corners uppercase font-headline tracking-widest"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onFileChange(null);
                  }}
                >
                  [ REMOVE CARTRIDGE ]
                </Button>
              </div>
            ) : (
              <>
                <UploadCloud className="w-12 h-12 mb-4 text-primary animate-pulse" />
                <p className="mb-2 text-lg font-headline text-muted-foreground uppercase tracking-wider">
                  <span className="text-primary">Insert CSV</span> to Start
                </p>
                <p className="text-sm text-muted-foreground">.CSV files supported</p>
              </>
            )}
          </div>
          <Input id="dropzone-file" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {file && previewData && !isLoading && (
        <div className="grid grid-cols-1 gap-4 p-6 bg-black/40 border-4 border-accent/50 pixel-corners animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-[0_0_15px_oklch(var(--accent)/0.2)]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 border-2 border-accent pixel-corners">
              <Gamepad2 className="w-6 h-6 text-accent" />
            </div>
            <div className="text-left">
              <p className="text-sm font-headline tracking-widest text-muted-foreground uppercase">Total Games</p>
              <p className="text-2xl font-headline text-foreground">{previewData.totalGames}</p>
            </div>
          </div>
          
          {previewData.topGames.length > 0 && (
            <div className="flex items-start gap-4 border-t-2 border-accent/20 pt-4 border-dashed">
              <div className="p-3 bg-amber-500/10 border-2 border-amber-500 pixel-corners">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-headline tracking-widest text-muted-foreground uppercase">Top Rated</p>
                <p className="text-lg font-body text-foreground line-clamp-2 uppercase">{previewData.topGames.join(", ")}</p>
              </div>
            </div>
          )}

          {previewData.platforms.length > 0 && (
            <div className="flex items-start gap-4 border-t-2 border-accent/20 pt-4 border-dashed">
              <div className="p-3 bg-blue-500/10 border-2 border-blue-500 pixel-corners">
                <Layers className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-headline tracking-widest text-muted-foreground uppercase">Platforms</p>
                <p className="text-lg font-body text-foreground line-clamp-1 uppercase">{previewData.platforms.join(", ")}{previewData.platforms.length >= 5 ? "..." : ""}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <Button 
        type="submit" 
        className="arcade-button w-full h-16 text-xl tracking-widest" 
        disabled={isLoading || !file}
      >
        {isLoading ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : null}
        {isLoading ? "PROCESSING..." : "GENERATE REWIND"}
      </Button>

      {isLoading && (
        <div className="space-y-4 pt-4 bg-black/20 p-4 border-2 border-primary/30 pixel-corners">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-headline tracking-widest text-primary uppercase blink">SYSTEM_BUSY</span>
            <span className="text-sm font-headline tracking-widest text-accent">{Math.floor(fakeProgress)}%</span>
          </div>
          <div className="w-full h-4 bg-primary/20 pixel-corners p-0.5">
             <div 
               className="h-full bg-primary transition-all duration-300 relative overflow-hidden" 
               style={{ width: `${fakeProgress}%` }}
             >
                <div className="absolute inset-0 bg-[url('/scanline.png')] opacity-20" />
             </div>
          </div>
          <p className="min-h-[2rem] text-xl text-center text-foreground font-body tracking-wider uppercase" aria-live="polite">
            {'>'} {loadingMessages[loadingStep]}
          </p>
        </div>
      )}
    </form>
  );
}
