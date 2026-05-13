import { bg, footer, kicker, title, thumb, videoFile, C } from "./common.mjs";

export async function slide11(presentation, ctx) {
  const slide = presentation.slides.add();
  bg(slide, ctx);
  kicker(slide, ctx, "Media demo");
  title(slide, ctx, "Paket ini berisi screenshot dan dua klip GIF demo yang bisa dipakai ulang.", "File GIF disimpan bersama deck untuk web, chat, atau follow-up sales.");
  await thumb(slide, ctx, "neoscreen-tv-experience-demo.png", 70, 296, 500, 246, "Klip pengalaman TV");
  await thumb(slide, ctx, "neoscreen-operations-demo.png", 710, 296, 500, 246, "Klip operasional");
  ctx.addText(slide, { text: "neoscreen-tv-experience-demo.gif", x: 90, y: 566, w: 460, h: 22, fontSize: 15, color: C.teal, typeface: ctx.fonts.mono });
  ctx.addText(slide, { text: "neoscreen-operations-demo.gif", x: 730, y: 566, w: 460, h: 22, fontSize: 15, color: C.teal, typeface: ctx.fonts.mono });
  ctx.addText(slide, { text: videoFile(ctx, "neoscreen-tv-experience-demo.gif"), x: 90, y: 594, w: 460, h: 44, fontSize: 9, color: C.muted, typeface: ctx.fonts.mono });
  ctx.addText(slide, { text: videoFile(ctx, "neoscreen-operations-demo.gif"), x: 730, y: 594, w: 460, h: 44, fontSize: 9, color: C.muted, typeface: ctx.fonts.mono });
  footer(slide, ctx, 11);
  return slide;
}
