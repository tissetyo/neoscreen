import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState, useRef } from 'react';
import {
    ArrowLeft, Save, RotateCcw, Monitor, Palette, Play, Eye, Plus,
    Trash2, Upload, Power, Link as LinkIcon, Image as ImageIcon,
    ChevronDown, GripVertical, EyeOff, CheckCircle2, AlertTriangle,
} from 'lucide-react';

// Matches the real TV Dashboard 24×14 grid exactly
const DEFAULT_LAYOUT: Record<string, any> = {
    analogClocks:     { colStart: 1,  rowStart: 1,  colSpan: 6,  rowSpan: 3,  visible: true, bgColor: '#1e293b' },
    flightSchedule:   { colStart: 1,  rowStart: 4,  colSpan: 6,  rowSpan: 5,  visible: true, bgColor: '#1e293b' },
    hotelDeals:       { colStart: 1,  rowStart: 9,  colSpan: 6,  rowSpan: 6,  visible: true, bgColor: '#292524' },
    digitalClock:     { colStart: 7,  rowStart: 1,  colSpan: 10, rowSpan: 3,  visible: true, bgColor: '#0f172a' },
    hotelService:     { colStart: 7,  rowStart: 9,  colSpan: 4,  rowSpan: 3,  visible: true, bgColor: '#1e293b' },
    hotelInfo:        { colStart: 7,  rowStart: 12, colSpan: 4,  rowSpan: 3,  visible: true, bgColor: '#0f172a' },
    mapWidget:        { colStart: 11, rowStart: 9,  colSpan: 4,  rowSpan: 6,  visible: true, bgColor: '#14532d' },
    guestCard:        { colStart: 17, rowStart: 1,  colSpan: 8,  rowSpan: 2,  visible: true, bgColor: '#1e293b' },
    wifiCard:         { colStart: 17, rowStart: 3,  colSpan: 8,  rowSpan: 3,  visible: true, bgColor: '#164e63' },
    notificationCard: { colStart: 17, rowStart: 6,  colSpan: 8,  rowSpan: 3,  visible: true, bgColor: '#1e293b' },
    alarmWidget:      { colStart: 15, rowStart: 9,  colSpan: 2,  rowSpan: 2,  visible: true, bgColor: '#d4af37' },
    chatWidget:       { colStart: 17, rowStart: 9,  colSpan: 2,  rowSpan: 2,  visible: true, bgColor: '#14b8a6' },
    notifWidget:      { colStart: 19, rowStart: 9,  colSpan: 2,  rowSpan: 2,  visible: true, bgColor: '#f43f5e' },
    displayWidget:    { colStart: 21, rowStart: 9,  colSpan: 4,  rowSpan: 2,  visible: true, bgColor: '#6366f1' },
    brandLogo:        { colStart: 1,  rowStart: 1,  colSpan: 3,  rowSpan: 1,  visible: false, followGlobalStyle: false, bgOpacity: 0 },
};

const WIDGET_LABELS: Record<string, string> = {
    analogClocks: 'World Clocks', digitalClock: 'Digital Clock', guestCard: 'Guest Card',
    wifiCard: 'WiFi', flightSchedule: 'Flights', mapWidget: 'Map', hotelService: 'Services',
    hotelDeals: 'Promos/Deals', notificationCard: 'Notifications', hotelInfo: 'Hotel Info',
    alarmWidget: 'Alarm', chatWidget: 'Chat', notifWidget: 'Notifications Shortcut',
    displayWidget: 'Settings Shortcut', brandLogo: 'Brand Logo',
};

const DEFAULT_APPS = [
    { id: 'netflix', name: 'Netflix', url: 'com.netflix.ninja', icon: '', subtitle: 'Streaming', brandColor: '#e50914', iconScale: 1, enabled: true, embeddable: false },
    { id: 'youtube', name: 'YouTube', url: 'com.google.android.youtube.tv', icon: '', subtitle: 'Video', brandColor: '#ff0000', iconScale: 1, enabled: true, embeddable: false },
    { id: 'disney', name: 'Disney+', url: 'com.disney.disneyplus', icon: '', subtitle: 'Streaming', brandColor: '#113ccf', iconScale: 1, enabled: true, embeddable: false },
    { id: 'prime', name: 'Prime Video', url: 'com.amazon.amazonvideo.livingroom', icon: '', subtitle: 'Streaming', brandColor: '#00a8e1', iconScale: 1, enabled: true, embeddable: false },
    { id: 'spotify', name: 'Spotify', url: 'com.spotify.tv.android', icon: '', subtitle: 'Music', brandColor: '#1db954', iconScale: 1, enabled: true, embeddable: false },
    { id: 'iptv', name: 'IPTV', url: 'neotiv://iptv', icon: '', subtitle: 'Countries', brandColor: '#0891b2', iconScale: 1, enabled: true, embeddable: false },
];

const mergeSystemApps = (savedApps: any) => {
    if (!Array.isArray(savedApps)) return DEFAULT_APPS;

    const savedById = new Map(savedApps.filter((app: any) => app?.id).map((app: any) => [app.id, app]));
    const mergedDefaults = DEFAULT_APPS.map(defaultApp => ({
        ...defaultApp,
        ...(savedById.get(defaultApp.id) ?? {}),
    }));
    const customApps = savedApps.filter((app: any) => app?.id && !DEFAULT_APPS.some(defaultApp => defaultApp.id === app.id));

    return [...mergedDefaults, ...customApps];
};

const defaultAppLayout = (app: any, index: number, savedLayout: Record<string, any> = {}) => {
    const key = `app-${app.id}`;
    return {
        colStart: 15 + ((index % 5) * 2),
        rowStart: 11 + (Math.floor(index / 5) * 2),
        colSpan: 2,
        rowSpan: 2,
        visible: true,
        bgColor: app.brandColor || '#334155',
        ...(savedLayout?.[key] ?? {}),
    };
};

const COLS = 24;
const ROWS = 14;
const THEME_PRESETS = {
    luxury: {
        label: 'Luxury Gold',
        description: 'Dark frosted glass, gold accents, richer shadows.',
        values: { visualStyle: 'luxury', opacityLight: 0.88, opacityDark: 0.55, focusColor: '#d4af37', focusStyle: 'glow', clockStyle: 'minimal' },
    },
    figma: {
        label: 'Figma Glass',
        description: 'Soft teal glass, white borders, compact Poppins UI.',
        values: { visualStyle: 'figma', opacityLight: 0.94, opacityDark: 0.42, focusColor: '#ffffff', focusStyle: 'outline', clockStyle: 'classic' },
    },
} as const;

const SLIDER_ITEMS = [
    { id: 'clock', label: 'Clocks' },
    { id: 'guest', label: 'Guest' },
    { id: 'wifi', label: 'WiFi' },
    { id: 'flights', label: 'Flights' },
    { id: 'notif', label: 'Notifications' },
    { id: 'deals', label: 'Deals' },
    { id: 'services', label: 'Services' },
    { id: 'map', label: 'Map' },
    { id: 'info', label: 'Hotel Info' },
    { id: 'alarm', label: 'Alarm' },
    { id: 'chat', label: 'Chat' },
    { id: 'settings', label: 'Settings' },
];
const MIN_WIDGET_SPANS: Record<string, { colSpan: number; rowSpan: number }> = {
    analogClocks: { colSpan: 1, rowSpan: 1 },
    flightSchedule: { colSpan: 1, rowSpan: 1 },
    hotelDeals: { colSpan: 1, rowSpan: 1 },
    digitalClock: { colSpan: 1, rowSpan: 1 },
    hotelService: { colSpan: 1, rowSpan: 1 },
    hotelInfo: { colSpan: 1, rowSpan: 1 },
    mapWidget: { colSpan: 1, rowSpan: 1 },
    guestCard: { colSpan: 1, rowSpan: 1 },
    wifiCard: { colSpan: 1, rowSpan: 1 },
    notificationCard: { colSpan: 1, rowSpan: 1 },
};

interface Hotel {
    id: string; name: string; slug: string;
    tv_layout_config: Record<string, any> | null;
    startup_video_url: string | null;
    iptv_enabled: boolean;
}

export default function TvCanvas({ hotel }: { hotel: Hotel }) {
    const initConfig = () => {
        const saved = hotel.tv_layout_config ?? {};
        const savedLayout = { ...(saved.layout ?? {}) };
        delete savedLayout.appGrid;

        const apps = mergeSystemApps(saved.apps);
        const appLayout = apps.reduce((layout: Record<string, any>, app: any, index: number) => {
            const key = `app-${app.id}`;
            layout[key] = defaultAppLayout(app, index, saved.layout ?? {});
            return layout;
        }, {});

        const appSliderItems = apps
            .filter((app: any) => app.enabled !== false && (app.id !== 'iptv' || hotel.iptv_enabled))
            .map((app: any) => `app-${app.id}`);
        const defaultSliderOrder = [...SLIDER_ITEMS.map(item => item.id), ...appSliderItems];
        const savedSlideshow = saved.slideshow ?? {};
        const savedSliderOrder = Array.isArray(savedSlideshow.sliderOrder)
            ? savedSlideshow.sliderOrder.filter((id: string) => defaultSliderOrder.includes(id))
            : defaultSliderOrder;
        const sliderOrder = [
            ...savedSliderOrder,
            ...defaultSliderOrder.filter(id => !savedSliderOrder.includes(id)),
        ];
        const legacyMissingSliderItems = defaultSliderOrder.filter(id => !savedSliderOrder.includes(id));
        const sliderEnabled = Array.isArray(savedSlideshow.sliderEnabled)
            ? [
                ...savedSlideshow.sliderEnabled.filter((id: string) => defaultSliderOrder.includes(id)),
                ...legacyMissingSliderItems,
            ]
            : savedSliderOrder;

        return {
            screenMode: saved.screenMode ?? 'grid',
            theme: {
                visualStyle: 'luxury',
                opacityLight: 0.88, opacityDark: 0.55,
                marqueeText: 'Welcome to our hotel. Enjoy your stay!',
                marqueeSpeed: 20, focusColor: '#14b8a6',
                focusStyle: 'outline', clockStyle: 'minimal',
                showLogo: false, logoUrl: '', logoPosition: 'top-left',
                logoSize: 110, widgetSurface: '#1e293b',
                widgetGradientFrom: '#111827', widgetGradientTo: '#334155',
                widgetGradientEnabled: false, widgetBlur: 18,
                ...(saved.theme ?? {}),
            },
            apps,
            layout: { ...DEFAULT_LAYOUT, ...appLayout, ...savedLayout },
            slideshow: {
                autoAdvanceSeconds: 10, widgetDismissSeconds: 10,
                transition: 'crossfade', showFloatingClock: true,
                sliderPlacement: 'bottom', sliderOrientation: 'horizontal',
                ...savedSlideshow,
                sliderOrder,
                sliderEnabled,
            },
        };
    };

    const [config, setConfig] = useState(initConfig);
    const [saving, setSaving] = useState(false);
    const [uploadingIcon, setUploadingIcon] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [activeAppIndex, setActiveAppIndex] = useState<number | null>(null);
    const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
    const [localToast, setLocalToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'canvas' | 'apps' | 'theme' | 'slideshow'>('canvas');
    const [dragSliderId, setDragSliderId] = useState<string | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const iconInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    const notify = (type: 'success' | 'error', message: string) => {
        setLocalToast({ type, message });
        window.setTimeout(() => setLocalToast(null), 3600);
    };

    const minSpanFor = (key: string) => {
        if (key.startsWith('app-')) return { colSpan: 1, rowSpan: 1 };
        return MIN_WIDGET_SPANS[key] ?? { colSpan: 1, rowSpan: 1 };
    };

    const widgetLabel = (key: string) => {
        if (key.startsWith('app-')) {
            const id = key.replace('app-', '');
            return config.apps?.find((app: any) => app.id === id)?.name || key;
        }
        return WIDGET_LABELS[key] ?? key;
    };

    const updateLayout = (key: string, patch: Record<string, any>) =>
        setConfig(c => ({ ...c, layout: { ...c.layout, [key]: { ...c.layout[key], ...patch } } }));

    const addWidgetToCanvas = (key: string) => {
        updateLayout(key, { visible: true });
        notify('success', `${widgetLabel(key)} is visible on the canvas.`);
    };

    const updateApp = (index: number, patch: Record<string, any>) => {
        setConfig(c => {
            const apps = [...(c.apps ?? [])];
            apps[index] = { ...apps[index], ...patch };
            const layoutKey = apps[index]?.id ? `app-${apps[index].id}` : null;
            const layout = layoutKey && patch.brandColor
                ? { ...c.layout, [layoutKey]: { ...c.layout[layoutKey], bgColor: patch.brandColor } }
                : c.layout;
            return { ...c, apps, layout };
        });
    };

    const addApp = () => {
        const newId = `custom-${Date.now()}`;
        const newApp = {
            id: newId,
            name: 'Custom App',
            subtitle: 'STB App',
            url: '',
            icon: '',
            brandColor: '#334155',
            iconScale: 1,
            enabled: true,
            embeddable: false,
        };
        setConfig(c => ({
            ...c,
            apps: [...(c.apps ?? []), newApp],
            layout: {
                ...c.layout,
                [`app-${newId}`]: defaultAppLayout(newApp, c.apps?.length ?? 0, c.layout),
            },
        }));
        setExpandedAppId(newId);
        notify('success', 'Custom app added to the canvas.');
    };

    const removeApp = (index: number) => {
        if (!confirm('Remove this app from the TV launcher?')) return;
        setConfig(c => {
            const removedAppId = c.apps?.[index]?.id;
            const apps = [...(c.apps ?? [])];
            apps.splice(index, 1);
            const layout = { ...c.layout };
            if (removedAppId) delete layout[`app-${removedAppId}`];
            return { ...c, apps, layout };
        });
    };

    const moveApp = (index: number, direction: -1 | 1) => {
        setConfig(c => {
            const apps = [...(c.apps ?? [])];
            const nextIndex = index + direction;
            if (index < 0 || nextIndex < 0 || nextIndex >= apps.length) return c;
            [apps[index], apps[nextIndex]] = [apps[nextIndex], apps[index]];
            return { ...c, apps };
        });
    };

    const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const targetIdx = activeAppIndex;
        if (iconInputRef.current) iconInputRef.current.value = '';
        if (!file || targetIdx === null || targetIdx >= (config.apps?.length ?? 0)) {
            setActiveAppIndex(null);
            return;
        }

        setUploadingIcon(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload/tv-app-icon', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
            updateApp(targetIdx, { icon: `${data.url}?t=${Date.now()}` });
            notify('success', 'App icon uploaded.');
        } catch (error: any) {
            notify('error', error?.message || 'Upload failed');
        } finally {
            setUploadingIcon(false);
            setActiveAppIndex(null);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (logoInputRef.current) logoInputRef.current.value = '';
        if (!file) return;

        setUploadingLogo(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload/tv-brand-logo', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
            setConfig(c => ({
                ...c,
                theme: {
                    ...c.theme,
                    showLogo: true,
                    logoUrl: `${data.url}?t=${Date.now()}`,
                },
                layout: {
                    ...c.layout,
                    brandLogo: { ...(c.layout.brandLogo ?? DEFAULT_LAYOUT.brandLogo), visible: true },
                },
            }));
            notify('success', 'Brand logo uploaded and added to the canvas.');
        } catch (error: any) {
            notify('error', error?.message || 'Upload failed');
        } finally {
            setUploadingLogo(false);
        }
    };

    const startDrag = (e: React.PointerEvent, key: string) => {
        if ((e.target as HTMLElement).classList.contains('rh')) return;
        e.preventDefault();
        if (!gridRef.current) return;
        const ix = e.clientX, iy = e.clientY;
        const w = config.layout[key];
        const ic = w.colStart ?? 1, ir = w.rowStart ?? 1, sc = w.colSpan ?? 1, sr = w.rowSpan ?? 1;
        const cw = gridRef.current.offsetWidth / COLS, ch = gridRef.current.offsetHeight / ROWS;
        const onMove = (ev: PointerEvent) => {
            let nc = Math.max(1, ic + Math.round((ev.clientX - ix) / cw));
            let nr = Math.max(1, ir + Math.round((ev.clientY - iy) / ch));
            if (nc + sc - 1 > COLS) nc = COLS - sc + 1;
            if (nr + sr - 1 > ROWS) nr = ROWS - sr + 1;
            updateLayout(key, { colStart: nc, rowStart: nr });
        };
        const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const startResize = (e: React.PointerEvent, key: string) => {
        e.preventDefault(); e.stopPropagation();
        if (!gridRef.current) return;
        const ix = e.clientX, iy = e.clientY;
        const w = config.layout[key];
        const isx = w.colSpan ?? 1, isy = w.rowSpan ?? 1, cs = w.colStart ?? 1, rs = w.rowStart ?? 1;
        const min = minSpanFor(key);
        const cw = gridRef.current.offsetWidth / COLS, ch = gridRef.current.offsetHeight / ROWS;
        const onMove = (ev: PointerEvent) => {
            let nsx = Math.max(min.colSpan, isx + Math.round((ev.clientX - ix) / cw));
            let nsy = Math.max(min.rowSpan, isy + Math.round((ev.clientY - iy) / ch));
            if (cs + nsx - 1 > COLS) nsx = COLS - cs + 1;
            if (rs + nsy - 1 > ROWS) nsy = ROWS - rs + 1;
            updateLayout(key, { colSpan: nsx, rowSpan: nsy });
        };
        const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const save = () => {
        setSaving(true);
        router.put(`/admin/hotels/${hotel.id}/tv-canvas`, { tv_layout_config: config }, {
            onSuccess: () => { setSaving(false); notify('success', 'TV canvas saved. TVs will pick up the change on the next poll.'); },
            onError: () => { setSaving(false); notify('error', 'TV canvas could not be saved. Check the required fields.'); },
            preserveScroll: true,
        });
    };

    const reset = () => {
        if (confirm('Reset to default layout?'))
            setConfig(c => ({ ...c, layout: { ...DEFAULT_LAYOUT } }));
    };

    const tabs = [
        { key: 'canvas', label: 'Layout Canvas', icon: Monitor },
        { key: 'apps', label: 'Apps', icon: Power },
        { key: 'theme', label: 'Theme', icon: Palette },
        { key: 'slideshow', label: 'Slideshow', icon: Play },
    ] as const;

    const inp = 'w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400';
    const appSliderItems = (config.apps ?? [])
        .filter((app: any) => app.enabled !== false && (app.id !== 'iptv' || hotel.iptv_enabled))
        .map((app: any) => ({
            id: `app-${app.id}`,
            label: app.name || 'App',
            app,
        }));
    const allSliderItems = [...SLIDER_ITEMS, ...appSliderItems];
    const defaultSliderOrder = allSliderItems.map(item => item.id);
    const sliderOrder = Array.isArray(config.slideshow.sliderOrder) && config.slideshow.sliderOrder.length
        ? [
            ...config.slideshow.sliderOrder.filter((id: string) => defaultSliderOrder.includes(id)),
            ...defaultSliderOrder.filter(id => !config.slideshow.sliderOrder.includes(id)),
        ]
        : defaultSliderOrder;
    const sliderEnabled = Array.isArray(config.slideshow.sliderEnabled)
        ? config.slideshow.sliderEnabled.filter((id: string) => defaultSliderOrder.includes(id))
        : sliderOrder;
    const orderedSliderItems = sliderOrder
        .map((id: string) => allSliderItems.find(item => item.id === id))
        .filter(Boolean) as typeof SLIDER_ITEMS;
    const visibleSliderItems = orderedSliderItems.filter(item => sliderEnabled.includes(item.id));

    const moveSliderItem = (id: string, direction: -1 | 1) => {
        const order = [...sliderOrder];
        const index = order.indexOf(id);
        const next = index + direction;
        if (index < 0 || next < 0 || next >= order.length) return;
        [order[index], order[next]] = [order[next], order[index]];
        setConfig(c => ({ ...c, slideshow: { ...c.slideshow, sliderOrder: order } }));
    };

    const moveSliderItemTo = (id: string, targetId: string) => {
        const order = [...sliderOrder];
        const from = order.indexOf(id);
        const to = order.indexOf(targetId);
        if (from < 0 || to < 0 || from === to) return;
        const [item] = order.splice(from, 1);
        order.splice(to, 0, item);
        setConfig(c => ({ ...c, slideshow: { ...c.slideshow, sliderOrder: order } }));
    };

    const toggleSliderItem = (id: string, enabled: boolean) => {
        const next = enabled
            ? sliderOrder.filter((item: string) => item === id || sliderEnabled.includes(item))
            : sliderEnabled.filter((item: string) => item !== id);
        setConfig(c => ({ ...c, slideshow: { ...c.slideshow, sliderEnabled: next } }));
    };

    const renderInventoryPanel = () => {
        const widgets = Object.keys(WIDGET_LABELS);
        return (
            <aside className="hidden xl:flex fixed right-0 top-16 bottom-0 z-30 w-[340px] 2xl:w-[360px] flex-col overflow-hidden border-l border-slate-200 bg-white shadow-[-12px_0_28px_rgba(15,23,42,0.06)]">
                <div className="p-5 border-b border-slate-100 bg-white">
                    <h3 className="font-medium text-slate-800">Canvas Library</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Add, hide, and select every widget or app from one place.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div>
                        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 px-1 mb-2">Widgets</p>
                        <div className="space-y-2">
                            {widgets.map(key => {
	                                    const layout = config.layout[key] ?? {};
	                                return (
	                                    <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
	                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-slate-700">{widgetLabel(key)}</p>
                                                <p className="text-[11px] text-slate-400">{layout.visible === false ? 'Hidden' : `${layout.colSpan ?? 1}×${layout.rowSpan ?? 1}`}</p>
                                            </div>
                                            <button type="button"
                                                onClick={() => updateLayout(key, { visible: layout.visible === false })}
                                                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${layout.visible === false ? 'bg-slate-200 text-slate-600' : 'bg-teal-50 text-teal-700'}`}>
	                                                {layout.visible === false ? 'Add' : 'Shown'}
	                                            </button>
	                                        </div>
	                                        <div className="mt-3 flex items-center gap-2">
	                                            <span className="w-16 text-[10px] font-medium uppercase tracking-wide text-slate-400">Icon</span>
	                                            <input
	                                                type="range"
	                                                min={0.6}
	                                                max={1.8}
	                                                step={0.05}
	                                                value={layout.iconScale ?? 1}
	                                                onChange={e => updateLayout(key, { iconScale: parseFloat(e.target.value) })}
	                                                className="min-w-0 flex-1 accent-teal-500"
	                                            />
	                                            <span className="w-9 text-right font-mono text-[10px] text-slate-500">{Math.round((layout.iconScale ?? 1) * 100)}%</span>
	                                        </div>
	                                    </div>
	                                );
	                            })}
                        </div>
                    </div>
                    <div>
                        <div className="mb-2 flex items-center justify-between px-1">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Apps</p>
                            <button type="button" onClick={addApp} className="text-xs font-medium text-teal-600 hover:text-teal-700">Add app</button>
                        </div>
                        <div className="space-y-2">
                            {(config.apps ?? []).map((app: any, index: number) => {
                                const key = `app-${app.id}`;
                                const layout = config.layout[key] ?? {};
                                return (
                                    <div key={app.id || index} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden p-1.5 text-xs font-semibold text-white">
                                                {app.icon ? <img src={app.icon} alt="" className="h-full w-full object-contain" /> : (app.name || 'App').slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-700">{app.name || 'App'}</p>
                                                <p className="truncate text-[11px] text-slate-400">{app.enabled === false ? 'Disabled' : app.subtitle || 'App tile'}</p>
                                            </div>
                                            <button type="button"
                                                onClick={() => updateLayout(key, { visible: layout.visible === false })}
                                                className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${layout.visible === false ? 'bg-slate-200 text-slate-600' : 'bg-teal-50 text-teal-700'}`}>
                                                {layout.visible === false ? 'Add' : 'Shown'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </aside>
        );
    };

    const renderSlideshowPreview = () => {
        const vertical = config.slideshow.sliderOrientation === 'vertical';
        const center = config.slideshow.sliderPlacement === 'center';
        return (
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-950 shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-950 to-teal-950" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_70%_80%,rgba(20,184,166,0.2),transparent_30%)]" />
                <div className="absolute left-5 top-5 rounded-2xl bg-black/35 px-4 py-3 text-white backdrop-blur-md">
                    <p className="text-xs uppercase text-white/50">Preview</p>
                    <p className="text-lg font-medium">{config.screenMode === 'slideshow' ? 'Slideshow mode' : 'Grid mode selected'}</p>
                </div>
                <div className={`absolute flex ${vertical ? 'flex-col' : 'flex-row'} items-center gap-2 ${
                    center ? 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' :
                    config.slideshow.sliderPlacement === 'top' ? 'left-1/2 top-6 -translate-x-1/2' :
                    config.slideshow.sliderPlacement === 'left' ? 'left-6 top-1/2 -translate-y-1/2' :
                    config.slideshow.sliderPlacement === 'right' ? 'right-6 top-1/2 -translate-y-1/2' :
                    'bottom-6 left-1/2 -translate-x-1/2'
                }`}>
                    {visibleSliderItems.slice(0, 7).map((item, index) => (
                        <div key={item.id} className={`${index === 0 ? 'h-16 w-16 border-[#d4af37] bg-[#d4af37]/35' : 'h-11 w-11 border-white/20 bg-white/10'} flex items-center justify-center rounded-2xl border text-[10px] font-medium text-white backdrop-blur-md`}>
                            {item.label.slice(0, 2)}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <StaffLayout header="TV Dashboard Canvas" fullBleed>
            <Head title={`TV Canvas — ${hotel.name}`} />
            {localToast && (
                <div className={`fixed right-5 top-20 z-[110] flex max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl ${
                    localToast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'
                }`}>
                    {localToast.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
                    <p className="text-sm font-medium leading-relaxed">{localToast.message}</p>
                </div>
            )}
            {renderInventoryPanel()}
            <div className="min-h-full p-6 lg:p-8 xl:pr-[380px] 2xl:pr-[400px] flex flex-col gap-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={`/admin/hotels/${hotel.id}`} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors">
                            <ArrowLeft size={16} /> {hotel.name}
                        </Link>
                        <span className="text-slate-300">/</span>
                        <span className="text-slate-800 font-medium">TV Dashboard Canvas</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors">
                            <RotateCcw size={15} /> Reset
                        </button>
                        <Link href={`/d/${hotel.slug}/preview`} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors">
                            <Eye size={15} /> Preview TV
                        </Link>
                        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50">
                            <Save size={15} /> {saving ? 'Saving…' : 'Save Config'}
                        </button>
                    </div>
                </div>

                {/* Screen Mode Toggle */}
                <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <span className="text-sm font-medium text-slate-600">Screen Mode:</span>
                    {(['grid', 'slideshow'] as const).map(m => (
                        <button key={m} onClick={() => setConfig(c => ({ ...c, screenMode: m }))}
                            className={`px-5 py-2 rounded-xl text-sm font-medium transition-colors ${config.screenMode === m ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            {m === 'grid' ? 'Grid Mode' : 'Slideshow Mode'}
                        </button>
                    ))}
                    <span className="ml-auto text-xs text-slate-400">24×14 grid • matches actual TV layout • drag to move • drag corner to resize</span>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === t.key ? 'bg-[#0B1120] text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            <t.icon size={15} /> {t.label}
                        </button>
                    ))}
                </div>

                {/* ── CANVAS TAB ── */}
                {activeTab === 'canvas' && (
                    <div className="flex gap-5">
                        <div className="flex-1 bg-[#0B1120] rounded-2xl p-5 shadow-xl">
                            <p className="text-slate-400 text-xs mb-3">Drag widgets to move · drag bottom-right corner to resize · 24×14 grid matches real TV</p>
                            <div ref={gridRef}
                                className="w-full rounded-xl"
                                style={{
                                    aspectRatio: '16/9',
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                                    gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                                    gap: '2px',
                                    backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)`,
                                    backgroundSize: `calc(100%/${COLS}) calc(100%/${ROWS})`,
                                }}>
                                {Object.entries(config.layout).map(([key, w]) => {
                                    if (!w.visible) return null;
                                    const app = key.startsWith('app-')
                                        ? config.apps?.find((item: any) => `app-${item.id}` === key)
                                        : null;
                                    return (
                                        <div key={key}
                                            onPointerDown={e => startDrag(e, key)}
                                            className={`rounded-md border border-white/20 relative group select-none touch-none cursor-grab active:cursor-grabbing flex flex-col items-center justify-center overflow-hidden hover:border-teal-400 transition-colors ${app?.enabled === false ? 'grayscale opacity-45' : ''}`}
                                            style={{
                                                gridColumn: `${w.colStart ?? 1} / span ${w.colSpan ?? 1}`,
                                                gridRow: `${w.rowStart ?? 1} / span ${w.rowSpan ?? 1}`,
                                                backgroundColor: w.bgColor ?? '#1e293b',
                                                opacity: w.bgOpacity ?? 0.9,
                                            }}>
                                            <span className="text-[9px] font-medium text-white/80 text-center px-1 leading-tight pointer-events-none">
                                                {widgetLabel(key)}
                                            </span>
                                            {app?.enabled === false && <span className="text-[7px] text-white/50 pointer-events-none">Off</span>}
                                            <span className="text-[7px] text-white/30 pointer-events-none">{w.colSpan}×{w.rowSpan}</span>
                                            <div className="rh absolute bottom-0 right-0 w-3 h-3 opacity-0 group-hover:opacity-100 cursor-se-resize flex items-end justify-end transition-opacity"
                                                onPointerDown={e => startResize(e, key)}>
                                                <div className="rh w-2 h-2 bg-teal-400 rounded-sm pointer-events-none" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Widget Panel */}
                        <div className="hidden">
                            <div className="p-4 border-b border-slate-100 bg-slate-50">
                                <h3 className="font-medium text-slate-800">Widget Visibility</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Toggle, tint, and adjust opacity</p>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                                {Object.entries(config.layout).map(([key, w]) => (
                                    <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                                                <input type="checkbox" checked={w.visible !== false}
                                                    onChange={e => updateLayout(key, { visible: e.target.checked })}
                                                    className="w-4 h-4 rounded accent-teal-500 shrink-0" />
                                                <span className="text-sm font-semibold text-slate-700 truncate">{widgetLabel(key)}</span>
                                            </label>
                                            <input type="color" value={w.bgColor ?? '#1e293b'}
                                                onChange={e => updateLayout(key, { bgColor: e.target.value })}
                                                title="Widget color"
                                                className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0 bg-transparent shrink-0" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400 w-12">Opacity</span>
                                            <input type="range" min={0} max={1} step={0.05}
                                                value={w.bgOpacity ?? 0.9}
                                                onChange={e => updateLayout(key, { bgOpacity: parseFloat(e.target.value) })}
                                                className="flex-1 accent-teal-500 h-1" />
                                            <span className="text-[10px] text-slate-500 w-8 text-right font-mono">
                                                {Math.round((w.bgOpacity ?? 0.9) * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── APPS TAB ── */}
                {activeTab === 'apps' && (
                    <div className="grid grid-cols-[1fr_340px] gap-5">
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5">
                                <div>
                                    <h3 className="font-medium text-slate-800">STB App Launcher</h3>
                                    <p className="text-sm text-slate-500 mt-1">Use Android TV package names, intent URLs, or web URLs. Enabled apps appear on the canvas and slideshow carousel.</p>
                                </div>
                                <button type="button" onClick={addApp} className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">
                                    <Plus size={15} /> Add App
                                </button>
                            </div>

                            <input
                                ref={iconInputRef}
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                                onChange={handleIconUpload}
                            />

                            <div className="divide-y divide-slate-100">
                                {(config.apps ?? []).map((app: any, index: number) => {
                                    const layoutKey = `app-${app.id}`;
                                    const layout = config.layout?.[layoutKey] ?? {};
                                    const expanded = expandedAppId === app.id;
                                    return (
                                        <div key={app.id || index} className="p-4">
                                            <button type="button"
                                                onClick={() => setExpandedAppId(expanded ? null : app.id)}
                                                className="flex w-full items-center gap-4 text-left">
                                                <div className="w-14 h-14 rounded-2xl border border-slate-200 bg-slate-900 flex items-center justify-center overflow-hidden p-2 text-white font-semibold shadow-sm">
                                                    {app.icon ? (
                                                        <img src={app.icon} alt="" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <span className="text-lg">{(app.name || 'A').slice(0, 2).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-slate-800">{app.name || 'Custom App'}</p>
                                                    <p className="truncate text-xs text-slate-500">{app.url || 'No package or URL yet'}</p>
                                                </div>
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${app.enabled === false ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>
                                                    {app.enabled === false ? 'Off' : 'On'}
                                                </span>
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${layout.visible === false ? 'bg-slate-100 text-slate-500' : 'bg-teal-50 text-teal-700'}`}>
                                                    {layout.visible === false ? 'Hidden' : 'Canvas'}
                                                </span>
                                                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                                    <button type="button" onClick={() => moveApp(index, -1)} disabled={index === 0}
                                                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-500 hover:bg-white disabled:opacity-35">
                                                        Up
                                                    </button>
                                                    <button type="button" onClick={() => moveApp(index, 1)} disabled={index === (config.apps?.length ?? 1) - 1}
                                                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-500 hover:bg-white disabled:opacity-35">
                                                        Down
                                                    </button>
                                                </div>
                                                <ChevronDown size={18} className={`text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                                            </button>

                                            {expanded && (
                                            <div className="mt-4 grid grid-cols-[72px_1fr_148px] gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-14 h-14 rounded-2xl border border-slate-200 bg-slate-900 flex items-center justify-center overflow-hidden p-2 text-white font-semibold shadow-sm">
                                                    {app.icon ? (
                                                        <img src={app.icon} alt="" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <span className="text-lg">{(app.name || 'A').slice(0, 2).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    disabled={uploadingIcon}
                                                    onClick={() => { setActiveAppIndex(index); iconInputRef.current?.click(); }}
                                                    className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-teal-600 disabled:opacity-50"
                                                >
                                                    <Upload size={11} /> Icon
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">App Name</label>
                                                    <input value={app.name ?? ''} onChange={e => updateApp(index, { name: e.target.value })}
                                                        placeholder="Netflix"
                                                        className={inp} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Subtitle</label>
                                                    <input value={app.subtitle ?? ''} onChange={e => updateApp(index, { subtitle: e.target.value })}
                                                        placeholder="Streaming"
                                                        className={inp} />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Package, Intent, or URL</label>
                                                    <div className="relative">
                                                        <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input value={app.url ?? ''} onChange={e => updateApp(index, { url: e.target.value })}
                                                            placeholder="com.netflix.ninja, intent://..., or https://..."
                                                            className={inp + ' pl-9 font-mono'} />
                                                    </div>
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Icon URL</label>
                                                    <div className="relative">
                                                        <ImageIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        <input value={app.icon ?? ''} onChange={e => updateApp(index, { icon: e.target.value })}
                                                            placeholder="https://.../logo.svg or upload an icon"
                                                            className={inp + ' pl-9'} />
                                                    </div>
                                                </div>
                                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                                    <input type="checkbox" checked={app.embeddable === true} onChange={e => updateApp(index, { embeddable: e.target.checked })}
                                                        className="w-4 h-4 rounded accent-teal-500" />
                                                    Open web URL in iframe
                                                </label>
                                                <p className="text-xs text-slate-400">Tile color follows the global theme. Use Canvas → Appearance for per-widget overrides.</p>
                                                <div className="col-span-2 flex items-center gap-3">
                                                    <span className="text-xs text-slate-500 w-20">Icon scale</span>
                                                    <input type="range" min={0.5} max={2} step={0.1} value={app.iconScale ?? 1}
                                                        onChange={e => updateApp(index, { iconScale: parseFloat(e.target.value) })}
                                                        className="flex-1 accent-teal-500" />
                                                    <span className="text-xs font-mono text-slate-500 w-10 text-right">{Math.round((app.iconScale ?? 1) * 100)}%</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col justify-between gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => updateApp(index, { enabled: app.enabled === false })}
                                                    className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                                                        app.enabled === false
                                                            ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                    }`}
                                                >
                                                    <Power size={14} /> {app.enabled === false ? 'Off' : 'On'}
                                                </button>
                                                <label className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-600">
                                                    <input type="checkbox" checked={layout.visible !== false}
                                                        onChange={e => updateLayout(layoutKey, { visible: e.target.checked })}
                                                        className="w-4 h-4 rounded accent-teal-500" />
                                                    Canvas visible
                                                </label>
                                                <button type="button" onClick={() => removeApp(index)}
                                                    className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            </div>
                                            </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-2xl p-5 text-slate-300 shadow-sm">
                            <h3 className="font-medium text-white">Origin STB Launch Rules</h3>
                            <div className="mt-4 space-y-4 text-sm leading-relaxed">
                                <p>Native Android TV apps should use the package name. The TV dashboard passes that package to the STB bridge when available.</p>
                                <div className="rounded-xl bg-white/5 p-3 font-mono text-xs text-slate-400">
                                    com.netflix.ninja<br />
                                    com.google.android.youtube.tv<br />
                                    com.disney.disneyplus
                                </div>
                                <p>Use an `intent://` deep link when the app needs a specific route. Use `https://` only for web apps; enable iframe only when the provider allows embedding.</p>
                                <p className="text-slate-500">Disabled apps stay saved for later but are hidden from the TV grid and slideshow launcher.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── THEME TAB ── */}
                {activeTab === 'theme' && (
                    <div className="grid grid-cols-2 gap-5">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                            <h3 className="font-medium text-slate-800">Global Appearance</h3>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Visual Theme Preset</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setConfig(c => ({ ...c, theme: { ...c.theme, ...preset.values } }))}
                                            className={`text-left rounded-2xl border p-4 transition-colors ${
                                                (config.theme.visualStyle ?? 'luxury') === key
                                                    ? 'border-teal-500 bg-teal-50 text-teal-900'
                                                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                                            }`}
                                        >
                                            <span className="block text-sm font-semibold">{preset.label}</span>
                                            <span className="mt-1 block text-xs leading-relaxed">{preset.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                    Light Widget Opacity: {config.theme.opacityLight}
                                </label>
                                <input type="range" min={0} max={1} step={0.01} value={config.theme.opacityLight}
                                    onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, opacityLight: parseFloat(e.target.value) } }))}
                                    className="w-full accent-teal-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                    Dark Widget Opacity: {config.theme.opacityDark}
                                </label>
                                <input type="range" min={0} max={1} step={0.01} value={config.theme.opacityDark}
                                    onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, opacityDark: parseFloat(e.target.value) } }))}
                                    className="w-full accent-teal-500" />
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">Widget Surface</p>
                                        <p className="text-xs text-slate-500">One global surface for app tiles and widgets.</p>
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-slate-600">
                                        <input type="checkbox" checked={config.theme.widgetGradientEnabled === true}
                                            onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, widgetGradientEnabled: e.target.checked } }))}
                                            className="h-4 w-4 rounded accent-teal-500" />
                                        Gradient
                                    </label>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Base</label>
                                        <input type="color" value={config.theme.widgetSurface ?? '#1e293b'}
                                            onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, widgetSurface: e.target.value } }))}
                                            className="h-10 w-full rounded-xl border-0 p-0" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">From</label>
                                        <input type="color" value={config.theme.widgetGradientFrom ?? '#111827'}
                                            onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, widgetGradientFrom: e.target.value } }))}
                                            className="h-10 w-full rounded-xl border-0 p-0" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">To</label>
                                        <input type="color" value={config.theme.widgetGradientTo ?? '#334155'}
                                            onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, widgetGradientTo: e.target.value } }))}
                                            className="h-10 w-full rounded-xl border-0 p-0" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Blur intensity: {config.theme.widgetBlur ?? 18}px</label>
                                    <input type="range" min={0} max={40} step={1} value={config.theme.widgetBlur ?? 18}
                                        onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, widgetBlur: parseInt(e.target.value) } }))}
                                        className="w-full accent-teal-500" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Marquee Running Text</label>
                                <textarea rows={2} value={config.theme.marqueeText}
                                    onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, marqueeText: e.target.value } }))}
                                    className={inp + ' resize-none'} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                    Marquee Speed: {config.theme.marqueeSpeed}s
                                </label>
                                <input type="range" min={10} max={120} step={1} value={config.theme.marqueeSpeed}
                                    onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, marqueeSpeed: parseInt(e.target.value) } }))}
                                    className="w-full accent-teal-500" />
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                            <input
                                ref={logoInputRef}
                                type="file"
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                                onChange={handleLogoUpload}
                            />
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <h3 className="font-medium text-slate-800">TV Brand Logo</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">Optional overlay shown above the dashboard and slideshow.</p>
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-slate-700">
                                        <input type="checkbox" checked={config.theme.showLogo === true}
                                            onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, showLogo: e.target.checked } }))}
                                            className="w-4 h-4 rounded accent-teal-500" />
                                        Show
                                    </label>
                                </div>
                                <div className="mt-4 flex items-start gap-4">
                                    <div className="w-28 h-20 rounded-2xl bg-slate-900 border border-slate-200 flex items-center justify-center overflow-hidden p-3">
                                        {config.theme.logoUrl ? (
                                            <img src={config.theme.logoUrl} alt="" className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <ImageIcon size={26} className="text-slate-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <button type="button" disabled={uploadingLogo}
                                            onClick={() => logoInputRef.current?.click()}
                                            className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-medium text-slate-700 disabled:opacity-50">
                                            <Upload size={14} /> {uploadingLogo ? 'Uploading…' : 'Upload Logo'}
                                        </button>
                                        <input value={config.theme.logoUrl ?? ''}
                                            onChange={e => setConfig(c => ({
                                                ...c,
                                                theme: { ...c.theme, logoUrl: e.target.value, showLogo: !!e.target.value || c.theme.showLogo },
                                                layout: {
                                                    ...c.layout,
                                                    brandLogo: { ...(c.layout.brandLogo ?? DEFAULT_LAYOUT.brandLogo), visible: !!e.target.value || c.layout.brandLogo?.visible === true },
                                                },
                                            }))}
                                            placeholder="Or paste logo URL"
                                            className={inp} />
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Position</label>
                                        <select value={config.theme.logoPosition ?? 'top-left'}
                                            onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, logoPosition: e.target.value } }))}
                                            className={inp}>
                                            <option value="top-left">Top left</option>
                                            <option value="top-center">Top center</option>
                                            <option value="top-right">Top right</option>
                                            <option value="bottom-left">Bottom left</option>
                                            <option value="bottom-right">Bottom right</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Size: {config.theme.logoSize ?? 110}px</label>
                                        <input type="range" min={48} max={260} step={4} value={config.theme.logoSize ?? 110}
                                            onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, logoSize: parseInt(e.target.value) } }))}
                                            className="w-full accent-teal-500" />
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-medium text-slate-800">Focus &amp; Interaction</h3>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Focus Color</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={config.theme.focusColor}
                                        onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, focusColor: e.target.value } }))}
                                        className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0" />
                                    <span className="font-mono text-sm text-slate-600">{config.theme.focusColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Focus Style (D-pad)</label>
                                <select value={config.theme.focusStyle}
                                    onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, focusStyle: e.target.value } }))}
                                    className={inp}>
                                    {['outline', 'glow', 'scale', 'glow-scale', 'ring-pulse', 'underline', 'inset'].map(s => (
                                        <option key={s} value={s}>{s.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Clock Style</label>
                                <select value={config.theme.clockStyle}
                                    onChange={e => setConfig(c => ({ ...c, theme: { ...c.theme, clockStyle: e.target.value } }))}
                                    className={inp}>
                                    <option value="minimal">Minimal</option>
                                    <option value="classic">Classic</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── SLIDESHOW TAB ── */}
                {activeTab === 'slideshow' && (
                    <div className="grid grid-cols-2 gap-5">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                            <div>
                                <h3 className="font-medium text-slate-800">Slideshow Settings</h3>
                                <p className="text-sm text-slate-500 mt-1">Active when Screen Mode is set to <strong>Slideshow</strong>. In slideshow mode, the TV shows a rotating background with widgets appearing one at a time when the guest presses a button.</p>
                            </div>

                            <div className={`p-3 rounded-xl border-2 text-sm font-medium ${config.screenMode === 'slideshow' ? 'bg-teal-50 border-teal-400 text-teal-800' : 'bg-amber-50 border-amber-300 text-amber-700'}`}>
                                {config.screenMode === 'slideshow'
                                    ? 'Slideshow mode is active — these settings will apply on save.'
                                    : 'Screen mode is currently set to Grid. Switch to Slideshow mode above to activate.'}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                    Background Auto-Advance: {config.slideshow.autoAdvanceSeconds}s
                                </label>
                                <input type="range" min={5} max={60} step={1} value={config.slideshow.autoAdvanceSeconds}
                                    onChange={e => setConfig(c => ({ ...c, slideshow: { ...c.slideshow, autoAdvanceSeconds: parseInt(e.target.value) } }))}
                                    className="w-full accent-teal-500" />
                                <p className="text-xs text-slate-400 mt-1">How long each background image is displayed before auto-advancing</p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                    Widget Overlay Dismiss: {config.slideshow.widgetDismissSeconds}s
                                </label>
                                <input type="range" min={3} max={30} step={1} value={config.slideshow.widgetDismissSeconds}
                                    onChange={e => setConfig(c => ({ ...c, slideshow: { ...c.slideshow, widgetDismissSeconds: parseInt(e.target.value) } }))}
                                    className="w-full accent-teal-500" />
                                <p className="text-xs text-slate-400 mt-1">How long a widget stays visible after the guest opens it</p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Transition Style</label>
                                <select value={config.slideshow.transition}
                                    onChange={e => setConfig(c => ({ ...c, slideshow: { ...c.slideshow, transition: e.target.value } }))}
                                    className={inp}>
                                    <option value="crossfade">Crossfade</option>
                                    <option value="slide">Slide</option>
                                    <option value="zoom">Zoom</option>
                                    <option value="kenburns">Ken Burns</option>
                                    <option value="wipe">Soft Wipe</option>
                                    <option value="fade-through">Fade Through</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Slider Placement</label>
                                    <select value={config.slideshow.sliderPlacement ?? 'bottom'}
                                        onChange={e => setConfig(c => ({ ...c, slideshow: { ...c.slideshow, sliderPlacement: e.target.value } }))}
                                        className={inp}>
                                        <option value="bottom">Bottom</option>
                                        <option value="center">Center</option>
                                        <option value="top">Top</option>
                                        <option value="left">Left</option>
                                        <option value="right">Right</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Slider Direction</label>
                                    <select value={config.slideshow.sliderOrientation ?? 'horizontal'}
                                        onChange={e => setConfig(c => ({ ...c, slideshow: { ...c.slideshow, sliderOrientation: e.target.value } }))}
                                        className={inp}>
                                        <option value="horizontal">Horizontal</option>
                                        <option value="vertical">Vertical</option>
                                    </select>
                                </div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <input type="checkbox" checked={config.slideshow.showFloatingClock !== false}
                                    onChange={e => setConfig(c => ({ ...c, slideshow: { ...c.slideshow, showFloatingClock: e.target.checked } }))}
                                    className="w-5 h-5 rounded accent-teal-500" />
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Show floating clock overlay</p>
                                    <p className="text-xs text-slate-500">Display time and date over the background image</p>
                                </div>
                            </label>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                            <div>
                                <h3 className="font-medium text-slate-800">Slideshow Preview</h3>
                                <p className="text-sm text-slate-500 mt-1">Shows placement, direction, and the first visible items.</p>
                            </div>
                            {renderSlideshowPreview()}
                            <div>
                                <h3 className="font-medium text-slate-800">Slider Order</h3>
                                <p className="text-sm text-slate-500 mt-1">Only checked items appear in the TV slideshow carousel.</p>
                            </div>
                            <div className="space-y-2">
                                {orderedSliderItems.map(item => {
                                    const enabled = sliderEnabled.includes(item.id);
                                    const position = sliderOrder.indexOf(item.id);
                                    return (
                                        <div key={item.id}
                                            draggable
                                            onDragStart={() => setDragSliderId(item.id)}
                                            onDragOver={e => e.preventDefault()}
                                            onDrop={e => {
                                                e.preventDefault();
                                                if (dragSliderId) moveSliderItemTo(dragSliderId, item.id);
                                                setDragSliderId(null);
                                            }}
                                            onDragEnd={() => setDragSliderId(null)}
                                            className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${enabled ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50'} ${dragSliderId === item.id ? 'opacity-50' : ''}`}>
                                            <GripVertical size={15} className="cursor-grab text-slate-300 active:cursor-grabbing" />
                                            <input type="checkbox" checked={enabled}
                                                onChange={e => toggleSliderItem(item.id, e.target.checked)}
                                                className="h-4 w-4 rounded accent-teal-500" />
                                            <span className={`min-w-0 flex-1 text-sm font-medium ${enabled ? 'text-slate-700' : 'text-slate-400'}`}>{item.label}</span>
                                            <button type="button" disabled={position <= 0}
                                                onClick={() => moveSliderItem(item.id, -1)}
                                                className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30">Up</button>
                                            <button type="button" disabled={position === sliderOrder.length - 1}
                                                onClick={() => moveSliderItem(item.id, 1)}
                                                className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30">Down</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
}
