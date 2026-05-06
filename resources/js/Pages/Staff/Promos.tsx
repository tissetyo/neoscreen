import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Promo { id: string; title: string; description: string | null; poster_url: string | null; is_active: boolean; start_date: string | null; end_date: string | null; created_at: string; }
interface Props { slug: string; promos: Promo[]; }

export default function Promos({ slug, promos: initialPromos }: Props) {
    const [promos, setPromos] = useState(initialPromos);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [saving, setSaving] = useState(false);

    const save = () => {
        if (!title.trim()) return;
        setSaving(true);
        router.post(`/${slug}/frontoffice/promos`, { title, description, start_date: startDate || null, end_date: endDate || null }, {
            onSuccess: () => { setTitle(''); setDescription(''); setStartDate(''); setEndDate(''); setShowForm(false); setSaving(false); },
            onError: () => setSaving(false),
        });
    };

    const toggle = (promoId: string) => {
        router.patch(`/${slug}/frontoffice/promos/${promoId}/toggle`, {}, {
            onSuccess: () => setPromos(promos.map(p => p.id === promoId ? { ...p, is_active: !p.is_active } : p)),
            preserveScroll: true,
        });
    };

    const remove = (promoId: string) => {
        if (!confirm('Delete this promo?')) return;
        router.delete(`/${slug}/frontoffice/promos/${promoId}`, {
            onSuccess: () => setPromos(promos.filter(p => p.id !== promoId)),
            preserveScroll: true,
        });
    };

    return (
        <StaffLayout header="Promos & Deals">
            <Head title="Promos" />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-medium text-slate-800">Promos & Hotel Deals</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Manage promotions shown on room TVs.</p>
                    </div>
                    <button onClick={() => setShowForm(!showForm)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${showForm ? 'bg-slate-200 text-slate-700' : 'bg-pink-500 hover:bg-pink-600 text-white'}`}>
                        {showForm ? <X size={16} /> : <Plus size={16} />}
                        {showForm ? 'Cancel' : 'Add Promo'}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <h2 className="font-medium text-slate-800 mb-5">New Promotion</h2>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Title *</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekend Brunch Special"
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-400" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Valid From</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Valid Until</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
                                </div>
                            </div>
                        </div>
                        <div className="mb-5">
                            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the promotion..."
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 resize-none" />
                        </div>
                        <button onClick={save} disabled={saving || !title.trim()} className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                            {saving ? 'Saving...' : 'Save Promo'}
                        </button>
                    </div>
                )}

                {promos.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl">
                        <p className="text-4xl mb-3">🎟️</p>
                        <p className="text-slate-800 font-medium">No promos yet</p>
                        <p className="text-slate-500 text-sm mt-1">Create your first promotion to show it on room TVs.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {promos.map(p => (
                            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {p.poster_url ? (
                                    <img src={p.poster_url} alt={p.title} className="w-full h-40 object-cover" />
                                ) : (
                                    <div className="w-full h-40 bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
                                        <span className="text-4xl">🎟️</span>
                                    </div>
                                )}
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-medium text-slate-800">{p.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium uppercase shrink-0 ml-2 ${p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {p.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {p.description && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{p.description}</p>}
                                    {(p.start_date || p.end_date) && (
                                        <p className="text-xs text-slate-400 mb-4">
                                            {p.start_date && `From ${new Date(p.start_date).toLocaleDateString()}`}
                                            {p.end_date && ` · Until ${new Date(p.end_date).toLocaleDateString()}`}
                                        </p>
                                    )}
                                    <div className="flex gap-3 pt-3 border-t border-slate-100">
                                        <button onClick={() => toggle(p.id)} className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors">
                                            {p.is_active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button onClick={() => remove(p.id)} className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </StaffLayout>
    );
}
