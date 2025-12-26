"use client";

import { PlayerPersonaCard } from "@/types";
import { Cpu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface PlayerPersonaCardProps {
  card: PlayerPersonaCard;
}
...
            {/* Avatar Container */}
            <div className="flex flex-col items-center justify-center w-full md:w-fit md:float-left md:mr-8 md:mb-4 space-y-4 relative z-10">
              <div className="w-32 h-32 md:w-40 md:h-40 relative pixel-corners bg-background flex items-center justify-center overflow-hidden border-4 border-border shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Image
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${config.seed}&backgroundColor=1a1a1a`}
                  alt={card.persona}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover rendering-pixelated shadow-inner"
                  unoptimized
                />
                <div className="absolute -bottom-2 -right-2 bg-accent text-accent-foreground font-headline text-[10px] px-2 py-1 border-2 border-foreground transform rotate-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {config.tag}
                </div>
              </div>
            </div>

            {/* Info Container */}
            <div className="relative z-10 text-center md:text-left">
              <div className="mb-4">
                <h2 className="font-headline text-xl md:text-2xl cursor-default text-foreground mb-2 uppercase leading-relaxed break-words">
                  {card.persona}
                </h2>
              </div>

              <div>
                <p className="font-body text-sm md:text-base lg:text-lg leading-relaxed text-muted-foreground italic">
                  &quot;{card.description}&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
