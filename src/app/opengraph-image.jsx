import { ImageResponse } from 'next/og';

export const alt = 'Addis Eats — Authentic Ethiopian Kitchen';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#f5f5f4',
          color: '#292524',
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#92400e',
            marginBottom: 20,
          }}
        >
          ETHIOPIAN KITCHEN
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: '-2px',
          }}
        >
          Addis Eats
        </div>

        <div
          style={{
            fontSize: 32,
            marginTop: 20,
            color: '#57534e',
          }}
        >
          Authentic Ethiopian cuisine, delivered across Addis Ababa.
        </div>
      </div>
    ),
    size
  );
}