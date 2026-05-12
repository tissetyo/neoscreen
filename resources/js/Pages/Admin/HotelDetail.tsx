import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ArrowLeft, BedDouble, Users, Wrench, Wifi, Film, Monitor, Globe, Tv2, ToggleLeft, ToggleRight, Palette, Building2, Satellite, LayoutGrid, Play } from 'lucide-react';

interface HotelDetail {
    id: string; name: string; slug: string; location: string | null; timezone: string;
    is_active: boolean; iptv_enabled: boolean; featured_image_url: string | null; created_at: string;
    wifi_ssid: string | null; wifi_username: string | null; wifi_password: string | null; startup_video_url: string | null;
    tv_layout_config: Record<string, any> | null;
    rooms_count: number; services_count: number;
}
interface StaffUser { id: string; name: string; email: string; role: string; is_suspended: boolean; }
interface Props { hotel: HotelDetail; staff: StaffUser[]; }

export default function AdminHotelDetail({ hotel: initialHotel, staff }: Props) {
    const [hotel, setHotel] = useState(initialHotel);
    const [tab, setTab] = useState<'overview' | 'tv' | 'wifi' | 'iptv'>('overview');
    const [screenMode, setScreenMode] = useState<'grid' | 'slideshow'>((hotel.tv_layout_config?.screenMode as any) || 'grid');
    const [saving, setSaving] = useState(false);
    const [wifiSsid, setWifiSsid] = useState(hotel.wifi_ssid ?? '');
    const [wifiUsername, setWifiUsername] = useState(hotel.wifi_username ?? '');
    const [wifiPassword, setWifiPassword] = useState(hotel.wifi_password ?? '');
    const [savingWifi, setSavingWifi] = useState(false);
    const [savingIptv, setSavingIptv] = useState(false);

    useEffect(() => {
        setHotel(initialHotel);
        setScreenMode((initialHotel.tv_layout_config?.screenMode as 'grid' | 'slideshow') || 'grid');
        setWifiSsid(initialHotel.wifi_ssid ?? '');
        setWifiUsername(initialHotel.wifi_username ?? '');
        setWifiPassword(initialHotel.wifi_password ?? '');
    }, [initialHotel]);

    const toggle = () => {
        if (!confirm(`${hotel.is_active ? 'Deactivate' : 'Activate'} "${hotel.name}"?`)) return;
        router.patch(`/admin/hotels/${hotel.id}/toggle`, {}, {
            onSuccess: () => setHotel({ ...hotel, is_active: !hotel.is_active }),
            preserveScroll: true,
        });
    };

    const saveScreenMode = () => {
        setSaving(true);
        router.patch(`/admin/hotels/${hotel.id}/tv-config`, { screenMode }, {
            onSuccess: () => setSaving(false),
            onError: () => setSaving(false),
            preserveScroll: true,
        });
    };

    const saveWifi = () => {
        setSavingWifi(true);
        router.patch(`/admin/hotels/${hotel.id}/wifi`, {
            wifi_ssid: wifiSsid || null,
            wifi_username: wifiUsername || null,
            wifi_password: wifiPassword || null,
        }, {
            onSuccess: () => setSavingWifi(false),
            onError: () => setSavingWifi(false),
            preserveScroll: true,
        });
    };

    const toggleIptv = () => {
        setSavingIptv(true);
        router.patch(`/admin/hotels/${hotel.id}/iptv`, { iptv_enabled: !hotel.iptv_enabled }, {
            onSuccess: () => { setHotel({ ...hotel, iptv_enabled: !hotel.iptv_enabled }); setSavingIptv(false); },
            onError: () => setSavingIptv(false),
            preserveScroll: true,
        });
    };

    const tabs = [
        { key: 'overview', label: 'Overview', icon: Globe },
        { key: 'tv', label: 'TV Settings', icon: Tv2 },
        { key: 'iptv', label: 'IPTV', icon: Satellite },
        { key: 'wifi', label: 'WiFi', icon: Wifi },
    ] as const;

    return (
        <StaffLayout header={hotel.name}>
            <Head title={`${hotel.name} — Admin`} />
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Breadcrumb & Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/hotels" className="text-slate-400 hover:text-slate-600 transition-colors text-sm flex items-center gap-1">
                            <ArrowLeft size={16} /> Hotels
                        </Link>
                        <span className="text-slate-300">/</span>
                        <h1 className="text-xl font-medium text-slate-800">{hotel.name}</h1>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium uppercase ${hotel.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {hotel.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/admin/hotels/${hotel.id}/tv-canvas`} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition-colors">
                            <Monitor size={15} /> TV Canvas
                        </Link>
                        <a href={`/${hotel.slug}/frontoffice`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium transition-colors">
                            <Globe size={16} /> Front Office
                        </a>
                        <button onClick={toggle} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${hotel.is_active ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                            {hotel.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                            {hotel.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Rooms', value: hotel.rooms_count, icon: BedDouble, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Staff', value: staff.length, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
                        { label: 'Services', value: hotel.services_count, icon: Wrench, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Screen Mode', value: screenMode, icon: Monitor, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    ].map(s => (
                        <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                                <s.icon size={20} className={s.color} />
                            </div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{s.label}</p>
                            <p className="text-2xl font-semibold text-slate-900 mt-1 capitalize">{s.value}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200 pb-0">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setTab(t.key as any)}
                            className={`px-5 py-2.5 text-sm font-medium rounded-t-xl transition-colors border-b-2 -mb-px ${tab === t.key ? 'text-rose-600 border-rose-500 bg-white' : 'text-slate-500 border-transparent hover:text-slate-700'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    {tab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'URL Slug', value: `/${hotel.slug}` },
                                    { label: 'Location', value: hotel.location || '-' },
                                    { label: 'Timezone', value: hotel.timezone },
                                    { label: 'Created', value: new Date(hotel.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                                ].map(item => (
                                    <div key={item.label} className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.label}</p>
                                        <p className="font-medium text-slate-800 mt-1">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Staff Table */}
                            <div>
                                <h3 className="font-medium text-slate-800 mb-4 flex items-center gap-2"><Users size={16} /> Staff Members</h3>
                                <table className="w-full text-sm">
                                    <thead><tr className="bg-slate-50 text-slate-400 text-xs font-medium uppercase tracking-wider rounded-xl">
                                        <th className="text-left px-4 py-3 rounded-tl-xl">Name</th>
                                        <th className="text-left px-4 py-3">Email</th>
                                        <th className="text-left px-4 py-3">Role</th>
                                        <th className="text-left px-4 py-3 rounded-tr-xl">Status</th>
                                    </tr></thead>
                                    <tbody>
                                        {staff.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-slate-400">No staff yet</td></tr>}
                                        {staff.map(s => (
                                            <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                                                <td className="px-4 py-3 text-slate-500">{s.email}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase ${s.role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{s.role}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase ${s.is_suspended ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{s.is_suspended ? 'Suspended' : 'Active'}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Quick links */}
                            <div className="pt-4 border-t border-slate-100">
                                <h3 className="font-medium text-slate-800 mb-4">Hotel Links</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href={`/admin/hotels/${hotel.id}/tv-canvas`}
                                        className="flex items-center gap-3 p-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors">
                                        <Palette size={22} className="text-indigo-500 shrink-0" />
                                        <div>
                                            <p className="text-xs font-medium text-indigo-700">TV Layout Canvas</p>
                                            <p className="text-[10px] text-indigo-400">Drag-and-drop widget editor</p>
                                        </div>
                                    </Link>
                                    {[
                                        { label: 'Front Office Panel', url: `/${hotel.slug}/frontoffice`, Icon: Building2, sub: `/${hotel.slug}/frontoffice` },
                                        { label: 'TV Preview (Room 101)', url: `/d/${hotel.slug}/101`, Icon: Tv2, sub: `/d/${hotel.slug}/101` },
                                        { label: 'STB Launcher', url: '/launcher', Icon: Satellite, sub: '/launcher' },
                                    ].map(link => (
                                        <a key={link.label} href={link.url} target="_blank"
                                            className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors">
                                            <link.Icon size={20} className="text-slate-400 shrink-0" />
                                            <div>
                                                <p className="text-xs font-medium text-slate-700">{link.label}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{link.sub}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'tv' && (
                        <div className="space-y-8 max-w-xl">
                            <div>
                                <h3 className="font-medium text-slate-800 mb-1">Dashboard Screen Mode</h3>
                                <p className="text-sm text-slate-500 mb-4">Choose how the TV dashboard displays content in guest rooms.</p>
                                <div className="grid grid-cols-2 gap-4">
                                    {(['grid', 'slideshow'] as const).map(mode => (
                                        <button key={mode} onClick={() => setScreenMode(mode)}
                                            className={`p-5 rounded-2xl border-2 transition-all text-left ${screenMode === mode ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                                            <div className="mb-3">{mode === 'grid' ? <LayoutGrid size={28} className="text-teal-500" /> : <Play size={28} className="text-teal-500" />}</div>
                                            <p className="font-medium text-slate-800 capitalize">{mode}</p>
                                            <p className="text-xs text-slate-500 mt-1">{mode === 'grid' ? 'All widgets always visible in a bento grid layout' : 'Auto-rotating widget slides with ambient backgrounds'}</p>
                                        </button>
                                    ))}
                                </div>
                                <button onClick={saveScreenMode} disabled={saving}
                                    className="mt-4 px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                                    {saving ? 'Saving...' : '💾 Save Screen Mode'}
                                </button>
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="font-medium text-slate-800 mb-1 flex items-center gap-2"><Film size={16} /> Startup Video</h3>
                                <p className="text-sm text-slate-500 mb-4">Loops on TV startup. Guests can press any key to dismiss.</p>
                                {hotel.startup_video_url ? (
                                    <div className="relative group rounded-2xl overflow-hidden border border-slate-200">
                                        <video src={hotel.startup_video_url} className="w-full h-36 object-cover" muted playsInline />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-white text-sm font-medium">Startup Video Set</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
                                        <Film size={32} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No startup video set</p>
                                        <p className="text-xs mt-1">Upload via the Front Office Settings page</p>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-slate-100">
                                <h3 className="font-medium text-slate-800 mb-4">TV Dashboard Preview Links</h3>
                                <div className="bg-[#0B1120] rounded-2xl p-5 space-y-3">
                                    {[101, 102, 103].map(code => (
                                        <a key={code} href={`/d/${hotel.slug}/${code}`} target="_blank"
                                            className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                                            <span className="text-white/70 text-sm font-medium flex items-center gap-2"><Tv2 size={14}/> Room {code}</span>
                                            <span className="text-white/30 text-xs group-hover:text-teal-400 transition-colors">/d/{hotel.slug}/{code} →</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'iptv' && (
                        <div className="space-y-6 max-w-2xl">
                            <div>
                                <h3 className="font-medium text-slate-800 mb-1 flex items-center gap-2"><Satellite size={16} /> IPTV availability</h3>
                                <p className="text-sm text-slate-500">Controls whether the IPTV app appears on guest room TVs. When off, Front Office can see IPTV as locked and the TV app disappears from rooms.</p>
                            </div>
                            <div className={`rounded-2xl border p-5 ${hotel.iptv_enabled ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="font-medium text-slate-900">{hotel.iptv_enabled ? 'IPTV is enabled' : 'IPTV is disabled'}</p>
                                        <p className="text-sm text-slate-500 mt-1">{hotel.iptv_enabled ? 'Guest TVs can open country-based live channels.' : 'The app is hidden from guest TVs and locked for staff.'}</p>
                                    </div>
                                    <button type="button" onClick={toggleIptv} disabled={savingIptv}
                                        className={`relative h-8 w-14 rounded-full p-1 transition-colors disabled:opacity-60 ${hotel.iptv_enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                        <span className={`block h-6 w-6 rounded-full bg-white shadow transition-transform ${hotel.iptv_enabled ? 'translate-x-6' : ''}`} />
                                    </button>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                <h4 className="font-medium text-slate-800">Country catalog</h4>
                                <p className="text-sm text-slate-500 mt-1">Enable or disable countries globally from the IPTV Control page. Room defaults always include Indonesia, United States, International, and the guest origin country when available.</p>
                                <Link href="/admin/iptv" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2 text-sm font-medium text-white hover:bg-rose-600">
                                    Manage IPTV catalog
                                </Link>
                            </div>
                        </div>
                    )}

                    {tab === 'wifi' && (
                        <div className="space-y-4 max-w-md">
                            <div>
                                <h3 className="font-medium text-slate-800 mb-1 flex items-center gap-2"><Wifi size={16} /> WiFi Credentials</h3>
                                <p className="text-sm text-slate-500 mb-5">Same data as Front Office → Settings. Shown on the WiFi card in guest rooms (dashboard and TV config API).</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Network Name (SSID)</label>
                                <input type="text" value={wifiSsid} onChange={e => setWifiSsid(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Username (optional)</label>
                                <input type="text" value={wifiUsername} onChange={e => setWifiUsername(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                                <input type="text" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400" />
                            </div>
                            <button type="button" onClick={saveWifi} disabled={savingWifi}
                                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                                {savingWifi ? 'Saving…' : 'Save WiFi'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </StaffLayout>
    );
}
