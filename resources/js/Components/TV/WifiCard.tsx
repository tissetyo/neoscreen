'use client';

import { QRCode } from 'react-qr-code';
import { Wifi } from 'lucide-react';

interface Props {
  ssid: string;
  username?: string;
  password?: string;
}

export default function WifiCard({ ssid, username, password }: Props) {
  if (!ssid) {
    return (
      <div className="tv-widget-light h-full min-h-0 flex flex-col items-center justify-center opacity-70 tv-focusable" tabIndex={0}>
         <Wifi className="w-[2vw] h-[2vw] text-slate-400 mb-2" />
         <span className="text-slate-500 text-[0.8vw] font-medium">WiFi Unconfigured</span>
      </div>
    );
  }

  const wifiString = `WIFI:S:${ssid};T:WPA;P:${password || ''};;`;

  return (
    <div className="wifi-card h-full min-h-0 flex flex-col rounded-[var(--widget-radius)] overflow-hidden shadow-xl tv-focusable transition-transform hover:scale-[1.02]" tabIndex={0}>
      {/* Dark Header */}
      <div className="wifi-card-header bg-gradient-to-r from-[#1a1408] to-[#2a1f0a] backdrop-blur-md px-[clamp(8px,1.15cqw,28px)] py-[clamp(6px,1.05cqh,18px)] flex items-center gap-[clamp(5px,0.85cqw,16px)] border-b border-[#d4af37]/30 shrink-0">
         <Wifi className="wifi-card-icon w-[clamp(12px,1.7cqw,34px)] h-[clamp(12px,1.7cqw,34px)] text-[#d4af37]" strokeWidth={2.5} />
         <span className="wifi-card-title text-[#f3e5ab] font-medium tracking-normal text-[clamp(10px,1.55cqw,28px)] uppercase truncate">Wifi Access</span>
      </div>
      
      {/* Light Body */}
      <div className="wifi-card-body bg-white/95 backdrop-blur-xl flex-1 min-h-0 flex items-center p-[clamp(7px,1.3cqw,30px)] gap-[clamp(7px,1.25cqw,30px)] overflow-hidden">
        <div className="wifi-card-qr rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-white" style={{ width: 'clamp(42px, min(30cqw, 76cqh), 240px)', height: 'clamp(42px, min(30cqw, 76cqh), 240px)' }}>
          <QRCode value={wifiString} size={256} level="M" style={{ width: '100%', height: '100%' }} />
        </div>
        
        <div className="wifi-card-details flex flex-col gap-[min(0.8cqw,1cqh)] min-w-0 flex-1">
          <div>
            <p className="wifi-card-label text-slate-500 text-[clamp(7px,0.9cqw,16px)] font-medium tracking-normal">SSID</p>
            <p className="wifi-card-value text-slate-900 text-[clamp(9px,1.55cqw,30px)] font-medium leading-tight truncate">{ssid}</p>
          </div>
          {username && (
            <div>
              <p className="wifi-card-label text-slate-500 text-[clamp(7px,0.82cqw,15px)] font-medium tracking-normal">Username</p>
              <p className="wifi-card-value text-slate-900 text-[clamp(8px,1.35cqw,26px)] font-medium leading-tight truncate">{username}</p>
            </div>
          )}
          {password && (
            <div>
              <p className="wifi-card-label text-slate-500 text-[clamp(7px,0.82cqw,15px)] font-medium tracking-normal">Password</p>
              <p className="wifi-card-value text-slate-900 text-[clamp(8px,1.38cqw,27px)] font-medium leading-tight font-mono truncate">{password}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
