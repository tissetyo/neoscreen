'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '@/stores/roomStore';
import AnalogClock from '@/Components/TV/AnalogClock';
import DigitalClock from '@/Components/TV/DigitalClock';
import GuestCard from '@/Components/TV/GuestCard';
import WifiCard from '@/Components/TV/WifiCard';
import FlightSchedule from '@/Components/TV/FlightSchedule';
import NotificationCard from '@/Components/TV/NotificationCard';
import HotelDeals from '@/Components/TV/HotelDeals';
import HotelService from '@/Components/TV/HotelService';
import HotelInfo from '@/Components/TV/HotelInfo';
import MapWidget from '@/Components/TV/MapWidget';
import MarqueeBar from '@/Components/TV/MarqueeBar';
import { CheckoutWidget } from '@/Components/TV/CheckoutReminder';
import {
  AlarmClock, MessageCircle, Bell, Settings,
  Wifi, Plane, ShoppingBag, MapPin, Info, User,
  Clock, X, ChevronLeft, ChevronRight, ConciergeBell
} from 'lucide-react';

interface SlideshowProps {
  config: any;
  onAction: (action: string) => void;
  onLaunchApp: (app: any) => void;
  onOpenPromos: () => void;
  onOpenServices: () => void;
  isModalOpen?: boolean;
}

const DEFAULT_SLIDESHOW_IMAGES = [
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1920&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920&auto=format&fit=crop',
];

const DOCK_WIDGETS = [
  { id: 'clock',    label: 'Clocks',        icon: Clock },
  { id: 'guest',    label: 'Guest',         icon: User },
  { id: 'wifi',     label: 'WiFi',          icon: Wifi },
  { id: 'flights',  label: 'Flights',       icon: Plane },
  { id: 'notif',    label: 'Notifications', icon: Bell },
  { id: 'deals',    label: 'Deals',         icon: ShoppingBag },
  { id: 'services', label: 'Services',      icon: ConciergeBell },
  { id: 'map',      label: 'Map',           icon: MapPin },
  { id: 'info',     label: 'Hotel',         icon: Info },
  { id: 'alarm',    label: 'Alarm',         icon: AlarmClock },
  { id: 'chat',     label: 'Chat',          icon: MessageCircle },
  { id: 'settings', label: 'Settings',      icon: Settings },
];

export default function SlideshowDashboard({
  config, onAction, onLaunchApp, onOpenPromos, onOpenServices, isModalOpen,
}: SlideshowProps) {
  const store = useRoomStore();

  const slideshowImages = config.slideshow?.images?.length
    ? config.slideshow.images
    : (store.backgroundUrl ? [store.backgroundUrl] : DEFAULT_SLIDESHOW_IMAGES);
  const autoAdvanceSec = config.slideshow?.autoAdvanceSeconds ?? 10;

  const [bgIndex, setBgIndex] = useState(0);
  const [activeWidget, setActiveWidget] = useState<string | null>(null);
  const [centerIdx, setCenterIdx] = useState(0);
  const [carouselVisible, setCarouselVisible] = useState(false);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const widgetDismissSec = config.slideshow?.widgetDismissSeconds ?? 15;

  const AUTO_SHOW_WIDGETS = ['clock', 'guest', 'wifi', 'flights', 'map', 'info'];

  const isCheckoutDay = store.checkoutDate
    ? new Date(`${store.checkoutDate}T00:00:00`).toDateString() === new Date().toDateString()
    : false;

  const allDockItems = [
    ...DOCK_WIDGETS,
    ...(config.apps || []).map((app: any) => ({
      id: `app-${app.id}`, label: app.name, icon: null, app,
    })),
  ];

  // Background auto-advance
  useEffect(() => {
    if (slideshowImages.length <= 1 || autoAdvanceSec <= 0) return;
    const t = setInterval(() => setBgIndex(p => (p + 1) % slideshowImages.length), autoAdvanceSec * 1000);
    return () => clearInterval(t);
  }, [slideshowImages.length, autoAdvanceSec]);

  // Auto-show floating widgets when centered
  useEffect(() => {
    if (!carouselVisible) {
      setActiveWidget(null);
      return;
    }
    const item = allDockItems[centerIdx];
    if (item && AUTO_SHOW_WIDGETS.includes(item.id)) {
      setActiveWidget(item.id);
    } else {
      setActiveWidget(null);
    }
  }, [centerIdx, carouselVisible, allDockItems]);

  // Auto-dismiss carousel + widget
  const resetDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      setActiveWidget(null);
      setCarouselVisible(false);
    }, widgetDismissSec * 1000);
  }, [widgetDismissSec]);

  useEffect(() => () => { if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current); }, []);

  // Handle selection of center item
  const selectCenterItem = useCallback(() => {
    const item = allDockItems[centerIdx];
    if (!item) return;
    if (['alarm', 'chat', 'settings'].includes(item.id)) { onAction(item.id); return; }
    if (item.id === 'notif') { onAction('notif'); return; }
    if (item.id === 'services') { onOpenServices(); return; }
    if (item.id === 'deals') { onOpenPromos(); return; }
    if (item.app) { onLaunchApp(item.app); return; }
    // If it's an auto-show widget, Enter just resets the dismiss timer
    resetDismissTimer();
  }, [centerIdx, allDockItems, onAction, onOpenServices, onOpenPromos, onLaunchApp, resetDismissTimer]);

  // Keyboard navigation
  useEffect(() => {
    if (isModalOpen) return; // Yield keyboard control to active modals
    
    const handler = (e: KeyboardEvent) => {
      const isRight = e.key === 'ArrowRight' || e.keyCode === 39;
      const isLeft = e.key === 'ArrowLeft' || e.keyCode === 37;
      const isUp = e.key === 'ArrowUp' || e.keyCode === 38;
      const isEnter = e.key === 'Enter' || e.keyCode === 13 || e.key === 'Select';
      const isEscape = e.key === 'Escape' || e.keyCode === 27 || e.key === 'Backspace' || e.keyCode === 8;

      if (isEscape) {
        if (activeWidget) { setActiveWidget(null); resetDismissTimer(); }
        else if (carouselVisible) { setCarouselVisible(false); if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current); }
        return;
      }
      if (!carouselVisible) {
        setCarouselVisible(true);
        resetDismissTimer();
        return;
      }
      if (isRight) {
        setCenterIdx(p => (p + 1) % allDockItems.length);
        resetDismissTimer();
      } else if (isLeft) {
        setCenterIdx(p => (p - 1 + allDockItems.length) % allDockItems.length);
        resetDismissTimer();
      } else if (isEnter) {
        selectCenterItem();
      } else if (isUp) {
        if (activeWidget) { setActiveWidget(null); resetDismissTimer(); }
      } else {
        resetDismissTimer();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isModalOpen, carouselVisible, activeWidget, centerIdx, allDockItems.length, selectCenterItem, resetDismissTimer]);

  // Render expanded widget panel
  const renderWidget = () => {
    if (!activeWidget) return null;
    const content = (() => {
      switch (activeWidget) {
        case 'clock': return (
          <div className="flex items-center gap-[2vw]">
            {store.clockTimezones?.length >= 3 && (
              <div className="flex items-center gap-[1.5vw]">
                <AnalogClock timezone={store.clockTimezones[0]} label={store.clockLabels[0]} size={80} clockStyle={config.theme?.clockStyle} />
                <AnalogClock timezone={store.clockTimezones[1]} label={store.clockLabels[1]} size={80} clockStyle={config.theme?.clockStyle} />
                <AnalogClock timezone={store.clockTimezones[2]} label={store.clockLabels[2]} size={80} clockStyle={config.theme?.clockStyle} />
              </div>
            )}
          </div>
        );
        case 'guest': return isCheckoutDay
          ? <CheckoutWidget onOpenModal={() => onAction('checkout-reminder')} />
          : <GuestCard guestName={store.guestName} guestPhotoUrl={store.guestPhotoUrl} roomCode={store.roomCode} onClick={() => onAction('logout')} />;
        case 'wifi': return <WifiCard ssid={store.wifiSsid} username={store.wifiUsername} password={store.wifiPassword} />;
        case 'flights': return <FlightSchedule />;
        case 'notif': return <NotificationCard />;
        case 'map': return <MapWidget location={store.hotelLocation} hotelName={store.hotelName} />;
        case 'info': return (
          <div className="slideshow-info-card">
            <span className="text-[clamp(10px,0.75vw,14px)] font-medium uppercase tracking-normal text-white/65">Hotel Info</span>
            <span className="mt-[0.35vh] block max-w-full truncate text-[clamp(18px,1.6vw,30px)] font-medium leading-tight text-white">
              {store.hotelName || 'Hotel'}
            </span>
          </div>
        );
        default: return null;
      }
    })();
    if (!content) return null;
    return (
      <AnimatePresence>
        <motion.div
          key={activeWidget}
          initial={{ opacity: 0, y: 30, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.92 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute z-20 flex justify-center w-full pointer-events-none"
          style={{ bottom: '16.5vw', left: 0 }}
        >
          <div className={`slideshow-widget-panel slideshow-widget-${activeWidget} relative pointer-events-auto`}>
            <div className="slideshow-widget-surface">{content}</div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const overrides = store.tvDisplayOverrides || {};
  const displayFilter = `brightness(${overrides.brightness ?? 1}) contrast(${overrides.contrast ?? 1}) saturate(${overrides.saturate ?? 1})`;

  // For carousel: render items relative to centerIdx
  // We show up to 9 visible items: -4 to +4 if there are enough items
  const getCarouselItems = () => {
    const visible: { item: any; offset: number }[] = [];
    const half = Math.min(Math.floor((allDockItems.length - 1) / 2), 4);
    for (let o = -half; o <= half; o++) {
      const idx = (centerIdx + o + allDockItems.length) % allDockItems.length;
      visible.push({ item: allDockItems[idx], offset: o });
    }
    return visible;
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div key={bgIndex}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{ backgroundImage: `url(${slideshowImages[bgIndex]})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: displayFilter }}
          />
        </AnimatePresence>
        {/* Gradient vignette bottom */}
        <div className="absolute inset-x-0 bottom-0 h-[35%]" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }} />
      </div>

      {/* FLOATING CLOCK top-left */}
      {config.slideshow?.showFloatingClock !== false && (
        <div className="absolute top-[1.5vw] left-[1.5vw] z-10 pointer-events-none">
          <div className="slideshow-top-clock px-[1.5vw] py-[1vh] rounded-2xl">
            <DigitalClock timezone={store.hotelTimezone} location={store.hotelLocation} />
          </div>
        </div>
      )}

      {/* GUEST BADGE top-right */}
      <div className="absolute top-[1.5vw] right-[1.5vw] z-10 pointer-events-none">
        <div className="slideshow-guest-badge flex items-center gap-[0.8vw] px-[1.2vw] py-[0.6vh] rounded-2xl">
          <span className="max-w-[16vw] truncate text-white/85 text-[0.9vw] font-medium">{store.guestName || 'Guest'}</span>
          <span className="text-[#d4af37] text-[1vw] font-medium">Room {store.roomCode}</span>
        </div>
      </div>

      {/* Slide indicators */}
      {slideshowImages.length > 1 && !carouselVisible && (
        <div className="absolute bottom-[5.5vw] left-1/2 -translate-x-1/2 z-10 flex gap-[0.5vw]">
          {slideshowImages.map((_: string, i: number) => (
            <div key={i} className={`rounded-full transition-all duration-300 ${i === bgIndex ? 'w-[1.5vw] h-[0.5vw] bg-white' : 'w-[0.5vw] h-[0.5vw] bg-white/40'}`} />
          ))}
        </div>
      )}

      {/* Idle hint */}
      {!carouselVisible && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-[4vw] left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        >
          <p className="text-white/50 text-[1vw] font-medium animate-pulse tracking-widest uppercase">Press any key to explore</p>
        </motion.div>
      )}

      {/* EXPANDED WIDGET */}
      {renderWidget()}

      {/* ═══════ CAROUSEL ═══════ */}
      <AnimatePresence>
        {carouselVisible && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute bottom-[3.5vw] left-0 right-0 z-30 flex flex-col items-center"
          >
            {/* Label for center item */}
            <motion.p
              key={centerIdx}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white text-[clamp(18px,2vw,38px)] font-medium mb-[1.2vw] tracking-normal drop-shadow-lg"
            >
              {allDockItems[centerIdx]?.label}
            </motion.p>

            {/* Carousel row */}
            <div className="flex items-center justify-center gap-[1.5vw] w-full" style={{ height: '8vw' }}>
              {/* Left arrow */}
              <button
                onClick={() => { setCenterIdx(p => (p - 1 + allDockItems.length) % allDockItems.length); resetDismissTimer(); }}
                className="text-white/50 hover:text-white transition-colors"
                style={{ fontSize: '2vw' }}
              >
                <ChevronLeft style={{ width: '2.5vw', height: '2.5vw' }} />
              </button>

              {getCarouselItems().map(({ item, offset }) => {
                const isCenter = offset === 0;
                const isActive = activeWidget === item.id;
                const Icon = item.icon;
                const absOffset = Math.abs(offset);
                const scale = isCenter ? 1 : absOffset === 1 ? 0.75 : absOffset === 2 ? 0.55 : absOffset === 3 ? 0.45 : 0.35;
                const opacity = isCenter ? 1 : absOffset === 1 ? 0.8 : absOffset === 2 ? 0.5 : absOffset === 3 ? 0.3 : 0.15;

                return (
                  <motion.button
                    key={item.id}
                    layout
                    animate={{ scale, opacity }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    onClick={() => {
                      const clickedIdx = (centerIdx + offset + allDockItems.length) % allDockItems.length;
                      if (!isCenter) {
                        setCenterIdx(clickedIdx);
                      }
                      
                      // For mouse/touch users, instantly trigger the action without waiting for center alignment
                      const clickedItem = allDockItems[clickedIdx];
                      if (clickedItem) {
                        if (['alarm', 'chat', 'settings'].includes(clickedItem.id)) { onAction(clickedItem.id); }
                        else if (clickedItem.id === 'notif') { onAction('notif'); }
                        else if (clickedItem.id === 'services') { onOpenServices(); }
                        else if (clickedItem.id === 'deals') { onOpenPromos(); }
                        else if (clickedItem.app) { onLaunchApp(clickedItem.app); }
                      }
                      
                      resetDismissTimer();
                    }}
                    className="flex flex-col items-center justify-center rounded-2xl transition-colors relative"
                    style={{
                      width: isCenter ? '7vw' : '5vw',
                      height: isCenter ? '7vw' : '5vw',
                      minWidth: isCenter ? '7vw' : '5vw',
                      background: isCenter
                        ? (isActive ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.18)')
                        : 'rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(20px)',
                      border: isCenter
                        ? `2px solid ${isActive ? '#d4af37' : 'rgba(255,255,255,0.4)'}`
                        : '1px solid rgba(255,255,255,0.15)',
                      boxShadow: isCenter ? '0 8px 40px rgba(0,0,0,0.6)' : 'none',
                      zIndex: isCenter ? 2 : 1,
                    }}
                  >
                    {Icon ? (
                      <Icon
                        style={{ width: isCenter ? '2.5vw' : '1.6vw', height: isCenter ? '2.5vw' : '1.6vw' }}
                        className={isCenter ? 'text-white' : 'text-white/70'}
                        strokeWidth={isCenter ? 1.5 : 1.5}
                      />
                    ) : item.app?.icon ? (
                      <img src={item.app.icon} alt={item.label}
                        style={{ width: isCenter ? '3vw' : '2vw', height: isCenter ? '3vw' : '2vw', objectFit: 'contain' }}
                      />
                    ) : (
                      <div style={{ width: '2vw', height: '2vw', borderRadius: '0.5vw', background: 'rgba(255,255,255,0.2)' }} />
                    )}
                  </motion.button>
                );
              })}

              {/* Right arrow */}
              <button
                onClick={() => { setCenterIdx(p => (p + 1) % allDockItems.length); resetDismissTimer(); }}
                className="text-white/50 hover:text-white transition-colors"
              >
                <ChevronRight style={{ width: '2.5vw', height: '2.5vw' }} />
              </button>
            </div>

            {/* Dot indicator row */}
            <div className="flex gap-[0.4vw] mt-[1.2vw]">
              {allDockItems.map((_, i) => (
                <div key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === centerIdx ? '1.2vw' : '0.4vw',
                    height: '0.4vw',
                    background: i === centerIdx ? '#d4af37' : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MARQUEE */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2.2vw] z-40 flex items-center"
        style={{ background: 'linear-gradient(90deg, rgba(10,12,16,0.85) 0%, rgba(212,175,55,0.15) 50%, rgba(10,12,16,0.85) 100%)' }}
      >
        <MarqueeBar />
      </div>
    </div>
  );
}
