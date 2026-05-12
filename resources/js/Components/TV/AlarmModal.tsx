'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlarmClock, CheckCircle2, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useRoomStore } from '@/stores/roomStore';
import { useDpadNavigation } from '@/lib/hooks/useDpadNavigation';

interface AlarmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_TIMES = [
  { label: '06:00', hours: 6, minutes: 0, amPm: 'AM' as const },
  { label: '06:30', hours: 6, minutes: 30, amPm: 'AM' as const },
  { label: '07:00', hours: 7, minutes: 0, amPm: 'AM' as const },
  { label: '07:30', hours: 7, minutes: 30, amPm: 'AM' as const },
  { label: '08:00', hours: 8, minutes: 0, amPm: 'AM' as const },
];

export default function AlarmModal({ isOpen, onClose }: AlarmModalProps) {
  const store = useRoomStore();
  const authHeaders = store.roomSessionToken ? { 'X-Room-Token': store.roomSessionToken } : {};
  const [hours, setHours] = useState(7);
  const [minutes, setMinutes] = useState(0);
  const [amPm, setAmPm] = useState<'AM' | 'PM'>('AM');
  const [activeField, setActiveField] = useState<'hour' | 'minute' | 'period'>('hour');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSaved(false);
    setHours(7);
    setMinutes(0);
    setAmPm('AM');
    setActiveField('hour');
  }, [isOpen]);

  useDpadNavigation({ enabled: isOpen, onEscape: onClose, selector: '.alarm-focusable' });

  const adjustHours = (delta: number) => {
    setHours((h) => {
      const next = h + delta;
      if (next > 12) return 1;
      if (next < 1) return 12;
      return next;
    });
  };

  const adjustMinutes = (delta: number) => {
    setMinutes((m) => {
      const next = m + delta;
      if (next >= 60) return 0;
      if (next < 0) return 55;
      return next;
    });
  };

  const cycleField = (delta: number) => {
    const fields: Array<typeof activeField> = ['hour', 'minute', 'period'];
    const idx = fields.indexOf(activeField);
    setActiveField(fields[(idx + delta + fields.length) % fields.length]);
  };

  const adjustActiveField = (delta: number) => {
    if (activeField === 'hour') adjustHours(delta);
    if (activeField === 'minute') adjustMinutes(delta * 5);
    if (activeField === 'period') setAmPm((p) => (p === 'AM' ? 'PM' : 'AM'));
  };

  const setQuickTime = (time: typeof QUICK_TIMES[number]) => {
    setHours(time.hours);
    setMinutes(time.minutes);
    setAmPm(time.amPm);
  };

  const handleSubmit = async () => {
    if (!store.roomId || !store.hotelId || saving) return;
    setSaving(true);

    let scheduledHour = hours;
    if (amPm === 'PM' && hours !== 12) scheduledHour += 12;
    if (amPm === 'AM' && hours === 12) scheduledHour = 0;

    const res = await fetch(`/api/room/${store.roomId}/alarm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({
        alarm_time: `${scheduledHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        is_active: true,
      })
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => onClose(), 1800);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Backspace') {
      e.preventDefault();
      onClose();
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      cycleField(-1);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      cycleField(1);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      adjustActiveField(1);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      adjustActiveField(-1);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const fieldClass = (field: typeof activeField) =>
    `rounded-3xl border px-[2vw] py-[2vh] text-center transition-all ${
      activeField === field
        ? 'border-[#d4af37] bg-[#d4af37]/20 shadow-[0_0_35px_rgba(212,175,55,0.18)]'
        : 'border-white/12 bg-white/6'
    }`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.78)' }}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="glass-card w-[min(74vw,1120px)] overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-[2.4vw] py-[2vh]">
              <div className="flex items-center gap-[1vw]">
                <div className="flex h-[3.2vw] w-[3.2vw] items-center justify-center rounded-2xl bg-[#d4af37]/20 text-[#f3e5ab]">
                  <AlarmClock className="h-[1.6vw] w-[1.6vw]" />
                </div>
                <div>
                  <h2 className="text-[clamp(24px,2vw,40px)] font-semibold text-white">Wake-Up Alarm</h2>
                  <p className="text-[clamp(14px,0.9vw,18px)] text-white/50">Left or right chooses a field. Up or down changes the time. OK sets it.</p>
                </div>
              </div>
              <button onClick={onClose} className="alarm-focusable rounded-full p-[0.8vw] text-white/60 transition-colors hover:text-white" tabIndex={0}>
                <X className="h-[1.7vw] w-[1.7vw]" />
              </button>
            </div>

            {saved ? (
              <div className="flex min-h-[42vh] flex-col items-center justify-center p-[4vw] text-center">
                <CheckCircle2 className="mb-[1.2vh] h-[5vw] w-[5vw] text-[#d4af37]" />
                <p className="text-[clamp(28px,2.4vw,48px)] font-semibold text-white">Alarm set</p>
                <p className="mt-[0.6vh] text-[clamp(18px,1.2vw,24px)] text-white/60">
                  Wake-up call at {hours}:{minutes.toString().padStart(2, '0')} {amPm}
                </p>
              </div>
            ) : (
              <div className="p-[2.4vw]">
                <div className="mb-[2vh] grid grid-cols-5 gap-[0.8vw]">
                  {QUICK_TIMES.map((time) => (
                    <button
                      key={time.label}
                      onClick={() => setQuickTime(time)}
                      className="alarm-focusable rounded-2xl border border-white/12 bg-white/8 px-[1vw] py-[1.3vh] text-[clamp(18px,1.4vw,28px)] font-semibold text-white transition-colors hover:border-[#d4af37]"
                      tabIndex={0}
                    >
                      {time.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr_0.75fr] items-center gap-[1vw]">
                  <div className={fieldClass('hour')} onClick={() => setActiveField('hour')}>
                    <ChevronUp className="mx-auto mb-[0.4vh] h-[1.4vw] w-[1.4vw] text-white/55" />
                    <p className="text-[clamp(56px,6vw,110px)] font-bold leading-none text-white tabular-nums">{hours.toString().padStart(2, '0')}</p>
                    <ChevronDown className="mx-auto mt-[0.4vh] h-[1.4vw] w-[1.4vw] text-white/55" />
                  </div>
                  <span className="text-[clamp(56px,5vw,96px)] font-bold text-white/80">:</span>
                  <div className={fieldClass('minute')} onClick={() => setActiveField('minute')}>
                    <ChevronUp className="mx-auto mb-[0.4vh] h-[1.4vw] w-[1.4vw] text-white/55" />
                    <p className="text-[clamp(56px,6vw,110px)] font-bold leading-none text-white tabular-nums">{minutes.toString().padStart(2, '0')}</p>
                    <ChevronDown className="mx-auto mt-[0.4vh] h-[1.4vw] w-[1.4vw] text-white/55" />
                  </div>
                  <button className={fieldClass('period')} onClick={() => { setActiveField('period'); setAmPm((p) => p === 'AM' ? 'PM' : 'AM'); }}>
                    <p className="text-[clamp(38px,3.4vw,70px)] font-bold text-white">{amPm}</p>
                  </button>
                </div>

                <div className="mt-[2.4vh] flex items-center justify-between gap-[1vw]">
                  <div className="flex items-center gap-[0.5vw] text-white/45">
                    <ChevronLeft className="h-[1vw] w-[1vw]" />
                    <span className="text-[clamp(13px,0.85vw,18px)]">Select field</span>
                    <ChevronRight className="h-[1vw] w-[1vw]" />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={saving}
                    className="alarm-focusable rounded-2xl bg-[#14b8a6] px-[3vw] py-[1.4vh] text-[clamp(18px,1.25vw,26px)] font-bold text-white transition-all disabled:opacity-50"
                    tabIndex={0}
                  >
                    {saving ? 'Setting...' : 'Set Alarm'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
