import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router } from '@inertiajs/react';
import { CreditCard, Hotel, ReceiptText, TrendingUp, WalletCards } from 'lucide-react';
import { useState } from 'react';

interface BillingHotel {
    id: string;
    name: string;
    slug: string;
    rooms_count: number;
    paired_stbs_count: number;
    estimated_amount: number;
    billing_plan: string;
    billing_cycle: string;
    billing_unit: string;
    billing_currency: string;
    billing_base_price: string | number;
    billing_room_price: string | number;
    billing_stb_price: string | number;
    payment_status: string;
    next_billing_date: string | null;
}

interface Props {
    hotels: BillingHotel[];
    summary: { mrr: number; trial: number; active: number; overdue: number };
}

const paymentClass: Record<string, string> = {
    active: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25',
    trial: 'bg-blue-500/15 text-blue-300 border-blue-400/25',
    overdue: 'bg-amber-500/15 text-amber-300 border-amber-400/25',
    suspended: 'bg-red-500/15 text-red-300 border-red-400/25',
    cancelled: 'bg-slate-500/15 text-slate-300 border-slate-400/20',
};

const currency = (code: string, value: number | string) => {
    const amount = Number(value || 0);
    return `${code || 'IDR'} ${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export default function Billing({ hotels, summary }: Props) {
    const [editing, setEditing] = useState<Record<string, BillingHotel>>({});

    const rowFor = (hotel: BillingHotel) => editing[hotel.id] || hotel;
    const update = (hotel: BillingHotel, patch: Partial<BillingHotel>) =>
        setEditing((current) => ({ ...current, [hotel.id]: { ...rowFor(hotel), ...patch } }));

    const save = (hotel: BillingHotel) => {
        const row = rowFor(hotel);
        router.patch(`/admin/billing/${hotel.id}`, row, {
            preserveScroll: true,
            onSuccess: () => setEditing((current) => {
                const next = { ...current };
                delete next[hotel.id];
                return next;
            }),
        });
    };

    return (
        <StaffLayout header="Billing">
            <Head title="Billing" />
            <div className="space-y-6">
                <div className="rounded-3xl border border-slate-800 bg-[#0B1120] p-6 text-white shadow-xl">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
                            <CreditCard size={22} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold">Billing & Payments</h1>
                            <p className="text-sm text-slate-400">Flexible pricing by hotel, room, STB, or hybrid model.</p>
                        </div>
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                        {[
                            { label: 'Estimated MRR', value: currency('IDR', summary.mrr), icon: TrendingUp },
                            { label: 'Active Hotels', value: summary.active, icon: Hotel },
                            { label: 'Trial Hotels', value: summary.trial, icon: WalletCards },
                            { label: 'Overdue/Suspended', value: summary.overdue, icon: ReceiptText },
                        ].map((item) => (
                            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                <item.icon size={18} className="text-rose-300" />
                                <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-500">{item.label}</p>
                                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-800 bg-[#101827] shadow-xl">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-950/50 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                                <th className="px-4 py-4">Hotel</th>
                                <th className="px-4 py-4">Plan</th>
                                <th className="px-4 py-4">Billing Unit</th>
                                <th className="px-4 py-4">Prices</th>
                                <th className="px-4 py-4">Payment</th>
                                <th className="px-4 py-4">Est.</th>
                                <th className="px-4 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hotels.map((hotel) => {
                                const row = rowFor(hotel);
                                return (
                                    <tr key={hotel.id} className="border-b border-slate-800/70 text-slate-200 hover:bg-white/[0.03]">
                                        <td className="px-4 py-4">
                                            <p className="font-medium">{hotel.name}</p>
                                            <p className="text-xs text-slate-500">{hotel.rooms_count} rooms · {hotel.paired_stbs_count} STBs</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <select value={row.billing_plan} onChange={(e) => update(hotel, { billing_plan: e.target.value })} className="w-32 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-200">
                                                {['starter', 'standard', 'premium', 'enterprise'].map((item) => <option key={item} value={item}>{item}</option>)}
                                            </select>
                                            <select value={row.billing_cycle} onChange={(e) => update(hotel, { billing_cycle: e.target.value })} className="mt-2 w-32 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-200">
                                                <option value="monthly">monthly</option>
                                                <option value="annual">annual</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-4">
                                            <select value={row.billing_unit} onChange={(e) => update(hotel, { billing_unit: e.target.value })} className="w-36 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-200">
                                                <option value="per_hotel">per hotel</option>
                                                <option value="per_room">per room</option>
                                                <option value="per_stb">per STB</option>
                                                <option value="hybrid">hybrid</option>
                                            </select>
                                            <select value={row.billing_currency} onChange={(e) => update(hotel, { billing_currency: e.target.value })} className="mt-2 w-36 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-200">
                                                {['IDR', 'USD', 'SGD', 'AUD'].map((item) => <option key={item} value={item}>{item}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-4">
                                            {[
                                                ['Base', 'billing_base_price'],
                                                ['Room', 'billing_room_price'],
                                                ['STB', 'billing_stb_price'],
                                            ].map(([label, key]) => (
                                                <label key={key} className="mb-1 flex items-center gap-2 text-[10px] text-slate-500">
                                                    <span className="w-9">{label}</span>
                                                    <input value={(row as any)[key] ?? 0} onChange={(e) => update(hotel, { [key]: e.target.value } as any)} className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200" />
                                                </label>
                                            ))}
                                        </td>
                                        <td className="px-4 py-4">
                                            <select value={row.payment_status} onChange={(e) => update(hotel, { payment_status: e.target.value })} className="w-32 rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-xs text-slate-200">
                                                {['trial', 'active', 'overdue', 'suspended', 'cancelled'].map((item) => <option key={item} value={item}>{item}</option>)}
                                            </select>
                                            <span className={`mt-2 inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase ${paymentClass[row.payment_status] || paymentClass.trial}`}>{row.payment_status}</span>
                                        </td>
                                        <td className="px-4 py-4 font-medium text-slate-100">{currency(row.billing_currency, hotel.estimated_amount)}</td>
                                        <td className="px-4 py-4 text-right">
                                            <button onClick={() => save(hotel)} className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-medium text-white hover:bg-rose-600">
                                                Save
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </StaffLayout>
    );
}
