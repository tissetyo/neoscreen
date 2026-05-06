'use client';

import { useEffect, useState } from 'react';
import type { FlightData } from '@/types';

const statusClass: Record<string, string> = {
  on_schedule: 'status-on-schedule',
  delay: 'status-delay',
  last_call: 'status-last-call',
  closed: 'status-closed',
  gate_open: 'status-gate-open',
  check_in: 'status-check-in',
};

const statusLabel: Record<string, string> = {
  on_schedule: 'ON SCHEDULE',
  delay: 'DELAY',
  last_call: 'LAST CALL',
  closed: 'CLOSED',
  gate_open: 'GATE OPEN',
  check_in: 'CHECK-IN',
};

export default function FlightSchedule() {
  const [flights, setFlights] = useState<FlightData[]>([]);

  useEffect(() => {
    fetch('/api/flights?airport=DPS')
      .then(r => r.json())
      .then(d => setFlights(d.flights || []))
      .catch(() => {});

    const interval = setInterval(() => {
      fetch('/api/flights?airport=DPS')
        .then(r => r.json())
        .then(d => setFlights(d.flights || []))
        .catch(() => {});
    }, 300000); // 5 min
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tv-widget h-full min-h-0 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 mb-[0.6vh] min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[clamp(12px,1vw,18px)]">✈️</span>
          <span className="text-white tv-responsive-title font-semibold truncate">Flight Schedule</span>
        </div>
        <div className="flex items-center gap-1.5 bg-[#d4af37]/20 border border-[#d4af37]/30 rounded-full px-[0.6vw] py-[0.3vh] min-w-0 max-w-[52%]">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] shrink-0" />
          <span className="text-[#f3e5ab] text-[clamp(8px,0.62vw,12px)] font-medium truncate">I Gusti Ngurah Rai</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto hide-scrollbar">
        <table className="w-full tv-responsive-body">
          <thead>
            <tr className="text-white/50 text-left border-b border-white/10">
              <th className="pb-2 font-medium">Flight</th>
              <th className="pb-2 font-medium">Time</th>
              <th className="pb-2 font-medium">Destination</th>
              <th className="pb-2 font-medium">Gate</th>
              <th className="pb-2 font-medium">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((f, i) => (
              <tr key={i} className="border-b border-white/5 text-white">
                <td className="py-1.5">
                  <span className="text-orange-400 font-semibold text-[clamp(8px,0.65vw,12px)]">{f.airline}</span>
                  <span className="ml-2">{f.flightNumber}</span>
                </td>
                <td className="py-1.5">{f.time}</td>
                <td className="py-1.5">{f.destination}</td>
                <td className="py-1.5">{f.gate}</td>
                <td className="py-1.5">
                  <span className={statusClass[f.status] || 'text-white'}>{statusLabel[f.status] || f.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
