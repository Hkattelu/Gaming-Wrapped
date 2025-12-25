import { NextRequest, NextResponse } from 'next/server';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getWrapped } from '@/lib/db';
import { Game } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const wrapped = await getWrapped(id);

    if (!wrapped) {
      return new NextResponse('Not Found', { status: 404 });
    }

    // Extract stats
    const summaryCard = wrapped.cards.find((c: any) => c.type === 'summary');
    const platformCard = wrapped.cards.find((c: any) => c.type === 'platform_stats');
    const topGameCard = wrapped.cards.find((c: any) => c.type === 'top_game');
    const personaCard = wrapped.cards.find((c: any) => c.type === 'player_persona');

    const totalGames = summaryCard?.totalGames ?? 0;
    const avgScore = (summaryCard?.averageScore ?? 0).toFixed(1);
    const playtime = totalGames * 20;
    const topPlatform = platformCard?.data?.[0]?.platform ?? 'Various';
    const topGame = topGameCard?.game?.title ?? 'Multiple';
    const persona = personaCard?.persona ?? 'Gamer';

    // Fetch font
    const fontData = await fetch(
      new URL('https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf', 'https://fonts.gstatic.com')
    ).then((res) => res.arrayBuffer());

    const svg = await satori(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#09090b',
            backgroundImage: 'radial-gradient(circle at center, #18181b 0%, #09090b 100%)',
            color: 'white',
            fontFamily: 'Inter',
            padding: '40px',
            position: 'relative',
          }}
        >
          {/* Decorative Grid */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.5,
            display: 'flex',
          }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ 
              fontSize: 60, 
              fontWeight: 900, 
              letterSpacing: '0.15em', 
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="12" x="2" y="6" rx="2" />
                <path d="M6 12h.01M9 12h.01M15 11h.01M18 11h.01M15 13h.01M18 13h.01" />
              </svg>
              GAMING WRAPPED
            </div>
          </div>

          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', gap: '30px' }}>
            {/* Left Column: Persona & Top Game */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', fontSize: 18, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Your Persona</div>
                <div style={{ display: 'flex', fontSize: 32, fontWeight: 700, color: '#f8fafc' }}>{persona}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.03)', border: '2px solid rgba(255,255,255,0.1)', padding: '24px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', fontSize: 18, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Top Game</div>
                <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#f8fafc' }}>{topGame}</div>
              </div>
            </div>

            {/* Right Column: Stats Grid (Simulated with Flex) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1.2 }}>
              <div style={{ display: 'flex', gap: '20px', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '2px solid #3b82f6', padding: '20px', borderRadius: '16px', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, color: '#3b82f6' }}>{totalGames}</div>
                  <div style={{ display: 'flex', fontSize: 16, color: '#94a3b8', textTransform: 'uppercase' }}>Games Played</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '2px solid #f59e0b', padding: '20px', borderRadius: '16px', alignItems: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', fontSize: 48, fontWeight: 800, color: '#f59e0b' }}>{avgScore}</div>
                  <div style={{ display: 'flex', fontSize: 16, color: '#94a3b8', textTransform: 'uppercase' }}>Avg Score</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '2px solid #10b981', padding: '20px', borderRadius: '16px', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', fontSize: 42, fontWeight: 800, color: '#10b981' }}>{`${playtime.toLocaleString()} HRS`}</div>
                <div style={{ display: 'flex', fontSize: 16, color: '#94a3b8', textTransform: 'uppercase' }}>Estimated Playtime</div>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '20px', right: '40px', fontSize: 14, color: '#4b5563', display: 'flex' }}>
            gaming-wrapped.vercel.app
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
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

    return new NextResponse(pngBuffer, {
      headers,
    });
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}