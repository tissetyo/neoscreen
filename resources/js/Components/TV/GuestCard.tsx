'use client';

interface Props {
  guestName: string;
  guestPhotoUrl: string | null;
  roomCode: string;
  onClick?: () => void;
}

export default function GuestCard({ guestName, guestPhotoUrl, roomCode, onClick }: Props) {
  const fallbackPhotoUrl = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=480&auto=format&fit=crop&crop=faces';
  const displayPhotoUrl = guestPhotoUrl || fallbackPhotoUrl;

  if (!guestName) {
    return (
      <div className="tv-widget-light h-full min-h-0 flex flex-col items-center justify-center tv-focusable cursor-pointer" tabIndex={0} onClick={onClick}>
        <span className="text-slate-500 text-[clamp(11px,1vw,18px)] font-medium mb-[0.5vh]">Room {roomCode}</span>
        <span className="text-slate-400 text-[0.55vw] tracking-normal uppercase font-medium">Vacant</span>
      </div>
    );
  }

  return (
    <div className="guest-card h-full w-full min-h-0 min-w-0 flex items-center tv-focusable cursor-pointer overflow-hidden rounded-[var(--widget-radius)] [transform:translateZ(0)]" tabIndex={0} onClick={onClick}>
      <div className="guest-card-shell flex h-full w-full min-w-0 items-center justify-between gap-[clamp(12px,2cqw,40px)] bg-transparent px-[clamp(20px,3cqw,50px)] py-[clamp(12px,2cqh,30px)]">
        
        {/* Left side: Text - Takes up most space and text is huge */}
        <div className="guest-card-copy flex-1 min-w-0 text-right text-white flex flex-col justify-center pr-[clamp(10px,1.5cqw,30px)]">
          <span className="guest-card-greeting block text-[clamp(14px,2cqw,32px)] font-normal leading-relaxed text-white/90">Welcome</span>
          <span className="guest-card-name block max-w-full truncate text-[clamp(32px,5.5cqw,96px)] font-semibold leading-tight tracking-tight">{guestName}</span>
        </div>

        {/* Right side: Photo and Room Info */}
        <div className="flex items-center gap-[clamp(16px,2.5cqw,48px)] shrink-0">
          <div className="guest-card-photo w-[clamp(60px,min(18cqw,85cqh),180px)] h-[clamp(60px,min(18cqw,85cqh),180px)] rounded-full overflow-hidden border-[clamp(2px,0.5cqw,6px)] border-[#d4af37] shadow-xl bg-slate-200 shrink-0">
            <img
              src={displayPhotoUrl}
              alt="Guest"
              className="w-full h-full object-cover"
              onError={(event) => {
                if (event.currentTarget.src !== fallbackPhotoUrl) {
                  event.currentTarget.src = fallbackPhotoUrl;
                }
              }}
            />
          </div>
          
          <div className="guest-card-divider h-[min(8vw,75cqh)] w-px bg-white/30" />
          
          <div className="flex flex-col text-white">
            <span className="guest-card-room-label text-[clamp(12px,1.5cqw,24px)] font-normal leading-tight text-white/85">Room</span>
            <span className="guest-card-room-number text-[clamp(28px,min(6.5cqw,65cqh),84px)] font-bold leading-none tracking-normal">{roomCode}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
