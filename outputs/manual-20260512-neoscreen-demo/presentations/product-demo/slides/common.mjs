import path from "node:path";

export const C = {
  ink: "#07101F",
  ink2: "#0B1528",
  panel: "#101B31",
  panel2: "#14243B",
  teal: "#29D5C7",
  teal2: "#0F766E",
  amber: "#D5B84A",
  red: "#E25563",
  white: "#F8FAFC",
  text: "#DCE7F6",
  muted: "#8FA4BF",
  line: "#29405F",
};

export function screenshot(ctx, file) {
  return path.join(ctx.assetDir, "screenshots", file);
}

export function videoThumb(ctx, file) {
  return path.join(ctx.assetDir, "video-thumbnails", file);
}

export function videoFile(ctx, file) {
  return path.join(ctx.assetDir, "videos", file);
}

export function bg(slide, ctx) {
  ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: ctx.H, fill: C.ink });
  ctx.addShape(slide, { x: 0, y: 0, w: ctx.W, h: 92, fill: "#0A1324" });
  ctx.addShape(slide, { x: 0, y: 91, w: ctx.W, h: 1, fill: C.line });
}

export function footer(slide, ctx, n) {
  ctx.addText(slide, { text: "Demo produk Neoscreen", x: 48, y: 674, w: 420, h: 22, fontSize: 12, color: C.muted });
  ctx.addText(slide, { text: String(n).padStart(2, "0"), x: 1184, y: 668, w: 48, h: 28, fontSize: 14, color: C.muted, align: "right", typeface: ctx.fonts.mono });
}

export function kicker(slide, ctx, label) {
  ctx.addShape(slide, { x: 48, y: 36, w: 28, h: 3, fill: C.teal, name: "kicker-marker" });
  ctx.addText(slide, { text: label.toUpperCase(), x: 88, y: 24, w: 360, h: 28, fontSize: 13, color: C.teal, bold: true, name: "kicker-label" });
}

export function title(slide, ctx, claim, sub = "") {
  ctx.addText(slide, { text: claim, x: 48, y: 108, w: 520, h: 104, fontSize: 30, color: C.white, bold: true, typeface: ctx.fonts.title });
  if (sub) ctx.addText(slide, { text: sub, x: 50, y: 218, w: 500, h: 38, fontSize: 15, color: C.muted });
}

export function pill(slide, ctx, text, x, y, w, tone = "teal") {
  const fill = tone === "amber" ? "#4A3E13" : "#0A3838";
  const line = tone === "amber" ? C.amber : C.teal;
  ctx.addShape(slide, { x, y, w, h: 34, fill, line: ctx.line(line, 1) });
  ctx.addText(slide, { text, x: x + 12, y: y + 8, w: w - 24, h: 18, fontSize: 12, color: tone === "amber" ? "#FFF1A8" : "#BDFCF5", bold: true, align: "center" });
}

export function bullet(slide, ctx, text, x, y, w, color = C.text) {
  ctx.addShape(slide, { x, y: y + 8, w: 7, h: 7, fill: C.teal });
  ctx.addText(slide, { text, x: x + 18, y, w, h: 42, fontSize: 16, color });
}

export function metric(slide, ctx, value, label, x, y, w = 150) {
  ctx.addShape(slide, { x, y, w, h: 74, fill: C.panel, line: ctx.line(C.line, 1) });
  ctx.addText(slide, { text: value, x: x + 14, y: y + 12, w: w - 28, h: 28, fontSize: 24, color: C.white, bold: true });
  ctx.addText(slide, { text: label, x: x + 14, y: y + 44, w: w - 28, h: 18, fontSize: 11, color: C.muted });
}

export function frame(slide, ctx, x, y, w, h, label = "") {
  ctx.addShape(slide, { x: x - 2, y: y - 2, w: w + 4, h: h + 4, fill: "#0E1A2E", line: ctx.line(C.line, 1) });
  if (label) ctx.addText(slide, { text: label, x: x, y: y - 26, w, h: 18, fontSize: 12, color: C.muted, bold: true });
}

export async function shot(slide, ctx, file, x, y, w, h, fit = "cover", label = "") {
  frame(slide, ctx, x, y, w, h, label);
  await ctx.addImage(slide, { path: screenshot(ctx, file), x, y, w, h, fit, alt: file });
}

export async function thumb(slide, ctx, file, x, y, w, h, label = "") {
  frame(slide, ctx, x, y, w, h, label);
  await ctx.addImage(slide, { path: videoThumb(ctx, file), x, y, w, h, fit: "cover", alt: file });
}

export function step(slide, ctx, n, label, detail, x, y, w = 210) {
  ctx.addShape(slide, { x, y, w, h: 120, fill: C.panel, line: ctx.line(C.line, 1) });
  ctx.addShape(slide, { x: x + 16, y: y + 16, w: 30, h: 30, fill: C.teal });
  ctx.addText(slide, { text: String(n), x: x + 16, y: y + 21, w: 30, h: 18, fontSize: 13, color: C.ink, bold: true, align: "center" });
  ctx.addText(slide, { text: label, x: x + 58, y: y + 15, w: w - 74, h: 28, fontSize: 15, color: C.white, bold: true });
  ctx.addText(slide, { text: detail, x: x + 18, y: y + 56, w: w - 36, h: 42, fontSize: 12, color: C.muted });
}

export function arrow(slide, ctx, x1, y1, x2, y2) {
  const w = x2 - x1;
  ctx.addShape(slide, { x: x1, y: y1, w, h: 2, fill: C.teal });
  ctx.addShape(slide, { x: x2 - 8, y: y2 - 5, w: 10, h: 10, fill: C.teal });
}
