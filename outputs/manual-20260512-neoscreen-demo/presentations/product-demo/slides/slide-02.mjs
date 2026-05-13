import { bg, footer, kicker, title, shot, step, arrow, C } from "./common.mjs";

export async function slide02(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "Peta produk");
  title(slide, ctx, "Produk bekerja sebagai satu sistem di enam surface hotel.", "Setiap surface punya tugas jelas, dengan data room yang sama.");
  await shot(slide, ctx, "02-stb-launcher-downloads.png", 740, 126, 430, 214, "cover", "Portal installer");
  await shot(slide, ctx, "13-frontoffice-dashboard.png", 740, 388, 430, 230, "cover", "Operasional hotel");
  step(slide, ctx, 1, "Portal", "Mengarahkan user ke workspace yang tepat.", 58, 300, 160);
  step(slide, ctx, 2, "Admin", "Mengatur hotel, canvas, IPTV, akun, dan STB fleet.", 250, 250, 185);
  step(slide, ctx, 3, "Front Office", "Pairing STB dan operasi tamu harian.", 470, 300, 190);
  step(slide, ctx, 4, "Room TV", "Dashboard tamu berbasis remote.", 250, 430, 185);
  step(slide, ctx, 5, "Mobile", "QR companion untuk service dan chat.", 58, 430, 160);
  arrow(slide, ctx, 218, 354, 248, 354);
  arrow(slide, ctx, 435, 304, 468, 344);
  arrow(slide, ctx, 468, 444, 438, 476);
  ctx.addText(slide, { text: "Data hotel, room, session, layout, IPTV, service, chat, dan alarm dipakai bersama", x: 60, y: 578, w: 596, h: 28, fontSize: 15, color: C.teal, bold: true, align: "center" });
  footer(slide, ctx, 2);
  return slide;
}
