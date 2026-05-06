import MobileLayout from '@/Layouts/MobileLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Info } from 'lucide-react';

interface Option { id: string; name: string; price: number; }
interface Service { id: string; name: string; icon: string | null; options: Option[]; }
interface Props {
  session: { id: string; room: { room_code: string }; hotel: { slug: string; name: string } };
  services: Service[];
}

export default function MobileServices({ session, services }: Props) {
  const [activeId, setActiveId] = useState(services[0]?.id || '');
  const [cart, setCart] = useState<{ option: Option; quantity: number }[]>([]);
  const [sending, setSending] = useState(false);
  const active = services.find(s => s.id === activeId);
  const total = cart.reduce((sum, item) => sum + Number(item.option.price) * item.quantity, 0);
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  const money = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  const updateQty = (option: Option, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.option.id === option.id);
      if (!existing && delta > 0) return [...prev, { option, quantity: 1 }];
      if (!existing) return prev;
      const next = existing.quantity + delta;
      if (next <= 0) return prev.filter(item => item.option.id !== option.id);
      return prev.map(item => item.option.id === option.id ? { ...item, quantity: next } : item);
    });
  };

  const submit = async () => {
    if (!active || cart.length === 0 || sending) return;
    setSending(true);
    const res = await fetch(`/api/mobile/${session.id}/service-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: active.id,
        items: cart.map(item => ({ id: item.option.id, name: item.option.name, price: item.option.price, quantity: item.quantity })),
        total_price: total,
      }),
    });
    setSending(false);
    if (res.ok) router.visit(`/${session.hotel.slug}/mobile/${session.id}/chat`);
  };

  return (
    <MobileLayout session={session}>
      <Head title="Order Service" />
      <section className="rounded-b-[34px] bg-teal-600 px-6 py-8 text-white shadow-md">
        <h1 className="text-3xl font-black">Order Service</h1>
        <p className="mt-1 text-sm text-teal-50">Choose a category and send a request to the front desk.</p>
      </section>

      <div className="overflow-x-auto px-5 py-5">
        <div className="flex gap-3">
          {services.map(service => (
            <button key={service.id} onClick={() => setActiveId(service.id)} className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold shadow-sm ${activeId === service.id ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600'}`}>
              {service.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 px-5 pb-36">
        {!active || active.options.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-12 text-center">
            <Info className="mx-auto mb-3 text-slate-300" size={36} />
            <p className="text-sm font-semibold text-slate-500">No packages configured yet.</p>
          </div>
        ) : active.options.map(option => {
          const qty = cart.find(item => item.option.id === option.id)?.quantity || 0;
          return (
            <div key={option.id} className="flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <div>
                <p className="font-bold text-slate-900">{option.name}</p>
                <p className="mt-1 text-sm font-bold text-teal-600">{money(Number(option.price))}</p>
              </div>
              {qty === 0 ? (
                <button onClick={() => updateQty(option, 1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700"><Plus size={20} /></button>
              ) : (
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 p-1">
                  <button onClick={() => updateQty(option, -1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-rose-500"><Minus size={16} /></button>
                  <span className="w-5 text-center text-sm font-black">{qty}</span>
                  <button onClick={() => updateQty(option, 1)} className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-500 text-white"><Plus size={16} /></button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-[76px] z-30 mx-auto max-w-md px-5">
          <button onClick={submit} disabled={sending} className="flex w-full items-center justify-between rounded-3xl bg-slate-900 p-4 text-white shadow-2xl disabled:opacity-70">
            <span className="flex items-center gap-3"><ShoppingCart size={22} /> <span><b>{count} items</b><br /><small>{money(total)}</small></span></span>
            <span className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-900">{sending ? 'Sending...' : 'Checkout'}</span>
          </button>
        </div>
      )}
    </MobileLayout>
  );
}
