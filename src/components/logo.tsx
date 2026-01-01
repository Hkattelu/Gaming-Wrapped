import { Gamepad2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function Logo({ className, hideIcon }: { className?: string, hideIcon?: boolean }) {
  return (
    <div className={cn("flex items-center gap-4 text-3xl font-bold font-headline text-primary tracking-[0.2em] relative group", className)}>
      {!hideIcon && (
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Gamepad2 className="h-10 w-10 hidden md:block" />
        </motion.div>
      )}
      <div className="relative overflow-hidden">
        <h1>
          GAMING WRAPPED
        </h1>
      </div>
    </div>
  );
}
