'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import useSWR from 'swr';
import { router } from '@inertiajs/react';
import { useDpadNavigation } from '@/lib/hooks/useDpadNavigation';
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
import ChatModal from '@/Components/TV/ChatModal';
import AlarmModal from '@/Components/TV/AlarmModal';
import AppLauncher from '@/Components/TV/AppLauncher';
import ServiceRequestModal from '@/Components/TV/ServiceRequestModal';
import ConnectionStatus from '@/Components/TV/ConnectionStatus';
import PromoModal from '@/Components/TV/PromoModal';
import NotificationsModal from '@/Components/TV/NotificationsModal';
import SettingsPage from '@/Components/TV/SettingsPage';
import SlideshowDashboard from '@/Components/TV/SlideshowDashboard';
import GuestLogoutModal from '@/Components/TV/GuestLogoutModal';
import { CheckoutWidget, CheckoutModal } from '@/Components/TV/CheckoutReminder';
import type { AppConfig } from '@/Components/TV/AppLauncher';
import {
  AlarmClock, MessageCircle, Bell, Settings, Clock, Plane, ShoppingBag,
  ConciergeBell, Info, MapPin, User, Wifi, MonitorCog,
} from 'lucide-react';

const DEFAULT_APPS = [
  { id: 'netflix', name: 'Netflix', url: 'com.netflix.ninja', icon: '', subtitle: 'Streaming', brandColor: '#e50914', iconScale: 1, enabled: true, embeddable: false },
  { id: 'youtube', name: 'YouTube', url: 'com.google.android.youtube.tv', icon: '', subtitle: 'Video', brandColor: '#ff0000', iconScale: 1, enabled: true, embeddable: false },
  { id: 'disney', name: 'Disney+', url: 'com.disney.disneyplus', icon: '', subtitle: 'Streaming', brandColor: '#113ccf', iconScale: 1, enabled: true, embeddable: false },
  { id: 'prime', name: 'Prime Video', url: 'com.amazon.amazonvideo.livingroom', icon: '', subtitle: 'Streaming', brandColor: '#00a8e1', iconScale: 1, enabled: true, embeddable: false },
  { id: 'spotify', name: 'Spotify', url: 'com.spotify.tv.android', icon: '', subtitle: 'Music', brandColor: '#1db954', iconScale: 1, enabled: true, embeddable: false },
];

interface Hotel {
    id: string;
    name: string;
    slug: string;
    location: string;
    timezone: string;
    wifi_ssid: string | null;
    wifi_password: string | null;
    wifi_username: string | null;
    default_background_url: string | null;
    featured_image_url: string | null;
    airport_iata_code: string | null;
    latitude: number | null;
    longitude: number | null;
    clock_timezone_1: string;
    clock_timezone_2: string;
    clock_timezone_3: string;
    clock_label_1: string;
    clock_label_2: string;
    clock_label_3: string;
    tv_layout_config: Record<string, any> | null;
}

interface Room {
    id: string;
    room_code: string;
    guest_name: string | null;
    guest_photo_url: string | null;
    background_url: string | null;
    checkout_date: string | null;
    is_occupied: boolean;
    room_type: { name: string } | null;
    room_session_token?: string | null;
}

interface DashboardProps {
    hotel: Hotel;
    room: Room;
    promos: any[];
    services: any[];
    announcements: string[];
    notifications: any[];
    screenMode: string;
    slideshowConfig: any;
}

export default function Dashboard({ hotel, room }: DashboardProps) {
  const hotelSlug = hotel.slug;
  const roomCode = room.room_code;

  const store = useRoomStore();
  const hydrate = useRoomStore(s => s.hydrate);
  const currentLayoutConfig = useRoomStore(s => s.tvLayoutConfig);

  const [mounted, setMounted] = useState(false);

  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [launchApp, setLaunchApp] = useState<AppConfig | null>(null);
  const [detailWidget, setDetailWidget] = useState<string | null>(null);

  const handleEscape = useCallback(() => {
    setActiveModal(null);
    setLaunchApp(null);
    setDetailWidget(null);
  }, []);

  useDpadNavigation({ enabled: mounted && !activeModal && !launchApp && !detailWidget, onEscape: handleEscape });

  // Block right-click context menu on TV dashboard
  useEffect(() => {
    if (!mounted) return;
    const blockContext = (e: MouseEvent) => { e.preventDefault(); };
    document.addEventListener('contextmenu', blockContext, true);
    return () => { document.removeEventListener('contextmenu', blockContext, true); };
  }, [mounted]);

  const { data: liveConfig } = useSWR(
    mounted && store.roomId ? `/api/hotel/${hotelSlug}/tv-config?roomId=${store.roomId}` : null,
    async (url: string) => {
      const res = await fetch(url, { headers: store.roomSessionToken ? { 'X-Room-Token': store.roomSessionToken } : {} });
      if (!res.ok) {
        const errorText = await res.text();
        console.error('TV Config Fetch Failed:', errorText);
        return null;
      }
      return res.json();
    },
    { refreshInterval: 60000 } // Check every minute
  );

  // Silent light reload for Notifications and Chat Updates every 60s
  const { data: liveStatus } = useSWR(
    mounted && store.roomId ? `/api/room/${store.roomId}/status?hotelId=${store.hotelId}` : null,
    async (url: string) => {
      const res = await fetch(url, { headers: store.roomSessionToken ? { 'X-Room-Token': store.roomSessionToken } : {} });
      if (!res.ok) return null;
      return res.json();
    },
    { refreshInterval: 60000 }
  );

  useEffect(() => {
    if (liveConfig) {
      const updates: any = {};
      if (liveConfig.tvLayoutConfig) {
        const incoming = JSON.stringify(liveConfig.tvLayoutConfig);
        const current = JSON.stringify(currentLayoutConfig);
        if (incoming !== current) {
          updates.tvLayoutConfig = liveConfig.tvLayoutConfig;
        }
      }
      if (liveConfig.featuredImageUrl !== undefined && liveConfig.featuredImageUrl !== store.hotelFeaturedImageUrl) {
        updates.hotelFeaturedImageUrl = liveConfig.featuredImageUrl;
      }
      if (Object.keys(updates).length > 0) {
        hydrate(updates);
      }
    }
  }, [liveConfig, currentLayoutConfig, store.hotelFeaturedImageUrl, hydrate]);

  useEffect(() => {
    if (liveStatus) {
      if (liveStatus.unreadChatCount !== store.unreadChatCount) {
        useRoomStore.setState({ unreadChatCount: liveStatus.unreadChatCount });
      }
      if (liveStatus.latestNotification?.id !== store.latestNotification?.id) {
        store.setNotification(liveStatus.latestNotification);
      }
      if (liveStatus.roomDetails) {
        let hasChanges = false;
        const updates: any = {};
        if (liveStatus.roomDetails.guest_name !== store.guestName) { updates.guestName = liveStatus.roomDetails.guest_name; hasChanges = true; }
        if (liveStatus.roomDetails.guest_photo_url !== store.guestPhotoUrl) { updates.guestPhotoUrl = liveStatus.roomDetails.guest_photo_url; hasChanges = true; }
        if (liveStatus.roomDetails.checkout_date !== store.checkoutDate) { updates.checkoutDate = liveStatus.roomDetails.checkout_date; hasChanges = true; }
        
        if (hasChanges) {
          hydrate(updates);
          const stored = localStorage.getItem(`neotiv_room_${hotelSlug}_${roomCode}`);
          if (stored) {
            try {
              const data = JSON.parse(stored);
              // Also sync roomCode if changed (can't change route instantly safely, but we can update data)
              const updatedSession = { ...data, ...updates, 
                roomCode: liveStatus.roomDetails.room_code || data.roomCode,
                welcomeMessage: liveStatus.roomDetails.custom_welcome_message 
              };
              localStorage.setItem(`neotiv_room_${hotelSlug}_${roomCode}`, JSON.stringify(updatedSession));
            } catch {}
          }
        }
      }
    }
  }, [liveStatus, hydrate, hotelSlug, roomCode, store.guestName, store.guestPhotoUrl, store.checkoutDate]);

  useEffect(() => {
    store.hydrate({
      roomId: room.id,
      hotelId: hotel.id,
      roomCode: room.room_code,
      hotelSlug: hotel.slug,
      guestName: room.guest_name || '',
      roomSessionToken: room.room_session_token || store.roomSessionToken || null,
      guestPhotoUrl: room.guest_photo_url,
      backgroundUrl: room.background_url,
      hotelName: hotel.name,
      hotelFeaturedImageUrl: hotel.featured_image_url || null,
      hotelTimezone: hotel.timezone,
      hotelLocation: hotel.location,
      wifiSsid: hotel.wifi_ssid || '',
      wifiPassword: hotel.wifi_password || '',
      wifiUsername: hotel.wifi_username || '',
      checkoutDate: room.checkout_date || null,
      clockTimezones: [hotel.clock_timezone_1, hotel.clock_timezone_2, hotel.clock_timezone_3],
      clockLabels: [hotel.clock_label_1, hotel.clock_label_2, hotel.clock_label_3],
      tvLayoutConfig: hotel.tv_layout_config,
    });
    setMounted(true);
  }, [hotel, room, hydrate]);

  const handleAction = useCallback((action: string) => { setActiveModal(action); }, []);
  const handleLaunchApp = useCallback((app: any) => {
    if (app.name === 'TV') {
      window.dispatchEvent(new CustomEvent('neotiv:switch-to-tv', { bubbles: true }));
      return;
    }

    if (app.url && !app.url.startsWith('http') && !app.url.startsWith('intent://')) {
      const pkg = app.url.trim();

      // Reliable STB Native App Launch
      if (typeof window !== 'undefined' && (window as any).NeotivNative?.launchExternalApp) {
        (window as any).NeotivNative.launchExternalApp(pkg);
        return;
      }

      // Standard Browser Fallback
      const intentUrl = `intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LEANBACK_LAUNCHER;package=${pkg};S.browser_fallback_url=market://details?id=${pkg};end;`;
      window.location.href = intentUrl;
      setTimeout(() => {
        window.location.href = `intent://#Intent;package=${pkg};scheme=https;S.browser_fallback_url=https://play.google.com/store/apps/details?id=${pkg};end;`;
      }, 2000);
      return;
    }
    // If it's already a perfectly formatted intent
    if (app.url && app.url.startsWith('intent://')) {
      let intentUrl = app.url;
      // Ensure it has fallback URL
      if (!intentUrl.includes('S.browser_fallback_url')) {
        const pkgMatch = intentUrl.match(/package=([^;]+)/);
        if (pkgMatch) {
          intentUrl = intentUrl.replace(';end;', `;S.browser_fallback_url=market://details?id=${pkgMatch[1]};end;`);
        }
      }
      window.location.href = intentUrl;
      return;
    }

    setLaunchApp({ 
      name: app.name, 
      url: app.url, 
      embeddable: app.embeddable || false, 
      icon: typeof app.icon === 'string' ? app.icon : '' 
    });
  }, []);

  const isCheckoutDay = store.checkoutDate 
    ? new Date(`${store.checkoutDate}T00:00:00`).toDateString() === new Date().toDateString() 
    : false;

  if (!mounted) return <div className="fixed inset-0 w-full h-full bg-slate-900" />;

  const bgUrl = (store.tvLayoutConfig as any)?.theme?.bgUrl || store.backgroundUrl || 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1920&auto=format&fit=crop';

  const defaultConfig = {
    theme: { visualStyle: 'luxury', opacityLight: 0.88, opacityDark: 0.55 },
    apps: DEFAULT_APPS,
    // 24-col × 14-row grid: each "tile" is 2×2 cells.
    // Widget sizes: 1 tile (2×2), 2h tiles (4×2), 2v tiles (2×4), 4 tiles (4×4)
    layout: {
      // Left column (cols 1-6)
      analogClocks:     { colStart: 1,  colSpan: 6, rowStart: 1,  rowSpan: 3, visible: true },
      flightSchedule:   { colStart: 1,  colSpan: 6, rowStart: 4,  rowSpan: 5, visible: true },
      hotelDeals:       { colStart: 1,  colSpan: 6, rowStart: 9,  rowSpan: 6, visible: true },
      // Center column (cols 7-18)
      digitalClock:     { colStart: 7,  colSpan: 10, rowStart: 1, rowSpan: 3, visible: true },
      hotelService:     { colStart: 7,  colSpan: 4,  rowStart: 9, rowSpan: 3, visible: true },
      hotelInfo:        { colStart: 7,  colSpan: 4,  rowStart: 12, rowSpan: 3, visible: true },
      mapWidget:        { colStart: 11, colSpan: 4,  rowStart: 9, rowSpan: 6, visible: true },
      // Right column (cols 17-24)
      guestCard:        { colStart: 17, colSpan: 8,  rowStart: 1, rowSpan: 2, visible: true },
      wifiCard:         { colStart: 17, colSpan: 8,  rowStart: 3, rowSpan: 3, visible: true },
      notificationCard: { colStart: 17, colSpan: 8,  rowStart: 6, rowSpan: 3, visible: true },
      alarmWidget:      { colStart: 15, colSpan: 2,  rowStart: 9, rowSpan: 2, visible: true },
      chatWidget:       { colStart: 17, colSpan: 2,  rowStart: 9, rowSpan: 2, visible: true },
      notifWidget:      { colStart: 19, colSpan: 2,  rowStart: 9, rowSpan: 2, visible: true },
      displayWidget:    { colStart: 21, colSpan: 4,  rowStart: 9, rowSpan: 2, visible: true },
    }
  };
  const savedConfig = (store.tvLayoutConfig && typeof store.tvLayoutConfig === 'object' ? store.tvLayoutConfig : {}) as any;
  const appLayout = ((savedConfig.apps ?? defaultConfig.apps) || []).reduce((layout: Record<string, any>, app: any, index: number) => {
    const key = `app-${app.id}`;
    layout[key] = {
      colStart: 15 + ((index % 5) * 2),
      colSpan: 2,
      rowStart: 11 + (Math.floor(index / 5) * 2),
      rowSpan: 2,
      visible: true,
      ...(savedConfig.layout?.[key] ?? {}),
    };
    return layout;
  }, {});
  const savedLayout = { ...(savedConfig.layout ?? {}) };
  delete savedLayout.appGrid;
  const activeApps = ((savedConfig.apps ?? defaultConfig.apps) || []).filter((app: any) => app.enabled !== false);
  const config = {
    ...defaultConfig,
    ...savedConfig,
    theme: { ...defaultConfig.theme, ...(savedConfig.theme ?? {}) },
    layout: { ...defaultConfig.layout, ...appLayout, ...savedLayout },
    apps: activeApps,
  } as any;
  
  // Safe widget style getter with strict validation
  const getWidgetLayout = (key: string) => {
    const dbW = config.layout?.[key];
    const defW = (defaultConfig.layout as any)[key] ?? {};
    const colStart = typeof dbW?.colStart === 'number' && dbW.colStart > 0 ? dbW.colStart : (defW.colStart || 1);
    const colSpan = typeof dbW?.colSpan === 'number' && dbW.colSpan > 0 ? dbW.colSpan : (defW.colSpan || 1);
    const rowStart = typeof dbW?.rowStart === 'number' && dbW.rowStart > 0 ? dbW.rowStart : (defW.rowStart || 1);
    const rowSpan = typeof dbW?.rowSpan === 'number' && dbW.rowSpan > 0 ? dbW.rowSpan : (defW.rowSpan || 1);

    return {
      ...defW,
      ...dbW,
      colStart: Math.min(24, colStart),
      colSpan: Math.min(24, colSpan),
      rowStart: Math.min(14, rowStart),
      rowSpan: Math.min(14, rowSpan),
    };
  };

  const getWidgetStyle = (key: string, baseDelay: string) => {
    try {
      const dbW = getWidgetLayout(key);
      const colStart = dbW.colStart;
      const colSpan = Math.min(dbW.colSpan, 24 - colStart + 1);
      const rowStart = dbW.rowStart;
      const rowSpan = Math.min(dbW.rowSpan, 14 - rowStart + 1);
      const bgColor = dbW?.bgColor;
      const bgOpacity = dbW?.bgOpacity !== undefined ? dbW.bgOpacity : 0.6;
      const textColor = dbW?.textColor || '#ffffff';

      let finalBgColor = '';
      if (bgColor) {
        const hex = bgColor.replace('#', '');
        if (hex.length === 6) {
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          finalBgColor = `rgba(${r}, ${g}, ${b}, ${bgOpacity})`;
        } else {
          finalBgColor = `${bgColor}99`; // Fallback legacy
        }
      }

      return {
        gridColumn: `${colStart} / span ${colSpan}`,
        gridRow: `${rowStart} / span ${rowSpan}`,
        animationDelay: baseDelay,
        color: textColor,
        '--widget-col-span': colSpan,
        '--widget-row-span': rowSpan,
        ...(finalBgColor ? { '--widget-bg': finalBgColor } : {})
      } as React.CSSProperties;
    } catch (err) {
      console.error(`Layout Error for ${key}:`, err);
      return { animationDelay: baseDelay };
    }
  };

  const isWidgetVisible = (key: string) => {
    if (key.startsWith('app-')) {
      const appId = key.replace('app-', '');
      const app = (config.apps || []).find((item: any) => item.id === appId);
      if (!app) return false;
    }
    return getWidgetLayout(key)?.visible !== false;
  };

  const widgetIconMeta = (key: string) => {
    const app = key.startsWith('app-')
      ? (config.apps || []).find((item: any) => `app-${item.id}` === key)
      : null;

    if (app) {
      return {
        label: app.name,
        icon: null,
        image: typeof app.icon === 'string' ? app.icon : '',
        onClick: () => handleLaunchApp(app),
      };
    }

    const meta: Record<string, { label: string; icon: any; onClick?: () => void }> = {
      analogClocks: { label: 'Clocks', icon: Clock },
      digitalClock: { label: 'Time', icon: Clock },
      flightSchedule: { label: 'Flights', icon: Plane },
      hotelDeals: { label: 'Deals', icon: ShoppingBag, onClick: () => setActiveModal('promos') },
      hotelService: { label: 'Services', icon: ConciergeBell, onClick: () => setActiveModal('services') },
      hotelInfo: { label: 'Hotel', icon: Info },
      mapWidget: { label: 'Map', icon: MapPin },
      guestCard: { label: 'Guest', icon: User, onClick: () => setActiveModal('logout') },
      wifiCard: { label: 'WiFi', icon: Wifi },
      notificationCard: { label: 'Notice', icon: Bell, onClick: () => setActiveModal('notif') },
      alarmWidget: { label: 'Alarm', icon: AlarmClock, onClick: () => handleAction('alarm') },
      chatWidget: { label: 'Chat', icon: MessageCircle, onClick: () => handleAction('chat') },
      notifWidget: { label: 'Notifs', icon: Bell, onClick: () => handleAction('notif') },
      displayWidget: { label: 'Settings', icon: MonitorCog, onClick: () => handleAction('settings') },
    };
    return meta[key] || { label: key, icon: Info };
  };

  const WidgetFrame = ({
    widgetKey,
    delay,
    className = '',
    children,
  }: {
    widgetKey: string;
    delay: string;
    className?: string;
    children: ReactNode;
  }) => {
    const layout = getWidgetLayout(widgetKey);
    const colSpan = Math.min(layout.colSpan, 24 - layout.colStart + 1);
    const rowSpan = Math.min(layout.rowSpan, 14 - layout.rowStart + 1);
    const isIconOnly = colSpan <= 1 || rowSpan <= 1;
    const isCompact = !isIconOnly && (colSpan <= 2 || rowSpan <= 1);
    const isSmall = !isIconOnly && !isCompact && colSpan <= 4;
    const compactFallbackWidgets = new Set(['analogClocks', 'flightSchedule', 'hotelDeals', 'notificationCard']);
    const useCompactFallback = isCompact && compactFallbackWidgets.has(widgetKey);
    const meta = widgetIconMeta(widgetKey);
    const Icon = meta.icon;
    const fallbackAction = meta.onClick ?? (() => setDetailWidget(widgetKey));

    return (
      <div
        className={`tv-grid-widget widget-animate ${isIconOnly ? 'tv-size-icon' : ''} ${isCompact ? 'tv-size-compact' : ''} ${isSmall ? 'tv-size-small' : ''} ${useCompactFallback ? 'tv-size-fallback' : ''} ${className}`}
        style={getWidgetStyle(widgetKey, delay)}
        data-widget-key={widgetKey}
        data-col-span={colSpan}
        data-row-span={rowSpan}
      >
        <div className="tv-widget-content h-full min-h-0">
          {children}
        </div>
        {(isIconOnly || useCompactFallback) && (
          <button
            type="button"
            className="tv-icon-fallback tv-focusable"
            tabIndex={0}
            onClick={fallbackAction}
            aria-label={meta.label}
          >
            {meta.image ? (
              <img src={meta.image} alt="" className="h-[52%] w-[52%] object-contain" />
            ) : Icon ? (
              <Icon className="h-[46%] w-[46%]" strokeWidth={1.8} />
            ) : null}
            <span className="tv-compact-label">{meta.label}</span>
          </button>
        )}
      </div>
    );
  };

  // Display filter from config + local room overrides
  const overrides = store.tvDisplayOverrides || {};
  const brightness = overrides.brightness ?? config.theme?.brightness ?? 1;
  const contrast = overrides.contrast ?? config.theme?.contrast ?? 1;
  const saturate = overrides.saturate ?? config.theme?.saturate ?? 1;
  const scale = overrides.scale ?? config.theme?.scale ?? 1;
  const displayFilter = `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`;

  // ===== SCREEN MODE: check local override first =====
  const screenModeOverride = (store.tvDisplayOverrides as any)?.screenMode;
  const screenMode = screenModeOverride || config.screenMode || 'grid';

  const renderWidgetDetail = () => {
    if (!detailWidget) return null;

    const content = (() => {
      switch (detailWidget) {
        case 'analogClocks':
          return (
            <div className="tv-widget h-full flex items-center justify-around gap-[1vw]">
              {store.clockTimezones?.slice(0, 3).map((timezone, index) => (
                <AnalogClock
                  key={timezone}
                  timezone={timezone}
                  label={store.clockLabels[index]}
                  size={120}
                  clockStyle={config.theme?.clockStyle}
                />
              ))}
            </div>
          );
        case 'digitalClock':
          return <DigitalClock timezone={store.hotelTimezone} location={store.hotelLocation} />;
        case 'flightSchedule':
          return <FlightSchedule />;
        case 'hotelDeals':
          return <HotelDeals onOpenPromos={() => { setDetailWidget(null); setActiveModal('promos'); }} />;
        case 'hotelService':
          return <HotelService onOpenServices={() => { setDetailWidget(null); setActiveModal('services'); }} />;
        case 'hotelInfo':
          return <HotelInfo hotelName={store.hotelName} featuredImageUrl={store.hotelFeaturedImageUrl} />;
        case 'mapWidget':
          return <MapWidget location={store.hotelLocation} hotelName={store.hotelName} />;
        case 'guestCard':
          return <GuestCard guestName={store.guestName} guestPhotoUrl={store.guestPhotoUrl} roomCode={roomCode} onClick={() => { setDetailWidget(null); setActiveModal('logout'); }} />;
        case 'wifiCard':
          return <WifiCard ssid={store.wifiSsid} username={store.wifiUsername} password={store.wifiPassword} />;
        case 'notificationCard':
          return <NotificationCard />;
        default:
          return null;
      }
    })();

    if (!content) return null;

    return (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-xl p-[4vw]">
        <button
          type="button"
          className="absolute inset-0 cursor-default"
          aria-label="Close widget detail"
          onClick={() => setDetailWidget(null)}
        />
        <div className="relative z-10 h-[min(58vh,560px)] w-[min(72vw,980px)] overflow-hidden rounded-[24px] border border-white/20 bg-slate-950/70 p-[1vw] shadow-2xl">
          <button
            type="button"
            className="tv-focusable absolute right-[1vw] top-[1vw] z-20 flex h-[2.2vw] w-[2.2vw] items-center justify-center rounded-full bg-white/10 text-white/80"
            onClick={() => setDetailWidget(null)}
            aria-label="Close"
          >
            x
          </button>
          <div className="h-full min-h-0 pt-[0.2vw]">
            {content}
          </div>
        </div>
      </div>
    );
  };
  
  if (screenMode === 'slideshow') {
    return (
      <div className="fixed inset-0 w-full h-full overflow-hidden bg-slate-900 tv-kiosk-mode"
        style={{ 
          '--visual-style': config.theme?.visualStyle ?? 'luxury',
          '--focus-color': config.theme?.focusColor ?? '#d4af37',
          '--focus-style': config.theme?.focusStyle ?? 'glow',
        } as React.CSSProperties}>
        <SlideshowDashboard
          config={config}
          isModalOpen={activeModal !== null || launchApp !== null || detailWidget !== null}
          onAction={handleAction}
          onLaunchApp={handleLaunchApp}
          onOpenPromos={() => handleAction('promo')}
          onOpenServices={() => handleAction('service')}
        />
        {/* Modals — same as grid mode */}
        {launchApp && <AppLauncher app={launchApp} isOpen={!!launchApp} onClose={() => setLaunchApp(null)} />}
        <ChatModal isOpen={activeModal === 'chat'} onClose={() => setActiveModal(null)} />
        <AlarmModal isOpen={activeModal === 'alarm'} onClose={() => setActiveModal(null)} />
        <PromoModal isOpen={activeModal === 'promo'} onClose={() => setActiveModal(null)} />
        <NotificationsModal isOpen={activeModal === 'notif'} onClose={() => setActiveModal(null)} />
        <SettingsPage isOpen={activeModal === 'settings'} onClose={() => setActiveModal(null)} onOpenAlarm={() => { setActiveModal(null); setTimeout(() => setActiveModal('alarm'), 100); }} />
        <GuestLogoutModal isOpen={activeModal === 'logout'} onClose={() => setActiveModal(null)} />
        {isCheckoutDay && <CheckoutModal isOpen={activeModal === 'checkout-reminder'} onClose={() => setActiveModal(null)} />}
        <ServiceRequestModal isOpen={activeModal === 'service'} onClose={() => setActiveModal(null)} onOrderComplete={() => setActiveModal('chat')} />
        {renderWidgetDetail()}
        <ConnectionStatus />
      </div>
    );
  }

  // ===== SCREEN MODE: GRID (existing) =====
  return (
      <div className="fixed inset-0 w-full h-full overflow-hidden bg-slate-900 tv-kiosk-mode"
        style={{ 
          '--visual-style': config.theme?.visualStyle ?? 'luxury',
          '--widget-dark-opacity': config.theme?.opacityDark ?? 0.55,
          '--widget-light-opacity': config.theme?.opacityLight ?? 0.88,
          '--focus-color': config.theme?.focusColor ?? '#d4af37',
          '--focus-style': config.theme?.focusStyle ?? 'glow'
        } as React.CSSProperties}>

      {/* ===== BACKGROUND IMAGE ===== */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: `url(${bgUrl})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          filter: displayFilter,
          transition: 'filter 0.3s ease-in-out'
        }} 
      />

      {/* ===== SCALABLE CONTENT WRAPPER FOR OVERSCAN/RATIO CONTROL ===== */}
      <div className="absolute inset-0 transition-transform duration-300 pointer-events-none" style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }}>
        <div className="w-full h-full relative pointer-events-auto">

      {/* ===== BENTO GRID — 24×14 flexible tile system ===== */}
      <div className="absolute inset-0 grid gap-[0.35vw]" style={{
        zIndex: 1,
        padding: '0.8vw 0.8vw 2.6vw 0.8vw',
        gridTemplateColumns: 'repeat(24, 1fr)',
        gridTemplateRows: 'repeat(14, 1fr)',
      }}>

        {/* ════════ TILE BACKGROUNDS — mirrors the saved admin canvas slots ════════ */}
        {Object.keys(config.layout).map((key) => {
          const w = getWidgetLayout(key);
          if (w.visible === false) return null;
          return (
            <div
              key={`tile-${key}`}
              className="tv-tile"
              style={{
                gridColumn: `${w.colStart} / span ${Math.min(w.colSpan, 24 - w.colStart + 1)}`,
                gridRow: `${w.rowStart} / span ${Math.min(w.rowSpan, 14 - w.rowStart + 1)}`,
              }}
            />
          );
        })}

        {/* ════════════════ LEFT COLUMN ════════════════ */}
        {/* ROW 1-2: Analog Clocks */}
        {isWidgetVisible('analogClocks') && store.clockTimezones?.length >= 3 && (
          <WidgetFrame widgetKey="analogClocks" delay="0ms">
          <div className="tv-widget tv-widget-fit flex min-w-0 items-center justify-around gap-[0.4vw] tv-focusable" tabIndex={0}>
            <AnalogClock timezone={store.clockTimezones[0]} label={store.clockLabels[0]} size={100} clockStyle={config.theme?.clockStyle} />
            <AnalogClock timezone={store.clockTimezones[1]} label={store.clockLabels[1]} size={100} clockStyle={config.theme?.clockStyle} />
            <AnalogClock timezone={store.clockTimezones[2]} label={store.clockLabels[2]} size={100} clockStyle={config.theme?.clockStyle} />
          </div>
          </WidgetFrame>
        )}

        {/* ROW 3-7: Flight Schedule */}
        {isWidgetVisible('flightSchedule') && (
          <WidgetFrame widgetKey="flightSchedule" delay="150ms">
            <FlightSchedule />
          </WidgetFrame>
        )}

        {/* ROW 8-12: Hotel Deals */}
        {isWidgetVisible('hotelDeals') && (
          <WidgetFrame widgetKey="hotelDeals" delay="300ms">
            <HotelDeals onOpenPromos={() => setActiveModal('promos')} />
          </WidgetFrame>
        )}


        {/* ════════════════ CENTER COLUMN ════════════════ */}
        
        {/* ROW 1-2: Digital Clock + Weather */}
        {isWidgetVisible('digitalClock') && (
          <WidgetFrame widgetKey="digitalClock" delay="50ms" className="flex flex-col justify-center items-center tv-text-shadow">
            <DigitalClock timezone={store.hotelTimezone} location={store.hotelLocation} />
          </WidgetFrame>
        )}

        {/* ROW 4-8: Open Background (visible center area) */}
        <div className="pointer-events-none" style={{ gridColumn: '7 / span 10', gridRow: '4 / span 5' }} />

        {/* ROW 8-10: Hotel Service */}
        {isWidgetVisible('hotelService') && (
          <WidgetFrame widgetKey="hotelService" delay="350ms" className="flex flex-col">
            <HotelService onOpenServices={() => setActiveModal('services')} />
          </WidgetFrame>
        )}

        {/* ROW 11-12: Hotel Info */}
        {isWidgetVisible('hotelInfo') && (
          <WidgetFrame widgetKey="hotelInfo" delay="375ms" className="flex flex-col">
            <HotelInfo hotelName={store.hotelName} featuredImageUrl={store.hotelFeaturedImageUrl} />
          </WidgetFrame>
        )}

        {/* ROW 8-12: Map Widget */}
        {isWidgetVisible('mapWidget') && (
          <WidgetFrame widgetKey="mapWidget" delay="400ms">
            <MapWidget location={store.hotelLocation} hotelName={store.hotelName} />
          </WidgetFrame>
        )}


        {/* ════════════════ RIGHT COLUMN ════════════════ */}
        
        {/* ROW 1: Guest Card */}
        {isWidgetVisible('guestCard') && (
          <WidgetFrame widgetKey="guestCard" delay="100ms">
             {isCheckoutDay ? (
               <CheckoutWidget onOpenModal={() => setActiveModal('checkout-reminder')} />
             ) : (
               <GuestCard guestName={store.guestName} guestPhotoUrl={store.guestPhotoUrl} roomCode={roomCode} onClick={() => setActiveModal('logout')} />
             )}
          </WidgetFrame>
        )}

        {/* ROW 2-3: WiFi Card */}
        {isWidgetVisible('wifiCard') && (
          <WidgetFrame widgetKey="wifiCard" delay="200ms">
            <WifiCard ssid={store.wifiSsid} username={store.wifiUsername} password={store.wifiPassword} />
          </WidgetFrame>
        )}

        {/* ROW 4-7: Notification Card (tall) */}
        {isWidgetVisible('notificationCard') && store.latestNotification && !store.latestNotification.is_dismissed && (
          <WidgetFrame widgetKey="notificationCard" delay="250ms">
            <NotificationCard />
          </WidgetFrame>
        )}


        {/* ════════════════ INDEPENDENT SMALL APP / UTILITY TILES ════════════════ */}
        {(config.apps || []).map((app: any, i: number) => {
          const layoutKey = `app-${app.id}`;
          if (!isWidgetVisible(layoutKey)) return null;
          return (
            <WidgetFrame key={app.id || i} widgetKey={layoutKey} delay={`${450 + i * 50}ms`}>
              <button
                onClick={() => handleLaunchApp(app)}
                className="tv-app-card tv-widget-fit tv-focusable rounded-[var(--widget-radius)] flex flex-col items-center justify-center text-white group relative overflow-hidden"
                style={{ '--app-color': app.brandColor || '#334155' } as React.CSSProperties}
                tabIndex={0}
              >
                <div className="mb-[0.3vh] group-hover:scale-110 transition-transform duration-300 relative z-10 flex items-center justify-center"
                     style={{ width: `${2.5 * (app.iconScale || 1)}vw`, height: `${2.5 * (app.iconScale || 1)}vw` }}>
                   {app.icon && typeof app.icon === 'string' && (app.icon.startsWith('/') || app.icon.startsWith('http')) ? (
                      <img src={app.icon} alt={app.name} className="w-full h-full object-contain" />
                   ) : (
                      <span className="text-[clamp(14px,1.5vw,28px)] font-semibold leading-none">{(app.name || 'App').slice(0, 2).toUpperCase()}</span>
                   )}
                </div>
                <span className="text-[clamp(8px,0.58vw,12px)] font-medium tracking-normal relative z-10 truncate px-1 w-full text-center">{app.name}</span>
                {app.subtitle && <span className="text-[clamp(7px,0.4vw,10px)] opacity-40 relative z-10 truncate px-1 w-full text-center">{app.subtitle}</span>}
              </button>
            </WidgetFrame>
          );
        })}

        {isWidgetVisible('alarmWidget') && (
          <WidgetFrame widgetKey="alarmWidget" delay="500ms">
            <button onClick={() => handleAction('alarm')}
              className="tv-app-card tv-widget-fit tv-focusable rounded-[var(--widget-radius)] flex flex-col items-center justify-center text-white group relative overflow-hidden"
              style={{ '--app-color': '#d4af37' } as React.CSSProperties} tabIndex={0}>
              <AlarmClock size={22} className="group-hover:scale-110 transition-transform text-white/90 mb-[0.3vh]" strokeWidth={2} />
              <span className="text-[clamp(8px,0.58vw,12px)] font-medium">Alarm</span>
            </button>
          </WidgetFrame>
        )}

        {isWidgetVisible('chatWidget') && (
          <WidgetFrame widgetKey="chatWidget" delay="550ms">
            <button onClick={() => handleAction('chat')}
              className="tv-app-card tv-widget-fit tv-focusable rounded-[var(--widget-radius)] flex flex-col items-center justify-center text-white group relative overflow-hidden"
              style={{ '--app-color': '#aa8529' } as React.CSSProperties} tabIndex={0}>
              <div className="relative mb-[0.3vh]">
                <MessageCircle size={22} className="group-hover:scale-110 transition-transform text-white/90" strokeWidth={2} />
                {store.unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[0.4vw] w-[0.8vw] h-[0.8vw] rounded-full flex items-center justify-center font-bold">
                    {store.unreadChatCount}
                  </span>
                )}
              </div>
              <span className="text-[clamp(8px,0.58vw,12px)] font-medium">Chat</span>
            </button>
          </WidgetFrame>
        )}

        {isWidgetVisible('notifWidget') && (
          <WidgetFrame widgetKey="notifWidget" delay="600ms">
            <button onClick={() => handleAction('notif')}
              className="tv-app-card tv-widget-fit tv-focusable rounded-[var(--widget-radius)] flex flex-col items-center justify-center text-white group relative overflow-hidden"
              style={{ '--app-color': '#c9a54e' } as React.CSSProperties} tabIndex={0}>
              <Bell size={22} className="group-hover:scale-110 transition-transform text-white/90 mb-[0.3vh]" strokeWidth={2} />
              <span className="text-[clamp(8px,0.58vw,12px)] font-medium">Notifs</span>
            </button>
          </WidgetFrame>
        )}

        {isWidgetVisible('displayWidget') && (
          <WidgetFrame widgetKey="displayWidget" delay="650ms">
            <button onClick={() => handleAction('settings')}
              className="tv-app-card tv-widget-fit tv-focusable rounded-[var(--widget-radius)] flex flex-col items-center justify-center text-white group relative overflow-hidden"
              style={{ '--app-color': '#8b7355' } as React.CSSProperties} tabIndex={0}>
              <Settings size={22} className="group-hover:scale-110 transition-transform text-white/90 mb-[0.3vh]" strokeWidth={2} />
              <span className="text-[clamp(8px,0.58vw,12px)] font-medium">Settings</span>
            </button>
          </WidgetFrame>
        )}
      </div>

      {/* ===== MARQUEE BAR ===== */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.2vw] z-10 flex items-center widget-animate"
        style={{ animationDelay: '700ms', background: 'linear-gradient(90deg, rgba(10,12,16,0.85) 0%, rgba(212,175,55,0.15) 50%, rgba(10,12,16,0.85) 100%)' }}>
        <MarqueeBar />
      </div>

        </div>
      </div>

      {/* Modals */}
      <ChatModal isOpen={activeModal === 'chat'} onClose={() => setActiveModal(null)} />
      <CheckoutModal isOpen={activeModal === 'checkout-reminder'} onClose={() => setActiveModal(null)} />
      <AlarmModal isOpen={activeModal === 'alarm'} onClose={() => setActiveModal(null)} />
      <NotificationsModal isOpen={activeModal === 'notif'} onClose={() => setActiveModal(null)} />
      <PromoModal isOpen={activeModal === 'promos'} onClose={() => setActiveModal(null)} />
      <GuestLogoutModal isOpen={activeModal === 'logout'} onClose={() => setActiveModal(null)} />
      <AppLauncher app={launchApp} isOpen={!!launchApp} onClose={() => setLaunchApp(null)} />
      <ServiceRequestModal
        isOpen={activeModal === 'services'}
        onClose={() => setActiveModal(null)}
        onOrderComplete={() => setActiveModal('chat')}
      />
      <SettingsPage isOpen={activeModal === 'settings'} onClose={() => setActiveModal(null)} onOpenAlarm={() => { setActiveModal(null); setTimeout(() => setActiveModal('alarm'), 100); }} />
      {renderWidgetDetail()}
      <ConnectionStatus />
    </div>
  );
}
