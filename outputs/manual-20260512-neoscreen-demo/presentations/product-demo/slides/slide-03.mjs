import { bg, footer, kicker, title, shot, metric, bullet, C } from "./common.mjs";

export async function slide03(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "Guest TV");
  title(slide, ctx, "TV kamar langsung masuk ke dashboard tamu, bukan landing page.", "Visual besar, jam, nama tamu, room, layanan, app, IPTV, dan running text ada dalam satu canvas remote-friendly.");
  await shot(slide, ctx, "04-room-tv-dashboard.png", 602, 128, 590, 348, "cover", "Dashboard Room 101");
  metric(slide, ctx, "24x14", "Grid layout admin", 62, 316);
  metric(slide, ctx, "QR", "Mobile companion", 230, 316);
  metric(slide, ctx, "IPTV", "Slot live TV", 398, 316);
  bullet(slide, ctx, "First viewport full-screen untuk audiens TV.", 70, 430, 460);
  bullet(slide, ctx, "Widget dan app bisa disusun ulang dari Super Admin.", 70, 476, 460);
  bullet(slide, ctx, "Running text dan jam lokal tetap terlihat tanpa mendominasi layar.", 70, 522, 460);
  footer(slide, ctx, 3);
  return slide;
}
