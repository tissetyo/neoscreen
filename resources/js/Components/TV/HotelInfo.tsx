'use client';

import { Building2 } from 'lucide-react';

interface Props {
  hotelName: string;
  featuredImageUrl?: string | null;
}

export default function HotelInfo({ hotelName, featuredImageUrl }: Props) {
  return (
    <div
      className="hotel-info-card flex-1 tv-focusable flex flex-row items-center gap-[clamp(8px,1cqw,22px)] overflow-hidden relative"
      tabIndex={0}
      style={{
        borderRadius: 'var(--widget-radius)',
        padding: 'var(--widget-pad)',
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
          {/* Dark overlay for readable text */}
          <div
            className="absolute inset-0"
            style={{
              borderRadius: 'var(--widget-radius)',
              background: 'linear-gradient(135deg, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.45) 100%)',
              backdropFilter: 'blur(2px)',
            }}
          />
        </>
      ) : (
        /* Fallback: standard tv-widget-light background via inline */
        <div
          className="absolute inset-0"
          style={{
            borderRadius: 'var(--widget-radius)',
            background: 'var(--widget-bg, rgba(255, 255, 255, 0.82))',
            backdropFilter: 'blur(24px) saturate(1.2)',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex w-full flex-row items-center gap-[clamp(8px,1cqw,22px)]">
        {!featuredImageUrl && (
          <div
            className="hotel-info-icon w-[clamp(32px,min(8cqw,42cqh),96px)] h-[clamp(32px,min(8cqw,42cqh),96px)] rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: 'rgba(148, 163, 184, 0.15)' }}
          >
            <Building2 className="w-[48%] h-[48%] text-slate-400" />
          </div>
        )}
        <div className="min-w-0">
          <p
            className={`hotel-info-label text-[clamp(8px,0.9cqw,16px)] font-medium mb-[0.1vh] uppercase tracking-wide ${
              featuredImageUrl ? 'text-white/70' : 'text-slate-500'
            }`}
          >
            Hotel Info
          </p>
          <p
            className={`hotel-info-name text-[clamp(10px,1.55cqw,30px)] font-medium truncate ${
              featuredImageUrl ? 'text-white' : 'text-slate-900'
            }`}
          >
            {hotelName || 'Hotel Name'}
          </p>
        </div>
      </div>

      {/* Gradient stroke border (matching tv-widget-light::before) */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          borderRadius: 'var(--widget-radius)',
          border: '1.5px solid rgba(255,255,255,0.15)',
        }}
      />
    </div>
  );
}
