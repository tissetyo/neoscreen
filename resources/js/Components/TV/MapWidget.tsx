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
    <div className="w-full h-full min-h-0 tv-focusable rounded-[var(--widget-radius)] overflow-hidden bg-slate-100 relative flex items-center justify-center" tabIndex={0}>
      <iframe
        src={mapSrc}
        title={`${placeLabel} map`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-[clamp(5px,0.45vw,9px)] bg-white/95 px-[clamp(7px,0.65vw,13px)] py-[clamp(5px,0.45vw,9px)] text-slate-950 shadow-[0_-8px_22px_rgba(15,23,42,0.08)]">
        <MapPin className="h-[clamp(12px,0.9vw,18px)] w-[clamp(12px,0.9vw,18px)] shrink-0 fill-slate-950 text-slate-950" strokeWidth={2.5} />
        <span className="truncate text-[clamp(9px,0.65vw,13px)] font-medium leading-none">{hotelName || location || 'Hotel'}</span>
      </div>
    </div>
  );
}
