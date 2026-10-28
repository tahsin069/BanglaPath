import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  // Maskable icon with 18% safe-zone padding around central emblem
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#9A3412',
          color: '#FBF9F5',
          padding: '92px',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '164px',
            border: '8px solid #FBBF24',
          }}
        >
          <div style={{ fontSize: 150, fontWeight: 700, lineHeight: 1 }}>BG</div>
          <div style={{ fontSize: 28, marginTop: 12, letterSpacing: '0.12em' }}>AUDIO</div>
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
