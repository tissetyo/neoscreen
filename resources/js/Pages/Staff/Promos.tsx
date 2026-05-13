import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router } from '@inertiajs/react';
import { ChangeEvent, useRef, useState } from 'react';
import { ImageUp, Plus, Ticket, X } from 'lucide-react';

interface Promo {
    id: string;
    title: string;
    description: string | null;
    image_url?: string | null;
    poster_url: string | null;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
}
interface Props { slug: string; promos: Promo[]; }

export default function Promos({ slug, promos: initialPromos }: Props) {
    const [promos, setPromos] = useState(initialPromos);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement | null>(null);

    const uploadPoster = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (fileRef.current) fileRef.current.value = '';
        if (!file) return;

        setUploading(true);
        const form = new FormData();
        form.append('file', file);

        try {
            const res = await fetch('/api/upload/promo-poster', { method: 'POST', body: form });
            const data = await res.json();
            if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
            setImageUrl(`${data.url}?t=${Date.now()}`);
        } catch (error: any) {
            alert(error?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const save = () => {
        if (!title.trim()) return;
        setSaving(true);
        router.post(`/${slug}/frontoffice/promos`, { title, description, image_url: imageUrl || null, start_date: startDate || null, end_date: endDate || null }, {
            onSuccess: () => {
                setTitle('');
                setDescription('');
                setImageUrl('');
                setStartDate('');
                setEndDate('');
                setShowForm(false);
                setSaving(false);
                router.reload({ only: ['promos'], preserveScroll: true, preserveState: false });
            },
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
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 mb-4">
                            <div>
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Title *</label>
                                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weekend Brunch Special"
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-400" />
                                </div>
                                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Describe the promotion..."
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-pink-400 resize-none" />
                            </div>
                            <div>
                                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadPoster} />
                                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="Promo preview" className="h-40 w-full object-cover" />
                                    ) : (
                                        <div className="flex h-40 items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 text-pink-500">
                                            <Ticket size={42} />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        disabled={uploading}
                                        className="flex w-full items-center justify-center gap-2 border-t border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        <ImageUp size={16} /> {uploading ? 'Uploading...' : 'Upload deal photo'}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Valid From</label>
                                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Valid Until</label>
                                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm" />
                                </div>
                        </div>
                        <button onClick={save} disabled={saving || !title.trim()} className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                            {saving ? 'Saving...' : 'Save Promo'}
                        </button>
                    </div>
                )}

                {promos.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl">
                        <Ticket size={42} className="mx-auto mb-3 text-pink-300" />
                        <p className="text-slate-800 font-medium">No promos yet</p>
                        <p className="text-slate-500 text-sm mt-1">Create your first promotion to show it on room TVs.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {promos.map(p => {
                            const poster = p.poster_url || p.image_url;
                            return (
                            <div key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {poster ? (
                                    <img src={poster} alt={p.title} className="w-full h-40 object-cover" />
                                ) : (
                                    <div className="w-full h-40 bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center text-pink-500">
                                        <Ticket size={42} />
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
                            );
                        })}
                    </div>
                )}
            </div>
        </StaffLayout>
    );
}
