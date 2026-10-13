import { ImageResponse } from 'next/og';
import fs from 'node:fs/promises';
import path from 'node:path';

export const alt = 'Addis Eats — Authentic Ethiopian Kitchen';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
export const runtime = 'nodejs';

export default async function OpenGraphImage() {
  const filePath = path.join(process.cwd(), 'public', 'images', 'hero-feast.jpg');
  const fileBuffer = await fs.readFile(filePath);
  const base64Image = `data:image/jpeg;base64,${fileBuffer.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#1c1917',
        }}
      >
        {/* Background Hero Picture */}
        <img
          src={base64Image}
          alt={alt}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Cinematic Vignette Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background:
              'linear-gradient(to top, rgba(17, 14, 12, 0.94) 0%, rgba(28, 25, 23, 0.65) 55%, rgba(28, 25, 23, 0.35) 100%)',
          }}
        />

        {/* Content Container */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            padding: '60px 70px',
          }}
        >
          {/* Top Brand Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: '#f59e0b',
                  color: '#1c1917',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '24px',
                  marginRight: '16px',
                }}
              >
                AE
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#fbbf24',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              >
                Addis Eats
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                background: 'rgba(0, 0, 0, 0.55)',
                border: '1px solid rgba(251, 191, 36, 0.4)',
                borderRadius: '999px',
                padding: '10px 24px',
                color: '#fef3c7',
                fontSize: '20px',
                fontWeight: 700,
              }}
            >
              ⭐ 4.9 · Authentic Ethiopian Kitchen
            </div>
          </div>

          {/* Bottom Heading & Subtitle */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: '66px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-1.5px',
                lineHeight: 1.15,
                marginBottom: '16px',
                textShadow: '0 4px 24px rgba(0,0,0,0.8)',
              }}
            >
              Taste the Soul of Ethiopian Cuisine
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255, 255, 255, 0.25)',
                paddingTop: '20px',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: '24px',
                  color: '#e7e5e4',
                  fontWeight: 500,
                }}
              >
                Handcrafted wots & fresh teff sourdough delivered across Addis Ababa
              </div>

              <div
                style={{
                  display: 'flex',
                  fontSize: '22px',
                  color: '#fbbf24',
                  fontWeight: 800,
                }}
              >
                addiseats.et
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}