import StaffLayout from '@/Layouts/StaffLayout';
import { Head, Link } from '@inertiajs/react';
import { Lock, Tv, UserRound } from 'lucide-react';

interface Country { code: string; name: string; region: string; }
interface Room { id: string; room_code: string; guest_name: string | null; guest_country_code: string | null; is_occupied: boolean; }
interface HealthCountry { code: string; name: string; playlistAvailable: boolean; playableChannels: number; hiddenChannels: number; }
interface HealthSummary { playlistOnline: number; playableChannels: number; hiddenChannels: number; countries: HealthCountry[]; }
interface Props { slug: string; hotel: { id: string; name: string; iptv_enabled: boolean }; countries: Country[]; rooms: Room[]; iptvHealth: HealthSummary; }

export default function StaffIptv({ slug, hotel, countries, rooms, iptvHealth }: Props) {
    const countryName = (code: string | null) => countries.find(country => country.code === code)?.name || 'Indonesia';

    return (
        <StaffLayout header="IPTV">
            <Head title="IPTV" />
            <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${hotel.iptv_enabled ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'}`}>
                                {hotel.iptv_enabled ? <Tv size={24} /> : <Lock size={24} />}
                            </div>
                            <div>
                                <h1 className="text-xl font-medium text-slate-900">IPTV guest channels</h1>
                                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                                    {hotel.iptv_enabled
                                        ? 'Set each guest country in Rooms. Guest TVs start with Indonesia, US, International, and the guest origin country.'
                                        : 'IPTV is visible for staff planning, but locked until the superadmin enables it for this hotel.'}
                                </p>
                            </div>
                        </div>
                        <span className={`rounded-xl px-3 py-1.5 text-xs font-medium uppercase ${hotel.iptv_enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {hotel.iptv_enabled ? 'Enabled' : 'Locked'}
                        </span>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Playable channels</p>
                        <p className="mt-1 text-3xl font-semibold text-slate-900">{iptvHealth.playableChannels}</p>
                        <p className="text-xs text-slate-500">Across enabled country packs</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Hidden unavailable</p>
                        <p className="mt-1 text-3xl font-semibold text-slate-900">{iptvHealth.hiddenChannels}</p>
                        <p className="text-xs text-slate-500">Geo-blocked, offline, backup, or not 24/7</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Playlist status</p>
                        <p className="mt-1 text-3xl font-semibold text-slate-900">{iptvHealth.playlistOnline}/{countries.length}</p>
                        <p className="text-xs text-slate-500">Enabled playlists reachable</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-medium text-slate-900">Room defaults</h2>
                            <Link href={`/${slug}/frontoffice/rooms`} className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">Edit rooms</Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {rooms.map(room => (
                                <div key={room.id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                            <UserRound size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">Room {room.room_code}</p>
                                            <p className="text-xs text-slate-500">{room.guest_name || 'No guest assigned'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-slate-800">{countryName(room.guest_country_code)}</p>
                                        <p className="text-xs text-slate-400">{room.is_occupied ? 'Occupied' : 'Vacant'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm h-fit">
                        <h2 className="font-medium text-slate-900">Available country packs</h2>
                        <p className="mt-1 text-sm text-slate-500">Controlled by the superadmin catalog.</p>
                        <div className="mt-4 max-h-[520px] space-y-2 overflow-y-auto pr-1">
                            {countries.map(country => {
                                const health = iptvHealth.countries.find(item => item.code === country.code);
                                return (
                                <div key={country.code} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                                    <span>
                                        <span className="block text-sm font-medium text-slate-700">{country.name}</span>
                                        <span className="text-xs text-slate-400">{health?.playableChannels ?? 0} playable · {health?.hiddenChannels ?? 0} hidden</span>
                                    </span>
                                    <span className={`text-[10px] font-medium uppercase ${health?.playlistAvailable ? 'text-emerald-600' : 'text-rose-500'}`}>{country.code}</span>
                                </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
}
