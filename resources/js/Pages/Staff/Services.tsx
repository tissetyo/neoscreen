import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Trash2, Utensils, Car, Shirt, Coffee, Sparkles, Scissors, ShoppingBag, Map, Briefcase, Bell, Check, X } from 'lucide-react';

const ICONS: Record<string, JSX.Element> = {
    Utensils: <Utensils className="w-5 h-5" />,
    Car: <Car className="w-5 h-5" />,
    Shirt: <Shirt className="w-5 h-5" />,
    Coffee: <Coffee className="w-5 h-5" />,
    Sparkles: <Sparkles className="w-5 h-5" />,
    Scissors: <Scissors className="w-5 h-5" />,
    ShoppingBag: <ShoppingBag className="w-5 h-5" />,
    Map: <Map className="w-5 h-5" />,
    Briefcase: <Briefcase className="w-5 h-5" />,
    Bell: <Bell className="w-5 h-5" />,
};

const COLORS = [
    { id: 'teal', class: 'bg-teal-500' },
    { id: 'amber', class: 'bg-amber-500' },
    { id: 'rose', class: 'bg-rose-500' },
    { id: 'indigo', class: 'bg-indigo-500' },
    { id: 'sky', class: 'bg-sky-500' },
    { id: 'violet', class: 'bg-violet-500' },
];

interface Service { id: string; name: string; icon: string | null; color_theme: string | null; is_active: boolean; options?: ServiceOption[]; }
interface ServiceOption { id: string; name: string; price: number; }
interface Props { slug: string; services: Service[]; }

export default function Services({ slug, services: initialServices }: Props) {
    const [services, setServices] = useState(initialServices);
    const [selectedId, setSelectedId] = useState<string>(initialServices[0]?.id || '');
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState('Bell');
    const [newColor, setNewColor] = useState('teal');
    const [optionName, setOptionName] = useState('');
    const [optionPrice, setOptionPrice] = useState('');
    const [savingCat, setSavingCat] = useState(false);
    const [savingOpt, setSavingOpt] = useState(false);

    const selected = services.find(s => s.id === selectedId);

    const createCategory = () => {
        if (!newName.trim()) return;
        setSavingCat(true);
        router.post(`/${slug}/frontoffice/services`, { name: newName, icon: newIcon, color_theme: newColor }, {
            onSuccess: (page: any) => {
                setSavingCat(false);
                setIsAdding(false);
                setNewName('');
                // Reload happens via Inertia props
            },
            onError: () => setSavingCat(false),
        });
    };

    const deleteCategory = (id: string) => {
        if (!confirm('Delete this entire category? All packages inside will be lost.')) return;
        router.delete(`/${slug}/frontoffice/services/${id}`, {
            onSuccess: () => {
                setServices(services.filter(s => s.id !== id));
                if (selectedId === id) setSelectedId(services.filter(s => s.id !== id)[0]?.id || '');
            },
            preserveScroll: true,
        });
    };

    const addOption = () => {
        if (!optionName.trim() || !optionPrice || !selectedId) return;
        setSavingOpt(true);
        router.post(`/${slug}/frontoffice/services/${selectedId}/options`, { name: optionName, price: parseInt(optionPrice) || 0 }, {
            onSuccess: () => { setOptionName(''); setOptionPrice(''); setSavingOpt(false); },
            onError: () => setSavingOpt(false),
            preserveScroll: true,
        });
    };

    const deleteOption = (serviceId: string, optionId: string) => {
        if (!confirm('Delete this package?')) return;
        router.delete(`/${slug}/frontoffice/services/${serviceId}/options/${optionId}`, { preserveScroll: true });
    };

    const fmtRupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

    return (
        <StaffLayout header="Services & Packages">
            <Head title="Services" />
            <div className="space-y-4">
                <div>
                    <h1 className="text-xl font-medium text-slate-800">Hotel Services & Packages</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Configure service categories and their package items/prices shown to guests.</p>
                </div>

                <div className="flex gap-5 h-[calc(100vh-200px)]">
                    {/* Categories Sidebar */}
                    <div className="w-72 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <h2 className="font-medium text-slate-800">Categories</h2>
                            {!isAdding && (
                                <button onClick={() => setIsAdding(true)} className="text-teal-600 hover:bg-teal-50 p-1.5 rounded-lg transition-colors">
                                    <Plus size={18} />
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {isAdding && (
                                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl mb-3 space-y-3">
                                    <p className="text-xs font-medium text-teal-800 uppercase tracking-widest">New Category</p>
                                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Spa & Massage"
                                        className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-teal-500" />
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold mb-2">Icon</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {Object.entries(ICONS).map(([name, cmp]) => (
                                                <button key={name} onClick={() => setNewIcon(name)} title={name}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${newIcon === name ? 'bg-teal-500 text-white' : 'bg-white border text-slate-400 hover:bg-slate-100'}`}>
                                                    {cmp}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-semibold mb-2">Color</p>
                                        <div className="flex gap-2">
                                            {COLORS.map(c => (
                                                <button key={c.id} onClick={() => setNewColor(c.id)}
                                                    className={`w-6 h-6 rounded-full ${c.class} ${newColor === c.id ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'} transition-all`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={createCategory} disabled={savingCat || !newName}
                                            className="flex-1 bg-teal-600 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 hover:bg-teal-700 disabled:opacity-50">
                                            <Check size={14} /> Save
                                        </button>
                                        <button onClick={() => setIsAdding(false)} className="px-3 bg-white border text-slate-500 rounded-lg hover:bg-slate-50">
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                            {services.map(s => {
                                const icon = ICONS[s.icon || ''] || <span className="text-base">{s.icon || '🛎️'}</span>;
                                const colorCls = COLORS.find(c => c.id === s.color_theme)?.class || 'bg-teal-500';
                                const active = selectedId === s.id;
                                return (
                                    <button key={s.id} onClick={() => setSelectedId(s.id)}
                                        className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-xl transition-all border group ${active ? `${colorCls} border-transparent text-white shadow-md` : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`p-1.5 rounded-lg ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>{icon}</span>
                                            <span className="font-semibold text-sm">{s.name}</span>
                                        </div>
                                        <span onClick={e => { e.stopPropagation(); deleteCategory(s.id); }}
                                            className={`p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all ${active ? 'hover:bg-red-500/50 text-white' : 'hover:bg-red-50 text-red-500'}`}>
                                            <Trash2 size={14} />
                                        </span>
                                    </button>
                                );
                            })}
                            {services.length === 0 && !isAdding && (
                                <p className="text-sm text-slate-400 text-center py-8 border border-dashed rounded-xl">No categories. Click + to create one.</p>
                            )}
                        </div>
                    </div>

                    {/* Options Editor */}
                    <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                        {selected ? (
                            <>
                                <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                                    <span className={`p-2.5 rounded-xl text-white ${COLORS.find(c => c.id === selected.color_theme)?.class || 'bg-teal-500'}`}>
                                        {ICONS[selected.icon || ''] || <Bell size={18} />}
                                    </span>
                                    <div>
                                        <h2 className="font-medium text-slate-800 text-lg">{selected.name}</h2>
                                        <p className="text-xs text-slate-500">Configure all packages under this category</p>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-5 bg-slate-50/30">
                                    {/* Add Package Row */}
                                    <div className="flex gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                        <div className="flex-1">
                                            <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Package Name</label>
                                            <input type="text" value={optionName} onChange={e => setOptionName(e.target.value)} placeholder="e.g. Signature Massage (60 mins)"
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-teal-500 outline-none" />
                                        </div>
                                        <div className="w-48">
                                            <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">Price (IDR)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-slate-400 font-semibold text-sm">Rp</span>
                                                <input type="number" value={optionPrice} onChange={e => setOptionPrice(e.target.value)} placeholder="250000"
                                                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:border-teal-500 outline-none" />
                                            </div>
                                        </div>
                                        <div className="flex items-end">
                                            <button onClick={addOption} disabled={savingOpt || !optionName || !optionPrice}
                                                className="h-[42px] px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50">
                                                <Plus size={15} /> Add
                                            </button>
                                        </div>
                                    </div>
                                    {/* Options List */}
                                    <div className="space-y-3">
                                        {(!selected.options || selected.options.length === 0) ? (
                                            <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-2xl">
                                                <ShoppingBag size={36} className="text-slate-200 mx-auto mb-3" />
                                                <p className="text-slate-500 font-medium">No packages yet</p>
                                                <p className="text-slate-400 text-sm mt-1">Use the form above to add packages</p>
                                            </div>
                                        ) : selected.options.map(opt => (
                                            <div key={opt.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-teal-200 hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-semibold text-lg">{opt.name.charAt(0)}</div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{opt.name}</p>
                                                        <span className="text-teal-600 font-medium text-xs bg-teal-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">{fmtRupiah(opt.price)}</span>
                                                    </div>
                                                </div>
                                                <button onClick={() => deleteOption(selected.id, opt.id)}
                                                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                <Map size={48} className="text-slate-200 mb-4" />
                                <p className="font-medium text-lg">Select a Category</p>
                                <p className="text-sm mt-1">Choose a category or create one to add packages</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StaffLayout>
    );
}
