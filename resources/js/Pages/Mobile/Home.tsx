import MobileLayout from '@/Layouts/MobileLayout';
import { Link, Head } from '@inertiajs/react';
import { BellRing, ConciergeBell, MapPin, Wifi } from 'lucide-react';

interface Props {
  session: {
    id: string;
    room: { room_code: string; guest_name: string | null };
    hotel: { slug: string; name: string; location: string | null; wifi_ssid: string | null; wifi_password: string | null; wifi_username: string | null; featured_image_url: string | null };
  };
}

export default function MobileHome({ session }: Props) {
  const base = `/${session.hotel.slug}/mobile/${session.id}`;

  return (
    <MobileLayout session={session}>
      <Head title="Guest Portal" />
      <div className="space-y-6 p-5">
        <section className="relative flex h-48 flex-col justify-end overflow-hidden rounded-[28px] bg-slate-900 p-6 text-white shadow-xl">
          {session.hotel.featured_image_url && <img src={session.hotel.featured_image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />}
          <div className="relative">
            <p className="text-2xl font-black">Welcome{session.room.guest_name ? `, ${session.room.guest_name}` : ''}</p>
            <p className="mt-1 text-sm text-slate-200">Your phone is connected to the room TV.</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600"><Wifi size={22} /></div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900">Hotel Wi-Fi</p>
              <p className="mt-1 text-sm text-slate-500">SSID: <span className="font-semibold text-slate-800">{session.hotel.wifi_ssid || 'Ask Front Desk'}</span></p>
              {session.hotel.wifi_username && <p className="text-sm text-slate-500">User: <span className="font-semibold text-slate-800">{session.hotel.wifi_username}</span></p>}
              <p className="text-sm text-slate-500">Password: <span className="font-mono font-semibold text-teal-700">{session.hotel.wifi_password || 'Ask Front Desk'}</span></p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4">
          <Link href={`${base}/services`} className="rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-sm active:scale-95">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-teal-600"><ConciergeBell size={28} /></div>
            <span className="font-bold text-slate-800">Order Service</span>
          </Link>
          <Link href={`${base}/chat`} className="rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-sm active:scale-95">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"><BellRing size={28} /></div>
            <span className="font-bold text-slate-800">Front Desk</span>
          </Link>
        </section>

        {session.hotel.location && (
          <section className="flex gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500"><MapPin size={20} /></div>
            <div>
              <p className="font-bold text-slate-900">Location</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-500">{session.hotel.location}</p>
            </div>
          </section>
        )}
      </div>
    </MobileLayout>
  );
}
