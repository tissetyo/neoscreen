import StaffLayout from '@/Layouts/StaffLayout';
import { Head } from '@inertiajs/react';
import { 
    BedDouble, 
    MessageSquare, 
    Bell, 
    Clock, 
    ChefHat, 
    ArrowUpRight,
    Users,
    Activity
} from 'lucide-react';

export default function Dashboard({ slug }: { slug: string }) {
    const stats = [
        { label: 'Occupied Rooms', value: '42', icon: BedDouble, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+5%' },
        { label: 'Unread Messages', value: '3', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-100', trend: 'New' },
        { label: 'Active Alarms', value: '12', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100', trend: '-2' },
        { label: 'Service Requests', value: '8', icon: ChefHat, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '4 Pending' },
    ];

    return (
        <StaffLayout>
            <Head title="Staff Dashboard" />

            <div className="space-y-8">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-2xl font-medium text-slate-900">Morning, Team!</h1>
                    <p className="text-slate-500">Here's what's happening at the hotel today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`${stat.bg} p-3 rounded-2xl`}>
                                    <stat.icon size={24} className={stat.color} />
                                </div>
                                <span className={`text-xs font-medium px-2 py-1 rounded-lg ${stat.trend.includes('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {stat.trend}
                                </span>
                            </div>
                            <h3 className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">{stat.label}</h3>
                            <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Service Requests */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                <h2 className="font-medium text-slate-900 flex items-center gap-2">
                                    <Activity size={20} className="text-[#d4af37]" />
                                    Active Service Requests
                                </h2>
                                <button className="text-xs font-medium text-[#d4af37] hover:underline flex items-center gap-1 uppercase tracking-widest">
                                    View All <ArrowUpRight size={14} />
                                </button>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-medium text-slate-400">
                                                {100 + i}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">Room 10{i} — Extra Towels</p>
                                                <p className="text-xs text-slate-500">Requested 12 mins ago</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-lg uppercase tracking-wider">
                                            Pending
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Chat */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                            <div className="p-6 border-b border-slate-50">
                                <h2 className="font-medium text-slate-900 flex items-center gap-2">
                                    <MessageSquare size={20} className="text-[#d4af37]" />
                                    Recent Guest Messages
                                </h2>
                            </div>
                            <div className="p-6 flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                    <MessageSquare size={32} className="text-slate-200" />
                                </div>
                                <p className="text-slate-900 font-medium">No new messages</p>
                                <p className="text-slate-500 text-sm">All guest inquiries have been resolved.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Staff Online / Notifications */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="font-medium text-slate-900 mb-6 flex items-center gap-2">
                                <Bell size={20} className="text-[#d4af37]" />
                                System Notifications
                            </h2>
                            <div className="space-y-4">
                                <div className="flex gap-4 p-3 bg-red-50 rounded-2xl border border-red-100">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-red-900">Emergency Alert</p>
                                        <p className="text-[11px] text-red-700">Fire alarm test scheduled for 2 PM today.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                                    <div>
                                        <p className="text-xs font-medium text-blue-900">Software Update</p>
                                        <p className="text-[11px] text-blue-700">STB firmware update successful for all rooms.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0f172a] p-6 rounded-3xl shadow-xl text-white">
                            <h2 className="font-medium text-[#f3e5ab] mb-6 flex items-center gap-2">
                                <Users size={20} />
                                Staff on Duty
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { name: 'John Doe', role: 'Manager' },
                                    { name: 'Jane Smith', role: 'Reception' },
                                    { name: 'Mike Johnson', role: 'Housekeeping' }
                                ].map((staff) => (
                                    <div key={staff.name} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-medium text-[10px]">
                                            {staff.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium">{staff.name}</p>
                                            <p className="text-[10px] text-white/40">{staff.role}</p>
                                        </div>
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
}
