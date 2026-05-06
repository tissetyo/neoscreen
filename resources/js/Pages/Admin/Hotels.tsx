import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, X, Tv2, Globe } from 'lucide-react';

interface HotelItem { id: string; name: string; slug: string; location: string | null; is_active: boolean; rooms_count: number; created_at: string; }
interface Props { hotels: HotelItem[]; }

export default function AdminHotels({ hotels: initialHotels }: Props) {
    const pageHotels = usePage<Props>().props.hotels;
    const [hotels, setHotels] = useState(initialHotels);
    useEffect(() => {
        setHotels(pageHotels);
    }, [pageHotels]);
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState('');
    const [slug, setSlugVal] = useState('');
    const [location, setLocation] = useState('');
    const [timezone, setTimezone] = useState('Asia/Jakarta');
    const [managerName, setManagerName] = useState('');
    const [managerEmail, setManagerEmail] = useState('');
    const [managerPassword, setManagerPassword] = useState('');
    const [saving, setSaving] = useState(false);

    const create = () => {
        if (!name.trim() || !slug.trim()) return;
        setSaving(true);
        router.post('/admin/hotels', { name, slug, location, timezone, manager_name: managerName, manager_email: managerEmail, manager_password: managerPassword }, {
            onSuccess: () => { setName(''); setSlugVal(''); setLocation(''); setManagerName(''); setManagerEmail(''); setManagerPassword(''); setShowForm(false); setSaving(false); },
            onError: () => setSaving(false),
        });
    };

    const toggle = (hotelId: string) => {
        router.patch(`/admin/hotels/${hotelId}/toggle`, {}, {
            onSuccess: () => setHotels(hotels.map(h => h.id === hotelId ? { ...h, is_active: !h.is_active } : h)),
            preserveScroll: true,
        });
    };

    return (
        <StaffLayout header="Hotels">
            <Head title="Hotels" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div><h1 className="text-xl font-medium text-slate-800">Hotels</h1><p className="text-sm text-slate-500 mt-0.5">Manage all registered hotels on the platform.</p></div>
                    <button onClick={() => setShowForm(!showForm)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium ${showForm ? 'bg-slate-200 text-slate-700' : 'bg-rose-500 hover:bg-rose-600 text-white'} transition-colors`}>
                        {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? 'Cancel' : 'Create Hotel'}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                        <h2 className="font-medium text-slate-800">New Hotel</h2>
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Hotel Information</p>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Hotel Name *</label>
                                    <input type="text" value={name} onChange={e => { setName(e.target.value); setSlugVal(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-400" placeholder="e.g. The Grand Bali" /></div>
                                <div><label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">URL Slug *</label>
                                    <input type="text" value={slug} onChange={e => setSlugVal(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-400" />
                                    <p className="text-xs text-slate-400 mt-1">/{slug}/frontoffice</p></div>
                                <div><label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Location</label>
                                    <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-400" placeholder="e.g. Kuta, Bali" /></div>
                                <div><label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wider">Timezone</label>
                                    <input type="text" value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-400" /></div>
                            </div>
                        </div>
                        <div className="pt-5 border-t border-slate-100">
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">Manager Account <span className="normal-case font-normal">(optional)</span></p>
                            <div className="grid grid-cols-3 gap-4">
                                <div><label className="block text-xs font-medium text-slate-500 mb-1.5">Name</label>
                                    <input type="text" value={managerName} onChange={e => setManagerName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm" placeholder="e.g. John Doe" /></div>
                                <div><label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                                    <input type="email" value={managerEmail} onChange={e => setManagerEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm" placeholder="manager@hotel.com" /></div>
                                <div><label className="block text-xs font-medium text-slate-500 mb-1.5">Password</label>
                                    <input type="text" value={managerPassword} onChange={e => setManagerPassword(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm" placeholder="min. 6 characters" /></div>
                            </div>
                        </div>
                        <button onClick={create} disabled={saving || !name.trim() || !slug.trim()} className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                            {saving ? 'Creating...' : 'Create Hotel'}
                        </button>
                    </div>
                )}

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead><tr className="bg-slate-50 text-slate-400 text-xs font-medium uppercase tracking-wider">
                            <th className="text-left px-6 py-4">Hotel</th>
                            <th className="text-left px-6 py-4 hidden md:table-cell">Location</th>
                            <th className="text-left px-6 py-4">Rooms</th>
                            <th className="text-left px-6 py-4 hidden lg:table-cell">Created</th>
                            <th className="text-left px-6 py-4">Status</th>
                            <th className="text-right px-6 py-4">Actions</th>
                        </tr></thead>
                        <tbody>
                            {hotels.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-slate-400">No hotels yet</td></tr>}
                            {hotels.map(h => (
                                <tr key={h.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <Link href={`/admin/hotels/${h.id}`} className="group">
                                            <p className="font-medium text-slate-900 group-hover:text-rose-600 transition-colors">{h.name}</p>
                                            <p className="text-xs text-slate-400">/{h.slug}</p>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 hidden md:table-cell">{h.location || '-'}</td>
                                    <td className="px-6 py-4 font-medium text-slate-700">{h.rooms_count}</td>
                                    <td className="px-6 py-4 text-slate-400 text-xs hidden lg:table-cell">{new Date(h.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase ${h.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{h.is_active ? 'Active' : 'Inactive'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/hotels/${h.id}`}
                                                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                                                Manage
                                            </Link>
                                            <Link href={`/admin/hotels/${h.id}/tv-canvas`}
                                                className="text-xs font-medium text-slate-600 hover:text-slate-800 px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1">
                                                <Tv2 size={12}/> TV
                                            </Link>
                                            <button onClick={() => toggle(h.id)} className={`text-xs font-medium ${h.is_active ? 'text-slate-400 hover:text-red-500' : 'text-emerald-600 hover:text-emerald-800'} transition-colors`}>
                                                {h.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
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
