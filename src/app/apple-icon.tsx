import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(145deg, #1e3a8a 0%, #2563eb 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20%',
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '18px',
            width: '112px',
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2563eb' }} />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '-10px',
              left: '16px',
              width: '0',
              height: '0',
              borderLeft: '10px solid white',
              borderTop: '10px solid transparent',
            }}
          />
        </div>
      </div>
    ),
    size,
  );
}
