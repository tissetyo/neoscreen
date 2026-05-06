import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Settings, User, X, Save, Monitor, Plus, Trash2 } from 'lucide-react';

interface Room { id: string; room_code: string; guest_name: string | null; custom_welcome_message: string | null; checkin_date: string | null; checkout_date: string | null; pin: string | null; is_occupied: boolean; room_type: { name: string } | null; }
interface Props { slug: string; rooms: Room[]; }

export default function Rooms({ slug, rooms: initialRooms }: Props) {
    const [rooms, setRooms] = useState(initialRooms);
    const [filter, setFilter] = useState<'all' | 'occupied' | 'vacant'>('all');
    const [search, setSearch] = useState('');
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [saving, setSaving] = useState(false);
    const [showPairModal, setShowPairModal] = useState(false);
    const [pairCode, setPairCode] = useState('');
    const [pairResult, setPairResult] = useState<'success' | 'error' | null>(null);
    const [pairLoading, setPairLoading] = useState(false);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [newRoomCode, setNewRoomCode] = useState('');
    const [newRoomPin, setNewRoomPin] = useState('');

    const filtered = rooms.filter(r => {
        if (filter === 'occupied' && !r.is_occupied) return false;
        if (filter === 'vacant' && r.is_occupied) return false;
        if (search && !r.room_code.includes(search) && !r.guest_name?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const handleSave = () => {
        if (!editingRoom) return;
        setSaving(true);
        router.put(`/${slug}/frontoffice/rooms/${editingRoom.id}`, {
            guest_name: editingRoom.guest_name || null,
            custom_welcome_message: editingRoom.custom_welcome_message || null,
            checkin_date: editingRoom.checkin_date || null,
            checkout_date: editingRoom.checkout_date || null,
            pin: editingRoom.pin || null,
            is_occupied: editingRoom.is_occupied,
        }, {
            onSuccess: () => { setRooms(rooms.map(r => r.id === editingRoom.id ? editingRoom : r)); setEditingRoom(null); setSaving(false); },
            onError: () => setSaving(false),
        });
    };

    const handlePairSTB = async () => {
        if (!pairCode.trim() || !editingRoom) return;
        setPairLoading(true); setPairResult(null);
        try {
            const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
            const res = await fetch('/api/stb/pair', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf }, body: JSON.stringify({ code: pairCode.trim().toUpperCase(), hotelSlug: slug, roomCode: editingRoom.room_code }) });
            setPairResult(res.ok ? 'success' : 'error');
            if (res.ok) setTimeout(() => { setShowPairModal(false); setPairCode(''); setPairResult(null); }, 3000);
        } catch { setPairResult('error'); }
        setPairLoading(false);
    };

    const createRoom = () => {
        if (!newRoomCode.trim() || !newRoomPin.trim()) return;
        router.post(`/${slug}/frontoffice/rooms`, { room_code: newRoomCode.trim(), pin: newRoomPin.trim() }, {
            onSuccess: () => {
                setShowAddRoom(false);
                setNewRoomCode('');
                setNewRoomPin('');
                router.reload({ only: ['rooms'] });
            },
        });
    };

    const deleteRoom = () => {
        if (!editingRoom || !confirm(`Delete Room ${editingRoom.room_code}? This also deletes its chat, alarms, and requests.`)) return;
        router.delete(`/${slug}/frontoffice/rooms/${editingRoom.id}`, {
            onSuccess: () => {
                setRooms(rooms.filter(r => r.id !== editingRoom.id));
                setEditingRoom(null);
            },
        });
    };

    return (
        <StaffLayout header="Room Overview">
            <Head title="Rooms" />
            <div className="flex gap-6 h-[calc(100vh-130px)] overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                        <h1 className="text-xl font-medium text-slate-800">Room Overview</h1>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setShowAddRoom(true)} className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-teal-700">
                                <Plus size={16} /> Add Room
                            </button>
                            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                                className="px-4 py-2 border border-slate-200 rounded-xl text-sm w-48 focus:outline-none focus:border-teal-400" />
                            <div className="flex rounded-xl overflow-hidden border border-slate-200">
                                {(['all', 'occupied', 'vacant'] as const).map(f => (
                                    <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 text-xs capitalize font-medium transition-colors ${filter === f ? 'bg-teal-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>{f}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                    {filtered.length === 0 ? (
                        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl"><p className="text-4xl mb-3">🏨</p><p className="text-slate-500 font-medium">No rooms match.</p></div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-10">
                            {filtered.map(room => (
                                <div key={room.id} onClick={() => setEditingRoom({ ...room })}
                                    className={`bg-white rounded-2xl border p-4 transition-all cursor-pointer relative overflow-hidden ${editingRoom?.id === room.id ? 'border-teal-500 ring-2 ring-teal-100 shadow-md' : 'border-slate-200 hover:border-teal-300 hover:shadow-sm'}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-lg font-semibold text-slate-800">Room {room.room_code}</span>
                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${room.is_occupied ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500'}`}>{room.is_occupied ? 'IN' : 'OUT'}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-3">{room.room_type?.name || 'Standard'}</p>
                                    <div className="flex items-center text-xs text-slate-600 pt-3 border-t border-slate-100">
                                        <User size={12} className="mr-1.5 opacity-50 shrink-0" />
                                        {room.guest_name ? <span className="font-semibold text-slate-800 truncate">{room.guest_name}</span> : <span className="text-slate-400 italic">No Guest</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {editingRoom && (
                    <div className="fixed lg:relative right-0 top-0 lg:top-auto bottom-0 w-full lg:w-[380px] bg-white border-l lg:border border-slate-200 shadow-2xl flex flex-col lg:rounded-2xl overflow-hidden z-30 lg:h-full">
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50 shrink-0">
                            <h2 className="font-medium text-slate-800 flex items-center gap-2"><Settings size={16} className="text-teal-600" /> Room {editingRoom.room_code}</h2>
                            <button onClick={() => setEditingRoom(null)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400"><X size={16} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
                                <span className="text-sm font-semibold text-slate-700">Status</span>
                                <button onClick={() => setEditingRoom({ ...editingRoom, is_occupied: !editingRoom.is_occupied })}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${editingRoom.is_occupied ? 'bg-teal-100 text-teal-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {editingRoom.is_occupied ? 'OCCUPIED' : 'VACANT'}
                                </button>
                            </div>
                            <div><label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Guest Name</label>
                                <input type="text" value={editingRoom.guest_name || ''} onChange={e => setEditingRoom({ ...editingRoom, guest_name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-400 outline-none" /></div>
                            <div><label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Welcome Message</label>
                                <textarea rows={2} value={editingRoom.custom_welcome_message || ''} onChange={e => setEditingRoom({ ...editingRoom, custom_welcome_message: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-teal-400 outline-none resize-none" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Check-In</label>
                                    <input type="date" value={editingRoom.checkin_date || ''} onChange={e => setEditingRoom({ ...editingRoom, checkin_date: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" /></div>
                                <div><label className="block text-[10px] font-medium text-rose-500 uppercase tracking-wider mb-1">Check-Out</label>
                                    <input type="date" value={editingRoom.checkout_date || ''} onChange={e => setEditingRoom({ ...editingRoom, checkout_date: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-rose-600 font-semibold" /></div>
                            </div>
                            <div className="pt-3 border-t border-slate-100">
                                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">TV Access PIN</label>
                                <input type="text" value={editingRoom.pin || ''} onChange={e => setEditingRoom({ ...editingRoom, pin: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-mono tracking-widest outline-none" />
                            </div>
                            <div className="space-y-2 pt-3 border-t border-slate-100">
                                <button onClick={() => { setShowPairModal(true); setPairCode(''); setPairResult(null); }} className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border border-indigo-200">
                                    <Monitor size={16} /> 📺 Pair STB to Room
                                </button>
                                <button onClick={deleteRoom} className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-sm font-medium flex items-center justify-center gap-2 border border-rose-200">
                                    <Trash2 size={16} /> Delete Room
                                </button>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                            <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                                {saving ? 'Saving...' : <><Save size={16} /> Save Configuration</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showPairModal && editingRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden">
                        <div className="p-5 border-b bg-indigo-50 flex items-center justify-between">
                            <div><h3 className="font-medium text-slate-800">Pair STB — Room {editingRoom.room_code}</h3>
                                <p className="text-xs text-slate-500 mt-1">Enter the 6-char code on the TV screen</p></div>
                            <button onClick={() => setShowPairModal(false)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400"><X size={16} /></button>
                        </div>
                        <div className="p-6">
                            <input type="text" value={pairCode} onChange={e => setPairCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                                placeholder="ABC123" maxLength={6} autoFocus
                                className="w-full px-6 py-4 text-center text-2xl font-medium font-mono tracking-[0.5em] bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                                onKeyDown={e => { if (e.key === 'Enter' && pairCode.length === 6) handlePairSTB(); }} />
                            {pairResult === 'success' && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-3 text-emerald-800 text-sm font-medium">✓ STB Paired Successfully!</div>}
                            {pairResult === 'error' && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-3 text-red-800 text-sm font-medium">Invalid code. Try again.</div>}
                            <div className="flex gap-3 mt-4">
                                <button onClick={() => setShowPairModal(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold">Cancel</button>
                                <button onClick={handlePairSTB} disabled={pairLoading || pairCode.length < 6 || pairResult === 'success'} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                                    {pairLoading ? 'Pairing...' : '📺 Pair Device'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showAddRoom && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-96 overflow-hidden">
                        <div className="p-5 border-b bg-teal-50 flex items-center justify-between">
                            <div><h3 className="font-medium text-slate-800">Add Room</h3><p className="text-xs text-slate-500 mt-1">Create a room code and initial TV PIN.</p></div>
                            <button onClick={() => setShowAddRoom(false)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-400"><X size={16} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Room Code</label>
                                <input value={newRoomCode} onChange={e => setNewRoomCode(e.target.value)} placeholder="101" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">TV PIN</label>
                                <input value={newRoomPin} onChange={e => setNewRoomPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))} placeholder="1234" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-teal-500" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowAddRoom(false)} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold">Cancel</button>
                                <button onClick={createRoom} disabled={!newRoomCode.trim() || newRoomPin.length < 4} className="flex-1 py-3 bg-teal-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">Create</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </StaffLayout>
    );
}
