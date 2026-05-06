import StaffLayout from '@/Layouts/StaffLayout';
import { Head, Link } from '@inertiajs/react';
import {
    MessageSquare,
    ChefHat,
    Tag,
    BarChart3,
    BedDouble,
    Wrench,
    Bell,
    Clock,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ComposedChart,
} from 'recharts';

interface DayCount {
    date: string;
    count: number;
}

interface TopService {
    name: string;
    count: number;
}

interface Props {
    slug: string;
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
    unreadChats: number;
    pendingRequests: number;
    totalPromos: number;
    totalServices: number;
    serviceRequestsByDay: DayCount[];
    chatGuestByDay: DayCount[];
    chatStaffByDay: DayCount[];
    notificationsSentByDay: DayCount[];
    notificationsReadByDay: DayCount[];
    topServices: TopService[];
    requestStatusBreakdown: Record<string, number>;
    avgMinutesToStaffAck: number | null;
    pendingRequestsWithoutStaffAck: number;
    guestAcknowledgementPercent: number;
    alarmsAcknowledged7d: number;
    alarmsActive: number;
    notificationsPendingStaffAck7d: number;
}

const fmtDay = (d: string) => {
    const [y, m, day] = d.split('-');
    return `${m}/${day}`;
};

export default function Analytics({
    slug,
    totalRooms,
    occupiedRooms,
    occupancyRate,
    unreadChats,
    pendingRequests,
    totalPromos,
    totalServices,
    serviceRequestsByDay,
    chatGuestByDay,
    chatStaffByDay,
    notificationsSentByDay,
    notificationsReadByDay,
    topServices,
    requestStatusBreakdown,
    avgMinutesToStaffAck,
    pendingRequestsWithoutStaffAck,
    guestAcknowledgementPercent,
    alarmsAcknowledged7d,
    alarmsActive,
    notificationsPendingStaffAck7d,
}: Props) {
    const vacantRooms = totalRooms - occupiedRooms;

    const chatMerged = chatGuestByDay.map((d, i) => ({
        date: fmtDay(d.date),
        guest: d.count,
        staff: chatStaffByDay[i]?.count ?? 0,
    }));

    const notifMerged = notificationsSentByDay.map((d, i) => ({
        date: fmtDay(d.date),
        sent: d.count,
        read: notificationsReadByDay[i]?.count ?? 0,
    }));

    const svcSeries = serviceRequestsByDay.map((d) => ({
        date: fmtDay(d.date),
        requests: d.count,
    }));

    const stats = [
        { label: 'Occupancy Rate', value: `${occupancyRate}%`, sub: `${occupiedRooms} occupied / ${vacantRooms} vacant`, icon: BedDouble, color: 'text-teal-600', bg: 'bg-teal-50', href: `/${slug}/frontoffice/rooms` },
        { label: 'Unread Chats', value: unreadChats, sub: 'Guest messages waiting', icon: MessageSquare, color: 'text-rose-600', bg: 'bg-rose-50', href: `/${slug}/frontoffice/chat` },
        { label: 'Pending Requests', value: pendingRequests, sub: 'Service requests open', icon: ChefHat, color: 'text-amber-600', bg: 'bg-amber-50', href: `/${slug}/frontoffice/requests` },
        { label: 'Active Promos', value: totalPromos, sub: 'Displayed on TVs', icon: Tag, color: 'text-pink-600', bg: 'bg-pink-50', href: `/${slug}/frontoffice/promos` },
        { label: 'Total Rooms', value: totalRooms, sub: 'In inventory', icon: BedDouble, color: 'text-blue-600', bg: 'bg-blue-50', href: `/${slug}/frontoffice/rooms` },
        { label: 'Services', value: totalServices, sub: 'Available categories', icon: Wrench, color: 'text-violet-600', bg: 'bg-violet-50', href: `/${slug}/frontoffice/services` },
    ];

    const trustTiles = [
        {
            label: 'Avg. minutes to staff ack',
            value: avgMinutesToStaffAck !== null ? `${avgMinutesToStaffAck} min` : '—',
            sub: 'Service requests (14d, acknowledged)',
            icon: TrendingUp,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            href: `/${slug}/frontoffice/requests`,
        },
        {
            label: 'Pending without staff ack',
            value: pendingRequestsWithoutStaffAck,
            sub: 'Still waiting for “Acknowledge receipt”',
            icon: Users,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            href: `/${slug}/frontoffice/requests`,
        },
        {
            label: 'Guest ack on completed',
            value: `${guestAcknowledgementPercent}%`,
            sub: 'TV guest-ack API usage',
            icon: ChefHat,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            href: `/${slug}/frontoffice/guide#operations`,
        },
        {
            label: 'Notifications (7d)',
            value: notificationsPendingStaffAck7d,
            sub: 'Awaiting staff “reviewed” log',
            icon: Bell,
            color: 'text-amber-700',
            bg: 'bg-amber-50',
            href: `/${slug}/frontoffice/notifications`,
        },
        {
            label: 'Alarms ack (7d)',
            value: alarmsAcknowledged7d,
            sub: `Active now: ${alarmsActive}`,
            icon: Clock,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            href: `/${slug}/frontoffice/alarms`,
        },
    ];

    return (
        <StaffLayout header="Analytics">
            <Head title="Analytics" />
            <div className="space-y-10">
                <div>
                    <h1 className="text-xl font-medium text-slate-800">Hotel analytics</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Fourteen-day trends plus trust signals tied to acknowledgements.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                    {stats.map((s) => (
                        <Link
                            key={s.label}
                            href={s.href}
                            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
                        >
                            <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                                <s.icon size={22} className={s.color} />
                            </div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                            <p className="text-3xl font-semibold text-slate-900 mb-1">{s.value}</p>
                            <p className="text-xs text-slate-500">{s.sub}</p>
                        </Link>
                    ))}
                </div>

                <div>
                    <h2 className="text-sm font-medium text-slate-400 uppercase tracking-widest mb-4">Trust & acknowledgement KPIs</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trustTiles.map((t) => (
                            <Link
                                key={t.label}
                                href={t.href}
                                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-teal-200 hover:shadow-md transition-all"
                            >
                                <div className={`w-10 h-10 ${t.bg} rounded-xl flex items-center justify-center mb-3`}>
                                    <t.icon size={20} className={t.color} />
                                </div>
                                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.label}</p>
                                <p className="text-2xl font-semibold text-slate-900 mt-1">{t.value}</p>
                                <p className="text-xs text-slate-500 mt-1">{t.sub}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-medium text-slate-800 mb-1 flex items-center gap-2">
                            <BarChart3 size={18} className="text-teal-500" /> Service requests per day
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">Last 14 days — volume only; drill into Requests for detail.</p>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={svcSeries}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="requests" name="Requests" stroke="#14b8a6" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-medium text-slate-800 mb-1 flex items-center gap-2">
                            <MessageSquare size={18} className="text-teal-500" /> Chat volume (guest vs staff)
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">Messages created per day.</p>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chatMerged}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="guest" name="Guest" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="staff" name="Staff" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-medium text-slate-800 mb-1 flex items-center gap-2">
                            <Bell size={18} className="text-amber-500" /> Notifications sent vs guest-read
                        </h3>
                        <p className="text-xs text-slate-500 mb-4">Read counts use notifications marked is_read (approximation by created date).</p>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={notifMerged}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="sent" name="Sent" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="read" name="Guest read" stroke="#10b981" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h3 className="font-medium text-slate-800 mb-4">Top requested services (14d)</h3>
                        {topServices.length === 0 ? (
                            <p className="text-sm text-slate-400">No linked service data yet.</p>
                        ) : (
                            <ul className="space-y-3">
                                {topServices.map((s) => (
                                    <li key={s.name} className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-slate-700">{s.name}</span>
                                        <span className="font-semibold text-teal-600 tabular-nums">{s.count}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-6 pt-4 border-t border-slate-100">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Status mix (all time)</p>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(requestStatusBreakdown).map(([status, count]) => (
                                    <span key={status} className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600 capitalize">
                                        {status.replace('_', ' ')}: {count}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h2 className="font-medium text-slate-800 flex items-center gap-2">
                                <BarChart3 size={18} className="text-teal-500" /> Occupancy overview
                            </h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {occupiedRooms} of {totalRooms} rooms currently occupied
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-semibold text-teal-600">{occupancyRate}%</p>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Occupancy</p>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-5 overflow-hidden">
                        <div
                            className="h-5 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-500 flex items-center justify-end pr-3"
                            style={{ width: `${Math.max(occupancyRate, 2)}%` }}
                        >
                            {occupancyRate > 10 && <span className="text-[10px] text-white font-medium">{occupancyRate}%</span>}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        {[
                            { label: 'Occupied', value: occupiedRooms, color: 'text-teal-600 bg-teal-50 border-teal-100' },
                            { label: 'Vacant', value: vacantRooms, color: 'text-slate-600 bg-slate-50 border-slate-100' },
                            { label: 'Total', value: totalRooms, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                        ].map((item) => (
                            <div key={item.label} className={`${item.color} border rounded-2xl p-4 text-center`}>
                                <p className="text-2xl font-semibold">{item.value}</p>
                                <p className="text-xs font-medium uppercase tracking-wider mt-1">{item.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
}
