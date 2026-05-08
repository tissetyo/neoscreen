'use client';

import { Building2 } from 'lucide-react';

interface Props {
  hotelName: string;
  featuredImageUrl?: string | null;
}

export default function HotelInfo({ hotelName, featuredImageUrl }: Props) {
  return (
    <div
      className="hotel-info-card h-full w-full tv-focusable overflow-hidden relative border border-white/10"
      tabIndex={0}
      style={{
        borderRadius: 'var(--widget-radius)',
        boxShadow: featuredImageUrl ? '0 4px 24px rgba(0,0,0,0.25)' : '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      {/* Background image layer */}
      {featuredImageUrl ? (
        <>
          <img
            src={featuredImageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{ borderRadius: 'var(--widget-radius)' }}
          />
          {/* Subtle gradient for text readability */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              borderRadius: 'var(--widget-radius)',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 40%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8) 100%)',
            }}
          />
        </>
      ) : (
        /* Fallback: dark solid background */
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: 'var(--widget-radius)',
            background: '#1a1a1a',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between p-[clamp(16px,2cqw,40px)]">
        <p className="hotel-info-label text-white text-[clamp(20px,min(4cqw,30cqh),72px)] font-semibold tracking-wide drop-shadow-md">
          Hotel Info
        </p>
        <p className="hotel-info-name text-white text-[clamp(16px,min(3cqw,20cqh),48px)] font-medium tracking-wide drop-shadow-md truncate">
          {hotelName || 'Hotel Name'}
        </p>
      </div>

    </div>
  );
}
