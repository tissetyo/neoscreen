import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Wifi, Globe, Clock, Megaphone, Monitor, Film, Upload, Trash2, Plus } from 'lucide-react';

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
interface Props { slug: string; hotel: HotelSettings; announcements: Announcement[]; }

export default function Settings({ slug, hotel: initialHotel, announcements: initialAnnouncements }: Props) {
    const [hotel, setHotel] = useState(initialHotel);
    const [tab, setTab] = useState<'general' | 'wifi' | 'clocks' | 'announcements' | 'tv'>('general');
    const [saving, setSaving] = useState(false);
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [newAnn, setNewAnn] = useState('');
    const [screenMode, setScreenMode] = useState<'grid' | 'slideshow'>((initialHotel.tv_layout_config?.screenMode as any) || 'grid');

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

    const saveScreenMode = () => {
        router.patch(`/${slug}/frontoffice/settings/tv`, { screenMode }, { preserveScroll: true });
    };

    const tabs = [
        { key: 'general', label: 'General', icon: Globe },
        { key: 'wifi', label: 'WiFi', icon: Wifi },
        { key: 'clocks', label: 'Clocks', icon: Clock },
        { key: 'announcements', label: 'Announcements', icon: Megaphone },
        { key: 'tv', label: '📺 TV Experience', icon: Monitor },
    ] as const;

    const inputCls = 'w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 bg-white';

    return (
        <StaffLayout header="Hotel Settings">
            <Head title="Settings" />
            <div className="max-w-3xl space-y-6">
                <div>
                    <h1 className="text-xl font-medium text-slate-800">Hotel Settings</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Configure your hotel's details, WiFi, clocks, and TV experience.</p>
                </div>

                {/* Tab Bar */}
                <div className="flex flex-wrap gap-2">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === t.key ? 'bg-teal-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    {/* General Tab */}
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

                    {/* WiFi Tab */}
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

                    {/* Clocks Tab */}
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

                    {/* Announcements Tab */}
                    {tab === 'announcements' && (
                        <div className="space-y-4">
                            <h2 className="font-medium text-slate-800 mb-5 flex items-center gap-2"><Megaphone size={16} /> Ticker Announcements</h2>
                            <div className="flex gap-3">
                                <input type="text" value={newAnn} onChange={e => setNewAnn(e.target.value)} onKeyDown={e => e.key === 'Enter' && addAnnouncement()}
                                    placeholder="e.g. Breakfast served 7–10 AM in The Garden Restaurant"
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

                    {/* TV Experience Tab */}
                    {tab === 'tv' && (
                        <div className="space-y-8">
                            <div>
                                <h2 className="font-medium text-slate-800 mb-1 flex items-center gap-2"><Monitor size={16} /> Dashboard Screen Mode</h2>
                                <p className="text-sm text-slate-500 mb-5">Choose how the TV dashboard displays content in guest rooms.</p>
                                <div className="grid grid-cols-2 gap-4 max-w-lg">
                                    {(['grid', 'slideshow'] as const).map(mode => (
                                        <button key={mode} onClick={() => setScreenMode(mode)}
                                            className={`p-5 rounded-2xl border-2 transition-all text-left ${screenMode === mode ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}`}>
                                            <div className="text-3xl mb-2">{mode === 'grid' ? '⊞' : '▶'}</div>
                                            <p className="font-medium text-slate-800 capitalize">{mode}</p>
                                            <p className="text-xs text-slate-500 mt-1">{mode === 'grid' ? 'Bento grid — all widgets always visible' : 'Rotating slides with ambient backgrounds'}</p>
                                        </button>
                                    ))}
                                </div>
                                <button onClick={saveScreenMode} className="mt-4 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">
                                    💾 Save Screen Mode
                                </button>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="font-medium text-slate-800 mb-1 flex items-center gap-2"><Film size={16} /> Startup Video</h3>
                                <p className="text-sm text-slate-500 mb-4">Loops on TV startup until a guest presses any key.</p>
                                {hotel.startup_video_url ? (
                                    <div className="relative group rounded-2xl overflow-hidden border border-slate-200 max-w-xs">
                                        <video src={hotel.startup_video_url} className="w-full h-32 object-cover" muted playsInline />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-sm font-medium">✓ Startup Video Set</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 max-w-xs">
                                        <Film size={28} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No startup video uploaded</p>
                                        <p className="text-xs mt-1">Upload via the Upload page</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </StaffLayout>
    );
}
