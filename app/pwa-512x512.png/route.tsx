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
          borderRadius: '96px',
          border: '14px solid #FBBF24',
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 210, fontWeight: 700, lineHeight: 1 }}>BG</div>
        <div style={{ fontSize: 44, marginTop: 18, letterSpacing: '0.18em' }}>BANGLAGRANTHA</div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
