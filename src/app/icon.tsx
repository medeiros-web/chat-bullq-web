import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: '22%',
        }}
      >
        {/* Chat bubble shape via nested divs */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '50px',
              width: '320px',
              height: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Dots inside bubble */}
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb' }} />
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb' }} />
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#2563eb' }} />
            </div>
            {/* Bubble tail */}
            <div
              style={{
                position: 'absolute',
                bottom: '-30px',
                left: '48px',
                width: '0',
                height: '0',
                borderLeft: '30px solid white',
                borderRight: '0px solid transparent',
                borderTop: '30px solid transparent',
              }}
            />
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.9)',
              fontSize: '64px',
              fontWeight: '800',
              letterSpacing: '-1px',
              marginTop: '20px',
            }}
          >
            BullQ
          </div>
        </div>
      </div>
    ),
    size,
  );
}
