import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface Room {
    id: string;
    room_code: string;
    guest_name: string | null;
}
interface Alarm {
    id: string;
    room_id: string;
    alarm_time: string;
    is_active: boolean;
    acknowledged_at: string | null;
    acknowledger?: { name: string } | null;
}
interface Props {
    slug: string;
    alarms: Alarm[];
    rooms: Room[];
}

export default function Alarms({ slug, alarms: initialAlarms, rooms }: Props) {
    const pageAlarms = usePage<Props>().props.alarms;
    const [alarms, setAlarms] = useState(initialAlarms);
    useEffect(() => {
        setAlarms(pageAlarms);
    }, [pageAlarms]);

    const getRoom = (id: string) => rooms.find((r) => r.id === id);
    const isUpcoming = (time: string) => {
        const diff = new Date(time).getTime() - Date.now();
        return diff > 0 && diff < 30 * 60 * 1000;
    };

    const acknowledge = (alarmId: string) => {
        router.patch(`/${slug}/frontoffice/alarms/${alarmId}/acknowledge`, {}, {
            onSuccess: () => setAlarms(alarms.map((a) => (a.id === alarmId ? { ...a, is_active: false, acknowledged_at: new Date().toISOString() } : a))),
            preserveScroll: true,
        });
    };

    const pending = alarms.filter((a) => a.is_active);
    const done = alarms.filter((a) => !a.is_active);

    const TableSection = ({ items, title, showAction }: { items: Alarm[]; title: string; showAction: boolean }) => (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 font-medium text-slate-800">
                {title} <span className="text-slate-400 font-normal text-sm">({items.length})</span>
            </div>
            <div className="p-4 bg-rose-50/80 border-b border-rose-100 text-sm text-rose-900">
                <strong>Trust:</strong> marking an alarm stores who acknowledged it and when — visible in the history table.
            </div>
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-medium uppercase tracking-wider">
                        <th className="text-left px-5 py-3">Room</th>
                        <th className="text-left px-5 py-3">Guest</th>
                        <th className="text-left px-5 py-3">Time</th>
                        <th className="text-left px-5 py-3">Status</th>
                        {!showAction && <th className="text-left px-5 py-3 hidden md:table-cell">Acknowledged</th>}
                        {showAction && <th className="text-left px-5 py-3">Action</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 && (
                        <tr>
                            <td colSpan={showAction ? 5 : 6} className="text-center py-10 text-slate-400">
                                No alarms
                            </td>
                        </tr>
                    )}
                    {items.map((a) => {
                        const room = getRoom(a.room_id);
                        return (
                            <tr key={a.id} className={`border-t border-slate-50 hover:bg-slate-50 ${isUpcoming(a.alarm_time) && showAction ? 'bg-amber-50' : ''}`}>
                                <td className="px-5 py-3 font-medium text-slate-800">{room?.room_code || '-'}</td>
                                <td className="px-5 py-3 text-slate-600">{room?.guest_name || '-'}</td>
                                <td className="px-5 py-3 text-slate-700 font-medium">{new Date(a.alarm_time).toLocaleString()}</td>
                                <td className="px-5 py-3">
                                    {isUpcoming(a.alarm_time) && showAction ? (
                                        <span className="px-2 py-1 rounded-lg text-[10px] font-medium bg-amber-100 text-amber-700 uppercase">Upcoming</span>
                                    ) : (
                                        <span
                                            className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase ${
                                                !a.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            {!a.is_active ? 'Done' : 'Pending'}
                                        </span>
                                    )}
                                </td>
                                {!showAction && (
                                    <td className="px-5 py-3 text-xs text-slate-600 hidden md:table-cell">
                                        {a.acknowledged_at ? (
                                            <span className="flex items-center gap-1 font-semibold text-emerald-700">
                                                <CheckCircle2 size={14} />
                                                {new Date(a.acknowledged_at).toLocaleString()} — {a.acknowledger?.name || 'Staff'}
                                            </span>
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                )}
                                {showAction && (
                                    <td className="px-5 py-3">
                                        <button
                                            type="button"
                                            onClick={() => acknowledge(a.id)}
                                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-medium transition-colors"
                                        >
                                            Mark as called ✓
                                        </button>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    return (
        <StaffLayout header="Alarm Manager">
            <Head title="Alarms" />
            <div className="space-y-6">
                <TableSection items={pending} title="Pending Alarms" showAction={true} />
                {done.length > 0 && <TableSection items={done} title="Acknowledged" showAction={false} />}
            </div>
        </StaffLayout>
    );
}
