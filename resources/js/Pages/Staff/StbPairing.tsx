import StaffLayout from '@/Layouts/StaffLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, MonitorCog, Router, Search, Tv } from 'lucide-react';

interface Room {
    id: string;
    room_code: string;
    guest_name: string | null;
    stb_device_id: string | null;
    stb_status: string | null;
    stb_paired_at: string | null;
    stb_last_seen_at: string | null;
}

interface Props {
    slug: string;
    hotel: { id: string; name: string; slug: string };
    rooms: Room[];
}

export default function StbPairing({ slug, hotel, rooms }: Props) {
    const [roomList, setRoomList] = useState<Room[]>(rooms);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(rooms[0] ?? null);
    const [code, setCode] = useState('');
    const [search, setSearch] = useState('');
    const [pairing, setPairing] = useState(false);
    const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const filteredRooms = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return roomList;
        return roomList.filter((room) =>
            room.room_code.toLowerCase().includes(q) ||
            (room.guest_name || '').toLowerCase().includes(q)
        );
    }, [roomList, search]);

    const stats = useMemo(() => {
        const paired = roomList.filter((room) => ['paired', 'online'].includes(room.stb_status || '')).length;
        const online = roomList.filter((room) => room.stb_status === 'online').length;
        return { paired, online, total: roomList.length };
    }, [roomList]);

    const pairDevice = async () => {
        if (!selectedRoom || code.length !== 6 || pairing) return;
        setPairing(true);
        setResult(null);
        try {
            const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
            const res = await fetch('/api/stb/pair', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
                body: JSON.stringify({
                    code,
                    hotelSlug: slug,
                    roomCode: selectedRoom.room_code,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Pairing failed. Check the code on the TV and try again.');
            }
            const pairedRoom = {
                ...selectedRoom,
                stb_device_id: `PAIR-${code}`,
                stb_status: 'paired',
                stb_paired_at: new Date().toISOString(),
                stb_last_seen_at: new Date().toISOString(),
            };
            setRoomList((currentRooms) => currentRooms.map((room) => room.id === pairedRoom.id ? pairedRoom : room));
            setSelectedRoom(pairedRoom);
            setResult({ type: 'success', message: `STB connected to Room ${selectedRoom.room_code}. The TV will open the room dashboard automatically.` });
            setCode('');
        } catch (error) {
            setResult({ type: 'error', message: error instanceof Error ? error.message : 'Pairing failed.' });
        } finally {
            setPairing(false);
        }
    };

    const statusTone = (status: string | null) => {
        if (status === 'online') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        if (status === 'paired') return 'bg-blue-50 text-blue-700 border-blue-100';
        if (status === 'maintenance') return 'bg-amber-50 text-amber-700 border-amber-100';
        return 'bg-slate-100 text-slate-500 border-slate-200';
    };

    return (
        <StaffLayout header="STB Pairing">
            <Head title="STB Pairing" />
            <div className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900">Connect STB Launcher</h1>
                        <p className="mt-1 max-w-2xl text-sm text-slate-500">
                            Install the launcher on the Android STB or Smart TV, open it, then enter the pairing code shown on the TV here.
                        </p>
                    </div>
                    <Link href="/launcher" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                        <Download size={16} /> Download launcher
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Rooms</p>
                        <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.total}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Paired STBs</p>
                        <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.paired}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Online now</p>
                        <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.online}</p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-100 p-5">
                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <Search size={16} className="text-slate-400" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search rooms"
                                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                                />
                            </div>
                        </div>
                        <div className="grid max-h-[520px] gap-3 overflow-y-auto p-5 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredRooms.map((room) => {
                                const active = selectedRoom?.id === room.id;
                                return (
                                    <button
                                        key={room.id}
                                        type="button"
                                        onClick={() => { setSelectedRoom(room); setResult(null); }}
                                        className={`rounded-2xl border p-4 text-left transition ${
                                            active ? 'border-teal-400 bg-teal-50 shadow-sm ring-2 ring-teal-100' : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-900">Room {room.room_code}</p>
                                                <p className="mt-1 truncate text-xs text-slate-500">{room.guest_name || 'No guest assigned'}</p>
                                            </div>
                                            <span className={`rounded-full border px-2 py-1 text-[10px] font-bold uppercase ${statusTone(room.stb_status)}`}>
                                                {room.stb_status || 'unpaired'}
                                            </span>
                                        </div>
                                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                                            <Router size={13} />
                                            <span className="truncate">{room.stb_device_id || 'No device paired'}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                            <MonitorCog size={24} />
                        </div>
                        <h2 className="mt-4 text-xl font-semibold text-slate-900">Enter TV pairing code</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            On the TV, open Neoscreen Launcher. It will show a 6-digit setup code. Select the room here, type the code, then connect.
                        </p>

                        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Selected room</p>
                            <div className="mt-2 flex items-center justify-between gap-3">
                                <div>
                                    <p className="text-lg font-semibold text-slate-900">{selectedRoom ? `Room ${selectedRoom.room_code}` : 'No room selected'}</p>
                                    <p className="text-xs text-slate-500">{hotel.name}</p>
                                </div>
                                <Tv className="text-slate-300" size={26} />
                            </div>
                        </div>

                        <label className="mt-6 block text-xs font-semibold uppercase tracking-wider text-slate-500">Pairing code</label>
                        <input
                            value={code}
                            onChange={(event) => {
                                setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                                setResult(null);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && code.length === 6) pairDevice();
                            }}
                            placeholder="000000"
                            inputMode="numeric"
                            className="mt-2 w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-center font-mono text-3xl font-semibold tracking-[0.35em] text-slate-900 outline-none focus:border-teal-500"
                        />

                        {result && (
                            <div className={`mt-4 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                                result.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'
                            }`}>
                                {result.type === 'success' ? <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> : <AlertTriangle size={18} className="mt-0.5 shrink-0" />}
                                <p className="font-medium leading-6">{result.message}</p>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={pairDevice}
                            disabled={!selectedRoom || code.length !== 6 || pairing}
                            className="mt-5 w-full rounded-2xl bg-teal-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            {pairing ? 'Connecting...' : 'Connect STB'}
                        </button>

                        <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="font-semibold text-slate-800">Install flow</p>
                            <p>1. Open /launcher and download the STB APK.</p>
                            <p>2. Install it on the Android STB or Smart TV.</p>
                            <p>3. Open Neoscreen Launcher and enter the TV code here.</p>
                            <p>4. The TV opens the assigned room dashboard automatically.</p>
                        </div>
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
}
