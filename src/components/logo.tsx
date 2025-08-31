import { Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 text-3xl font-bold font-headline text-primary tracking-[0.2em]", className)}>
      <Gamepad2 className="h-10 w-10 hidden md:block" />
      <h1>GAMING WRAPPED</h1>
    </div>
  );
}
