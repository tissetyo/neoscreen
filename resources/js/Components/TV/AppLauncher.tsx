'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCode } from 'react-qr-code';
import { useDpadNavigation } from '@/lib/hooks/useDpadNavigation';

export interface AppConfig {
  id?: string;
  name: string;
  icon: string;
  url: string;
  embeddable: boolean; // false = show QR code instead
  subtitle?: string;
  brandColor?: string;
  iconScale?: number;
}

export const TV_APPS: AppConfig[] = [
  { name: 'YouTube', icon: '▶️', url: 'https://www.youtube.com/tv', embeddable: true },
  { name: 'Disney+', icon: '🏰', url: 'https://www.disneyplus.com', embeddable: false },
  { name: 'Netflix', icon: '🎬', url: 'https://www.netflix.com', embeddable: false },
  { name: 'YouTube Music', icon: '🎵', url: 'https://music.youtube.com', embeddable: true },
  { name: 'Spotify', icon: '🎧', url: 'https://open.spotify.com', embeddable: true },
  { name: 'Prime Video', icon: '📦', url: 'https://www.primevideo.com', embeddable: false },
];

export const UTILITY_APPS: AppConfig[] = [
  { name: 'TV', icon: '📺', url: '', embeddable: false },
  { name: 'TikTok', icon: '🎭', url: 'https://www.tiktok.com', embeddable: false },
];

interface AppLauncherProps {
  app: AppConfig | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AppLauncher({ app, isOpen, onClose }: AppLauncherProps) {
  const [showControls, setShowControls] = useState(true);

  // Auto-hide controls after 3 seconds for iframe apps
  useEffect(() => {
    if (!isOpen || !app?.embeddable) return;
    setShowControls(true);
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  }, [isOpen, app]);

  useDpadNavigation({ enabled: isOpen, onEscape: onClose, selector: '.app-launcher-focusable' });

  // Show controls on mouse move or key press
  useEffect(() => {
    if (!isOpen) return;
    const show = () => {
      setShowControls(true);
    };
    window.addEventListener('mousemove', show);
    return () => window.removeEventListener('mousemove', show);
  }, [isOpen]);

  // Handle escape and TV switch
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Handle TV switch event dispatch
  const handleTVSwitch = () => {
    window.dispatchEvent(new CustomEvent('neotiv:switch-to-tv'));
    onClose();
  };

  if (!app) return null;
  const iconIsImage = typeof app.icon === 'string' && (app.icon.startsWith('/') || app.icon.startsWith('http'));
  const appInitials = (app.name || 'App').slice(0, 2).toUpperCase();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
          style={{ background: '#000' }}
        >
          {/* TV app — dispatch custom event and close */}
          {app.name === 'TV' ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-6">📺</div>
                <p className="text-white text-2xl font-semibold mb-4">Switching to TV Input...</p>
                <p className="text-white/50">Press Escape to return to dashboard</p>
              </div>
              {/* Auto-trigger TV switch */}
              <script dangerouslySetInnerHTML={{ __html: `window.dispatchEvent(new CustomEvent('neotiv:switch-to-tv'));` }} />
            </div>
          ) : app.embeddable ? (
            /* Embeddable app — fullscreen iframe */
            <>
              <iframe
                src={app.url}
                className="w-full h-full border-0"
                allow="fullscreen; autoplay; encrypted-media"
                allowFullScreen
                title={app.name}
              />

              {/* Floating back button */}
              <AnimatePresence>
                {showControls && (
                  <motion.button
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    onClick={onClose}
                    className="fixed top-4 left-4 z-[60] px-4 py-2 rounded-full font-semibold text-white text-sm transition-all tv-focusable app-launcher-focusable"
                    style={{
                      background: 'rgba(15,23,42,0.9)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(8px)',
                    }}
                    tabIndex={0}
                  >
                    ← Back to Dashboard
                  </motion.button>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* Non-embeddable app — show QR code */
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.95)' }}>
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card p-12 text-center max-w-md"
              >
                <div
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl text-2xl font-semibold text-white"
                  style={{ background: app.brandColor || 'rgba(255,255,255,0.12)' }}
                >
                  {iconIsImage ? (
                    <img src={app.icon} alt="" className="h-14 w-14 object-contain" />
                  ) : (
                    <span>{app.icon || appInitials}</span>
                  )}
                </div>
                <h2 className="text-white text-2xl font-bold mb-2">{app.name}</h2>
                <p className="text-white/50 mb-6">
                  Scan the QR code below to open {app.name} on your phone
                </p>
                <div className="bg-white p-4 rounded-2xl inline-block mb-6">
                  <QRCode value={app.url} size={200} />
                </div>
                <p className="text-white/30 text-sm mb-6">
                  Or visit: {app.url}
                </p>
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-xl font-semibold text-white transition-all tv-focusable app-launcher-focusable"
                  style={{ background: 'var(--color-teal)' }}
                  tabIndex={0}
                >
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
