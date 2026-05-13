import { bg, footer, kicker, title, shot, metric, bullet, C } from "./common.mjs";

export async function slide07(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "Front Office");
  title(slide, ctx, "Front Office menjadi control room untuk room, tamu, request, dan STB.", "Interface staf memegang workflow operasional harian.");
  await shot(slide, ctx, "13-frontoffice-dashboard.png", 56, 294, 520, 258, "cover", "Dashboard operasional");
  await shot(slide, ctx, "14-frontoffice-stb-pairing.png", 646, 294, 520, 258, "cover", "Pairing STB");
  metric(slide, ctx, "60%", "Occupancy demo", 662, 132);
  metric(slide, ctx, "6 digit", "Kode pairing TV", 830, 132);
  metric(slide, ctx, "1 view", "Pair semua room", 998, 132);
  bullet(slide, ctx, "Tim desk melihat unread chat, pending request, dan alarm workload.", 72, 580, 520);
  bullet(slide, ctx, "Pairing STB dipisah dari edit room agar instalasi lebih aman dan mudah dilatih.", 656, 580, 520);
  footer(slide, ctx, 7);
  return slide;
}
