import { ImageResponse } from 'next/og';
import fs from 'node:fs/promises';
import path from 'node:path';

export const alt = 'Addis Eats Dish';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

async function getDishes() {
  const filePath = path.join(process.cwd(), 'public', 'dishes.json');
  const fileContents = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContents);
}

export async function generateStaticParams() {
  const dishes = await getDishes();
  return dishes.map((dish) => ({
    id: String(dish.id),
  }));
}

export default async function OpenGraphImage({ params }) {
  const { id } = await params;
  const dishes = await getDishes();
  const dish = dishes.find((item) => String(item.id) === String(id));

  const name = dish?.name || 'Ethiopian Dish';
  const category = dish?.category || 'Traditional Kitchen';
  const price = dish ? `${dish.price} ETB` : '';
  const isVegetarian = dish?.vegetarian;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#fdfbf7',
          color: '#292524',
        }}
      >
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
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#78350f',
                color: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '20px',
                marginRight: '16px',
              }}
            >
              AE
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: '24px',
                fontWeight: 700,
                color: '#92400e',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {`Addis Eats · ${category}`}
            </div>
          </div>
          {price ? (
            <div
              style={{
                display: 'flex',
                fontSize: '32px',
                fontWeight: 800,
                color: '#78350f',
                background: '#fef3c7',
                padding: '10px 24px',
                borderRadius: '16px',
                border: '1px solid #fde68a',
              }}
            >
              {price}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '68px',
              fontWeight: 800,
              letterSpacing: '-2px',
              color: '#1c1917',
              marginBottom: '16px',
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '28px',
              color: '#57534e',
              lineHeight: 1.4,
              maxWidth: '900px',
            }}
          >
            {isVegetarian
              ? 'Handcrafted Ethiopian vegetarian specialty slow-cooked and served with fresh sourdough teff injera.'
              : 'Slow-simmered traditional Ethiopian delicacy prepared with spiced butter and authentic highland spices.'}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2px solid #e7e5e4',
            paddingTop: '24px',
            color: '#78716c',
            fontSize: '20px',
            fontWeight: 600,
            width: '100%',
          }}
        >
          <div style={{ display: 'flex' }}>Fresh Daily in Addis Ababa</div>
          <div style={{ display: 'flex' }}>{`addiseats.et/menu/${id}`}</div>
        </div>
      </div>
    ),
    size
  );
}
