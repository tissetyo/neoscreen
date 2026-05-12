'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Check, ChevronDown, ChevronUp, Clock3, Globe2, List, Play, RotateCcw, Search, Tv, X } from 'lucide-react';
import Hls from 'hls.js';
import { useDpadNavigation } from '@/lib/hooks/useDpadNavigation';
import { useRoomStore } from '@/stores/roomStore';
import MarqueeBar from '@/Components/TV/MarqueeBar';

interface Country { code: string; name: string; region: string; }
interface Channel {
  name: string;
  logo?: string | null;
  url: string;
  proxyUrl?: string;
  category: string;
  countryCode: string;
  countryName: string;
  availabilityStatus?: string;
  channelKey?: string;
  healthStatus?: string;
  responseTimeMs?: number | null;
}

interface IptvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GUIDE = [
  { key: 'OK', label: 'show channels' },
  { key: 'Up/Down', label: 'change channel' },
  { key: 'Left', label: 'countries' },
  { key: 'Back', label: 'close' },
];

const normalizeCategory = (value: string) => {
  const firstValue = (value || 'General').split(';')[0]?.trim() || 'General';
  const lower = firstValue.toLowerCase();
  if (lower.includes('sport')) return 'Sports';
  if (lower.includes('news') || lower.includes('business')) return 'News';
  if (lower.includes('kids') || lower.includes('children')) return 'Kids';
  if (lower.includes('movie') || lower.includes('entertain') || lower.includes('music')) return 'Entertainment';
  return firstValue;
};

export default function IptvModal({ isOpen, onClose }: IptvModalProps) {
  const store = useRoomStore();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const openedAtRef = useRef(0);
  const playStartedAtRef = useRef(0);
  const reportedRef = useRef<Record<string, boolean>>({});
  const [enabledCountries, setEnabledCountries] = useState<string[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [playbackError, setPlaybackError] = useState('');
  const [isBuffering, setIsBuffering] = useState(false);
  const [slowBuffer, setSlowBuffer] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(false);
  const [countryPanelVisible, setCountryPanelVisible] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [now, setNow] = useState(() => new Date());
  const countryParam = enabledCountries.join(',');
  const theme = store.tvLayoutConfig?.theme || {};
  const focusColor = theme.focusColor || '#14b8a6';

  const { data, error, isLoading, mutate } = useSWR(
    isOpen && store.roomId ? `/api/room/${store.roomId}/iptv?hotelId=${store.hotelId}&countries=${countryParam}` : null,
    async (url: string) => {
      const res = await fetch(url, { headers: store.roomSessionToken ? { 'X-Room-Token': store.roomSessionToken } : {} });
      if (!res.ok) throw new Error('Unable to load IPTV');
      return res.json();
    },
    { revalidateOnFocus: false }
  );

  useDpadNavigation({ enabled: isOpen, onEscape: onClose, selector: '.iptv-focusable' });

  useEffect(() => {
    if (isOpen) {
      openedAtRef.current = Date.now();
      setChromeVisible(false);
      setCountryPanelVisible(false);
      rootRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const revealChrome = (showCountries = false) => {
    setChromeVisible(true);
    if (showCountries) setCountryPanelVisible(true);
  };

  const revealFromPointer = () => {
    if (Date.now() - openedAtRef.current < 1200) return;
    revealChrome(false);
  };

  useEffect(() => {
    if (!data?.defaultCountryCodes || enabledCountries.length > 0) return;
    setEnabledCountries(data.defaultCountryCodes);
  }, [data?.defaultCountryCodes, enabledCountries.length]);

  const countries: Country[] = data?.countries || [];
  const channels: Channel[] = data?.channels || [];
  const authHeaders = store.roomSessionToken ? { 'X-Room-Token': store.roomSessionToken } : {};
  const categories = useMemo(() => {
    const found = new Set<string>();
    channels.forEach(channel => found.add(normalizeCategory(channel.category || 'General')));
    return ['All', ...Array.from(found).sort((a, b) => a.localeCompare(b))];
  }, [channels]);

  const filteredChannels = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return channels.filter(channel => {
      const category = normalizeCategory(channel.category || 'General');
      const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
      const matchesSearch = !needle ||
        channel.name.toLowerCase().includes(needle) ||
        channel.countryName.toLowerCase().includes(needle) ||
        category.toLowerCase().includes(needle);
      return matchesCategory && matchesSearch;
    });
  }, [channels, query, selectedCategory]);

  const reportChannel = (channel: Channel | null, event: 'play' | 'buffer' | 'recover' | 'error' | 'timeout' | 'skip', message?: string, startupMs?: number) => {
    if (!channel || !store.roomId || !store.hotelId) return;

    fetch(`/api/room/${store.roomId}/iptv/report?hotelId=${store.hotelId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        countryCode: channel.countryCode,
        channelKey: channel.channelKey || channel.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
        name: channel.name,
        url: channel.url,
        event,
        message,
        startupMs,
      }),
    })
      .then(() => {
        if (['error', 'timeout', 'skip'].includes(event)) mutate();
      })
      .catch(() => {});
  };

  useEffect(() => {
    if (activeChannel && channels.length && !channels.some(channel => channel.url === activeChannel.url)) {
      setActiveChannel(channels[0]);
      return;
    }

    if (!activeChannel && channels.length) {
      setActiveChannel(channels[0]);
    }
  }, [channels, activeChannel]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeChannel) return;

    playStartedAtRef.current = Date.now();
    reportedRef.current = {};
    setPlaybackError('');
    setIsBuffering(true);
    setSlowBuffer(false);
    const playbackUrl = activeChannel.proxyUrl || activeChannel.url;
    const isHls = activeChannel.url.toLowerCase().includes('.m3u8');
    const slowTimer = window.setTimeout(() => setSlowBuffer(true), 7000);
    const autoSkipTimer = window.setTimeout(() => {
      reportChannel(activeChannel, 'timeout', 'Startup timeout', Date.now() - playStartedAtRef.current);
      setPlaybackError('Trying the next available channel...');
      window.setTimeout(() => moveChannel(1), 900);
    }, 15000);

    const markPlaying = () => {
      window.clearTimeout(autoSkipTimer);
      if (!reportedRef.current.play) {
        reportedRef.current.play = true;
        reportChannel(activeChannel, 'play', 'Playback started', Date.now() - playStartedAtRef.current);
      }
      setIsBuffering(false);
      setSlowBuffer(false);
      setPlaybackError('');
    };
    const markWaiting = () => {
      setIsBuffering(true);
      if (!reportedRef.current.buffer) {
        reportedRef.current.buffer = true;
        reportChannel(activeChannel, 'buffer', 'Player waiting for data', Date.now() - playStartedAtRef.current);
      }
    };
    video.addEventListener('playing', markPlaying);
    video.addEventListener('canplay', markPlaying);
    video.addEventListener('waiting', markWaiting);
    video.addEventListener('stalled', markWaiting);
    video.addEventListener('loadstart', markWaiting);

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        startLevel: 0,
        capLevelToPlayerSize: true,
        maxBufferLength: 45,
        maxMaxBufferLength: 90,
        backBufferLength: 30,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 8,
        manifestLoadingTimeOut: 12000,
        levelLoadingTimeOut: 12000,
        fragLoadingTimeOut: 16000,
        abrBandWidthFactor: 0.72,
        abrBandWidthUpFactor: 0.65,
        abrEwmaDefaultEstimate: 650000,
      });
      hls.loadSource(playbackUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, (_event, manifest) => {
        if ((manifest?.levels?.length ?? 0) > 1) {
          hls.nextLevel = 0;
          hls.currentLevel = 0;
        }

        video.play().catch(() => {
          setIsBuffering(false);
          setPlaybackError('Press OK to start this channel.');
          reportChannel(activeChannel, 'error', 'Autoplay blocked', Date.now() - playStartedAtRef.current);
        });
      });
      hls.on(Hls.Events.ERROR, (_event, details) => {
        if (!details.fatal) return;

        if (details.type === Hls.ErrorTypes.NETWORK_ERROR) {
          reportChannel(activeChannel, 'recover', 'Recovered network error', Date.now() - playStartedAtRef.current);
          hls.startLoad();
          return;
        }

        if (details.type === Hls.ErrorTypes.MEDIA_ERROR) {
          reportChannel(activeChannel, 'recover', 'Recovered media error', Date.now() - playStartedAtRef.current);
          hls.recoverMediaError();
          return;
        }

        if (details.fatal) {
          setIsBuffering(false);
          setPlaybackError('This stream is temporarily unavailable.');
          reportChannel(activeChannel, 'error', details.details || 'Fatal HLS error', Date.now() - playStartedAtRef.current);
        }
      });

      return () => {
        window.clearTimeout(slowTimer);
        window.clearTimeout(autoSkipTimer);
        video.removeEventListener('playing', markPlaying);
        video.removeEventListener('canplay', markPlaying);
        video.removeEventListener('waiting', markWaiting);
        video.removeEventListener('stalled', markWaiting);
        video.removeEventListener('loadstart', markWaiting);
        hls.destroy();
      };
    }

    video.src = playbackUrl;
    video.play().catch(() => {
      setIsBuffering(false);
      setPlaybackError('Press OK to start this channel.');
      reportChannel(activeChannel, 'error', 'Autoplay blocked', Date.now() - playStartedAtRef.current);
    });

    return () => {
      window.clearTimeout(slowTimer);
      window.clearTimeout(autoSkipTimer);
      video.removeEventListener('playing', markPlaying);
      video.removeEventListener('canplay', markPlaying);
      video.removeEventListener('waiting', markWaiting);
      video.removeEventListener('stalled', markWaiting);
      video.removeEventListener('loadstart', markWaiting);
      video.removeAttribute('src');
      video.load();
    };
  }, [activeChannel]);

  useEffect(() => {
    if (!activeChannel || !channels.length) return;
    const index = channels.findIndex(channel => channel.url === activeChannel.url);
    if (index < 0) return;

    channels
      .slice(index + 1, index + 4)
      .filter(channel => (channel.proxyUrl || channel.url).toLowerCase().includes('.m3u8'))
      .forEach(channel => {
        fetch(channel.proxyUrl || channel.url, { headers: authHeaders, cache: 'force-cache' }).catch(() => {});
      });
  }, [activeChannel, channels]);

  useEffect(() => {
    if (!isOpen || !chromeVisible) return;
    const timer = window.setTimeout(() => {
      setChromeVisible(false);
      setCountryPanelVisible(false);
      setQuery('');
    }, 9000);
    return () => window.clearTimeout(timer);
  }, [chromeVisible, countryPanelVisible, query, activeChannel, isOpen]);

  const toggleCountry = (code: string) => {
    const mustKeep = new Set(data?.defaultCountryCodes || []);
    if (mustKeep.has(code)) return;
    setActiveChannel(null);
    setEnabledCountries(current => current.includes(code) ? current.filter(item => item !== code) : [...current, code]);
    setSelectedCategory('All');
  };

  const selectChannel = (channel: Channel) => {
    setActiveChannel(channel);
    revealChrome(false);
  };

  const moveChannel = (step: number) => {
    const list = filteredChannels.length ? filteredChannels : channels;
    if (!list.length || !activeChannel) return;
    const index = list.findIndex(channel => channel.url === activeChannel.url);
    const nextIndex = index < 0 ? 0 : (index + step + list.length) % list.length;
    setActiveChannel(list[nextIndex]);
    revealChrome(false);
  };

  const retryChannel = () => {
    setPlaybackError('');
    setSlowBuffer(false);
    mutate();
    setActiveChannel(current => current ? { ...current } : current);
  };

  const handleRemoteKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(event.key)) {
      revealChrome(event.key === 'ArrowLeft');
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveChannel(-1);
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveChannel(1);
    }

    if ((event.key === 'Enter' || event.key === ' ') && videoRef.current?.paused) {
      videoRef.current.play().catch(() => setPlaybackError('Press OK to start this channel.'));
    }
  };

  if (!isOpen) return null;

  const clockText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={rootRef}
        tabIndex={0}
        onKeyDown={handleRemoteKey}
        onMouseMove={revealFromPointer}
        onClick={revealFromPointer}
        className="fixed inset-0 z-[90] bg-black text-white outline-none"
      >
        {data?.enabled === false ? (
          <CenteredState title="IPTV is unavailable" body="This hotel has IPTV disabled by the platform administrator." />
        ) : error ? (
          <CenteredState title="Channels could not load" body="Check the room connection and try again." />
        ) : activeChannel ? (
          <>
            <video ref={videoRef} key={`${activeChannel.url}-${activeChannel.name}`} controls={chromeVisible} autoPlay playsInline className="h-full w-full bg-black object-contain" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black via-black/50 to-transparent" />
            {(isBuffering || playbackError) && (
              <div className="absolute left-1/2 top-1/2 w-[min(520px,80vw)] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/10 bg-slate-950/82 px-8 py-7 text-center shadow-2xl backdrop-blur-2xl">
                {isBuffering && !playbackError ? <div className="mx-auto mb-5 h-14 w-14 rounded-full border-4 border-white/15 border-t-cyan-300 animate-spin" /> : <AlertTriangle size={44} className="mx-auto mb-4 text-amber-300" />}
                <p className="text-2xl font-semibold">{playbackError ? 'Stream unavailable' : 'Starting live TV'}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {playbackError || (slowBuffer ? 'Still loading. You can wait, try again, or press Down for the next channel.' : 'Please wait while the live stream buffers.')}
                </p>
                {(slowBuffer || playbackError) && (
                  <div className="mt-5 flex justify-center gap-3">
                    <button type="button" onClick={retryChannel} className="iptv-focusable inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium">
                      <RotateCcw size={16} /> Try again
                    </button>
                    <button type="button" onClick={() => moveChannel(1)} className="iptv-focusable inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium text-slate-950" style={{ backgroundColor: focusColor }}>
                      <ChevronDown size={16} /> Next channel
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-white/50">
              <Tv size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl font-medium">{isLoading ? 'Loading channels...' : 'No playable channels found'}</p>
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute left-6 top-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/38 px-4 py-3 shadow-2xl backdrop-blur-xl">
          {theme.logoUrl ? <img src={theme.logoUrl} alt="" className="max-h-9 max-w-[120px] object-contain" /> : <span className="text-sm font-semibold tracking-[0.22em] text-white/85">NEOSCREEN</span>}
          <span className="h-6 w-px bg-white/15" />
          <Clock3 size={16} className="text-cyan-200" />
          <span className="text-sm font-medium tabular-nums text-white/80">{clockText}</span>
        </div>

        {activeChannel && (
          <div className={`pointer-events-none absolute bottom-14 left-8 right-[430px] transition-opacity duration-300 ${chromeVisible ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-3xl font-semibold drop-shadow-2xl">{activeChannel.name}</p>
            <p className="mt-1 text-base text-white/65">{activeChannel.countryName} · {normalizeCategory(activeChannel.category || 'General')}</p>
          </div>
        )}

        <div className={`absolute left-6 top-24 flex items-center gap-3 transition-opacity duration-300 ${chromeVisible ? 'opacity-100' : 'opacity-0'}`}>
          <button type="button" onClick={() => setCountryPanelVisible(current => !current)} className="iptv-focusable flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-slate-950/70 text-white shadow-2xl backdrop-blur-xl" aria-label="Country packs">
            <Globe2 size={20} />
          </button>
          <button type="button" onClick={() => revealChrome(false)} className="iptv-focusable flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-slate-950/70 text-white shadow-2xl backdrop-blur-xl" aria-label="Channel list">
            <List size={20} />
          </button>
        </div>

        <button type="button" onClick={onClose} className={`iptv-focusable absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-slate-950/70 text-white shadow-2xl backdrop-blur-xl transition-opacity duration-300 ${chromeVisible ? 'opacity-100' : 'opacity-0'}`} aria-label="Close IPTV">
          <X size={20} />
        </button>

        <AnimatePresence>
          {chromeVisible && (
            <motion.aside initial={{ x: 440, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 440, opacity: 0 }} className="absolute bottom-16 right-6 top-24 w-[420px] rounded-[28px] border border-white/10 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-2xl">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em]" style={{ color: focusColor }}>Live TV</p>
                  <h2 className="mt-1 text-xl font-semibold">Channels</h2>
                </div>
                <p className="text-xs text-white/40">{filteredChannels.length}/{channels.length}</p>
              </div>
              <div className="relative mb-3">
                <Search size={17} className="absolute left-3 top-3.5 text-white/35" />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search channels"
                  className="iptv-focusable w-full rounded-2xl border border-white/10 bg-white/[0.06] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300/60" />
              </div>
              <div className="iptv-scrollbar-hidden mb-4 flex gap-2 overflow-x-auto pb-1">
                {categories.map(category => (
                  <button key={category} type="button" onClick={() => setSelectedCategory(category)}
                    className={`iptv-focusable shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${selectedCategory === category ? 'border-cyan-300/50 bg-cyan-300/15 text-white' : 'border-white/10 bg-white/[0.04] text-white/55'}`}>
                    {category}
                  </button>
                ))}
              </div>
              <div className="iptv-scrollbar-hidden space-y-2 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 315px)' }}>
                {filteredChannels.map(channel => (
                  <button key={`${channel.countryCode}-${channel.url}`} type="button" onClick={() => selectChannel(channel)}
                    className={`iptv-focusable flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${activeChannel?.url === channel.url ? 'border-cyan-300/50 bg-cyan-300/15' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'}`}>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      {channel.logo ? <img src={channel.logo} alt="" className="max-h-10 max-w-10 object-contain" /> : <Play size={18} className="text-white/50" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{channel.name}</p>
                      <p className="truncate text-xs text-white/40">{channel.countryName} · {normalizeCategory(channel.category || 'General')}</p>
                    </div>
                  </button>
                ))}
                {!isLoading && filteredChannels.length === 0 && (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center text-sm text-white/45">No playable channels in this filter.</div>
                )}
              </div>
              <RemoteGuide />
            </motion.aside>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {chromeVisible && countryPanelVisible && (
            <motion.aside initial={{ x: -380, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -380, opacity: 0 }} className="absolute bottom-16 left-6 top-24 w-[340px] rounded-[28px] border border-white/10 bg-slate-950/90 p-5 shadow-2xl backdrop-blur-2xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em]" style={{ color: focusColor }}>Countries</p>
              <h2 className="mt-1 text-xl font-semibold">Channel Packs</h2>
              <div className="iptv-scrollbar-hidden mt-4 space-y-4 overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 235px)' }}>
                {Object.entries(countries.reduce<Record<string, Country[]>>((acc, country) => {
                  acc[country.region] = [...(acc[country.region] || []), country];
                  return acc;
                }, {})).map(([region, items]) => (
                  <div key={region}>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-white/35">{region}</p>
                    <div className="space-y-2">
                      {items.map(country => {
                        const checked = enabledCountries.includes(country.code);
                        const locked = (data?.defaultCountryCodes || []).includes(country.code);
                        return (
                          <button key={country.code} type="button" onClick={() => toggleCountry(country.code)}
                            className={`iptv-focusable flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-colors ${checked ? 'border-cyan-300/40 bg-cyan-300/15' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'}`}>
                            <span>
                              <span className="block text-sm font-medium">{country.name}</span>
                              <span className="text-xs text-white/35">{locked ? 'Default pack' : checked ? 'Added to list' : country.code.toUpperCase()}</span>
                            </span>
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full ${checked ? 'bg-cyan-300 text-slate-950' : 'bg-white/10 text-white/30'}`}>
                              {checked && <Check size={15} strokeWidth={3} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <RemoteGuide compact />
            </motion.aside>
          )}
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-0 h-10 border-t border-white/10 bg-black/78 backdrop-blur-xl">
          <MarqueeBar />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function CenteredState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="max-w-md text-center text-white/60">
        <AlertTriangle size={48} className="mx-auto mb-4 text-amber-300" />
        <p className="text-xl font-medium text-white">{title}</p>
        <p className="mt-2 text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

function RemoteGuide({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`mt-4 border-t border-white/10 pt-3 ${compact ? 'grid grid-cols-2 gap-2' : 'flex flex-wrap gap-2'}`}>
      {GUIDE.map(item => (
        <div key={item.key} className="flex items-center gap-2 rounded-xl bg-white/[0.05] px-2.5 py-2 text-[11px] text-white/55">
          {item.key === 'Up/Down' && <ChevronUp size={13} />}
          <span className="font-semibold text-white/85">{item.key}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
