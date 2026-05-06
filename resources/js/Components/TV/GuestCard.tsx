'use client';

interface Props {
  guestName: string;
  guestPhotoUrl: string | null;
  roomCode: string;
  onClick?: () => void;
}

export default function GuestCard({ guestName, guestPhotoUrl, roomCode, onClick }: Props) {
  const guestInitial = guestName?.trim()?.charAt(0)?.toUpperCase() || 'G';

  if (!guestName) {
    return (
      <div className="tv-widget-light h-full min-h-0 flex flex-col items-center justify-center tv-focusable cursor-pointer" tabIndex={0} onClick={onClick}>
        <span className="text-slate-500 text-[clamp(11px,1vw,18px)] font-medium mb-[0.5vh]">Room {roomCode}</span>
        <span className="text-slate-400 text-[0.55vw] tracking-normal uppercase font-medium">Vacant</span>
      </div>
    );
  }

  // The Reference mockup displays:
  // [Hello]  [guest photo overlapping a text pane] | [Room 417]
  return (
    <div className="guest-card h-full min-h-0 min-w-0 flex items-center justify-end tv-focusable tv-widget-transparent bg-transparent px-[clamp(6px,1cqw,24px)] py-[clamp(4px,0.75cqh,14px)] cursor-pointer overflow-hidden" tabIndex={0} onClick={onClick}>
      <div className="guest-card-shell flex max-w-full items-center gap-[clamp(7px,1.25cqw,26px)] rounded-full px-[clamp(8px,1.4cqw,30px)] py-[clamp(5px,0.9cqh,18px)]">
        <div className="guest-card-copy min-w-0 text-right text-white">
          <span className="guest-card-greeting block text-[clamp(7px,0.9cqw,18px)] font-normal leading-tight text-white/85">Hello</span>
          <span className="guest-card-name block max-w-[min(24vw,58cqw)] truncate text-[clamp(9px,1.55cqw,32px)] font-medium leading-tight">{guestName}</span>
        </div>
        <div className="guest-card-photo w-[clamp(34px,min(11cqw,78cqh),118px)] h-[clamp(34px,min(11cqw,78cqh),118px)] rounded-full overflow-hidden border-[clamp(2px,0.4cqw,5px)] border-[#d4af37] shadow-lg bg-slate-200 shrink-0">
          {guestPhotoUrl ? (
            <img src={guestPhotoUrl} alt="Guest" className="w-full h-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 text-[clamp(18px,4cqw,48px)] font-medium text-white">
              {guestInitial}
            </div>
          )}
        </div>
        <div className="guest-card-room flex items-center gap-[clamp(7px,1.25cqw,26px)] text-white shrink-0">
          <div className="guest-card-divider h-[min(3.6vw,70cqh)] w-px bg-white/35" />
          <div className="flex flex-col">
            <span className="guest-card-room-label text-[clamp(7px,0.9cqw,18px)] font-normal leading-tight text-white/85">Room</span>
            <span className="guest-card-room-number text-[clamp(18px,min(4.6cqw,52cqh),58px)] font-medium leading-none tracking-normal">{roomCode}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
