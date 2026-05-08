'use client';

import { MapPin } from 'lucide-react';

interface Props {
  location: string;
  hotelName: string;
}

export default function MapWidget({ location, hotelName }: Props) {
  const placeLabel = [hotelName, location].filter(Boolean).join(', ') || 'Hotel';
  const query = encodeURIComponent(placeLabel);
  const mapsKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_MAPS_EMBED_KEY) || '';
  const mapSrc = mapsKey && !mapsKey.includes('your_')
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${query}&zoom=15`
    : `https://maps.google.com/maps?q=${query}&z=15&output=embed`;

  return (
    <div className="map-card tv-widget h-full min-h-0 tv-focusable rounded-[var(--widget-radius)] overflow-hidden relative flex items-center justify-center !p-0 [transform:translateZ(0)]" tabIndex={0}>
      <iframe
        src={mapSrc}
        title={`${placeLabel} map`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="pointer-events-none absolute inset-0 h-full w-full rounded-[inherit]"
      />
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-[clamp(5px,0.9cqw,16px)] border-t border-white/40 bg-white/95 px-[clamp(7px,1.1cqw,22px)] py-[clamp(5px,0.9cqh,14px)] text-slate-950 shadow-[0_-8px_22px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <MapPin className="h-[clamp(12px,1.45cqw,28px)] w-[clamp(12px,1.45cqw,28px)] shrink-0 fill-slate-950 text-slate-950" strokeWidth={2.5} />
        <span className="truncate text-[clamp(9px,1.25cqw,24px)] font-medium leading-none">{hotelName || location || 'Hotel'}</span>
      </div>
    </div>
  );
}
