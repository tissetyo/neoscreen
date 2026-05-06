'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoomStore } from '@/stores/roomStore';
import { useDpadNavigation } from '@/lib/hooks/useDpadNavigation';
import {
  Sun, Contrast, Palette, Maximize, RotateCcw, X,
  Monitor, Wifi, Bell, Clock, Info, RefreshCw,
  ChevronRight, Settings as SettingsIcon, LayoutGrid, SlidersHorizontal
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenAlarm?: () => void;
}

type Category = 'display' | 'tv-stb' | 'network' | 'notifications' | 'alarm' | 'about' | 'reset';

const CATEGORIES: { id: Category; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'display', label: 'Display', icon: <Sun className="w-[1.2vw] h-[1.2vw]" />, desc: 'Brightness, contrast, saturation, zoom' },
  { id: 'tv-stb', label: 'TV / STB Settings', icon: <Monitor className="w-[1.2vw] h-[1.2vw]" />, desc: 'Open device system settings' },
  { id: 'network', label: 'Network', icon: <Wifi className="w-[1.2vw] h-[1.2vw]" />, desc: 'Connection status & WiFi info' },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-[1.2vw] h-[1.2vw]" />, desc: 'Notification preferences' },
  { id: 'alarm', label: 'Alarm', icon: <Clock className="w-[1.2vw] h-[1.2vw]" />, desc: 'Quick alarm setup' },
  { id: 'about', label: 'About', icon: <Info className="w-[1.2vw] h-[1.2vw]" />, desc: 'Device & app information' },
  { id: 'reset', label: 'Reset Setup', icon: <RefreshCw className="w-[1.2vw] h-[1.2vw]" />, desc: 'Clear config & return to setup' },
];

export default function SettingsPage({ isOpen, onClose, onOpenAlarm }: Props) {
  const store = useRoomStore();
  const hydrate = useRoomStore(s => s.hydrate);
  const config = (store.tvLayoutConfig && typeof store.tvLayoutConfig === 'object' ? store.tvLayoutConfig : {}) as any;

  const [activeCategory, setActiveCategory] = useState<Category>('display');
  const [focusPanel, setFocusPanel] = useState<'left' | 'right'>('left');

  // Display settings state
  const overrides = store.tvDisplayOverrides || {};
  const [brightness, setBrightness] = useState(overrides.brightness ?? config.theme?.brightness ?? 1);
  const [contrast, setContrast] = useState(overrides.contrast ?? config.theme?.contrast ?? 1);
  const [saturate, setSaturate] = useState(overrides.saturate ?? config.theme?.saturate ?? 1);
  const [scale, setScale] = useState(overrides.scale ?? config.theme?.scale ?? 1);

  // Device info
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useDpadNavigation({ enabled: isOpen, onEscape: onClose, selector: '.settings-focusable' });

  useEffect(() => {
    if (isOpen) {
      setBrightness(store.tvDisplayOverrides?.brightness ?? config.theme?.brightness ?? 1);
      setContrast(store.tvDisplayOverrides?.contrast ?? config.theme?.contrast ?? 1);
      setSaturate(store.tvDisplayOverrides?.saturate ?? config.theme?.saturate ?? 1);
      setScale(store.tvDisplayOverrides?.scale ?? config.theme?.scale ?? 1);
      setActiveCategory('display');
      setFocusPanel('left');

      // Try to get device info from native bridge
      try {
        if (typeof window !== 'undefined' && (window as any).NeotivNative?.getDeviceInfo) {
          const info = JSON.parse((window as any).NeotivNative.getDeviceInfo());
          setDeviceInfo(info);
        }
      } catch { /* not on STB */ }
    }
  }, [isOpen, store.tvDisplayOverrides, config.theme]);

  const handleDisplayChange = useCallback((type: 'brightness' | 'contrast' | 'saturate' | 'scale', value: number) => {
    const clamped = Math.round(value * 100) / 100;
    let b = brightness, c = contrast, s = saturate, z = scale;
    if (type === 'brightness') { b = clamped; setBrightness(clamped); }
    if (type === 'contrast') { c = clamped; setContrast(clamped); }
    if (type === 'saturate') { s = clamped; setSaturate(clamped); }
    if (type === 'scale') { z = clamped; setScale(clamped); }
    hydrate({ tvDisplayOverrides: { brightness: b, contrast: c, saturate: s, scale: z, screenMode: (store.tvDisplayOverrides as any)?.screenMode } });
  }, [brightness, contrast, saturate, scale, hydrate]);

  const handleDisplayReset = useCallback(() => {
    setBrightness(1); setContrast(1); setSaturate(1); setScale(1);
    hydrate({ tvDisplayOverrides: { brightness: 1, contrast: 1, saturate: 1, scale: 1, screenMode: (store.tvDisplayOverrides as any)?.screenMode } });
  }, [hydrate]);

  const handleApplyDisplay = useCallback(() => {
    if (store.hotelSlug && store.roomCode) {
      const key = `neotiv_room_${store.hotelSlug}_${store.roomCode}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          data.tvDisplayOverrides = { brightness, contrast, saturate, scale };
          localStorage.setItem(key, JSON.stringify(data));
        } catch { /* ignore */ }
      }
    }
  }, [store.hotelSlug, store.roomCode, brightness, contrast, saturate, scale]);

  const handleOpenSTBSettings = useCallback(() => {
    try {
      if (typeof window !== 'undefined' && (window as any).NeotivNative?.openSystemSettings) {
        (window as any).NeotivNative.openSystemSettings();
      } else if (typeof window !== 'undefined' && (window as any).NeotivNative?.exitApp) {
        (window as any).NeotivNative.exitApp();
      } else {
        alert('STB settings are only available on the physical TV device.');
      }
    } catch {
      alert('Could not open system settings.');
    }
  }, []);

  const handleReset = useCallback(() => {
    if (!confirm('This will clear all configuration and return to setup. Continue?')) return;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('neotiv_room_') || key === 'neotiv_stb_setup' || key === 'neotiv-room-store') {
        localStorage.removeItem(key);
      }
    });
    window.location.href = '/setup-stb';
  }, []);

  if (!isOpen) return null;

  const displaySliders = [
    { label: 'Brightness', icon: <Sun className="w-[1vw] h-[1vw]" />, value: brightness, type: 'brightness' as const, min: 0.5, max: 1.5, step: 0.05 },
    { label: 'Contrast', icon: <Contrast className="w-[1vw] h-[1vw]" />, value: contrast, type: 'contrast' as const, min: 0.5, max: 1.5, step: 0.05 },
    { label: 'Saturation', icon: <Palette className="w-[1vw] h-[1vw]" />, value: saturate, type: 'saturate' as const, min: 0.0, max: 2.0, step: 0.05 },
    { label: 'Zoom', icon: <Maximize className="w-[1vw] h-[1vw]" />, value: scale, type: 'scale' as const, min: 0.8, max: 1.2, step: 0.02 },
  ];

  const renderRightPanel = () => {
    switch (activeCategory) {
      case 'display':
        return (
          <div className="space-y-[1.5vh]">
            <div className="flex items-center justify-between mb-[1vh]">
              <h3 className="text-white text-[1.2vw] font-bold">Display Settings</h3>
              <button onClick={handleDisplayReset} className="flex items-center gap-[0.3vw] px-[0.6vw] py-[0.3vh] rounded-full bg-white/10 hover:bg-white/20 transition-colors settings-focusable" tabIndex={0}>
                <RotateCcw className="w-[0.7vw] h-[0.7vw] text-white/70" />
                <span className="text-white/70 text-[0.65vw] font-medium">Reset</span>
              </button>
            </div>
            {displaySliders.map((s) => (
              <div key={s.type} className="p-[0.8vw] rounded-xl settings-focusable focus:ring-2 focus:ring-[#d4af37]" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} tabIndex={0}>
                <div className="flex items-center justify-between mb-[0.5vh]">
                  <div className="flex items-center gap-[0.4vw] text-white/80">
                    {s.icon}
                    <span className="text-[0.75vw] font-semibold">{s.label}</span>
                  </div>
                  <span className="text-[#d4af37] text-[0.7vw] font-bold">{Math.round(s.value * 100)}%</span>
                </div>
                <div className="flex items-center gap-[0.5vw]">
                  <button onClick={() => handleDisplayChange(s.type, Math.max(s.min, s.value - s.step))} className="w-[1.5vw] h-[1.5vw] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold text-[0.7vw] settings-focusable shrink-0" tabIndex={0}>−</button>
                  <div className="flex-1 h-[0.4vw] rounded-full bg-white/10 relative overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-200" style={{ width: `${((s.value - s.min) / (s.max - s.min)) * 100}%`, background: 'linear-gradient(90deg, var(--color-teal), var(--color-teal-light))' }} />
                  </div>
                  <button onClick={() => handleDisplayChange(s.type, Math.min(s.max, s.value + s.step))} className="w-[1.5vw] h-[1.5vw] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold text-[0.7vw] settings-focusable shrink-0" tabIndex={0}>+</button>
                </div>
              </div>
            ))}
            <button onClick={() => { handleApplyDisplay(); onClose(); }} className="w-full py-[1vh] rounded-xl bg-[#d4af37] hover:bg-[#d4af37] text-white font-bold text-[0.85vw] transition-colors settings-focusable mt-[1vh]" tabIndex={0}>
              Apply & Close
            </button>

            {/* Screen Mode Toggle */}
            <div className="mt-[2vh] pt-[1.5vh] border-t border-white/10">
              <h4 className="text-white/80 text-[0.85vw] font-semibold mb-[1vh]">Screen Mode</h4>
              <div className="flex gap-[0.5vw]">
                {[
                  { id: 'grid', label: 'Grid', icon: <LayoutGrid className="w-[1vw] h-[1vw]" />, desc: 'All widgets visible' },
                  { id: 'slideshow', label: 'Slideshow', icon: <SlidersHorizontal className="w-[1vw] h-[1vw]" />, desc: 'Photo slideshow + overlays' },
                ].map((mode) => {
                  const currentMode = (store.tvDisplayOverrides as any)?.screenMode || config.screenMode || 'grid';
                  const isActive = currentMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        const current = store.tvDisplayOverrides || {};
                        hydrate({ tvDisplayOverrides: { ...current, screenMode: mode.id } });
                        // Persist to localStorage
                        if (store.hotelSlug && store.roomCode) {
                          const key = `neotiv_room_${store.hotelSlug}_${store.roomCode}`;
                          try {
                            const stored = JSON.parse(localStorage.getItem(key) || '{}');
                            stored.tvDisplayOverrides = { ...current, screenMode: mode.id };
                            localStorage.setItem(key, JSON.stringify(stored));
                          } catch { /* ignore */ }
                        }
                      }}
                      className={`flex-1 flex flex-col items-center gap-[0.3vh] p-[0.8vw] rounded-xl transition-all duration-200 settings-focusable ${
                        isActive
                          ? 'bg-[#d4af37]/20 border-2 border-[#d4af37] text-[#d4af37]'
                          : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                      tabIndex={0}
                    >
                      {mode.icon}
                      <span className="text-[0.7vw] font-bold">{mode.label}</span>
                      <span className="text-[0.5vw] opacity-60">{mode.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'tv-stb':
        return (
          <div className="space-y-[2vh]">
            <h3 className="text-white text-[1.2vw] font-bold">TV / STB Settings</h3>
            <p className="text-white/60 text-[0.8vw]">Access the underlying set-top box system settings. This will temporarily minimize the Neotiv app.</p>
            <button onClick={handleOpenSTBSettings} className="w-full py-[1.5vh] rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-[1vw] transition-colors settings-focusable flex items-center justify-center gap-[0.5vw]" tabIndex={0}>
              <Monitor className="w-[1.2vw] h-[1.2vw]" />
              Open System Settings
            </button>
            <p className="text-white/40 text-[0.65vw] text-center">Press Back on your remote to return to Neotiv</p>
          </div>
        );

      case 'network':
        return (
          <div className="space-y-[1.5vh]">
            <h3 className="text-white text-[1.2vw] font-bold">Network Status</h3>
            <div className="space-y-[1vh]">
              {[
                { label: 'Status', value: navigator.onLine ? '🟢 Connected' : '🔴 Offline' },
                { label: 'WiFi SSID', value: store.wifiSsid || 'Not configured' },
                { label: 'Hotel', value: store.hotelName || '—' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-[0.8vw] rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <span className="text-white/60 text-[0.75vw]">{item.label}</span>
                  <span className="text-white text-[0.75vw] font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-[1.5vh]">
            <h3 className="text-white text-[1.2vw] font-bold">Notification Preferences</h3>
            <p className="text-white/60 text-[0.8vw]">Notification settings are managed by your hotel. Contact the front desk for changes.</p>
            <div className="p-[1vw] rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <span className="text-white/80 text-[0.8vw]">Show notification popups</span>
                <span className="text-[#d4af37] text-[0.75vw] font-bold">Enabled</span>
              </div>
            </div>
          </div>
        );

      case 'alarm':
        return (
          <div className="space-y-[2vh]">
            <h3 className="text-white text-[1.2vw] font-bold">Alarm</h3>
            <p className="text-white/60 text-[0.8vw]">Set a wake-up call alarm. The front desk will call your room at the scheduled time.</p>
            <button onClick={() => { onClose(); onOpenAlarm?.(); }} className="w-full py-[1.5vh] rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-[1vw] transition-colors settings-focusable flex items-center justify-center gap-[0.5vw]" tabIndex={0}>
              <Clock className="w-[1.2vw] h-[1.2vw]" />
              Set Alarm
            </button>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-[1.5vh]">
            <h3 className="text-white text-[1.2vw] font-bold">About</h3>
            <div className="space-y-[0.8vh]">
              {[
                { label: 'Hotel', value: store.hotelName || '—' },
                { label: 'Room', value: store.roomCode || '—' },
                { label: 'App', value: 'Neotiv TV Dashboard v1.0' },
                ...(deviceInfo ? [
                  { label: 'Device', value: `${deviceInfo.manufacturer} ${deviceInfo.model}` },
                  { label: 'Android', value: `${deviceInfo.android} (SDK ${deviceInfo.sdk})` },
                ] : []),
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-[0.7vw] rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <span className="text-white/60 text-[0.7vw]">{item.label}</span>
                  <span className="text-white text-[0.7vw] font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'reset':
        return (
          <div className="space-y-[2vh]">
            <h3 className="text-white text-[1.2vw] font-bold">Reset Setup</h3>
            <p className="text-white/60 text-[0.8vw]">This will clear all local configuration and return to the initial setup screen. Use this when reconfiguring the device for a different hotel or room.</p>
            <button onClick={handleReset} className="w-full py-[1.5vh] rounded-xl bg-red-500/80 hover:bg-red-500 text-white font-bold text-[1vw] transition-colors settings-focusable flex items-center justify-center gap-[0.5vw]" tabIndex={0}>
              <RefreshCw className="w-[1.2vw] h-[1.2vw]" />
              Reset & Return to Setup
            </button>
            <p className="text-white/40 text-[0.65vw] text-center">⚠ This action cannot be undone</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative z-10 flex w-full h-full"
          >
            {/* Left Panel — Categories */}
            <div className="w-[28vw] border-r border-white/10 flex flex-col py-[3vh] px-[2vw]">
              <div className="flex items-center gap-[0.8vw] mb-[3vh]">
                <button onClick={onClose} className="w-[2.2vw] h-[2.2vw] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors settings-focusable" tabIndex={0}>
                  <X className="w-[1vw] h-[1vw] text-white/70" />
                </button>
                <div className="w-[2.5vw] h-[2.5vw] rounded-xl bg-white/10 flex items-center justify-center text-white/80">
                  <SettingsIcon className="w-[1.3vw] h-[1.3vw]" />
                </div>
                <h2 className="text-white text-[1.4vw] font-bold tracking-tight">Settings</h2>
              </div>

              <div className="space-y-[0.5vh] flex-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setFocusPanel('right'); }}
                    className={`w-full flex items-center gap-[0.8vw] px-[1vw] py-[1.2vh] rounded-xl transition-all duration-200 text-left settings-focusable ${
                      activeCategory === cat.id
                        ? 'bg-white/10 text-white border border-[#d4af37]/50'
                        : 'text-white/60 hover:bg-white/5 hover:text-white/80 border border-transparent'
                    }`}
                    tabIndex={0}
                  >
                    <div className={`w-[2vw] h-[2vw] rounded-lg flex items-center justify-center shrink-0 ${
                      activeCategory === cat.id ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-white/5'
                    }`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[0.85vw] font-semibold truncate">{cat.label}</p>
                      <p className="text-[0.6vw] text-white/40 truncate">{cat.desc}</p>
                    </div>
                    <ChevronRight className="w-[0.8vw] h-[0.8vw] text-white/30 shrink-0" />
                  </button>
                ))}
              </div>

              <p className="text-white/30 text-[0.55vw] text-center mt-[2vh]">Use D-pad to navigate • Escape to close</p>
            </div>

            {/* Right Panel — Active Category Options */}
            <div className="flex-1 py-[3vh] px-[3vw] overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderRightPanel()}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
