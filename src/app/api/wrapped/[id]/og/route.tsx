import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';
import { getWrapped } from '@/lib/db';

export const dynamic = 'force-dynamic';

type OgFont = {
  name: string;
  data: ArrayBuffer;
  style: 'normal' | 'italic';
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
};

async function fetchWithTimeout(input: URL | string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

const PERSONA_CONFIG: Record<string, { seed: string; color: string; accent: string; icon: string }> = {
  "The Loyal Legend": { seed: "Loyal Legend", color: "#facc15", accent: "#f97316", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }, // Star
  "The Platinum Plunderer": { seed: "Platinum Plunderer", color: "#60a5fa", accent: "#4f46e5", icon: "M6 3h12l4 6-10 13L2 9z" }, // Gem
  "The Squadron Leader": { seed: "Squadron Leader", color: "#4ade80", accent: "#059669", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }, // Shield
  "The Narrative Navigator": { seed: "Narrative Navigator", color: "#c084fc", accent: "#db2777", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" }, // Book
  "The Apex Predator": { seed: "Apex Predator", color: "#ef4444", accent: "#be123c", icon: "M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2" }, // Sword
  "The Cozy Cultivator": { seed: "Cozy Cultivator", color: "#6ee7b7", accent: "#14b8a6", icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" }, // Heart
  "The Artisan Adventurer": { seed: "lsjda", color: "#fdba74", accent: "#f59e0b", icon: "M12 19l7-7 3 3-7 7-3-3z" }, // Pen nib
  "The Master Architect": { seed: "jhsakdhjasduheu", color: "#22d3ee", accent: "#3b82f6", icon: "M3 21h18v-8H3v8zm0-10h18V3H3v8z" }, // Bricks
  "The High-Octane Hero": { seed: "High-Octane Hero", color: "#f97316", accent: "#dc2626", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" }, // Lightning
  "The Vanguard Gamer": { seed: "Vanguard Gamer", color: "#818cf8", accent: "#7c3aed", icon: "M2 12h20M12 2v20" }, // Crosshair
  "The Backlog Baron": { seed: "Backlog Baron", color: "#a1a1aa", accent: "#3f3f46", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" }, // Library/Book
  "The Digital Hoarder": { seed: "Digital Hoarder", color: "#f472b6", accent: "#9d174d", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }, // Ghost
  "The Completionist Cultist": { seed: "Completionist Cultist", color: "#fbbf24", accent: "#78350f", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }, // Crown (Star icon)
  "The Early Access Enthusiast": { seed: "Early Access Enthusiast", color: "#fb923c", accent: "#7c2d12", icon: "M3 21h18v-8H3v8zm0-10h18V3H3v8z" }, // Construction (Bricks icon)
  "The Diamond in the Rough Digger": { seed: "diamondint", color: "#2dd4bf", accent: "#0f766e", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }, // Diamond
  "The Speedrun Sorcerer": { seed: "Speedrun Specialist", color: "#facc15", accent: "#ca8a04", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" }, // Lightning/Clock
  "The Modded Maestro": { seed: "Community Coordinator", color: "#94a3b8", accent: "#475569", icon: "M12 2v20M2 12h20" }, // Gear
  "The Digital Monogamist": { seed: "Master Architect", color: "#f472b6", accent: "#be123c", icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" }, // Heart
};

const DEFAULT_THEME = { seed: "gamer", color: "#ff0092", accent: "#fff700", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" }; // Stack

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const isPro = searchParams.get('pro') === 'true';
    const isVertical = searchParams.get('aspect') === 'vertical';
    const cardIndex = searchParams.get('cardIndex');
    
    const wrapped = await getWrapped(id);

    if (!wrapped) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Determine what content to show
    let activeCard = null;
    if (cardIndex !== null) {
      const idx = parseInt(cardIndex);
      if (!isNaN(idx) && wrapped.cards[idx]) {
        activeCard = wrapped.cards[idx];
      }
    }

    // Extract common stats
    const summaryCard = wrapped.cards.find((c: any) => c.type === 'summary');
    const topGameCard = wrapped.cards.find((c: any) => c.type === 'top_game');
    const personaCard = wrapped.cards.find((c: any) => c.type === 'player_persona');
    const genreCard = wrapped.cards.find((c: any) => c.type === 'genre_breakdown');

    const totalGames = summaryCard?.totalGames ?? 0;
    const avgScore = (summaryCard?.averageScore ?? 0).toFixed(1);
    const playtime = totalGames * 20; 
    const topGame = topGameCard?.game?.title ?? 'Multiple';
    const persona = personaCard?.persona ?? 'Gamer';
    const topGenres = genreCard?.data?.slice(0, 3) || [];
    const platformCard = wrapped.cards.find((c: any) => c.type === 'platform_stats');
    const topPlatform = platformCard?.data?.[0]?.platform || 'PC';
    const rank = summaryCard?.rank || "BRONZE";
    
    const theme = PERSONA_CONFIG[persona] || DEFAULT_THEME;
    const borderColor = isPro ? '#fbbf24' : theme.color;

    const rankColors: Record<string, string> = {
      "BRONZE": "#cd7f32",
      "SILVER": "#c0c0c0",
      "GOLD": "#fbbf24",
      "PLATINUM": "#e5e4e2",
      "DIAMOND": "#b9f2ff",
      "MASTER": "#ff0055",
    };
    const rankColor = rankColors[rank] || "#cd7f32";

    // Fetch fonts with resilience
    let fonts: OgFont[] = [];
    try {
      const [fontData, interData] = await Promise.all([
        fetchWithTimeout(
          new URL('https://raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/PressStart2P-Regular.ttf'),
          2000
        ).then(async (res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch font (status ${res.status})`);
          }
          return await res.arrayBuffer();
        }),
        fetchWithTimeout(
          new URL('https://raw.githubusercontent.com/google/fonts/main/ofl/inter/static/Inter-Bold.ttf'),
          2000
        ).then(async (res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch font (status ${res.status})`);
          }
          return await res.arrayBuffer();
        })
      ]);
      
      fonts = [
          {
            name: 'Press Start 2P',
            data: fontData,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: interData,
            style: 'normal',
            weight: 700,
          },
        ];
    } catch (e) {
        const message = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
        console.warn(`Failed to load fonts, using system fallback (${message})`);
    }

    // Fetch Avatar with resilience
    const avatarUrl = `https://api.dicebear.com/9.x/bottts/png?seed=${theme.seed}&backgroundColor=1a1a1a&size=512`;
    let avatarBase64 = '';
    try {
        const avatarRes = await fetchWithTimeout(avatarUrl, 2000);
        if (avatarRes.ok) {
            const avatarBuffer = await avatarRes.arrayBuffer();
            avatarBase64 = `data:image/png;base64,${Buffer.from(avatarBuffer).toString('base64')}`;
        } else {
            throw new Error(`Avatar fetch failed (status ${avatarRes.status})`);
        }
    } catch (e) {
        const message = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
        console.warn(`Failed to load avatar (${message})`);
        // Fallback: 1x1 transparent pixel
        avatarBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    }

    const width = isVertical ? 1080 : 1200;
    const height = isVertical ? 1920 : 630;

    // Collector Serial for Pro version
    const serial = id.slice(0, 8).toUpperCase();

    // Define content based on activeCard
    let headerText = "GAMING WRAPPED";
    let bodyTitle = persona;
    let bodySubtitle = `MOST PLAYED: ${topGame}`;
    let showGenres = !activeCard && topGenres.length > 0;

    if (activeCard) {
      headerText = (activeCard as any).title?.toUpperCase() || "GAME REWIND";
      if (activeCard.type === 'roast') {
        bodyTitle = "THE VERDICT";
        bodySubtitle = (activeCard as any).roast;
      } else if (activeCard.type === 'recommendations') {
        bodyTitle = "WHAT'S NEXT?";
        bodySubtitle = (activeCard as any).recommendations.map((r:any) => r.game).slice(0, 2).join(', ');
      } else if (activeCard.type === 'top_game') {
        bodyTitle = (activeCard as any).game.title;
        bodySubtitle = `SCORE: ${(activeCard as any).game.formattedScore || (activeCard as any).game.score}/10`;
      } else if (activeCard.type === 'player_persona') {
        bodyTitle = (activeCard as any).persona;
        bodySubtitle = (activeCard as any).description;
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#09090b',
            color: 'white',
            fontFamily: fonts.length > 0 ? '"Press Start 2P"' : 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Background Pattern: Retro Grid */}
          <div style={{
            display: 'flex',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(to right, #3f3f46 1px, transparent 1px), linear-gradient(to bottom, #3f3f46 1px, transparent 1px)`,
            backgroundSize: isVertical ? '60px 60px' : '30px 30px',
            opacity: 0.05,
          }} />

          {/* Decorative Corner Pixels */}
          <div style={{ display: 'flex', position: 'absolute', top: 40, left: 40, width: 40, height: 40, backgroundColor: theme.color }} />
          <div style={{ display: 'flex', position: 'absolute', bottom: 40, right: 40, width: 40, height: 40, backgroundColor: theme.color }} />

          {/* Pro Collector Badge */}
          {isPro && (
            <div style={{
              display: 'flex',
              position: 'absolute',
              top: '40px',
              right: '60px',
              backgroundColor: '#fbbf24',
              color: '#000',
              padding: '8px 16px',
              fontSize: '12px',
              border: '2px solid #000',
              fontWeight: 'bold',
              zIndex: 100,
            }}>
              COLLECTOR&apos;S EDITION
            </div>
          )}

          {/* Main Container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            padding: isVertical ? '100px 60px' : '60px',
            justifyContent: 'space-between',
            border: `${isVertical ? '32px' : '16px'} solid ${borderColor}`,
          }}>
            
            {/* Header */}
            <div style={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isVertical ? '120px' : '56px',
                height: isVertical ? '120px' : '56px',
                backgroundColor: borderColor,
                borderRadius: '12px',
              }}>
                 <svg width={isVertical ? "64" : "32"} height={isVertical ? "64" : "32"} viewBox="0 0 24 24" fill="none" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                    <line x1="6" x2="10" y1="12" y2="12" />
                    <line x1="8" x2="8" y1="10" y2="14" />
                    <line x1="15" x2="15.01" y1="13" y2="13" />
                    <line x1="18" x2="18.01" y1="11" y2="11" />
                    <rect width="20" height="12" x="2" y="6" rx="2" />
                 </svg>
              </div>
              <div style={{ display: 'flex', fontSize: isVertical ? 48 : 32, color: '#fff', letterSpacing: '4px' }}>
                {headerText}
              </div>
              <div style={{
                display: 'flex',
                backgroundColor: rankColor,
                color: rank === 'SILVER' || rank === 'GOLD' || rank === 'PLATINUM' || rank === 'DIAMOND' ? '#000' : '#fff',
                padding: '4px 12px',
                fontSize: isVertical ? '18px' : '12px',
                border: '2px solid #fff',
                marginLeft: isVertical ? '0' : '20px',
                marginTop: isVertical ? '10px' : '0',
              }}>
                {rank} RANK
              </div>
            </div>

            {/* Content Body */}
            <div style={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row', width: '100%', gap: '40px', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
              
              {/* Avatar Box */}
              <div style={{
                display: 'flex',
                width: isVertical ? '500px' : '300px',
                height: isVertical ? '500px' : '300px',
                border: `${isVertical ? '8px' : '4px'} solid ${borderColor}`,
                backgroundColor: '#1a1a1a',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarBase64} width={isVertical ? 460 : 280} height={isVertical ? 460 : 280} alt="Avatar" style={{ imageRendering: 'pixelated' }} />
                
                {isPro && (
                  <div style={{
                    display: 'flex',
                    position: 'absolute',
                    bottom: '-20px',
                    right: '-20px',
                    backgroundColor: '#fbbf24',
                    color: '#000',
                    padding: '10px 20px',
                    fontSize: '14px',
                    border: '4px solid #000',
                    transform: 'rotate(-5deg)',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    SUPPORTER
                  </div>
                )}
              </div>

              {/* Text Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: isVertical ? 'none' : 1, width: isVertical ? '100%' : 'auto', textAlign: isVertical ? 'center' : 'left' }}>
                
                {/* Persona Title / Card Main Title */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative', alignItems: isVertical ? 'center' : 'flex-start' }}>
                    <div style={{ 
                        display: 'flex',
                        position: 'absolute', 
                        right: isVertical ? '0' : '-20px', 
                        top: '-20px', 
                        opacity: 0.15,
                        transform: 'rotate(10deg)',
                    }}>
                       <svg width={isVertical ? "180" : "120"} height={isVertical ? "180" : "120"} viewBox="0 0 24 24" fill={theme.color} xmlns="http://www.w3.org/2000/svg">
                          <path d={theme.icon} />
                       </svg>
                    </div>

                    <div style={{ 
                        display: 'flex',
                        fontSize: isVertical ? (bodyTitle.length > 15 ? 40 : 56) : (bodyTitle.length > 15 ? 32 : 40), 
                        color: 'white', 
                        lineHeight: '1.2',
                        textTransform: 'uppercase',
                        textShadow: '3px 3px 0px #000',
                    }}>
                        {bodyTitle}
                    </div>
                </div>

                {/* Subtitle / Descriptive Text */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: isVertical ? 'center' : 'flex-start' }}>
                    <div style={{ 
                        display: 'flex',
                        fontSize: isVertical ? 36 : 24, 
                        color: theme.accent,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '20px',
                        borderLeft: isVertical ? 'none' : `8px solid ${theme.accent}`,
                        borderBottom: isVertical ? `8px solid ${theme.accent}` : 'none',
                        width: isVertical ? '100%' : 'auto',
                        justifyContent: isVertical ? 'center' : 'flex-start',
                        lineHeight: '1.6',
                        fontFamily: fonts.length > 0 ? 'Inter' : 'sans-serif',
                    }}>
                        {bodySubtitle}
                    </div>
                </div>
              </div>
            </div>

            {/* Footer Stats Bar */}
            <div style={{
                display: 'flex',
                width: '100%',
                backgroundColor: '#111113',
                border: '4px solid #27272a',
                borderRadius: '24px',
                padding: isVertical ? '48px 24px' : '24px',
                justifyContent: 'space-around',
                alignItems: 'center',
                marginTop: '20px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <span style={{ display: 'flex', fontSize: isVertical ? 18 : 12, color: '#e4e4e7' }}>GAMES</span>
                    <span style={{ display: 'flex', fontSize: isVertical ? 36 : 24, color: theme.color }}>{totalGames}</span>
                </div>
                <div style={{ width: '4px', height: '60px', backgroundColor: '#3f3f46' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <span style={{ display: 'flex', fontSize: isVertical ? 18 : 12, color: '#e4e4e7' }}>SCORE</span>
                    <span style={{ display: 'flex', fontSize: isVertical ? 36 : 24, color: theme.accent }}>{avgScore}</span>
                </div>
                <div style={{ width: '4px', height: '60px', backgroundColor: '#3f3f46' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <span style={{ display: 'flex', fontSize: isVertical ? 18 : 12, color: '#e4e4e7' }}>HOURS</span>
                    <span style={{ display: 'flex', fontSize: isVertical ? 36 : 24, color: '#fff' }}>{playtime.toLocaleString()}</span>
                </div>
                {isPro && (
                  <>
                    <div style={{ width: '4px', height: '60px', backgroundColor: '#3f3f46' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <span style={{ display: 'flex', fontSize: isVertical ? 18 : 12, color: '#e4e4e7' }}>SYSTEM</span>
                        <span style={{ display: 'flex', fontSize: isVertical ? 24 : 18, color: '#fbbf24' }}>{topPlatform}</span>
                    </div>
                  </>
                )}
            </div>
            
            {/* Website URL and Watermark */}
            <div style={{
                display: 'flex',
                position: 'absolute',
                bottom: '40px',
                right: '60px',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '8px'
            }}>
                {isPro && (
                  <div style={{
                      fontSize: isVertical ? '16px' : '10px',
                      color: '#fbbf24',
                      marginBottom: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '4px'
                  }}>
                      <div style={{ display: 'flex' }}>THANK YOU FOR SUPPORTING!</div>
                      <div style={{ display: 'flex', fontSize: '8px', color: 'rgba(251, 191, 36, 0.6)' }}>SERIAL: GW-{serial}</div>
                  </div>
                )}
            </div>
          </div>
        </div>
      ),
      {
        width,
        height,
        fonts: fonts.length > 0 ? fonts : undefined,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}
