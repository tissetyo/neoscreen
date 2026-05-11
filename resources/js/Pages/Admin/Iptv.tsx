import StaffLayout from '@/Layouts/StaffLayout';
import { Head, Link, router } from '@inertiajs/react';
import { ExternalLink, Globe2, Radio, ShieldCheck, Tv } from 'lucide-react';

interface Country { code: string; name: string; region: string; playlist_url: string; is_enabled: boolean; }
interface Hotel { id: string; name: string; slug: string; iptv_enabled: boolean; }
interface HealthCountry { code: string; name: string; playlistAvailable: boolean; playableChannels: number; hiddenChannels: number; }
interface HealthSummary { playlistOnline: number; playableChannels: number; hiddenChannels: number; countries: HealthCountry[]; }
interface Props { countries: Country[]; hotels: Hotel[]; source: { name: string; url: string }; iptvHealth: HealthSummary; }

export default function AdminIptv({ countries, hotels, source, iptvHealth }: Props) {
    const enabledCountries = countries.filter(country => country.is_enabled).length;
    const grouped = countries.reduce<Record<string, Country[]>>((acc, country) => {
        acc[country.region] = [...(acc[country.region] || []), country];
        return acc;
    }, {});

    const toggleCountry = (country: Country) => {
        router.patch(`/admin/iptv/countries/${country.code}`, { is_enabled: !country.is_enabled }, { preserveScroll: true });
    };

    const toggleHotel = (hotel: Hotel) => {
        router.patch(`/admin/hotels/${hotel.id}/iptv`, { iptv_enabled: !hotel.iptv_enabled }, { preserveScroll: true });
    };

    return (
        <StaffLayout header="IPTV Control">
            <Head title="IPTV Control" />
            <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-medium text-slate-900">IPTV Control</h1>
                        <p className="text-sm text-slate-500 mt-1 max-w-2xl">Curate the public IPTV country packs available to hotels. Hotels can only serve countries that remain enabled here.</p>
                    </div>
                    <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        {source.name} <ExternalLink size={14} />
                    </a>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <Globe2 className="mb-3 text-rose-500" size={24} />
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Countries enabled</p>
                        <p className="mt-1 text-3xl font-semibold text-slate-900">{enabledCountries}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <Tv className="mb-3 text-indigo-500" size={24} />
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Hotels with IPTV</p>
                        <p className="mt-1 text-3xl font-semibold text-slate-900">{hotels.filter(hotel => hotel.iptv_enabled).length}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <ShieldCheck className="mb-3 text-emerald-500" size={24} />
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Playable / hidden</p>
                        <p className="mt-1 text-3xl font-semibold text-slate-900">{iptvHealth.playableChannels}</p>
                        <p className="text-xs text-slate-500">{iptvHealth.hiddenChannels} unavailable channels hidden</p>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="font-medium text-slate-900">Catalog availability</h2>
                            <p className="text-sm text-slate-500">Guest TVs hide channels labeled geo-blocked, offline, backup, or not 24/7.</p>
                        </div>
                        <span className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">{iptvHealth.playlistOnline}/{countries.length} playlists online</span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {iptvHealth.countries.slice(0, 12).map(country => (
                            <div key={country.code} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="truncate text-sm font-medium text-slate-800">{country.name}</p>
                                    <span className={`h-2.5 w-2.5 rounded-full ${country.playlistAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                </div>
                                <p className="mt-1 text-xs text-slate-500">{country.playableChannels} playable · {country.hiddenChannels} hidden</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                    <div className="space-y-5">
                        {Object.entries(grouped).map(([region, items]) => (
                            <div key={region} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="font-medium text-slate-900">{region}</h2>
                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-medium uppercase text-slate-500">{items.filter(item => item.is_enabled).length}/{items.length} enabled</span>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {items.map(country => (
                                        <button key={country.code} type="button" onClick={() => toggleCountry(country)}
                                            className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${country.is_enabled ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-slate-50 opacity-75'}`}>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">{country.name}</p>
                                                <p className="text-xs text-slate-500">{country.code.toUpperCase()} playlist</p>
                                            </div>
                                            <span className={`h-6 w-11 rounded-full p-0.5 transition-colors ${country.is_enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                <span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${country.is_enabled ? 'translate-x-5' : ''}`} />
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm h-fit">
                        <div className="mb-4 flex items-center gap-2">
                            <Radio size={18} className="text-rose-500" />
                            <h2 className="font-medium text-slate-900">Hotel availability</h2>
                        </div>
                        <div className="space-y-2">
                            {hotels.map(hotel => (
                                <div key={hotel.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                                    <div>
                                        <Link href={`/admin/hotels/${hotel.id}`} className="text-sm font-medium text-slate-800 hover:text-rose-600">{hotel.name}</Link>
                                        <p className="text-xs text-slate-400">/{hotel.slug}</p>
                                    </div>
                                    <button type="button" onClick={() => toggleHotel(hotel)} aria-label={`${hotel.iptv_enabled ? 'Disable' : 'Enable'} IPTV for ${hotel.name}`}
                                        className={`relative h-7 w-12 rounded-full p-0.5 transition-colors ${hotel.iptv_enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                        <span className={`block h-6 w-6 rounded-full bg-white shadow transition-transform ${hotel.iptv_enabled ? 'translate-x-5' : ''}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
}
