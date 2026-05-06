import StaffLayout from '@/Layouts/StaffLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ServiceRequest {
    id: string;
    status: string;
    items: Array<{ name?: string; quantity?: number; price?: string | number }> | null;
    notes: string | null;
    total_price: string | number | null;
    created_at: string;
    staff_acknowledged_at: string | null;
    staff_acknowledged_by: string | null;
    guest_acknowledged_at: string | null;
    staff_acknowledger?: { name: string } | null;
    service: { name: string } | null;
    room: { room_code: string } | null;
}

interface Props {
    slug: string;
    requests: ServiceRequest[];
}

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-slate-100 text-slate-500',
};

export default function ServiceRequests({ slug, requests: initialRequests }: Props) {
    const pageRequests = usePage<Props>().props.requests;
    const [requests, setRequests] = useState(initialRequests);
    useEffect(() => {
        setRequests(pageRequests);
    }, [pageRequests]);

    const [filter, setFilter] = useState('all');

    const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

    const formatPrice = (value: string | number | null) => {
        const amount = Number(value ?? 0);
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const itemSummary = (request: ServiceRequest) => {
        if (!request.items?.length) {
            return request.notes || '-';
        }

        return request.items
            .map((item) => `${item.quantity ?? 1}x ${item.name || 'Item'}`)
            .join(', ');
    };

    const updateStatus = (id: string, status: string) => {
        router.patch(`/${slug}/frontoffice/requests/${id}`, { status }, {
            onSuccess: () => setRequests(requests.map((r) => (r.id === id ? { ...r, status } : r))),
            preserveScroll: true,
        });
    };

    const acknowledge = (id: string) => {
        router.patch(`/${slug}/frontoffice/requests/${id}/acknowledge`, {}, {
            preserveScroll: true,
        });
    };

    return (
        <StaffLayout header="Service Requests">
            <Head title="Service Requests" />
            <div className="space-y-6">
                <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-sm text-teal-900">
                    <p className="font-medium text-teal-800 mb-1">Staff acknowledgement</p>
                    <p className="text-teal-800/90">
                        Click <strong>Acknowledge receipt</strong> as soon as the desk sees a new ticket — analytics measure response time. Changing status away from pending also records acknowledgement automatically.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-colors ${
                                filter === f ? 'bg-violet-500 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs font-medium uppercase tracking-wider">
                                <th className="text-left px-5 py-3">Room</th>
                                <th className="text-left px-5 py-3">Service</th>
                                <th className="text-left px-5 py-3 hidden md:table-cell">Items</th>
                                <th className="text-left px-5 py-3 hidden xl:table-cell">Total</th>
                                <th className="text-left px-5 py-3 hidden lg:table-cell">Staff ack</th>
                                <th className="text-left px-5 py-3 hidden lg:table-cell">Guest ack</th>
                                <th className="text-left px-5 py-3">Status</th>
                                <th className="text-left px-5 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-12 text-slate-400">
                                        No service requests
                                    </td>
                                </tr>
                            )}
                            {filtered.map((r) => (
                                <tr key={r.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-3 font-medium text-slate-800">Room {r.room?.room_code || '-'}</td>
                                    <td className="px-5 py-3 text-slate-700">{r.service?.name || 'Service'}</td>
                                    <td className="px-5 py-3 text-slate-500 max-w-[220px] truncate hidden md:table-cell" title={itemSummary(r)}>
                                        {itemSummary(r)}
                                    </td>
                                    <td className="px-5 py-3 text-slate-600 font-semibold hidden xl:table-cell">{formatPrice(r.total_price)}</td>
                                    <td className="px-5 py-3 text-xs text-slate-600 hidden lg:table-cell">
                                        {r.staff_acknowledged_at ? (
                                            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                                                <CheckCircle2 size={14} /> {r.staff_acknowledger?.name || 'Staff'}
                                            </span>
                                        ) : (
                                            <span className="text-amber-600 font-medium">Pending</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3 text-xs hidden lg:table-cell">
                                        {r.guest_acknowledged_at ? (
                                            <span className="text-emerald-700 font-semibold">Yes</span>
                                        ) : (
                                            <span className="text-slate-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-medium uppercase ${STATUS_STYLES[r.status] || ''}`}>
                                            {r.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 space-y-2">
                                        {!r.staff_acknowledged_at && (
                                            <button
                                                type="button"
                                                onClick={() => acknowledge(r.id)}
                                                className="block w-full px-2 py-1.5 rounded-lg text-[10px] font-medium uppercase bg-teal-100 text-teal-800 hover:bg-teal-200 transition-colors"
                                            >
                                                Acknowledge receipt
                                            </button>
                                        )}
                                        <select
                                            value={r.status}
                                            onChange={(e) => updateStatus(r.id, e.target.value)}
                                            className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-violet-400"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
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
