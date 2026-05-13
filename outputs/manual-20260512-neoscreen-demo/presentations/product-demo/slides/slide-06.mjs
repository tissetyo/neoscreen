import { bg, footer, kicker, title, shot, step, arrow, bullet, C } from "./common.mjs";

export async function slide06(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "STB launcher v2");
  title(slide, ctx, "Instalasi STB menjadi flow pairing staf yang sederhana.", "Tidak ada lagi mengetik slug hotel atau kode room di layar TV.");
  await shot(slide, ctx, "02-stb-launcher-downloads.png", 710, 122, 430, 210, "cover", "Portal download");
  await shot(slide, ctx, "03-stb-pairing-code.png", 710, 386, 430, 210, "cover", "Setup screen TV");
  step(slide, ctx, 1, "Buka portal", "neoscreen.site/launcher", 62, 314, 150);
  step(slide, ctx, 2, "Install APK", "Android STB atau Smart TV", 238, 314, 170);
  step(slide, ctx, 3, "Input kode", "Front Office memilih room", 434, 314, 170);
  arrow(slide, ctx, 212, 368, 238, 368);
  arrow(slide, ctx, 408, 368, 434, 368);
  bullet(slide, ctx, "Label APK: Neoscreen Launcher", 72, 458, 480);
  bullet(slide, ctx, "Versi: 2.0.0; default host: neoscreen.site", 72, 500, 480);
  bullet(slide, ctx, "Native wrapper menyimpan room session token dan membuka /d/{hotel}/{room}/main.", 72, 542, 560);
  footer(slide, ctx, 6);
  return slide;
}
