import MobileLayout from '@/Layouts/MobileLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { Send } from 'lucide-react';

interface Message { id: string; sender: 'guest' | 'staff'; message: string; created_at: string; }
interface Props { session: { id: string; room: { room_code: string }; hotel: { slug: string; name: string } }; }

export default function MobileChat({ session }: Props) {
  const [text, setText] = useState('');
  const bottom = useRef<HTMLDivElement>(null);
  const { data: messages = [], mutate } = useSWR<Message[]>(`/api/mobile/${session.id}/chat`, async (url: string) => {
    const res = await fetch(url);
    const json = await res.json();
    return json.messages || [];
  }, { refreshInterval: 5000 });

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    const message = text.trim();
    setText('');
    await fetch(`/api/mobile/${session.id}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    mutate();
  };

  return (
    <MobileLayout session={session}>
      <Head title="Front Desk Chat" />
      <div className="flex h-[calc(100vh-145px)] flex-col">
        <section className="shrink-0 bg-teal-600 px-5 py-4 text-white">
          <h1 className="text-lg font-black">Front Desk Chat</h1>
          <p className="text-xs text-teal-50">Send a message directly to hotel staff.</p>
        </section>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map(message => {
            const guest = message.sender === 'guest';
            return (
              <div key={message.id} className={`flex ${guest ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] whitespace-pre-wrap rounded-3xl px-4 py-2.5 text-sm shadow-sm ${guest ? 'rounded-br-md bg-slate-900 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-800'}`}>
                  {message.message}
                  <p className={`mt-1 text-[10px] ${guest ? 'text-right text-slate-400' : 'text-slate-400'}`}>{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottom} />
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-white p-3">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Type your message..." className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 py-3 text-sm outline-none ring-teal-500 focus:ring-2" />
          <button onClick={send} disabled={!text.trim()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white disabled:opacity-50"><Send size={18} /></button>
        </div>
      </div>
    </MobileLayout>
  );
}
