
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import { generateWrappedData } from '@/app/actions';
import { useRouter } from 'next/navigation';

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: 'INVALID FILE TYPE',
          description: 'Please upload a CSV file.',
          variant: 'destructive',
        });
        setFile(null);
        event.target.value = ''; // Reset the input
      }
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
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer border-primary/50 bg-card hover:bg-muted"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              <span className="font-semibold text-accent">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">CSV file only</p>
          </div>
          <Input id="dropzone-file" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {file && <p className="text-sm text-center text-accent">Selected: {file.name}</p>}

      <Button type="submit" className="w-full font-headline tracking-wider text-lg" disabled={isLoading || !file}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Generate My Rewind
      </Button>
    </form>
  );
}
