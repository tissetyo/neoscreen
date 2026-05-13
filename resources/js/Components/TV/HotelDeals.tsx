'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '@/stores/roomStore';
import { ChevronRight, Sparkles } from 'lucide-react';

interface Props {
  onOpenPromos?: () => void;
}

export default function HotelDeals({ onOpenPromos }: Props) {
  const store = useRoomStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use server API (bypasses RLS) so STBs without auth cookies can see promos
  const { data: promos } = useSWR(
    store.hotelSlug ? `/api/hotel/${store.hotelSlug}/promos` : null,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) return [];
      const json = await res.json();
      return json.promos || [];
    },
    { refreshInterval: 120000 }
  );

  useEffect(() => {
    if (!promos || promos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promos.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [promos]);

  const hasPromos = promos && promos.length > 0;
  const currentPromo = hasPromos ? promos[currentIndex] : null;
  const currentPoster = currentPromo?.poster_url || currentPromo?.image_url || null;

  return (
    <div
      className="tv-widget h-full flex flex-col tv-focusable relative"
      tabIndex={0}
      onClick={hasPromos ? onOpenPromos : undefined}
      style={{ cursor: hasPromos ? 'pointer' : 'default' }}
    >
      <div className="hotel-deals-header flex items-center justify-between mb-[clamp(8px,1.6cqh,18px)] z-10 relative">
        <div className="flex items-center gap-2">
          <Sparkles className="hotel-deals-icon h-[clamp(14px,1.6cqw,30px)] w-[clamp(14px,1.6cqw,30px)] text-white/80" />
          <span className="hotel-deals-title text-white text-[clamp(12px,1.45cqw,28px)] font-semibold">Hotel Deals</span>
        </div>
        {hasPromos && (
          <ChevronRight className="h-[clamp(12px,1.2cqw,22px)] w-[clamp(12px,1.2cqw,22px)] text-white/50" />
        )}
      </div>
      <div className="flex-1 overflow-hidden rounded-xl relative">
        <AnimatePresence mode="wait">
          {hasPromos && currentPoster ? (
            <motion.img
              key={currentIndex}
              src={currentPoster}
              alt="Promo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full object-cover rounded-xl absolute inset-0"
            />
          ) : hasPromos ? (
            <motion.div
              key={currentPromo?.id || currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full absolute inset-0 rounded-xl flex flex-col items-center justify-center bg-gradient-to-br from-rose-500/25 to-amber-400/20 px-[1.2cqw] text-center"
            >
              <Sparkles className="w-[clamp(28px,5cqw,76px)] h-[clamp(28px,5cqw,76px)] text-white/45 mb-[0.8vh]" />
              <span className="line-clamp-2 text-white text-[clamp(11px,1.35cqw,24px)] font-semibold">{currentPromo?.title}</span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full h-full absolute inset-0 rounded-xl flex flex-col items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <Sparkles className="w-[clamp(28px,5cqw,76px)] h-[clamp(28px,5cqw,76px)] text-white/20 mb-[0.8vh]" />
              <span className="text-white/30 text-[clamp(10px,1.2cqw,22px)] font-medium">No deals available</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Indicators */}
        {hasPromos && promos.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
            {promos.map((_: any, idx: number) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
