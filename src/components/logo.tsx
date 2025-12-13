import { Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className, hideIcon }: { className?: string, hideIcon?: boolean }) {
  return (
    <div className={cn("flex items-center gap-4 text-3xl font-bold font-headline text-primary tracking-[0.2em]", className)}>
      {!hideIcon ? (<Gamepad2 className="h-10 w-10 hidden md:block" />) : (<div></div>)}
      <h1>GAMING WRAPPED</h1>
    </div>
  );
}
