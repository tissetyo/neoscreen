import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';

interface User { id: string; name: string; email: string; role: string; is_suspended: boolean; hotel: { name: string; slug: string } | null; created_at: string; }
interface Hotel { id: string; name: string; slug: string; }
interface Props { users: User[]; hotels: Hotel[]; }

export default function AdminAccounts({ users: initialUsers, hotels }: Props) {
    const pageUsers = usePage<Props>().props.users;
    const [users, setUsers] = useState(initialUsers);
    useEffect(() => {
        setUsers(pageUsers);
    }, [pageUsers]);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'manager' | 'frontoffice'>('frontoffice');
    const [hotelId, setHotelId] = useState(hotels[0]?.id || '');
    const [saving, setSaving] = useState(false);

    const create = () => {
        if (!name.trim() || !email.trim() || !password.trim() || !hotelId) return;
        setSaving(true);
        router.post('/admin/accounts', { name, email, password, role, hotel_id: hotelId }, {
            onSuccess: () => { setName(''); setEmail(''); setPassword(''); setRole('frontoffice'); setShowForm(false); setSaving(false); },
            onError: () => setSaving(false),
        });
    };

    const suspend = (userId: string) => {
        router.patch(`/admin/accounts/${userId}/suspend`, {}, {
            onSuccess: () => setUsers(users.map(u => u.id === userId ? { ...u, is_suspended: !u.is_suspended } : u)),
            preserveScroll: true,
        });
    };

    const ROLE_STYLES: Record<string, string> = {
        manager: 'bg-blue-100 text-blue-700',
        frontoffice: 'bg-slate-100 text-slate-600',
    };

    return (
        <StaffLayout header="Accounts">
            <Head title="Accounts" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div><h1 className="text-xl font-medium text-slate-800">Account Management</h1><p className="text-sm text-slate-500 mt-0.5">Create and manage hotel staff accounts.</p></div>
                    <button onClick={() => setShowForm(!showForm)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium ${showForm ? 'bg-slate-200 text-slate-700' : 'bg-rose-500 hover:bg-rose-600 text-white'} transition-colors`}>
                        {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? 'Cancel' : 'Create Account'}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h2 className="font-medium text-slate-800 mb-5">New Staff Account</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-400" /></div>
                            <div><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Email *</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="staff@hotel.com" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-400" /></div>
                            <div><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Password *</label>
                                <input type="text" value={password} onChange={e => setPassword(e.target.value)} placeholder="min. 6 characters" className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-400" /></div>
                            <div><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Hotel *</label>
                                <select value={hotelId} onChange={e => setHotelId(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-rose-400">
                                    {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select></div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Role *</label>
                                <div className="flex gap-3">
                                    <button onClick={() => setRole('frontoffice')} className={`px-5 py-2 rounded-xl text-sm font-medium border transition-colors ${role === 'frontoffice' ? 'bg-teal-50 border-teal-300 text-teal-800' : 'bg-white border-slate-200 text-slate-500'}`}>🏠 Front Office</button>
                                    <button onClick={() => setRole('manager')} className={`px-5 py-2 rounded-xl text-sm font-medium border transition-colors ${role === 'manager' ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-slate-200 text-slate-500'}`}>👔 Manager</button>
                                </div>
                            </div>
                        </div>
                        <button onClick={create} disabled={saving || !name.trim() || !email.trim() || !password.trim() || !hotelId}
                            className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                            {saving ? 'Creating...' : 'Create Account'}
                        </button>
                    </div>
                )}

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-slate-50 text-slate-400 text-xs font-medium uppercase tracking-wider">
                            <th className="text-left px-6 py-4">Name</th>
                            <th className="text-left px-6 py-4 hidden md:table-cell">Email</th>
                            <th className="text-left px-6 py-4">Role</th>
                            <th className="text-left px-6 py-4 hidden lg:table-cell">Hotel</th>
                            <th className="text-left px-6 py-4">Status</th>
                            <th className="text-right px-6 py-4">Action</th>
                        </tr></thead>
                        <tbody>
                            {users.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-slate-400">No accounts yet</td></tr>}
                            {users.map(u => (
                                <tr key={u.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-800">{u.name}</td>
                                    <td className="px-6 py-4 text-slate-500 hidden md:table-cell">{u.email}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase ${ROLE_STYLES[u.role] || ''}`}>{u.role}</span></td>
                                    <td className="px-6 py-4 text-slate-600 hidden lg:table-cell">{u.hotel?.name || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase ${u.is_suspended ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {u.is_suspended ? 'Suspended' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => suspend(u.id)} className={`text-xs font-medium transition-colors ${u.is_suspended ? 'text-emerald-600 hover:text-emerald-800' : 'text-red-400 hover:text-red-600'}`}>
                                            {u.is_suspended ? 'Reactivate' : 'Suspend'}
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
