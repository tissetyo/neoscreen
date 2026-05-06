'use client';

import { useRoomStore } from '@/stores/roomStore';

export default function NotificationCard() {
  const notification = useRoomStore(s => s.latestNotification);
  const dismissNotification = useRoomStore(s => s.dismissNotification);

  if (!notification || notification.is_dismissed) {
    return null;
  }

  const createdAt = new Date(notification.created_at);
  const timeStr = createdAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const dateStr = createdAt.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div 
      className="tv-widget-light h-full flex flex-col tv-focusable relative overflow-hidden cursor-pointer text-black" 
      onClick={() => dismissNotification()}
      tabIndex={0}
      title="Press Enter to dismiss"
      style={{ borderRadius: 8, padding: 0, background: '#ffffff' }}
    >
      <div className="notification-card-header flex h-[21%] min-h-[36px] items-center gap-[clamp(6px,0.8cqw,14px)] p-[clamp(7px,0.9cqw,18px)] shrink-0">
        <span className="tv-badge-red shadow-sm">Notification</span>
        <span className="flex-1 text-[#909090] text-[clamp(10px,1cqw,20px)] text-right font-normal truncate">{timeStr},</span>
        <span className="text-[#909090] text-[clamp(10px,1cqw,20px)] font-normal whitespace-nowrap">{dateStr}</span>
      </div>
      <div className="notification-card-body flex flex-1 min-h-0 flex-col gap-[clamp(4px,0.8cqh,10px)] px-[clamp(8px,1cqw,18px)] py-[clamp(4px,0.8cqh,12px)] text-[clamp(10px,1.05cqw,22px)] leading-normal">
        <h3 className="notification-card-title text-black font-medium truncate">{notification.title}</h3>
        <p className="text-black font-normal leading-[1.45] flex-1 overflow-hidden"
          style={{ display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical' }}>
          {notification.message || (notification as any).body}
        </p>
      </div>
    </div>
  );
}
