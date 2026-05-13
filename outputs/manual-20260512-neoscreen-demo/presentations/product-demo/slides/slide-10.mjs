import { bg, footer, kicker, title, step, arrow, bullet, C } from "./common.mjs";

export async function slide10(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "Arsitektur");
  title(slide, ctx, "APK native tetap kecil, sementara web app membawa produk live.", "Instalasi lebih stabil dan fitur room bisa update lewat website.");
  step(slide, ctx, 1, "Android STB", "Neoscreen Launcher boot fullscreen dan memuat setup.", 70, 304, 190);
  step(slide, ctx, 2, "Setup screen", "Membuat kode pairing pendek via /api/stb.", 306, 304, 190);
  step(slide, ctx, 3, "Front Office", "Memilih room dan submit kode TV.", 542, 304, 190);
  step(slide, ctx, 4, "Room session", "Server mengirim hotel, room, dan session token.", 778, 304, 190);
  step(slide, ctx, 5, "Room TV", "APK membuka /d/{hotel}/{room}/main dengan cookie.", 1014, 304, 190);
  arrow(slide, ctx, 260, 358, 306, 358);
  arrow(slide, ctx, 496, 358, 542, 358);
  arrow(slide, ctx, 732, 358, 778, 358);
  arrow(slide, ctx, 968, 358, 1014, 358);
  ctx.addShape(slide, { x: 72, y: 500, w: 1134, h: 88, fill: C.panel2, line: ctx.line(C.line, 1) });
  ctx.addText(slide, { text: "Payoff operasional: hotel install sekali, pairing per room, lalu menerima update dashboard, IPTV, chat, service, alarm, dan canvas tanpa reinstall APK.", x: 98, y: 520, w: 1082, h: 44, fontSize: 18, color: C.white, bold: true, align: "center" });
  bullet(slide, ctx, "Native layer: launch, fullscreen, D-pad bridge, boot receiver, cookie injection.", 96, 610, 520);
  bullet(slide, ctx, "Web layer: semua UI tamu dan operasi staff/admin.", 660, 610, 470);
  footer(slide, ctx, 10);
  return slide;
}
