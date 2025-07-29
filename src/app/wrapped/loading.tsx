import { Gamepad2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-background">
      <div className="relative flex items-center justify-center">
        <Gamepad2 className="w-16 h-16 text-primary animate-bounce" />
        <div className="absolute w-24 h-24 border-2 rounded-full border-primary/50 animate-ping"></div>
      </div>
      <h2 className="mt-8 text-2xl font-headline font-semibold animate-pulse">
        Generating your Game Rewind...
      </h2>
      <p className="text-muted-foreground mt-2">Our AI is analyzing your epic year in gaming!</p>
    </div>
  );
}
