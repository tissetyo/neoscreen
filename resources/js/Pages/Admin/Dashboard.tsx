import StaffLayout from '@/Layouts/StaffLayout';
import { Head } from '@inertiajs/react';
import { Hotel, Users, BedDouble, CheckCircle, BarChart3, ArrowUpRight, CreditCard, Router, Wifi } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface HotelItem { id: string; name: string; slug: string; location: string | null; is_active: boolean; rooms_count: number; created_at: string; }
interface Props {
    totalHotels: number;
    totalRooms: number;
    totalUsers: number;
    activeHotels: number;
    pairedStbs: number;
    onlineStbs: number;
    overdueHotels: number;
    monthlyRecurring: number;
    hotels: HotelItem[];
}

export default function AdminDashboard({ totalHotels, totalRooms, totalUsers, activeHotels, pairedStbs, onlineStbs, overdueHotels, monthlyRecurring, hotels }: Props) {
    const stats = [
        { label: 'Total Hotels', value: totalHotels, icon: Hotel, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Active Hotels', value: activeHotels, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Total Rooms', value: totalRooms, icon: BedDouble, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Staff Accounts', value: totalUsers, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'Paired STBs', value: pairedStbs, icon: Router, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'Online STBs', value: onlineStbs, icon: Wifi, color: 'text-teal-600', bg: 'bg-teal-50' },
        { label: 'Billing Alerts', value: overdueHotels, icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Est. MRR', value: `IDR ${Number(monthlyRecurring || 0).toLocaleString()}`, icon: BarChart3, color: 'text-slate-700', bg: 'bg-slate-100' },
    ];

    return (
        <StaffLayout header="Platform Overview">
            <Head title="Admin Dashboard" />
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-medium text-slate-800">Platform Overview</h1>
                    <p className="text-slate-500 text-sm mt-1">Monitor all hotels and accounts across the platform.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    {stats.map(s => (
                        <div key={s.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-4`}>
                                <s.icon size={22} className={s.color} />
                            </div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
                            <p className="text-3xl font-semibold text-slate-900">{s.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="font-medium text-slate-800 flex items-center gap-2"><BarChart3 size={18} className="text-rose-500" /> Hotels</h2>
                        <Link href="/admin/hotels" className="text-xs font-medium text-rose-500 hover:text-rose-700 flex items-center gap-1 uppercase tracking-wider">
                            Manage all <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    <table className="w-full text-sm">
                        <thead><tr className="bg-slate-50 text-slate-400 text-xs font-medium uppercase tracking-wider">
                            <th className="text-left px-6 py-3">Hotel</th>
                            <th className="text-left px-6 py-3 hidden md:table-cell">Location</th>
                            <th className="text-left px-6 py-3">Rooms</th>
                            <th className="text-left px-6 py-3">Status</th>
                            <th className="text-right px-6 py-3">Action</th>
                        </tr></thead>
                        <tbody>
                            {hotels.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-slate-400">No hotels yet</td></tr>}
                            {hotels.slice(0, 5).map(h => (
                                <tr key={h.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-900">{h.name}</p>
                                        <p className="text-xs text-slate-400">/{h.slug}</p>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 hidden md:table-cell">{h.location || '-'}</td>
                                    <td className="px-6 py-4 text-slate-700 font-medium">{h.rooms_count}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase ${h.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {h.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <a href={`/${h.slug}/frontoffice`} target="_blank" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">Manage →</a>
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
