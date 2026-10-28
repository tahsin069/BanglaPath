import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'BanglaGrantha – Global Bengali Digital Library & Audiobooks';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FBF9F5',
          color: '#1C1917',
          padding: '64px 72px',
          border: '16px solid #9A3412',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 22,
            letterSpacing: '0.16em',
            color: '#9A3412',
            textTransform: 'uppercase',
          }}
        >
          <span>BANGLAGRANTHA · GLOBAL LITERARY ARCHIVE</span>
          <span>BENGALI &amp; ENGLISH AUDIOBOOKS</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: 20 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.1,
              color: '#1C1917',
            }}
          >
            Every Bengali Classic Ever Published, Reborn as E-Book &amp; Living Audiobook.
          </div>
          <div
            style={{
              fontSize: 28,
              marginTop: 24,
              color: '#57534E',
              lineHeight: 1.4,
            }}
          >
            Unabridged Multi-Chapter Bengali &amp; English Narration · 5 Federated Global Archives · Cross-Device Sync
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 24,
            borderTop: '2px solid #D6CEBE',
            fontSize: 22,
            color: '#44403C',
          }}
        >
          <span>Upanyas · Kabita · Chhotogolpo · Rahasya &amp; Sci-Fi · Prabandha · Shishu</span>
          <span style={{ color: '#9A3412', fontWeight: 700 }}>100% Free Public Access</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
