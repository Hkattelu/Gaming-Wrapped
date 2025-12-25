
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
    <form onSubmit={handleSubmit} className="space-y-4 font-body">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className={cn(
            "flex flex-col items-center justify-center w-full border-2 border-dashed rounded-lg cursor-pointer transition-colors",
            file
              ? "border-accent bg-accent/5 hover:bg-accent/10"
              : "border-primary/50 bg-card hover:bg-muted"
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
            {file ? (
              <div className="relative w-full flex flex-col items-center space-y-2">
                <div className="p-3 rounded-full bg-accent/20 mb-2">
                  <UploadCloud className="w-8 h-8 text-accent" />
                </div>
                <p className="mb-1 text-sm font-semibold text-accent truncate max-w-[200px] text-center">
                  {file.name}
                </p>
                <p className="text-sm text-muted-foreground mb-2">Click or drag to change file</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="h-12 text-md text-accent hover:text-destructive hover:bg-destructive/10 transition-colors border border-destructive/20"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onFileChange(null);
                  }}
                >
                  Remove file
                </Button>
              </div>
            ) : (
              <>
                <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-accent">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-muted-foreground">CSV file only</p>
              </>
            )}
          </div>
          <Input id="dropzone-file" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {file && previewData && !isLoading && (
        <div className="grid grid-cols-1 gap-3 p-4 bg-accent/5 border-2 border-accent/20 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-accent/10">
              <Gamepad2 className="w-5 h-5 text-accent" />
            </div>
            <div className="text-left">
              <p className="text-sm font-headline tracking-widest text-muted-foreground uppercase">Total Games</p>
              <p className="text-xl font-headline text-foreground">{previewData.totalGames}</p>
            </div>
          </div>
          
          {previewData.topGames.length > 0 && (
            <div className="flex items-start gap-4 border-t border-accent/10 pt-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-headline tracking-widest text-muted-foreground uppercase">Top Rated</p>
                <p className="text-sm text-foreground line-clamp-2">{previewData.topGames.join(", ")}</p>
              </div>
            </div>
          )}

          {previewData.platforms.length > 0 && (
            <div className="flex items-start gap-4 border-t border-accent/10 pt-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Layers className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-headline tracking-widest text-muted-foreground uppercase">Platforms</p>
                <p className="text-sm text-foreground line-clamp-1">{previewData.platforms.join(", ")}{previewData.platforms.length >= 5 ? "..." : ""}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <Button type="submit" className="w-full font-headline tracking-wider text-lg py-6" disabled={isLoading || !file}>
        {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
        {isLoading ? "Generating..." : "Generate My Rewind"}
      </Button>

      {isLoading && (
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-headline tracking-widest text-muted-foreground uppercase">Progress</span>
            <span className="text-sm font-headline tracking-widest text-accent">{Math.floor(fakeProgress)}%</span>
          </div>
          <Progress value={fakeProgress} className="w-full h-3" />
          <p className="min-h-[2rem] text-xl text-center text-foreground font-headline tracking-wider animate-pulse" aria-live="polite">
            {loadingMessages[loadingStep]}
          </p>
        </div>
      )}
    </form>
  );
}
