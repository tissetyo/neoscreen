import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Wifi, Globe, Clock, Megaphone, Monitor, Film, Upload, Trash2, Plus, Image as ImageIcon, Tags, Play } from 'lucide-react';

interface HotelSettings {
    id: string; name: string; slug: string; location: string | null; timezone: string;
    wifi_ssid: string | null; wifi_password: string | null; wifi_username: string | null;
    airport_iata_code: string | null; featured_image_url: string | null; startup_video_url: string | null;
    clock_label_1: string | null; clock_timezone_1: string | null;
    clock_label_2: string | null; clock_timezone_2: string | null;
    clock_label_3: string | null; clock_timezone_3: string | null;
    tv_layout_config: Record<string, any> | null;
}
interface Announcement { id: string; text: string; is_active: boolean; }
interface RoomOption { id: string; room_code: string; guest_name: string | null; }
interface MediaItem {
    id: string; title: string | null; type: 'image' | 'video'; url: string;
    source_type: 'upload' | 'youtube' | 'url'; room_ids: string[] | null;
    tags: string[] | null; is_slideshow: boolean; sort_order: number;
}
interface Props {
    slug: string;
    hotel: HotelSettings;
    announcements: Announcement[];
    rooms: RoomOption[];
    mediaItems: MediaItem[];
}

export default function Settings({ slug, hotel: initialHotel, announcements: initialAnnouncements, rooms, mediaItems: initialMediaItems }: Props) {
    const [hotel, setHotel] = useState(initialHotel);
    const [tab, setTab] = useState<'general' | 'wifi' | 'clocks' | 'announcements' | 'tv'>('general');
    const [saving, setSaving] = useState(false);
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [mediaItems, setMediaItems] = useState(initialMediaItems);
    const [newAnn, setNewAnn] = useState('');
    const [screenMode, setScreenMode] = useState<'grid' | 'slideshow'>((initialHotel.tv_layout_config?.screenMode as any) || 'grid');
    const [slideshow, setSlideshow] = useState({
        autoAdvanceSeconds: initialHotel.tv_layout_config?.slideshow?.autoAdvanceSeconds ?? 10,
        widgetDismissSeconds: initialHotel.tv_layout_config?.slideshow?.widgetDismissSeconds ?? 10,
        transition: initialHotel.tv_layout_config?.slideshow?.transition ?? 'crossfade',
        showFloatingClock: initialHotel.tv_layout_config?.slideshow?.showFloatingClock !== false,
    });
    const [startupVideoUrl, setStartupVideoUrl] = useState(initialHotel.startup_video_url || '');
    const [uploading, setUploading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const inputCls = 'w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 bg-white';

    const save = (data: Record<string, any>) => {
        setSaving(true);
        router.patch(`/${slug}/frontoffice/settings`, data, {
            onSuccess: () => setSaving(false),
            onError: () => setSaving(false),
            preserveScroll: true,
        });
    };

    const addAnnouncement = () => {
        if (!newAnn.trim()) return;
        router.post(`/${slug}/frontoffice/settings/announcements`, { text: newAnn }, {
            onSuccess: () => setNewAnn(''),
            preserveScroll: true,
        });
    };

    const deleteAnnouncement = (id: string) => {
        if (!confirm('Delete this announcement?')) return;
        router.delete(`/${slug}/frontoffice/settings/announcements/${id}`, {
            onSuccess: () => setAnnouncements(announcements.filter(a => a.id !== id)),
            preserveScroll: true,
        });
    };

    const saveTvExperience = () => {
        router.patch(`/${slug}/frontoffice/settings/tv`, {
            screenMode,
            slideshow,
            startup_video_url: startupVideoUrl,
        }, { preserveScroll: true });
    };

    const refreshMedia = () => router.reload({ only: ['mediaItems', 'hotel'], preserveScroll: true, preserveState: false });

    const uploadMediaFile = async (file: File, type: 'image' | 'video') => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await fetch(`/api/upload/${type === 'image' ? 'media-image' : 'media-video'}`, { method: 'POST', body: formData });
            const upload = await res.json();
            if (!res.ok || !upload.url) throw new Error(upload.error || 'Upload failed');
            router.post(`/${slug}/frontoffice/settings/media`, {
                title: file.name.replace(/\.[^.]+$/, ''),
                type,
                url: upload.url,
                source_type: 'upload',
                room_ids: [],
                tags: [],
                is_slideshow: type === 'image',
                sort_order: mediaItems.length,
            }, { preserveScroll: true, onSuccess: refreshMedia });
        } catch (error: any) {
            alert(error?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const updateMedia = (media: MediaItem, patch: Partial<MediaItem>) => {
        router.patch(`/${slug}/frontoffice/settings/media/${media.id}`, {
            title: media.title,
            type: media.type,
            url: media.url,
            source_type: media.source_type,
            room_ids: media.room_ids ?? [],
            tags: media.tags ?? [],
            is_slideshow: media.is_slideshow,
            sort_order: media.sort_order ?? 0,
            ...patch,
        }, { preserveScroll: true, onSuccess: refreshMedia });
    };

    const deleteMedia = (media: MediaItem) => {
        if (!confirm('Delete this media item?')) return;
        router.delete(`/${slug}/frontoffice/settings/media/${media.id}`, { preserveScroll: true, onSuccess: refreshMedia });
    };

    const toggleMediaRoom = (media: MediaItem, roomId: string) => {
        const current = media.room_ids ?? [];
        const next = current.includes(roomId) ? current.filter(id => id !== roomId) : [...current, roomId];
        updateMedia(media, { room_ids: next });
    };

    const updateMediaTags = (media: MediaItem, value: string) => {
        updateMedia(media, { tags: value.split(',').map(tag => tag.trim()).filter(Boolean) });
    };

    const tabs = [
        { key: 'general', label: 'General', icon: Globe },
        { key: 'wifi', label: 'WiFi', icon: Wifi },
        { key: 'clocks', label: 'Clocks', icon: Clock },
        { key: 'announcements', label: 'Announcements', icon: Megaphone },
        { key: 'tv', label: 'TV Experience', icon: Monitor },
    ] as const;

    return (
        <StaffLayout header="Hotel Settings">
            <Head title="Settings" />
            <div className="max-w-5xl space-y-6">
                <div>
                    <h1 className="text-xl font-medium text-slate-800">Hotel Settings</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Configure your hotel's details, WiFi, clocks, media library, and TV experience.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.key ? 'bg-teal-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                            <t.icon size={15} /> {t.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    {tab === 'general' && (
                        <div className="space-y-4">
                            <h2 className="font-medium text-slate-800 mb-5 flex items-center gap-2"><Globe size={16} /> General Information</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Hotel Name</label>
                                    <input type="text" value={hotel.name} onChange={e => setHotel({...hotel, name: e.target.value})} className={inputCls} /></div>
                                <div><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Location / City</label>
                                    <input type="text" value={hotel.location || ''} onChange={e => setHotel({...hotel, location: e.target.value})} className={inputCls} /></div>
                                <div><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Timezone</label>
                                    <input type="text" value={hotel.timezone} onChange={e => setHotel({...hotel, timezone: e.target.value})} className={inputCls} /></div>
                                <div><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Airport IATA Code</label>
                                    <input type="text" value={hotel.airport_iata_code || ''} onChange={e => setHotel({...hotel, airport_iata_code: e.target.value})} className={inputCls} placeholder="e.g. DPS, CGK" /></div>
                            </div>
                            <button onClick={() => save({ name: hotel.name, location: hotel.location, timezone: hotel.timezone, airport_iata_code: hotel.airport_iata_code })}
                                disabled={saving} className="mt-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    )}

                    {tab === 'wifi' && (
                        <div className="space-y-4 max-w-md">
                            <h2 className="font-medium text-slate-800 mb-1 flex items-center gap-2"><Wifi size={16} /> WiFi Credentials</h2>
                            <p className="text-sm text-slate-500 mb-5">Displayed on the WiFi widget on the TV dashboard.</p>
                            <div><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Network Name (SSID)</label>
                                <input type="text" value={hotel.wifi_ssid || ''} onChange={e => setHotel({...hotel, wifi_ssid: e.target.value})} className={inputCls} /></div>
                            <div><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Username (optional)</label>
                                <input type="text" value={hotel.wifi_username || ''} onChange={e => setHotel({...hotel, wifi_username: e.target.value} as any)} className={inputCls} /></div>
                            <div><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                                <input type="text" value={hotel.wifi_password || ''} onChange={e => setHotel({...hotel, wifi_password: e.target.value})} className={inputCls} /></div>
                            <button onClick={() => save({ wifi_ssid: hotel.wifi_ssid, wifi_password: hotel.wifi_password, wifi_username: (hotel as any).wifi_username })}
                                disabled={saving} className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                                {saving ? 'Saving...' : 'Save WiFi Settings'}
                            </button>
                        </div>
                    )}

                    {tab === 'clocks' && (
                        <div className="space-y-6">
                            <h2 className="font-medium text-slate-800 mb-1 flex items-center gap-2"><Clock size={16} /> World Clock Zones</h2>
                            <p className="text-sm text-slate-500">Configure up to 3 world clocks shown on the TV dashboard.</p>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Clock {i} Label</label>
                                        <input type="text" value={(hotel as any)[`clock_label_${i}`] || ''} onChange={e => setHotel({...hotel, [`clock_label_${i}`]: e.target.value} as any)} className={inputCls} placeholder={i === 1 ? 'e.g. Local' : i === 2 ? 'e.g. Tokyo' : 'e.g. London'} /></div>
                                    <div><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Timezone</label>
                                        <input type="text" value={(hotel as any)[`clock_timezone_${i}`] || ''} onChange={e => setHotel({...hotel, [`clock_timezone_${i}`]: e.target.value} as any)} className={inputCls} placeholder={i === 1 ? 'Asia/Jakarta' : i === 2 ? 'Asia/Tokyo' : 'Europe/London'} /></div>
                                </div>
                            ))}
                            <button onClick={() => save({ clock_label_1: (hotel as any).clock_label_1, clock_timezone_1: (hotel as any).clock_timezone_1, clock_label_2: (hotel as any).clock_label_2, clock_timezone_2: (hotel as any).clock_timezone_2, clock_label_3: (hotel as any).clock_label_3, clock_timezone_3: (hotel as any).clock_timezone_3 })}
                                disabled={saving} className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                                {saving ? 'Saving...' : 'Save Clock Settings'}
                            </button>
                        </div>
                    )}

                    {tab === 'announcements' && (
                        <div className="space-y-4">
                            <h2 className="font-medium text-slate-800 mb-5 flex items-center gap-2"><Megaphone size={16} /> Ticker Announcements</h2>
                            <div className="flex gap-3">
                                <input type="text" value={newAnn} onChange={e => setNewAnn(e.target.value)} onKeyDown={e => e.key === 'Enter' && addAnnouncement()}
                                    placeholder="e.g. Breakfast served 7-10 AM in The Garden Restaurant"
                                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400" />
                                <button onClick={addAnnouncement} className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium flex items-center gap-2">
                                    <Plus size={16} /> Add
                                </button>
                            </div>
                            <div className="space-y-2 mt-4">
                                {announcements.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No announcements yet</p>}
                                {announcements.map(a => (
                                    <div key={a.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-sm text-slate-700">{a.text}</p>
                                        <div className="flex items-center gap-3 shrink-0 ml-4">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase ${a.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                                                {a.is_active ? 'Active' : 'Off'}
                                            </span>
                                            <button onClick={() => deleteAnnouncement(a.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {tab === 'tv' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="font-medium text-slate-800 mb-1 flex items-center gap-2"><Monitor size={16} /> Dashboard Screen Mode</h2>
                                <p className="text-sm text-slate-500 mb-5">Choose how the TV dashboard displays content in guest rooms.</p>
                                <div className="grid grid-cols-2 gap-4 max-w-lg">
                                    {(['grid', 'slideshow'] as const).map(mode => (
                                        <button key={mode} onClick={() => setScreenMode(mode)}
                                            className={`p-5 rounded-2xl border-2 transition-all text-left ${screenMode === mode ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <div className="text-3xl mb-2">{mode === 'grid' ? 'Grid' : 'Slides'}</div>
                                            <p className="font-medium text-slate-800 capitalize">{mode}</p>
                                            <p className="text-xs text-slate-500 mt-1">{mode === 'grid' ? 'Bento grid with widgets and apps' : 'Rotating images with on-demand widgets'}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="font-medium text-slate-800 mb-1 flex items-center gap-2"><ImageIcon size={16} /> Slideshow Settings</h3>
                                <p className="text-sm text-slate-500 mb-5">Images marked for slideshow appear only in their selected rooms. Leave rooms empty to show an image in all rooms.</p>
                                <div className="grid grid-cols-2 gap-4 max-w-xl">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Background Auto-Advance: {slideshow.autoAdvanceSeconds}s</label>
                                        <input type="range" min={5} max={120} value={slideshow.autoAdvanceSeconds}
                                            onChange={e => setSlideshow(s => ({ ...s, autoAdvanceSeconds: parseInt(e.target.value) }))}
                                            className="w-full accent-teal-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Widget Dismiss: {slideshow.widgetDismissSeconds}s</label>
                                        <input type="range" min={3} max={60} value={slideshow.widgetDismissSeconds}
                                            onChange={e => setSlideshow(s => ({ ...s, widgetDismissSeconds: parseInt(e.target.value) }))}
                                            className="w-full accent-teal-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Transition</label>
                                        <select value={slideshow.transition} onChange={e => setSlideshow(s => ({ ...s, transition: e.target.value }))}
                                            className={inputCls}>
                                            <option value="crossfade">Crossfade</option>
                                            <option value="slide">Slide</option>
                                            <option value="zoom">Zoom</option>
                                        </select>
                                    </div>
                                    <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
                                        <input type="checkbox" checked={slideshow.showFloatingClock}
                                            onChange={e => setSlideshow(s => ({ ...s, showFloatingClock: e.target.checked }))}
                                            className="w-4 h-4 rounded accent-teal-500" />
                                        Show floating clock
                                    </label>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="font-medium text-slate-800 flex items-center gap-2"><ImageIcon size={16} /> Media Library</h3>
                                        <p className="text-sm text-slate-500 mt-1">Store reusable images and tag rooms for each slideshow image.</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <input ref={imageInputRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp"
                                            onChange={e => { const file = e.target.files?.[0]; if (file) uploadMediaFile(file, 'image'); if (imageInputRef.current) imageInputRef.current.value = ''; }} />
                                        <button onClick={() => imageInputRef.current?.click()} disabled={uploading}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium disabled:opacity-50">
                                            <Upload size={15} /> Image
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {mediaItems.filter(item => item.type === 'image').length === 0 && (
                                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
                                            <ImageIcon size={28} className="mx-auto mb-2 opacity-30" />
                                            <p className="text-sm">No media images yet</p>
                                        </div>
                                    )}
                                    {mediaItems.filter(item => item.type === 'image').map(media => (
                                        <div key={media.id} className="grid grid-cols-[112px_1fr] gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <img src={media.url} alt="" className="h-24 w-28 rounded-xl object-cover bg-slate-200" />
                                            <div className="min-w-0 space-y-3">
                                                <div className="grid grid-cols-[1fr_auto] gap-3">
                                                    <input value={media.title || ''} onChange={e => setMediaItems(items => items.map(item => item.id === media.id ? { ...item, title: e.target.value } : item))}
                                                        onBlur={e => updateMedia(media, { title: e.target.value })}
                                                        className="px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-teal-400"
                                                        placeholder="Image title" />
                                                    <button onClick={() => deleteMedia(media)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <label className="flex items-center gap-2 text-sm text-slate-700">
                                                        <input type="checkbox" checked={media.is_slideshow}
                                                            onChange={e => updateMedia(media, { is_slideshow: e.target.checked })}
                                                            className="w-4 h-4 rounded accent-teal-500" />
                                                        Use in slideshow
                                                    </label>
                                                    <div className="flex items-center gap-2 min-w-[220px] flex-1">
                                                        <Tags size={14} className="text-slate-400" />
                                                        <input defaultValue={(media.tags ?? []).join(', ')}
                                                            onBlur={e => updateMediaTags(media, e.target.value)}
                                                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-teal-400"
                                                            placeholder="Tags: honeymoon, vip, suite" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-medium text-slate-500 mb-2">Rooms</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <button type="button" onClick={() => updateMedia(media, { room_ids: [] })}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${(media.room_ids ?? []).length === 0 ? 'bg-teal-500 text-white border-teal-500' : 'bg-white text-slate-600 border-slate-200'}`}>
                                                            All rooms
                                                        </button>
                                                        {rooms.map(room => (
                                                            <button key={room.id} type="button" onClick={() => toggleMediaRoom(media, room.id)}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${(media.room_ids ?? []).includes(room.id) ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200'}`}>
                                                                {room.room_code}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="font-medium text-slate-800 mb-1 flex items-center gap-2"><Film size={16} /> Startup Video Before Splash</h3>
                                <p className="text-sm text-slate-500 mb-4">Shown after room PIN login and before the welcome splash. Use an uploaded MP4/WebM or a YouTube link.</p>
                                <div className="grid grid-cols-[1fr_auto] gap-3">
                                    <div className="relative">
                                        <Play size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input value={startupVideoUrl} onChange={e => setStartupVideoUrl(e.target.value)}
                                            className={inputCls + ' pl-9'} placeholder="https://youtu.be/... or uploaded video URL" />
                                    </div>
                                    <input ref={videoInputRef} type="file" className="hidden" accept="video/mp4,video/webm"
                                        onChange={async e => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            setUploading(true);
                                            const formData = new FormData();
                                            formData.append('file', file);
                                            try {
                                                const res = await fetch('/api/upload/media-video', { method: 'POST', body: formData });
                                                const upload = await res.json();
                                                if (!res.ok || !upload.url) throw new Error(upload.error || 'Upload failed');
                                                setStartupVideoUrl(upload.url);
                                            } catch (error: any) {
                                                alert(error?.message || 'Upload failed');
                                            } finally {
                                                setUploading(false);
                                                if (videoInputRef.current) videoInputRef.current.value = '';
                                            }
                                        }} />
                                    <button onClick={() => videoInputRef.current?.click()} disabled={uploading}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium disabled:opacity-50">
                                        <Upload size={15} /> Upload
                                    </button>
                                </div>
                                {startupVideoUrl && (
                                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                                        Current startup video: <span className="font-mono">{startupVideoUrl}</span>
                                    </div>
                                )}
                            </div>

                            <button onClick={saveTvExperience} className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">
                                Save TV Experience
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </StaffLayout>
    );
}
