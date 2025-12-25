import { NextRequest, NextResponse } from 'next/server';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getWrapped } from '@/lib/db';

export const dynamic = 'force-dynamic';

const PERSONA_CONFIG: Record<string, { seed: string; color: string; accent: string }> = {
  "The Loyal Legend": { seed: "legend", color: "#facc15", accent: "#f97316" }, // Yellow/Orange
  "The Platinum Plunderer": { seed: "trophy", color: "#60a5fa", accent: "#4f46e5" }, // Blue/Indigo
  "The Squadron Leader": { seed: "commander", color: "#4ade80", accent: "#059669" }, // Green/Emerald
  "The Narrative Navigator": { seed: "book", color: "#c084fc", accent: "#db2777" }, // Purple/Pink
  "The Apex Predator": { seed: "skull", color: "#ef4444", accent: "#be123c" }, // Red/Rose
  "The Cozy Cultivator": { seed: "plant", color: "#6ee7b7", accent: "#14b8a6" }, // Emerald/Teal
  "The Artisan Adventurer": { seed: "palette", color: "#fdba74", accent: "#f59e0b" }, // Orange/Amber
  "The Master Architect": { seed: "building", color: "#22d3ee", accent: "#3b82f6" }, // Cyan/Blue
  "The High-Octane Hero": { seed: "power", color: "#f97316", accent: "#dc2626" }, // Orange/Red
  "The Vanguard Gamer": { seed: "future", color: "#818cf8", accent: "#7c3aed" }, // Indigo/Violet
};

const DEFAULT_THEME = { seed: "gamer", color: "#ff0092", accent: "#fff700" }; // Brand Pink/Yellow

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

    const totalGames = summaryCard?.totalGames ?? 0;
    const avgScore = (summaryCard?.averageScore ?? 0).toFixed(1);
    const playtime = totalGames * 20; // Estimated
    const topGame = topGameCard?.game?.title ?? 'Multiple';
    const persona = personaCard?.persona ?? 'Gamer';
    
    const theme = PERSONA_CONFIG[persona] || DEFAULT_THEME;

    // Fetch font (Press Start 2P)
    const fontData = await fetch(
      new URL('https://raw.githubusercontent.com/google/fonts/main/ofl/pressstart2p/PressStart2P-Regular.ttf')
    ).then((res) => res.arrayBuffer());

    // Fetch Avatar
    const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/png?seed=${theme.seed}&backgroundColor=1a1a1a&scale=120`;
    const avatarBuffer = await fetch(avatarUrl).then(res => res.arrayBuffer());
    const avatarBase64 = `data:image/png;base64,${Buffer.from(avatarBuffer).toString('base64')}`;

    const svg = await satori(
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
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(to right, #3f3f46 1px, transparent 1px), linear-gradient(to bottom, #3f3f46 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            opacity: 0.1,
          }} />

          {/* Decorative Corner Pixels (Top Left) */}
          <div style={{ position: 'absolute', top: 20, left: 20, width: 20, height: 20, backgroundColor: theme.color }} />
          <div style={{ position: 'absolute', top: 20, left: 45, width: 10, height: 10, backgroundColor: theme.accent }} />
          <div style={{ position: 'absolute', top: 45, left: 20, width: 10, height: 10, backgroundColor: theme.accent }} />

          {/* Decorative Corner Pixels (Bottom Right) */}
          <div style={{ position: 'absolute', bottom: 20, right: 20, width: 20, height: 20, backgroundColor: theme.color }} />
          <div style={{ position: 'absolute', bottom: 20, right: 45, width: 10, height: 10, backgroundColor: theme.accent }} />
          <div style={{ position: 'absolute', bottom: 45, right: 20, width: 10, height: 10, backgroundColor: theme.accent }} />

          {/* Main Container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            padding: '60px',
            justifyContent: 'space-between',
          }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                backgroundColor: theme.color,
                boxShadow: `4px 4px 0px 0px ${theme.accent}`
              }}>
                 {/* Simple Gamepad Icon */}
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="6" width="20" height="12" rx="2" fill="#09090b" />
                    <rect x="6" y="10" width="4" height="4" fill={theme.color} />
                    <rect x="14" y="9" width="2" height="2" fill="white" />
                    <rect x="17" y="11" width="2" height="2" fill="white" />
                 </svg>
              </div>
              <div style={{ 
                fontSize: 32, 
                color: '#fff', 
                textShadow: `4px 4px 0px ${theme.accent}`,
                letterSpacing: '2px'
              }}>
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
                boxShadow: `10px 10px 0px 0px ${theme.accent}`,
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarBase64} width="280" height="280" alt="Avatar" style={{ imageRendering: 'pixelated' }} />
                
                {/* Seed/Tag Badge */}
                <div style={{
                    position: 'absolute',
                    bottom: '-15px',
                    right: '-15px',
                    backgroundColor: theme.accent,
                    color: '#000',
                    padding: '8px 12px',
                    fontSize: '14px',
                    border: '2px solid #fff',
                    transform: 'rotate(-5deg)'
                }}>
                    #{theme.seed.toUpperCase().substring(0, 4)}
                </div>
              </div>

              {/* Text Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flex: 1 }}>
                
                {/* Persona Title */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontSize: 16, color: theme.color, letterSpacing: '2px' }}>PLAYER IDENTITY DETECTED:</div>
                    <div style={{ 
                        fontSize: 40, 
                        color: 'white', 
                        lineHeight: '1.2',
                        textTransform: 'uppercase',
                        textShadow: '3px 3px 0px #000'
                    }}>
                        {persona}
                    </div>
                </div>

                {/* Top Game */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    <div style={{ fontSize: 16, color: '#a1a1aa' }}>MOST PLAYED:</div>
                    <div style={{ 
                        fontSize: 24, 
                        color: theme.accent,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        padding: '15px',
                        borderLeft: `4px solid ${theme.accent}`
                    }}>
                        {topGame}
                    </div>
                </div>

              </div>
            </div>

            {/* Footer Stats Bar */}
            <div style={{
                display: 'flex',
                width: '100%',
                backgroundColor: '#18181b',
                border: '2px solid #3f3f46',
                padding: '20px',
                justifyContent: 'space-around',
                alignItems: 'center',
                marginTop: '20px'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: 12, color: '#a1a1aa' }}>GAMES</span>
                    <span style={{ fontSize: 24, color: theme.color }}>{totalGames}</span>
                </div>
                <div style={{ width: '2px', height: '40px', backgroundColor: '#3f3f46' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: 12, color: '#a1a1aa' }}>SCORE</span>
                    <span style={{ fontSize: 24, color: theme.accent }}>{avgScore}</span>
                </div>
                <div style={{ width: '2px', height: '40px', backgroundColor: '#3f3f46' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: 12, color: '#a1a1aa' }}>HOURS</span>
                    <span style={{ fontSize: 24, color: '#fff' }}>{playtime.toLocaleString()}</span>
                </div>
            </div>
            
            <div style={{
                position: 'absolute',
                bottom: '25px',
                right: '25px',
                fontSize: '12px',
                color: '#52525b'
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

    const resvg = new Resvg(svg);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();

    const headers: Record<string, string> = {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    };

    const { searchParams } = new URL(req.url);
    if (searchParams.get('download') === 'true') {
      headers['Content-Disposition'] = `attachment; filename="gaming-wrapped-${id}.png"`;
    }

    return new NextResponse(new Blob([new Uint8Array(pngBuffer)]), {
      headers,
    });
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}
