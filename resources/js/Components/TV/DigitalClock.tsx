'use client';

import { useEffect, useState } from 'react';

interface Props {
  timezone: string;
  location: string;
}

export default function DigitalClock({ timezone, location }: Props) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = () => {
    try {
      if (!timezone || typeof timezone !== 'string') throw new Error('Invalid timezone');
      return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }).replace(':', '.');
    } catch {
      return time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '.');
    }
  };

  const formatAmPm = () => {
    try {
      if (!timezone || typeof timezone !== 'string') throw new Error('Invalid timezone');
      return time.toLocaleTimeString('en-US', { hour12: true, timeZone: timezone }).split(' ')[1];
    } catch {
      return time.toLocaleTimeString('en-US', { hour12: true }).split(' ')[1];
    }
  };

  const formatDate = () => {
    try {
      if (!timezone || typeof timezone !== 'string') throw new Error('Invalid timezone');
      return time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: timezone });
    } catch {
      return time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    }
  };

  return (
    <div className="digital-clock flex h-full min-h-0 max-w-full flex-col justify-center text-white tv-text-shadow overflow-hidden">
      <div className="digital-clock-weather flex items-center gap-[0.5vw] mb-[0.3vh] min-w-0">
        <span className="text-[clamp(10px,1vw,20px)]">☁️</span>
        <span className="truncate text-[clamp(8px,0.78vw,15px)] text-white/80 font-normal">24°C • {location || 'Hotel'}</span>
      </div>
      <div className="digital-clock-time flex items-baseline gap-[0.8vw]">
        <span className="text-[clamp(26px,min(4.8vw,38cqh),86px)] font-normal leading-none tracking-normal" style={{ fontFamily: 'Poppins, Montserrat, sans-serif' }}>
          {formatTime()}
        </span>
        <span className="text-[clamp(9px,1.05vw,20px)] font-normal text-white/80 tracking-normal uppercase">
          {formatAmPm()}
        </span>
      </div>
      <div className="digital-clock-date truncate text-[clamp(8px,0.85vw,16px)] text-white/85 font-normal tracking-normal mt-[0.3vh]">
        {formatDate()}
      </div>
    </div>
  );
}
