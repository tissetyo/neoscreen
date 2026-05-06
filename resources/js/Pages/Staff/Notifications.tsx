import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCircle2 } from 'lucide-react';

interface Room {
    id: string;
    room_code: string;
}
interface Notification {
    id: string;
    room_id: string | null;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    staff_acknowledged_at: string | null;
    staff_acknowledger?: { name: string } | null;
}
interface Props {
    slug: string;
    notifications: Notification[];
    rooms: Room[];
}

export default function Notifications({ slug, notifications: initialNotifs, rooms }: Props) {
    const pageNotifs = usePage<Props>().props.notifications;
    const [notifications, setNotifications] = useState(initialNotifs);
    useEffect(() => {
        setNotifications(pageNotifs);
    }, [pageNotifs]);

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [targetRoom, setTargetRoom] = useState('all');
    const [sending, setSending] = useState(false);

    const getRoomCode = (roomId: string | null) => {
        if (!roomId) return 'All Rooms';
        return `Room ${rooms.find((r) => r.id === roomId)?.room_code || '?'}`;
    };

    const send = () => {
        if (!title.trim()) return;
        setSending(true);
        router.post(
            `/${slug}/frontoffice/notifications`,
            {
                title,
                body,
                room_id: targetRoom === 'all' ? null : targetRoom,
            },
            {
                onSuccess: () => {
                    setTitle('');
                    setBody('');
                    setSending(false);
                },
                onError: () => setSending(false),
                preserveScroll: true,
            }
        );
    };

    const remove = (id: string) => {
        if (!confirm('Delete this notification?')) return;
        router.delete(`/${slug}/frontoffice/notifications/${id}`, {
            onSuccess: () => setNotifications(notifications.filter((n) => n.id !== id)),
            preserveScroll: true,
        });
    };

    const acknowledgeStaff = (id: string) => {
        router.patch(`/${slug}/frontoffice/notifications/${id}/acknowledge`, {}, { preserveScroll: true });
    };

    return (
        <StaffLayout header="Notifications">
            <Head title="Notifications" />
            <div className="space-y-8">
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-sm text-amber-950">
                    <p className="font-medium text-amber-900 mb-1">Staff acknowledgement</p>
                    <p>
                        After you verify a broadcast reached operations (printed log, handoff, etc.), press{' '}
                        <strong>Staff reviewed</strong> so reporting shows closed loops — separate from guest “read” on the TV.
                    </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h2 className="font-medium text-slate-800 mb-5 flex items-center gap-2">
                        <Bell size={18} className="text-amber-500" /> Send notification
                    </h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">To</label>
                            <select
                                value={targetRoom}
                                onChange={(e) => setTargetRoom(e.target.value)}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 bg-white"
                            >
                                <option value="all">All Rooms (Broadcast)</option>
                                {rooms.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        Room {r.room_code}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                                placeholder="Notification title..."
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400"
                            />
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Body</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            maxLength={500}
                            rows={3}
                            placeholder="Message body (optional)..."
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-400 resize-none"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={send}
                        disabled={sending || !title.trim()}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                        {sending ? 'Sending...' : 'Send Notification'}
                    </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-100 font-medium text-slate-800">History</div>
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500">
                                <th className="text-left px-5 py-3 font-semibold">Target</th>
                                <th className="text-left px-5 py-3 font-semibold">Title</th>
                                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Body</th>
                                <th className="text-left px-5 py-3 font-semibold hidden lg:table-cell">Sent</th>
                                <th className="text-left px-5 py-3 font-semibold">Guest read</th>
                                <th className="text-left px-5 py-3 font-semibold">Staff ack</th>
                                <th className="text-right px-5 py-3 font-semibold" />
                            </tr>
                        </thead>
                        <tbody>
                            {notifications.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-slate-400">
                                        No notifications yet
                                    </td>
                                </tr>
                            )}
                            {notifications.map((n) => (
                                <tr key={n.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3 font-medium text-slate-700">{getRoomCode(n.room_id)}</td>
                                    <td className="px-5 py-3 font-semibold text-slate-800">{n.title}</td>
                                    <td className="px-5 py-3 text-slate-500 max-w-[180px] truncate hidden md:table-cell">{n.message || '-'}</td>
                                    <td className="px-5 py-3 text-slate-400 text-xs hidden lg:table-cell">
                                        {new Date(n.created_at).toLocaleString()}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase ${
                                                n.is_read ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                            }`}
                                        >
                                            {n.is_read ? 'Read' : 'Unread'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        {n.staff_acknowledged_at ? (
                                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                                                <CheckCircle2 size={14} /> {n.staff_acknowledger?.name || 'Staff'}
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => acknowledgeStaff(n.id)}
                                                className="text-[10px] font-medium uppercase px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-teal-100 hover:text-teal-800 transition-colors"
                                            >
                                                Staff reviewed
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <button type="button" onClick={() => remove(n.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
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
