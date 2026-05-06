import StaffLayout from '@/Layouts/StaffLayout';
import { Head, Link, router } from '@inertiajs/react';
import { MessageSquare, Clock, ChefHat, Building2, Bell, ClipboardList, X } from 'lucide-react';

interface Props {
    slug: string;
    totalRooms: number;
    occupiedRooms: number;
    occupancyRate: number;
    unreadChats: number;
    activeAlarms: number;
    pendingRequests: number;
    onboardingBanner?: {
        dismissed: boolean;
        percentComplete: number;
    };
}

export default function StaffHome({
    slug,
    totalRooms,
    occupiedRooms,
    occupancyRate,
    unreadChats,
    activeAlarms,
    pendingRequests,
    onboardingBanner,
}: Props) {
    const actionCards = [
        {
            label: 'Unread Messages',
            value: unreadChats,
            icon: MessageSquare,
            href: `/${slug}/frontoffice/chat`,
            color: 'text-teal-600',
            bg: 'bg-teal-50',
            border: 'hover:border-teal-300',
            pulse: unreadChats > 0,
        },
        {
            label: 'Pending Requests',
            value: pendingRequests,
            icon: ChefHat,
            href: `/${slug}/frontoffice/requests`,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            border: 'hover:border-violet-300',
        },
        {
            label: 'Active Alarms',
            value: activeAlarms,
            icon: Clock,
            href: `/${slug}/frontoffice/alarms`,
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            border: 'hover:border-rose-300',
        },
    ];

    return (
        <StaffLayout header="Front Desk Overview">
            <Head title="Front Desk" />

            <div className="space-y-8">
                {onboardingBanner && !onboardingBanner.dismissed && onboardingBanner.percentComplete < 100 && (
                    <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <p className="font-medium text-lg">Finish property setup</p>
                                <p className="text-teal-100 text-sm mt-0.5">
                                    {onboardingBanner.percentComplete}% complete — connect rooms, TVs, and staff workflows.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Link
                                href={`/${slug}/frontoffice/onboarding`}
                                className="px-4 py-2.5 bg-white text-teal-800 rounded-xl text-sm font-medium hover:bg-teal-50 transition-colors"
                            >
                                Continue checklist
                            </Link>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!confirm('Dismiss this banner? You can reopen Setup checklist from the sidebar.')) return;
                                    router.patch(`/${slug}/frontoffice/onboarding/dismiss`, {}, { preserveScroll: true });
                                }}
                                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                                aria-label="Dismiss banner"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-medium text-slate-800">Front Desk Overview</h1>
                        <p className="text-slate-500 text-sm mt-1">Here is what is happening right now.</p>
                    </div>
                    {/* Occupancy ring */}
                    <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex items-center gap-5 shadow-sm">
                        <div className="text-right">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Occupancy</p>
                            <p className="text-2xl font-semibold text-slate-800">{occupancyRate}%</p>
                            <p className="text-xs text-slate-500">{occupiedRooms} / {totalRooms} rooms</p>
                        </div>
                        <div className="relative w-14 h-14">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#14b8a6" strokeWidth="3.5"
                                    strokeDasharray={`${occupancyRate} ${100 - occupancyRate}`}
                                    strokeLinecap="round" />
                            </svg>
                            <Building2 size={16} className="absolute inset-0 m-auto text-teal-600" />
                        </div>
                    </div>
                </div>

                {/* Action Cards */}
                <div>
                    <h2 className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">Requires Attention</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {actionCards.map((card) => (
                            <Link
                                key={card.label}
                                href={card.href}
                                className={`bg-white rounded-2xl p-6 border border-slate-200 shadow-sm ${card.border} hover:shadow-md transition-all relative overflow-hidden group`}
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 ${card.bg} rounded-full blur-[50px] opacity-60 group-hover:opacity-100 transition-opacity`} />
                                <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center mb-4 border border-transparent relative z-10`}>
                                    <card.icon size={24} className={card.color} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-4xl font-semibold text-slate-800 mb-1">{card.value}</h3>
                                    <p className="text-slate-500 font-medium text-sm">{card.label}</p>
                                </div>
                                {card.pulse && card.value > 0 && (
                                    <div className="absolute top-5 right-5 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white z-10" />
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="font-medium text-slate-800 mb-5">Quick Actions</h3>
                        <div className="space-y-3">
                            <Link href={`/${slug}/frontoffice/notifications`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <Bell size={18} />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700 text-sm group-hover:text-teal-700 transition-colors">Broadcast Notification</p>
                                    <p className="text-xs text-slate-500">Send an alert to room TVs</p>
                                </div>
                            </Link>
                            <Link href={`/${slug}/frontoffice/rooms`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <Building2 size={18} />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700 text-sm group-hover:text-teal-700 transition-colors">Manage Rooms</p>
                                    <p className="text-xs text-slate-500">Check-in / check-out guests</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    <div className="bg-[#0B1120] rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-10" />
                        <h3 className="font-medium text-xl mb-2 relative z-10">Welcome to Neotiv</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6 relative z-10">
                            Manage all guest requests, messages, and alerts from one dashboard.
                        </p>
                        <div className="flex gap-4 relative z-10">
                            <div className="bg-white/10 border border-white/20 rounded-xl py-3 px-4">
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Total Rooms</p>
                                <p className="text-xl font-semibold">{totalRooms}</p>
                            </div>
                            <div className="bg-white/10 border border-white/20 rounded-xl py-3 px-4">
                                <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Occupied</p>
                                <p className="text-xl font-semibold">{occupiedRooms}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
}
