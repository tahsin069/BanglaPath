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
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1 }}>BG</div>
        <div style={{ fontSize: 16, marginTop: 8, letterSpacing: '0.15em', color: '#FBBF24' }}>
          ARCHIVE
        </div>
      </div>
    ),
    {
      width: 180,
      height: 180,
    }
  );
}
