import { bg, footer, kicker, title, shot, bullet, C } from "./common.mjs";

export async function slide05(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "IPTV");
  title(slide, ctx, "IPTV adalah fitur hotel terkelola, bukan player eksternal lepas.", "Overlay TV, daftar channel, dan kontrol admin berada dalam operating model yang sama.");
  await shot(slide, ctx, "11-room-tv-iptv-modal.png", 58, 294, 520, 260, "cover", "Overlay live TV");
  await shot(slide, ctx, "21-superadmin-iptv-controls.png", 648, 294, 520, 260, "cover", "Kontrol availability admin");
  bullet(slide, ctx, "Tamu melihat overlay TV-native dengan jam lokal dan brand treatment.", 68, 594, 480);
  bullet(slide, ctx, "Admin mengatur availability, country pack, dan health channel.", 658, 594, 480);
  ctx.addText(slide, { text: "Hasil operasional: channel rusak disembunyikan, lineup terbaik ditampilkan, dan interface TV tetap sederhana.", x: 646, y: 210, w: 500, h: 50, fontSize: 17, color: C.text });
  footer(slide, ctx, 5);
  return slide;
}
