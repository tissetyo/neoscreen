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
    <div className="wifi-card tv-widget !p-0 w-full h-full min-h-0 flex flex-col rounded-[var(--widget-radius)] overflow-hidden tv-focusable [transform:translateZ(0)]" tabIndex={0}>
      {/* Dark Header */}
      <div className="wifi-card-header bg-gradient-to-r from-[#1a1408] to-[#2a1f0a] backdrop-blur-md px-[clamp(8px,1.45cqw,36px)] py-[clamp(6px,1.25cqh,22px)] flex items-center gap-[clamp(5px,0.95cqw,20px)] border-b border-[#d4af37]/30 shrink-0">
         <Wifi className="wifi-card-icon w-[clamp(12px,2.1cqw,42px)] h-[clamp(12px,2.1cqw,42px)] text-[#d4af37]" strokeWidth={2.5} />
         <span className="wifi-card-title text-[#f3e5ab] font-medium tracking-normal text-[clamp(10px,2.05cqw,40px)] uppercase truncate">Wifi Access</span>
      </div>
      
      {/* Light Body */}
      <div className="wifi-card-body bg-white/95 backdrop-blur-xl flex-1 min-h-0 flex items-center justify-between px-[clamp(24px,4cqw,60px)] py-[clamp(16px,2cqh,40px)] gap-[clamp(24px,4cqw,60px)] overflow-hidden">
        <div className="wifi-card-qr rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-white" style={{ width: 'clamp(50px, min(36cqw, 78cqh), 400px)', height: 'clamp(50px, min(36cqw, 78cqh), 400px)' }}>
          <QRCode value={wifiString} size={256} level="M" style={{ width: '100%', height: '100%' }} />
        </div>
        
        <div className="wifi-card-details flex max-w-[52cqw] flex-col gap-[clamp(4px,1.4cqh,18px)] min-w-0">
          <div>
            <p className="wifi-card-label text-slate-500 text-[clamp(10px,1.5cqw,28px)] font-medium tracking-normal">SSID</p>
            <p className="wifi-card-value text-slate-900 text-[clamp(14px,3cqw,56px)] font-bold leading-tight truncate">{ssid}</p>
          </div>
          {username && (
            <div>
              <p className="wifi-card-label text-slate-500 text-[clamp(8px,1.1cqw,22px)] font-medium tracking-normal">Username</p>
              <p className="wifi-card-value text-slate-900 text-[clamp(10px,1.8cqw,36px)] font-medium leading-tight truncate">{username}</p>
            </div>
          )}
          {password && (
            <div>
              <p className="wifi-card-label text-slate-500 text-[clamp(10px,1.5cqw,28px)] font-medium tracking-normal">Password</p>
              <p className="wifi-card-value text-slate-900 text-[clamp(14px,2.8cqw,52px)] font-bold leading-tight font-mono truncate">{password}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
