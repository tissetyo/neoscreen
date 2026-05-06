import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Plus, X, Megaphone, Trash2 } from 'lucide-react';

interface Announcement { id: string; hotel_id: string; text: string; is_active: boolean; created_at: string; hotel: { name: string } | null; }
interface Hotel { id: string; name: string; }
interface Props { announcements: Announcement[]; hotels: Hotel[]; }

export default function AdminAnnouncements({ announcements: initialAnnouncements, hotels }: Props) {
    const pageAnnouncements = usePage<Props>().props.announcements;
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    useEffect(() => {
        setAnnouncements(pageAnnouncements);
    }, [pageAnnouncements]);
    const [showForm, setShowForm] = useState(false);
    const [hotelId, setHotelId] = useState(hotels[0]?.id || '');
    const [text, setText] = useState('');
    const [saving, setSaving] = useState(false);

    const save = () => {
        if (!text.trim() || !hotelId) return;
        setSaving(true);
        router.post('/admin/announcements', { hotel_id: hotelId, text, is_active: true }, {
            onSuccess: () => { setText(''); setShowForm(false); setSaving(false); },
            onError: () => setSaving(false),
        });
    };

    const remove = (id: string) => {
        if (!confirm('Delete this announcement?')) return;
        router.delete(`/admin/announcements/${id}`, {
            onSuccess: () => setAnnouncements(announcements.filter(a => a.id !== id)),
            preserveScroll: true,
        });
    };

    return (
        <StaffLayout header="Announcements">
            <Head title="Announcements" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div><h1 className="text-xl font-medium text-slate-800">Announcements</h1><p className="text-sm text-slate-500 mt-0.5">Create announcements shown on hotel TV screens.</p></div>
                    <button onClick={() => setShowForm(!showForm)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium ${showForm ? 'bg-slate-200 text-slate-700' : 'bg-rose-500 hover:bg-rose-600 text-white'} transition-colors`}>
                        {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? 'Cancel' : 'Create'}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h2 className="font-medium text-slate-800 mb-5 flex items-center gap-2"><Megaphone size={16} className="text-rose-500" /> New Announcement</h2>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Hotel *</label>
                                <select value={hotelId} onChange={e => setHotelId(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:border-rose-400">
                                    {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                </select></div>
                            <div className="col-span-2"><label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Announcement Text *</label>
                                <input type="text" value={text} onChange={e => setText(e.target.value)} maxLength={500} placeholder="e.g. Breakfast is served from 7–10 AM in The Garden Restaurant."
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-rose-400" /></div>
                        </div>
                        <button onClick={save} disabled={saving || !text.trim() || !hotelId} className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium disabled:opacity-50">
                            {saving ? 'Saving...' : 'Create Announcement'}
                        </button>
                    </div>
                )}

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-slate-100 font-medium text-slate-800">Active Announcements</div>
                    <table className="w-full text-sm">
                        <thead><tr className="bg-slate-50 text-slate-400 text-xs font-medium uppercase tracking-wider">
                            <th className="text-left px-6 py-3">Hotel</th>
                            <th className="text-left px-6 py-3">Text</th>
                            <th className="text-left px-6 py-3 hidden lg:table-cell">Created</th>
                            <th className="text-left px-6 py-3">Status</th>
                            <th className="text-right px-6 py-3">Action</th>
                        </tr></thead>
                        <tbody>
                            {announcements.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-slate-400">No announcements</td></tr>}
                            {announcements.map(a => (
                                <tr key={a.id} className="border-t border-slate-50 hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-700">{a.hotel?.name || '-'}</td>
                                    <td className="px-6 py-4 text-slate-800 max-w-xs">{a.text}</td>
                                    <td className="px-6 py-4 text-slate-400 text-xs hidden lg:table-cell">{new Date(a.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase ${a.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{a.is_active ? 'Active' : 'Inactive'}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => remove(a.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
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
