import { bg, footer, kicker, shot, pill, C } from "./common.mjs";

export async function slide01(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "Demo produk");
  ctx.addText(slide, { text: "Neoscreen menyatukan TV kamar, front office, super admin, STB launcher, IPTV, dan mobile guest portal.", x: 48, y: 108, w: 520, h: 126, fontSize: 29, color: C.white, bold: true, typeface: ctx.fonts.title });
  ctx.addText(slide, { text: "Satu operating layer untuk pengalaman digital di kamar hotel.", x: 50, y: 252, w: 500, h: 24, fontSize: 15, color: C.muted });
  await shot(slide, ctx, "01-portal-entry.png", 650, 118, 560, 360, "cover", "Portal produk");
  pill(slide, ctx, "Room TV", 54, 300, 120);
  pill(slide, ctx, "Front Office", 188, 300, 150);
  pill(slide, ctx, "Super Admin", 352, 300, 150);
  pill(slide, ctx, "STB Launcher", 54, 348, 150, "amber");
  pill(slide, ctx, "IPTV", 218, 348, 100);
  pill(slide, ctx, "Mobile QR", 332, 348, 130);
  ctx.addShape(slide, { x: 54, y: 440, w: 510, h: 112, fill: C.panel, line: ctx.line(C.line, 1) });
  ctx.addText(slide, { text: "Paket demo berisi screenshot, dua GIF demo, dan deck PowerPoint yang bisa diedit untuk sales atau stakeholder walkthrough.", x: 78, y: 462, w: 462, h: 68, fontSize: 17, color: C.text });
  footer(slide, ctx, 1);
  return slide;
}
