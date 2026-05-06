import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router } from '@inertiajs/react';
import { Activity, Building2, MonitorCog, RefreshCw, Router, WifiOff } from 'lucide-react';

interface Room {
    id: string;
    room_code: string;
    guest_name: string | null;
    stb_device_id: string | null;
    stb_status: string;
    stb_paired_at: string | null;
    stb_last_seen_at: string | null;
    hotel: { id: string; name: string; slug: string };
}

interface Props {
    rooms: Room[];
    summary: { totalRooms: number; paired: number; online: number; unpaired: number };
}

const statusClass: Record<string, string> = {
    online: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25',
    paired: 'bg-blue-500/15 text-blue-300 border-blue-400/25',
    offline: 'bg-amber-500/15 text-amber-300 border-amber-400/25',
    maintenance: 'bg-violet-500/15 text-violet-300 border-violet-400/25',
    unpaired: 'bg-slate-500/15 text-slate-300 border-slate-400/20',
};

export default function StbFleet({ rooms, summary }: Props) {
    const updateStatus = (room: Room, status: string) => {
        router.patch(`/admin/stb-fleet/${room.id}`, {
            stb_status: status,
            stb_device_id: room.stb_device_id,
        }, { preserveScroll: true });
    };

    return (
        <StaffLayout header="STB Fleet">
            <Head title="STB Fleet" />
            <div className="space-y-6">
                <div className="rounded-3xl border border-slate-800 bg-[#0B1120] p-6 text-white shadow-xl">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
                                    <Router size={22} />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-semibold">STB Fleet Command</h1>
                                    <p className="text-sm text-slate-400">Track pairing, room assignment, last seen state, and operational health across hotels.</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => router.reload()} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10">
                            <RefreshCw size={15} /> Refresh
                        </button>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                        {[
                            { label: 'Total Rooms', value: summary.totalRooms, icon: Building2 },
                            { label: 'Paired STBs', value: summary.paired, icon: MonitorCog },
                            { label: 'Online Now', value: summary.online, icon: Activity },
                            { label: 'Unpaired', value: summary.unpaired, icon: WifiOff },
                        ].map((item) => (
                            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                <item.icon size={18} className="text-rose-300" />
                                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-500">{item.label}</p>
                                <p className="mt-1 text-3xl font-semibold">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-800 bg-[#101827] shadow-xl">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-950/50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                <th className="px-5 py-4">Hotel / Room</th>
                                <th className="px-5 py-4">Device</th>
                                <th className="px-5 py-4">Guest</th>
                                <th className="px-5 py-4">Last Seen</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rooms.map((room) => (
                                <tr key={room.id} className="border-b border-slate-800/70 text-slate-200 hover:bg-white/[0.03]">
                                    <td className="px-5 py-4">
                                        <p className="font-medium">{room.hotel.name}</p>
                                        <p className="text-xs text-slate-500">/{room.hotel.slug} · Room {room.room_code}</p>
                                    </td>
                                    <td className="px-5 py-4 font-mono text-xs text-slate-400">{room.stb_device_id || 'Not paired'}</td>
                                    <td className="px-5 py-4 text-slate-400">{room.guest_name || '-'}</td>
                                    <td className="px-5 py-4 text-xs text-slate-500">{room.stb_last_seen_at ? new Date(room.stb_last_seen_at).toLocaleString() : '-'}</td>
                                    <td className="px-5 py-4">
                                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${statusClass[room.stb_status] || statusClass.unpaired}`}>
                                            {room.stb_status || 'unpaired'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <select
                                            value={room.stb_status || 'unpaired'}
                                            onChange={(event) => updateStatus(room, event.target.value)}
                                            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-200 outline-none focus:border-rose-400"
                                        >
                                            {['unpaired', 'paired', 'online', 'offline', 'maintenance'].map((status) => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </StaffLayout>
    );
}
