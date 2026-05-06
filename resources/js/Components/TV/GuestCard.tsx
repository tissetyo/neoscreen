'use client';

interface Props {
  guestName: string;
  guestPhotoUrl: string | null;
  roomCode: string;
  onClick?: () => void;
}

export default function GuestCard({ guestName, guestPhotoUrl, roomCode, onClick }: Props) {
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
    <div className="guest-card h-full min-h-0 min-w-0 flex items-center justify-end tv-focusable tv-widget-transparent bg-transparent px-[clamp(6px,0.75cqw,14px)] py-[clamp(4px,0.5cqh,8px)] cursor-pointer overflow-hidden" tabIndex={0} onClick={onClick}>
      <div className="guest-card-shell flex max-w-full items-center gap-[clamp(7px,1cqw,14px)] rounded-full px-[clamp(8px,1.1cqw,16px)] py-[clamp(5px,0.7cqh,10px)]">
        <div className="guest-card-copy min-w-0 text-right text-white">
          <span className="guest-card-greeting block text-[clamp(7px,0.75cqw,13px)] font-normal leading-tight text-white/85">Hello</span>
          <span className="block max-w-[min(18vw,50cqw)] truncate text-[clamp(9px,1.2cqw,18px)] font-medium leading-tight">{guestName}</span>
        </div>
        <div className="guest-card-photo w-[clamp(34px,min(9cqw,72cqh),76px)] h-[clamp(34px,min(9cqw,72cqh),76px)] rounded-full overflow-hidden border-[clamp(2px,0.35cqw,3px)] border-[#d4af37] shadow-lg bg-slate-200 shrink-0">
          <img src={guestPhotoUrl || '/avatar.png'} alt="Guest" className="w-full h-full object-cover" />
        </div>
        <div className="guest-card-room flex items-center gap-[clamp(7px,1cqw,14px)] text-white shrink-0">
          <div className="guest-card-divider h-[min(3.6vw,70cqh)] w-px bg-white/35" />
          <div className="flex flex-col">
            <span className="text-[clamp(7px,0.75cqw,13px)] font-normal leading-tight text-white/85">Room</span>
            <span className="text-[clamp(18px,min(3.5cqw,42cqh),36px)] font-medium leading-none tracking-normal">{roomCode}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
