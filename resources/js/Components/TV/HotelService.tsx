'use client';

import useSWR from 'swr';
import { useRoomStore } from '@/stores/roomStore';
import {
  ConciergeBell, Utensils, Car, Shirt, Coffee, Sparkles,
  Scissors, ShoppingBag, Map, Briefcase, Bell
} from 'lucide-react';
import type { Service } from '@/types';

// Match the icon mapping used in admin/frontoffice settings/services
const ICONS: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="w-full h-full" />,
  Car: <Car className="w-full h-full" />,
  Shirt: <Shirt className="w-full h-full" />,
  Coffee: <Coffee className="w-full h-full" />,
  Sparkles: <Sparkles className="w-full h-full" />,
  Scissors: <Scissors className="w-full h-full" />,
  ShoppingBag: <ShoppingBag className="w-full h-full" />,
  Map: <Map className="w-full h-full" />,
  Briefcase: <Briefcase className="w-full h-full" />,
  Bell: <Bell className="w-full h-full" />,
};

/** Render the icon — tries Lucide map first, falls back to raw text (emoji) */
function renderIcon(icon: string | null | undefined) {
  if (!icon) return <ConciergeBell className="w-full h-full" />;
  return ICONS[icon] || <span className="text-[clamp(18px,1.7vw,34px)] leading-none">{icon}</span>;
}

interface Props {
  onOpenServices?: () => void;
}

export default function HotelService({ onOpenServices }: Props) {
  const store = useRoomStore();

  const { data: services } = useSWR(
    store.hotelId ? `services-widget-${store.hotelId}` : null,
    async () => {
      const res = await fetch(`/api/hotel/${store.hotelSlug}/tv-config`);
      const data = await res.json();
      return (data.services || []) as Pick<Service, 'id' | 'name' | 'icon'>[];
    },
    { refreshInterval: 120000 }
  );

  const visibleServices = (services || []).slice(0, 8);

  return (
    <button
      className="tv-widget h-full min-h-0 flex flex-col items-start justify-center w-full text-left tv-focusable group relative overflow-hidden"
      tabIndex={0}
      onClick={onOpenServices}
    >
      <span className="text-white text-[clamp(16px,min(1.45vw,16cqh),27px)] font-normal tracking-normal truncate max-w-full">
        Hotel Service
      </span>

      <div className="mt-[min(1.4vh,1vw)] flex max-w-full items-center gap-[clamp(12px,1.25vw,24px)] overflow-hidden text-[#ffa62a]">
        {visibleServices.length > 0 ? (
          visibleServices.map((service) => (
            <div
              key={service.id}
              className="h-[clamp(22px,min(2vw,28cqh),40px)] w-[clamp(22px,min(2vw,28cqh),40px)] shrink-0"
              title={service.name}
            >
              {renderIcon(service.icon)}
            </div>
          ))
        ) : (
          <div className="h-[clamp(22px,min(2vw,28cqh),40px)] w-[clamp(22px,min(2vw,28cqh),40px)] shrink-0">
            <ConciergeBell className="w-full h-full" />
          </div>
        )}
        {services && services.length > visibleServices.length && (
          <span className="text-[clamp(10px,0.8vw,14px)] font-semibold text-white/75">
            +{services.length - visibleServices.length}
          </span>
        )}
      </div>
    </button>
  );
}
