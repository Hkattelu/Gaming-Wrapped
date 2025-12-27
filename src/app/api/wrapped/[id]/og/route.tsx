import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';
import { getWrapped } from '@/lib/db';

export const dynamic = 'force-dynamic';

const PERSONA_CONFIG: Record<string, { seed: string; color: string; accent: string; icon: string }> = {
  "The Loyal Legend": { seed: "legend", color: "#facc15", accent: "#f97316", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" }, // Star
  "The Platinum Plunderer": { seed: "trophy", color: "#60a5fa", accent: "#4f46e5", icon: "M6 3h12l4 6-10 13L2 9z" }, // Gem
  "The Squadron Leader": { seed: "commander", color: "#4ade80", accent: "#059669", icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" }, // Shield
  "The Narrative Navigator": { seed: "book", color: "#c084fc", accent: "#db2777", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" }, // Book
  "The Apex Predator": { seed: "skull", color: "#ef4444", accent: "#be123c", icon: "M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2" }, // Sword
  "The Cozy Cultivator": { seed: "plant", color: "#6ee7b7", accent: "#14b8a6", icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" }, // Heart
  "The Artisan Adventurer": { seed: "palette", color: "#fdba74", accent: "#f59e0b", icon: "M12 19l7-7 3 3-7 7-3-3z" }, // Pen nib
  "The Master Architect": { seed: "building", color: "#22d3ee", accent: "#3b82f6", icon: "M3 21h18v-8H3v8zm0-10h18V3H3v8z" }, // Bricks
  "The High-Octane Hero": { seed: "power", color: "#f97316", accent: "#dc2626", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" }, // Lightning
  "The Vanguard Gamer": { seed: "future", color: "#818cf8", accent: "#7c3aed", icon: "M2 12h20M12 2v20" }, // Crosshair
};

const DEFAULT_THEME = { seed: "gamer", color: "#ff0092", accent: "#fff700", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" }; // Stack

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const wrapped = await getWrapped(id);

    if (!wrapped) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Extract stats
    const summaryCard = wrapped.cards.find((c: any) => c.type === 'summary');
    const topGameCard = wrapped.cards.find((c: any) => c.type === 'top_game');
    const personaCard = wrapped.cards.find((c: any) => c.type === 'player_persona');
    const genreCard = wrapped.cards.find((c: any) => c.type === 'genre_breakdown');

    const totalGames = summaryCard?.totalGames ?? 0;
    const avgScore = (summaryCard?.averageScore ?? 0).toFixed(1);
    const playtime = totalGames * 20; // Estimated
    const topGame = topGameCard?.game?.title ?? 'Multiple';
    const persona = personaCard?.persona ?? 'Gamer';
    const topGenres = genreCard?.data?.slice(0, 3) || [];
    
    const theme = PERSONA_CONFIG[persona] || DEFAULT_THEME;

    // Fetch font (Press Start 2P)
    const fontData = await fetch(
      new URL('https://raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/PressStart2P-Regular.ttf')
    ).then((res) => res.arrayBuffer());

    // Fetch Avatar
    const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/png?seed=${theme.seed}&backgroundColor=1a1a1a&scale=120`;
    const avatarBuffer = await fetch(avatarUrl).then(res => res.arrayBuffer());
    const avatarBase64 = `data:image/png;base64,${Buffer.from(avatarBuffer).toString('base64')}`;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#09090b', // Zinc 950
            color: 'white',
            fontFamily: '"Press Start 2P"',
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
            backgroundSize: '30px 30px',
            opacity: 0.05,
          }} />

          {/* Decorative Corner Pixels */}
          <div style={{ display: 'flex', position: 'absolute', top: 20, left: 20, width: 20, height: 20, backgroundColor: theme.color }} />
          <div style={{ display: 'flex', position: 'absolute', top: 20, left: 45, width: 10, height: 10, backgroundColor: theme.accent }} />
          <div style={{ display: 'flex', position: 'absolute', top: 45, left: 20, width: 10, height: 10, backgroundColor: theme.accent }} />
          <div style={{ display: 'flex', position: 'absolute', bottom: 20, right: 20, width: 20, height: 20, backgroundColor: theme.color }} />
          <div style={{ display: 'flex', position: 'absolute', bottom: 20, right: 45, width: 10, height: 10, backgroundColor: theme.accent }} />
          <div style={{ display: 'flex', position: 'absolute', bottom: 45, right: 20, width: 10, height: 10, backgroundColor: theme.accent }} />

          {/* Main Container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            padding: '60px',
            justifyContent: 'space-between',
            border: `16px solid ${theme.color}`,
          }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                backgroundColor: theme.color,
                borderRadius: '12px',
              }}>
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#09090b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                    <line x1="6" x2="10" y1="12" y2="12" />
                    <line x1="8" x2="8" y1="10" y2="14" />
                    <line x1="15" x2="15.01" y1="13" y2="13" />
                    <line x1="18" x2="18.01" y1="11" y2="11" />
                    <rect width="20" height="12" x="2" y="6" rx="2" />
                 </svg>
              </div>
              <div style={{ display: 'flex', fontSize: 32, color: '#fff', letterSpacing: '2px' }}>
                GAMING WRAPPED
              </div>
            </div>

            {/* Content Body */}
            <div style={{ display: 'flex', width: '100%', gap: '40px', alignItems: 'center', flex: 1 }}>
              
              {/* Avatar Box */}
              <div style={{
                display: 'flex',
                width: '300px',
                height: '300px',
                border: `4px solid ${theme.color}`,
                backgroundColor: '#1a1a1a',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarBase64} width={280} height={280} alt="Avatar" style={{ imageRendering: 'pixelated' }} />
              </div>

              {/* Text Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1 }}>
                
                {/* Persona Title */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
                    <div style={{ 
                        display: 'flex',
                        position: 'absolute', 
                        right: '-20px', 
                        top: '-20px', 
                        opacity: 0.15,
                        transform: 'rotate(10deg)',
                    }}>
                       <svg width="120" height="120" viewBox="0 0 24 24" fill={theme.color} xmlns="http://www.w3.org/2000/svg">
                          <path d={theme.icon} />
                       </svg>
                    </div>

                    <div style={{ 
                        display: 'flex',
                        fontSize: 40, 
                        color: 'white', 
                        lineHeight: '1.2',
                        textTransform: 'uppercase',
                        textShadow: '3px 3px 0px #000',
                    }}>
                        {persona}
                    </div>
                </div>

                {/* Top Game */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', fontSize: 16, color: '#a1a1aa' }}>MOST PLAYED:</div>
                    <div style={{ 
                        display: 'flex',
                        fontSize: 24, 
                        color: theme.accent,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '15px',
                        borderLeft: `4px solid ${theme.accent}`
                    }}>
                        {topGame}
                    </div>
                </div>

                {/* Genre Breakdown Chart */}
                {topGenres.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     <div style={{ display: 'flex', fontSize: 16, color: '#a1a1aa' }}>TOP GENRES:</div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                        {topGenres.map((g: any, i: number) => (
                           <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                              <div style={{ display: 'flex', fontSize: 14, color: '#fff', width: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {g.genre}
                              </div>
                              <div style={{ display: 'flex', flex: 1, height: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>
                                 <div style={{ 
                                    display: 'flex',
                                    width: `${(g.count / Math.max(...topGenres.map((t:any) => t.count))) * 100}%`, 
                                    height: '100%', 
                                    backgroundColor: theme.accent,
                                    borderRadius: '6px'
                                 }} />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Stats Bar */}
            <div style={{
                display: 'flex',
                width: '100%',
                backgroundColor: '#111113',
                border: '2px solid #27272a',
                borderRadius: '16px',
                padding: '24px',
                justifyContent: 'space-around',
                alignItems: 'center',
                marginTop: '10px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'flex', fontSize: 12, color: '#a1a1aa' }}>GAMES</span>
                    <span style={{ display: 'flex', fontSize: 24, color: theme.color }}>{totalGames}</span>
                </div>
                <div style={{ width: '2px', height: '40px', backgroundColor: '#3f3f46' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'flex', fontSize: 12, color: '#a1a1aa' }}>SCORE</span>
                    <span style={{ display: 'flex', fontSize: 24, color: theme.accent }}>{avgScore}</span>
                </div>
                <div style={{ width: '2px', height: '40px', backgroundColor: '#3f3f46' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'flex', fontSize: 12, color: '#a1a1aa' }}>HOURS</span>
                    <span style={{ display: 'flex', fontSize: 24, color: '#fff' }}>{playtime.toLocaleString()}</span>
                </div>
            </div>
            
            {/* Website URL */}
            <div style={{
                display: 'flex',
                position: 'absolute',
                bottom: '25px',
                right: '40px',
                fontSize: '14px',
                color: theme.color,
                fontWeight: 'bold',
                textShadow: '1px 1px 0px #000'
            }}>
                gamingwrapped.com
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Press Start 2P',
            data: fontData,
            style: 'normal',
          },
        ],
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}