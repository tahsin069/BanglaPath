import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#9A3412',
          color: '#FBF9F5',
          borderRadius: '36px',
          border: '6px solid #FBBF24',
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 78, fontWeight: 700, lineHeight: 1 }}>BG</div>
        <div style={{ fontSize: 18, marginTop: 8, letterSpacing: '0.15em' }}>ARCHIVE</div>
      </div>
    ),
    {
      width: 192,
      height: 192,
    }
  );
}
