import { bg, footer, kicker, title, shot, bullet, C } from "./common.mjs";

export async function slide04(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "UX remote");
  title(slide, ctx, "Kontrol remote-first mengurangi kebingungan tamu non-teknis.", "UI tetap tenang sampai tamu menekan tombol, lalu pilihan fokus muncul.");
  await shot(slide, ctx, "05-room-tv-remote-guide.png", 52, 400, 520, 185, "cover", "Petunjuk aksi");
  await shot(slide, ctx, "09-room-tv-opened-feature.png", 640, 176, 520, 350, "cover", "Settings via D-pad");
  bullet(slide, ctx, "Default state tetap calm dan full-screen.", 62, 288, 430);
  bullet(slide, ctx, "Action state menampilkan carousel dan app aktif.", 62, 330, 430);
  bullet(slide, ctx, "Menu memakai target besar dan hint D-pad yang jelas.", 62, 610, 560);
  ctx.addShape(slide, { x: 690, y: 548, w: 420, h: 70, fill: C.panel, line: ctx.line(C.line, 1) });
  ctx.addText(slide, { text: "Prinsip desain: setiap layar bisa dipakai dengan Left, Right, OK, dan Back.", x: 712, y: 562, w: 376, h: 42, fontSize: 16, color: C.text, bold: true });
  footer(slide, ctx, 4);
  return slide;
}
