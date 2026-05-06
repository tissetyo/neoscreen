import StaffLayout from '@/Layouts/StaffLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

interface Room { id: string; room_code: string; guest_name?: string; }
interface Message { id: string; sender: 'guest' | 'staff'; message: string; is_read: boolean; created_at: string; }
interface Props { slug: string; rooms: Room[]; }

export default function Chat({ slug, rooms }: Props) {
    const [selectedRoom, setSelectedRoom] = useState<string | null>(rooms[0]?.id || null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEnd = useRef<HTMLDivElement>(null);

    const loadMessages = async (roomId: string) => {
        const res = await fetch(`/${slug}/frontoffice/chat/${roomId}/messages`);
        if (res.ok) setMessages(await res.json());
    };

    useEffect(() => {
        if (selectedRoom) {
            loadMessages(selectedRoom);
            const interval = setInterval(() => loadMessages(selectedRoom!), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedRoom]);

    useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const sendMessage = async () => {
        if (!newMsg.trim() || !selectedRoom) return;
        setSending(true);
        const msg = newMsg; setNewMsg('');
        const res = await fetch(`/${slug}/frontoffice/chat/${selectedRoom}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '' },
            body: JSON.stringify({ message: msg }),
        });
        if (res.ok) await loadMessages(selectedRoom);
        setSending(false);
    };

    return (
        <StaffLayout header="Guest Chat">
            <Head title="Chat" />
            <div className="flex h-[calc(100vh-140px)] gap-4">
                {/* Room list */}
                <div className="w-52 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
                    <div className="p-4 border-b border-slate-100 font-medium text-slate-700 text-sm">Rooms</div>
                    <div className="flex-1 overflow-y-auto">
                        {rooms.map(r => (
                            <button key={r.id} onClick={() => setSelectedRoom(r.id)}
                                className={`w-full text-left px-4 py-3 text-sm border-b border-slate-50 transition-colors ${selectedRoom === r.id ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}>
                                Room {r.room_code}
                            </button>
                        ))}
                        {rooms.length === 0 && <p className="p-4 text-sm text-slate-400 text-center">No rooms</p>}
                    </div>
                </div>

                {/* Chat window */}
                <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-100 font-medium text-slate-800 text-sm">
                        {selectedRoom ? `Room ${rooms.find(r => r.id === selectedRoom)?.room_code}` : 'Select a room'}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                        {messages.length === 0 && <p className="text-center text-slate-400 text-sm py-8">No messages yet</p>}
                        {messages.map(m => (
                            <div key={m.id} className={`flex ${m.sender === 'staff' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${m.sender === 'staff' ? 'bg-teal-500 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm'}`}>
                                    <p>{m.message}</p>
                                    <p className={`text-[10px] mt-1 ${m.sender === 'staff' ? 'text-teal-100' : 'text-slate-400'}`}>
                                        {m.sender === 'staff' ? 'Front Office' : (rooms.find(r => r.id === selectedRoom)?.guest_name || 'Guest')} · {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEnd} />
                    </div>
                    <div className="p-4 border-t border-slate-100 flex gap-3 bg-white">
                        <input type="text" value={newMsg} onChange={e => setNewMsg(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                            placeholder="Type a message to the guest..." disabled={!selectedRoom}
                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 disabled:opacity-50" />
                        <button onClick={sendMessage} disabled={!newMsg.trim() || sending || !selectedRoom}
                            className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50 transition-colors">
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
}
