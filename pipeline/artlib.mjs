// Shared canvas art library for the B2-vehicle style demos.
// Hand-drawn look: jittered ink lines, colored costumes, transparent backgrounds.
import { createCanvas } from "@napi-rs/canvas";
import fs from "node:fs";
import path from "node:path";

export const INK = "#20242c";

export function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeCanvas(w, h) {
  return createCanvas(w, h).getContext("2d");
}

export function save(ctx, dir, file) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, file), ctx.canvas.toBuffer("image/png"));
  console.log(`art/${file}`);
}

// jittered ink stroke through points
export function pen(ctx, pts, { w = 5, color = INK, jitter = 1.6, rnd, close = false } = {}) {
  const r = rnd ?? mulberry32(7);
  ctx.strokeStyle = color; ctx.lineCap = "round"; ctx.lineJoin = "round";
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
    ctx.beginPath();
    ctx.lineWidth = w + (r() - 0.5) * 1.2;
    ctx.moveTo(x1 + (r() - 0.5) * jitter, y1 + (r() - 0.5) * jitter);
    ctx.quadraticCurveTo((x1 + x2) / 2 + (r() - 0.5) * jitter, (y1 + y2) / 2 + (r() - 0.5) * jitter, x2 + (r() - 0.5) * jitter, y2 + (r() - 0.5) * jitter);
    ctx.stroke();
  }
  if (close) {
    const [x1, y1] = pts[pts.length - 1], [x2, y2] = pts[0];
    ctx.beginPath(); ctx.lineWidth = w;
    ctx.moveTo(x1, y1); ctx.quadraticCurveTo((x1 + x2) / 2, (y1 + y2) / 2, x2, y2); ctx.stroke();
  }
}

export function oval(ctx, cx, cy, rx, ry, { fill, stroke, w = 5, rot = 0, rnd, jitter = 1.4 } = {}) {
  const r = rnd ?? mulberry32(11);
  ctx.beginPath();
  const steps = 26;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2 + (r() - 0.5) * 0.04;
    const x = cx + Math.cos(a) * rx + (r() - 0.5) * jitter;
    const y = cy + Math.sin(a) * ry + (r() - 0.5) * jitter;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.stroke(); }
}

// ---- character poses (800x1000 design, origin style of draw-assets.mjs) ----
const POSES = {
  stand: { neck: [400, 330], hip: [400, 560], lean: 0, tilt: 0, face: "dot-smile",
    armL: [[392, 352], [340, 450], [356, 516]], armR: [[408, 352], [462, 452], [446, 518]],
    legL: [[388, 560], [356, 760], [360, 928]], legR: [[412, 560], [440, 758], [456, 926]] },
  wave: { neck: [400, 330], hip: [400, 560], lean: 0.02, tilt: -0.1, face: "dot-smile",
    armL: [[392, 352], [340, 450], [356, 516]], armR: [[408, 352], [486, 292], [462, 208]],
    legL: [[388, 560], [356, 760], [360, 928]], legR: [[412, 560], [440, 758], [456, 926]] },
  point: { neck: [398, 330], hip: [400, 560], lean: 0, tilt: -0.04, face: "dot-smile",
    armL: [[390, 352], [338, 448], [356, 516]], armR: [[408, 352], [492, 380], [566, 366]],
    legL: [[388, 560], [354, 758], [360, 928]], legR: [[412, 560], [436, 756], [458, 926]] },
  walk: { neck: [402, 336], hip: [400, 562], lean: 0.05, tilt: 0, face: "dot-smile",
    armL: [[392, 358], [336, 430], [366, 486]], armR: [[410, 356], [468, 424], [436, 486]],
    legL: [[390, 562], [330, 740], [318, 920]], legR: [[412, 562], [462, 736], [492, 916]] },
  hold: { neck: [400, 332], hip: [400, 560], lean: 0, tilt: 0, face: "dot-smile",
    armL: [[392, 354], [346, 416], [384, 452]], armR: [[408, 354], [454, 416], [416, 452]],
    legL: [[388, 560], [356, 760], [360, 928]], legR: [[412, 560], [440, 758], [456, 926]] },
  jump: { neck: [400, 320], hip: [400, 540], lean: 0, tilt: 0, face: "dot-smile",
    armL: [[392, 342], [320, 290], [336, 218]], armR: [[408, 342], [480, 290], [464, 218]],
    legL: [[388, 540], [336, 690], [368, 780]], legR: [[412, 540], [464, 690], [432, 780]] },
  think: { neck: [400, 330], hip: [400, 560], lean: -0.02, tilt: 0, face: "dot-smile",
    armL: [[392, 352], [330, 440], [396, 468]], armR: [[408, 352], [468, 336], [422, 292]],
    legL: [[388, 560], [356, 760], [360, 928]], legR: [[412, 560], [440, 758], [456, 926]] },
  celebrate: { neck: [400, 330], hip: [400, 560], lean: 0, tilt: 0, face: "dot-smile",
    armL: [[392, 352], [318, 288], [334, 216]], armR: [[408, 352], [482, 288], [466, 216]],
    legL: [[388, 560], [330, 760], [312, 928]], legR: [[412, 560], [470, 760], [488, 928]] },
  carry: { neck: [400, 330], hip: [400, 560], lean: 0.02, tilt: 0, face: "dot-smile",
    armL: [[392, 352], [348, 430], [404, 442]], armR: [[408, 352], [452, 430], [396, 442]],
    legL: [[388, 560], [356, 760], [360, 928]], legR: [[412, 560], [440, 758], [456, 926]] },
};

// costume: {type:'shirt'|'beanie'|'hoodie'|'robe'|'vest', color, accent}
export function drawCharacter(dir, file, poseName, costume, seed = 42) {
  const W = 800, H = 1000;
  const ctx = makeCanvas(W, H);
  const rnd = mulberry32(seed);
  const g = POSES[poseName];
  const headR = 52;

  ctx.save();
  ctx.translate(g.hip[0], g.hip[1]); ctx.rotate(g.lean); ctx.translate(-g.hip[0], -g.hip[1]);

  // legs (limb color by costume)
  const limbColor = costume.limbColor || INK;
  for (const [a, b, c] of [g.legL, g.legR]) {
    pen(ctx, [a, b, c], { w: 5, color: limbColor, rnd });
    oval(ctx, c[0] + (c[0] > b[0] ? 8 : -8), c[1] + 3, 13, 6, { fill: limbColor, rot: 0.12 * (c[0] > b[0] ? 1 : -1) });
  }
  // torso garment behind the spine line
  if (costume.type === "shirt" || costume.type === "beanie") {
    const shirtColor = costume.shirtColor || costume.color;
    pen(ctx, [[g.neck[0] - 26, g.neck[1] + 6], [g.hip[0] - 30, g.hip[1] - 4], [g.hip[0] + 30, g.hip[1] - 4], [g.neck[0] + 26, g.neck[1] + 6]],
      { w: 3.4, color: shirtColor, jitter: 1, rnd, close: true });
    ctx.fillStyle = shirtColor + "55";
    ctx.beginPath(); ctx.moveTo(g.neck[0] - 24, g.neck[1] + 8); ctx.lineTo(g.hip[0] - 27, g.hip[1] - 6);
    ctx.lineTo(g.hip[0] + 27, g.hip[1] - 6); ctx.lineTo(g.neck[0] + 24, g.neck[1] + 8); ctx.closePath(); ctx.fill();
  } else if (costume.type === "hoodie") {
    ctx.fillStyle = costume.color;
    ctx.beginPath(); ctx.roundRect(g.neck[0] - 34, g.neck[1] + 4, 68, g.hip[1] - g.neck[1] - 6, 18); ctx.fill();
    pen(ctx, [[g.neck[0] - 34, g.neck[1] + 10], [g.neck[0] + 34, g.neck[1] + 10]], { w: 3, color: "#7c3a12", jitter: 0.8, rnd });
    oval(ctx, g.neck[0], g.neck[1] - 6, 34, 22, { fill: costume.color, stroke: "#7c3a12", w: 3, rnd }); // hood behind head
  } else if (costume.type === "robe") {
    ctx.fillStyle = costume.color;
    ctx.beginPath(); ctx.moveTo(g.neck[0] - 30, g.neck[1] + 8); ctx.lineTo(g.hip[0] - 52, g.hip[1] + 120);
    ctx.lineTo(g.hip[0] + 52, g.hip[1] + 120); ctx.lineTo(g.neck[0] + 30, g.neck[1] + 8); ctx.closePath(); ctx.fill();
    pen(ctx, [[g.neck[0] - 30, g.neck[1] + 8], [g.hip[0] - 52, g.hip[1] + 120]], { w: 3.4, color: "#3a3a3a", jitter: 1, rnd });
    pen(ctx, [[g.neck[0] + 30, g.neck[1] + 8], [g.hip[0] + 52, g.hip[1] + 120]], { w: 3.4, color: "#3a3a3a", jitter: 1, rnd });
    pen(ctx, [[g.hip[0] - 52, g.hip[1] + 40], [g.hip[0] + 52, g.hip[1] + 40]], { w: 6, color: costume.accent || "#b2352f", jitter: 1, rnd }); // belt/sash
  } else if (costume.type === "vest") {
    ctx.fillStyle = costume.color;
    ctx.beginPath(); ctx.roundRect(g.neck[0] - 30, g.neck[1] + 6, 60, 90, 12); ctx.fill();
  }
  // torso line
  pen(ctx, [g.neck, g.hip], { w: 5, color: limbColor, rnd });
  // arms
  for (const [a, b, c] of [g.armL, g.armR]) {
    pen(ctx, [a, b, c], { w: 5, color: limbColor, rnd });
    oval(ctx, c[0], c[1], 8.5, 11, { fill: costume.palm || limbColor });
  }
  // head
  const hx = g.neck[0], hy = g.neck[1] - headR - 6;
  oval(ctx, hx, hy, headR * 0.92, headR, { fill: costume.headFill || "#ffffff", stroke: INK, w: 5, rnd });
  // face: dot eyes + short line mouth (B2 grammar)
  const fy = hy + 2;
  oval(ctx, hx - 16, fy - 4, 4.5, 5.5, { fill: INK });
  oval(ctx, hx + 16, fy - 4, 4.5, 5.5, { fill: INK });
  ctx.strokeStyle = INK; ctx.lineWidth = 3.6; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(hx - 10, fy + 16); ctx.quadraticCurveTo(hx, fy + 24, hx + 10, fy + 16); ctx.stroke();
  // beanie
  if (costume.type === "beanie") {
    ctx.fillStyle = costume.color;
    ctx.beginPath(); ctx.ellipse(hx, hy - 14, headR * 0.95, headR * 0.72, 0, Math.PI, 0); ctx.fill();
    pen(ctx, [[hx - headR * 0.95, hy - 12], [hx + headR * 0.95, hy - 12]], { w: 7, color: costume.color, jitter: 0.8, rnd });
  }
  ctx.restore();
  save(ctx, dir, file);
}
