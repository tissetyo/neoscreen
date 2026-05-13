import { bg, footer, kicker, title, shot, bullet, C } from "./common.mjs";

export async function slide08(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "Guest service");
  title(slide, ctx, "Chat dan QR mobile mengubah TV menjadi kanal layanan dua arah.", "Tamu bisa lanjut dari TV ke handphone tanpa membuat login publik.");
  await shot(slide, ctx, "15-frontoffice-chat.png", 58, 294, 500, 264, "cover", "Chat staf");
  await shot(slide, ctx, "23-mobile-guest-portal.png", 646, 294, 500, 264, "cover", "Mobile companion");
  bullet(slide, ctx, "Front Office melihat percakapan dan konteks room sekaligus.", 72, 584, 500);
  bullet(slide, ctx, "Mobile session tamu terhubung via QR dan tetap room-scoped.", 660, 584, 500);
  ctx.addShape(slide, { x: 570, y: 360, w: 48, h: 2, fill: C.teal });
  ctx.addShape(slide, { x: 610, y: 354, w: 12, h: 12, fill: C.teal });
  footer(slide, ctx, 8);
  return slide;
}
