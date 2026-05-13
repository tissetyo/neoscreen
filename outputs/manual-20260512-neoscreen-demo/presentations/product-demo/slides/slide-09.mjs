import { bg, footer, kicker, title, shot, bullet, metric, C } from "./common.mjs";

export async function slide09(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "Super Admin");
  title(slide, ctx, "Super Admin mengontrol surface produk hotel dari tenant setup sampai TV canvas.", "Perubahan admin mengalir ke pengalaman room secara live.");
  await shot(slide, ctx, "20-tv-dashboard-canvas.png", 580, 120, 600, 354, "cover", "TV Dashboard Canvas");
  await shot(slide, ctx, "22-superadmin-stb-fleet.png", 60, 480, 440, 118, "cover", "STB fleet");
  metric(slide, ctx, "24x14", "Grid layout TV", 74, 250);
  metric(slide, ctx, "Apps", "Show, hide, reorder", 242, 250);
  metric(slide, ctx, "Fleet", "Visibility STB", 410, 250);
  bullet(slide, ctx, "Drag-and-drop canvas membuat posisi widget eksplisit.", 72, 356, 420);
  bullet(slide, ctx, "STB fleet dan policy IPTV memberi health layer untuk operator platform.", 72, 398, 440);
  footer(slide, ctx, 9);
  return slide;
}
