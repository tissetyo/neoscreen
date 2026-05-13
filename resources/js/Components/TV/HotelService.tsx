'use client';

import useSWR from 'swr';
import { useRoomStore } from '@/stores/roomStore';
import {
  Baby,
  ConciergeBell, Utensils, Car, Shirt, Coffee, Sparkles,
  Scissors, ShoppingBag, Map, Briefcase, Bell, Plane, Dumbbell,
  HeartPulse, Bike, Wine, Luggage, ShowerHead
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
  Plane: <Plane className="w-full h-full" />,
  Dumbbell: <Dumbbell className="w-full h-full" />,
  HeartPulse: <HeartPulse className="w-full h-full" />,
  Baby: <Baby className="w-full h-full" />,
  Bike: <Bike className="w-full h-full" />,
  Wine: <Wine className="w-full h-full" />,
  Luggage: <Luggage className="w-full h-full" />,
  ShowerHead: <ShowerHead className="w-full h-full" />,
};

const CATEGORY_ICON: Record<string, keyof typeof ICONS> = {
  dining: 'Utensils',
  food: 'Utensils',
  restaurant: 'Utensils',
  transport: 'Car',
  transportation: 'Car',
  taxi: 'Car',
  laundry: 'Shirt',
  housekeeping: 'Sparkles',
  cleaning: 'Sparkles',
  spa: 'Sparkles',
  wellness: 'Sparkles',
  shopping: 'ShoppingBag',
  concierge: 'Bell',
  tour: 'Map',
  business: 'Briefcase',
};

/** Render the icon — tries Lucide map first, falls back to raw text (emoji) */
function iconForService(service: Pick<Service, 'name' | 'icon'> & { category?: string | null }) {
  if (service.icon && ICONS[service.icon]) return ICONS[service.icon];
  const normalizedCategory = (service.category || '').toLowerCase();
  const categoryIcon = CATEGORY_ICON[normalizedCategory];
  if (categoryIcon) return ICONS[categoryIcon];

  const name = (service.name || '').toLowerCase();
  if (name.includes('room') || name.includes('food') || name.includes('dining')) return ICONS.Utensils;
  if (name.includes('laundry') || name.includes('linen')) return ICONS.Shirt;
  if (name.includes('car') || name.includes('taxi') || name.includes('transport')) return ICONS.Car;
  if (name.includes('spa') || name.includes('clean') || name.includes('house')) return ICONS.Sparkles;
  if (name.includes('shop')) return ICONS.ShoppingBag;
  if (name.includes('tour') || name.includes('map')) return ICONS.Map;
  return <ConciergeBell className="w-full h-full" />;
}

interface Props {
  onOpenServices?: () => void;
  services?: (Pick<Service, 'id' | 'name' | 'icon' | 'image_url'> & { category?: string | null })[];
}

export default function HotelService({ onOpenServices, services: initialServices }: Props) {
  const store = useRoomStore();

  const { data: fetchedServices } = useSWR(
    initialServices?.length ? null : (store.hotelId && store.hotelSlug ? `services-widget-${store.hotelId}` : null),
    async () => {
      const roomId = store.roomId ? `?roomId=${encodeURIComponent(store.roomId)}` : '';
      const res = await fetch(`/api/hotel/${store.hotelSlug}/tv-config${roomId}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.services || []) as (Pick<Service, 'id' | 'name' | 'icon' | 'image_url'> & { category?: string | null })[];
    },
    { refreshInterval: 120000 }
  );

  const services = initialServices?.length ? initialServices : fetchedServices;
  const visibleServices = (services || []).slice(0, 8);
  const heroService = visibleServices.find((service) => service.image_url);

  return (
    <button
      className="hotel-service h-full w-full min-h-0 flex flex-col items-start justify-between text-left tv-focusable group relative overflow-hidden px-[clamp(32px,5cqw,80px)] py-[clamp(28px,4cqh,80px)] bg-black/40 backdrop-blur-2xl rounded-[var(--widget-radius)] border border-white/10 [transform:translateZ(0)]"
      tabIndex={0}
      onClick={onOpenServices}
    >
      {heroService?.image_url && (
        <>
          <img src={heroService.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-black/45" />
        </>
      )}
      <span className="hotel-service-title relative z-10 text-white text-[clamp(20px,min(3.5cqw,24cqh),64px)] font-medium tracking-wide truncate max-w-full">
        Hotel Service
      </span>

      <div className="hotel-service-icons relative z-10 flex max-w-full flex-wrap items-center gap-x-[clamp(16px,2.5cqw,48px)] gap-y-[clamp(10px,1.5cqh,20px)] overflow-hidden text-[#ffa62a]">
        {visibleServices.length > 0 ? (
          visibleServices.map((service) => (
            <div
              key={service.id}
              className="hotel-service-icon h-[clamp(28px,min(5cqw,36cqh),90px)] w-[clamp(28px,min(5cqw,36cqh),90px)] shrink-0"
              title={service.name}
            >
              {iconForService(service)}
            </div>
          ))
        ) : (
          <div className="hotel-service-icon h-[clamp(28px,min(5cqw,36cqh),90px)] w-[clamp(28px,min(5cqw,36cqh),90px)] shrink-0">
            <ConciergeBell className="w-full h-full" />
          </div>
        )}
        {services && services.length > visibleServices.length && (
          <span className="text-[clamp(14px,2cqw,28px)] font-semibold text-white/75 ml-[clamp(4px,1cqw,12px)]">
            +{services.length - visibleServices.length}
          </span>
        )}
      </div>
    </button>
  );
}
