import { bg, footer, kicker, title, step, bullet, C } from "./common.mjs";

export async function slide12(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "Rencana pilot");
  title(slide, ctx, "Demo berikutnya sebaiknya pilot room nyata: install, pair, test, observe.", "Produk siap untuk validasi STB dengan set room kecil.");
  step(slide, ctx, 1, "Install", "Download STB Launcher v2 dari /launcher.", 80, 292, 210);
  step(slide, ctx, 2, "Pair", "Gunakan STB Pairing Front Office dengan kode TV.", 320, 292, 210);
  step(slide, ctx, 3, "Validasi", "Cek Room TV, IPTV, chat, alarm, services, dan QR mobile.", 560, 292, 210);
  step(slide, ctx, 4, "Monitor", "Review analytics, channel report, dan STB fleet status.", 800, 292, 210);
  ctx.addShape(slide, { x: 80, y: 480, w: 930, h: 92, fill: C.panel2, line: ctx.line(C.line, 1) });
  ctx.addText(slide, { text: "Pilot rekomendasi: 3 room, 2 model STB, 1 shift staf, dan satu country pack IPTV. Catat buffering, friction remote, dan waktu pairing per room.", x: 108, y: 502, w: 874, h: 46, fontSize: 18, color: C.white, bold: true });
  bullet(slide, ctx, "Deliverable hari ini: screenshot, GIF demo, PPTX editable, dan halaman download APK.", 98, 596, 780);
  ctx.addText(slide, { text: "neoscreen.site/launcher", x: 920, y: 596, w: 260, h: 24, fontSize: 18, color: C.amber, bold: true, typeface: ctx.fonts.mono, align: "right" });
  footer(slide, ctx, 12);
  return slide;
}
