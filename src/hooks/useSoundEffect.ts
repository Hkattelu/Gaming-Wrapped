import { useCallback } from 'react';

type SoundType = 'select' | 'start' | 'nav' | 'coin';

export function useSoundEffect() {
  const playSound = useCallback((soundType: SoundType) => {
    try {
      // Map sound types to audio files
      const soundMap: Record<SoundType, string> = {
        select: '/audio/nav.mp3',
        start: '/audio/startup.mp3',
        nav: '/audio/nav.mp3',
        coin: '/audio/coin.mp3',
      };

      const audio = new Audio(soundMap[soundType]);
      audio.volume = 0.5; // Set volume to 50%
      audio.play().catch(() => {
        // Silently fail if audio can't play (e.g., user hasn't interacted with page yet)
      });
    } catch {
      // Silently fail if audio initialization fails
    }
  }, []);

  return { playSound };
}
