import { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import { Home, MessageCircle, ConciergeBell } from 'lucide-react';

interface MobileSessionProps {
  id: string;
  room: { room_code: string };
  hotel: { slug: string; name: string };
}

export default function MobileLayout({ children, session }: PropsWithChildren<{ session: MobileSessionProps }>) {
  const base = `/${session.hotel.slug}/mobile/${session.id}`;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-50 shadow-2xl">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-slate-900">{session.hotel.name}</p>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Room {session.room.room_code}</p>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-teal-100 bg-teal-50 text-sm font-black text-teal-700">
            {session.room.room_code}
          </div>
        </header>

        <main className="flex-1 pb-24">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md items-center justify-around border-t border-slate-200 bg-white px-6 py-3 pb-[max(env(safe-area-inset-bottom),12px)]">
          <Link href={base} className="flex flex-col items-center gap-1 text-slate-500 hover:text-teal-600">
            <Home size={22} />
            <span className="text-[10px] font-bold">Home</span>
          </Link>
          <Link href={`${base}/services`} className="flex flex-col items-center gap-1 text-slate-500 hover:text-teal-600">
            <ConciergeBell size={22} />
            <span className="text-[10px] font-bold">Services</span>
          </Link>
          <Link href={`${base}/chat`} className="flex flex-col items-center gap-1 text-slate-500 hover:text-teal-600">
            <MessageCircle size={22} />
            <span className="text-[10px] font-bold">Chat</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
