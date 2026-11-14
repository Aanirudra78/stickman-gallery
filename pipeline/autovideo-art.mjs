// Keyword-driven canvas art for the generic video pipeline (B1/B2 vehicle).
// Style identity comes from a palette: costume + backdrop motif + prop colors.
import { makeCanvas, save, pen, oval, drawCharacter, mulberry32, INK } from "./artlib.mjs";

export { drawCharacter };

const W = 1280, H = 720;

// ---------- palettes ----------
export const PALETTES = {
  "B1":   { style: "B1", backdrop: null, ink: INK, accent: "#2e6b3a",
            costume: { type: "shirt", shirtColor: "#ffffff", limbColor: INK, headFill: "#ffffff", palm: INK } },
  "A1.1": { style: "B1", backdrop: null, ink: INK, accent: "#2e6b3a",
            costume: { type: "shirt", shirtColor: "#ffffff", limbColor: INK, headFill: "#ffffff", palm: INK } },
  "A1.2": { style: "B1", backdrop: null, ink: "#1a1a1a", accent: "#1a1a1a", mono: true,
            costume: { type: "shirt", shirtColor: "#1a1a1a", limbColor: "#1a1a1a", headFill: "#ffffff", palm: "#1a1a1a" } },
  "B2":   { style: "B2", backdrop: "warm", ink: "#2b2a26", accent: "#d7372c",
            costume: { type: "shirt", shirtColor: "#2a8f85", limbColor: INK, headFill: "#fff8ec", palm: "#f0c987" } },
  "A2.1": { style: "B2", backdrop: "tech", ink: "#232838", accent: "#3a6df0",
            costume: { type: "beanie", color: "#d7372c", shirtColor: "#f2b632", limbColor: INK, headFill: "#fff8ec", palm: "#f0c987" } },
  "A2.2": { style: "B2", backdrop: "dusk", ink: "#2b2330", accent: "#e8963c",
            costume: { type: "beanie", color: "#d7372c", shirtColor: "#f2b632", limbColor: INK, headFill: "#fff8ec", palm: "#f0c987" } },
  "A3":   { style: "B2", backdrop: "cave", ink: "#2e2418", accent: "#a3572b",
            costume: { type: "vest", color: "#7a5a34", limbColor: INK, headFill: "#fff2dc", palm: "#e8c79a" } },
  "A4":   { style: "B2", backdrop: "cozy", ink: "#3a2c22", accent: "#d97b29",
            costume: { type: "shirt", shirtColor: "#e8863c", limbColor: INK, headFill: "#fff8ec", palm: "#f0c987" } },
  "A5":   { style: "B2", backdrop: "history", ink: "#26262e", accent: "#2e5aa8",
            costume: { type: "robe", color: "#34549c", accent: "#b2352f", limbColor: INK, headFill: "#fff8ec", palm: "#f0c987" } },
  "A6":   { style: "B2", backdrop: "noir", ink: "#0f1420", accent: "#e8a13c",
            costume: { type: "hoodie", color: "#b35a1c", limbColor: "#1c2230", headFill: "#efe9df", palm: "#efe9df" } },
};

// ---------- backdrops (full-frame 1280x720, drawn plain: no motion) ----------
const BACKDROPS = {
  warm(ctx, r) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#f7efdc"); g.addColorStop(1, "#f2e4c4");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    oval(ctx, 1080, 120, 70, 70, { fill: "rgba(240,180,90,0.35)" });
    pen(ctx, [[80, 640], [300, 640], [520, 640]], { w: 3, color: "rgba(120,100,70,0.25)", jitter: 2, rnd: r });
  },
  tech(ctx, r) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#dde4f2"); g.addColorStop(1, "#c9d4ea");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(58,109,240,0.16)";
    for (let i = 0; i < 16; i++) ctx.fillRect(60 + r() * 1160, 60 + r() * 560, 10, 10);
    ctx.strokeStyle = "rgba(58,109,240,0.22)"; ctx.lineWidth = 3;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.moveTo(r() * W, r() * H); ctx.lineTo(r() * W, r() * H);
      ctx.lineTo(r() * W, r() * H); ctx.stroke();
    }
    ctx.fillStyle = "#b9c6de"; ctx.fillRect(0, 660, W, 60);
  },
  dusk(ctx, r) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#f5c98a"); g.addColorStop(0.55, "#d98a5c"); g.addColorStop(1, "#8a4a52");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    oval(ctx, 640, 430, 90, 90, { fill: "rgba(255,220,150,0.85)" });
    ctx.fillStyle = "#5c3a44"; ctx.fillRect(0, 560, W, 160);
    pen(ctx, [[-20, 560], [1300, 560]], { w: 4, color: "#4c3038", jitter: 1, rnd: r });
    pen(ctx, [[640, 620], [590, 700]], { w: 8, color: "rgba(245,220,180,0.5)", jitter: 1, rnd: r });
    pen(ctx, [[640, 620], [700, 700]], { w: 8, color: "rgba(245,220,180,0.5)", jitter: 1, rnd: r });
  },
  cave(ctx, r) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#4a3826"); g.addColorStop(1, "#2c2015");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) {
      const x = 40 + i * 145, len = 40 + r() * 90;
      pen(ctx, [[x, 0], [x + 12, len * 0.6], [x, len]], { w: 10, color: "#241a10", jitter: 2, rnd: r });
    }
    // torch glow on the wall
    const g2 = ctx.createRadialGradient(200, 300, 20, 200, 300, 260);
    g2.addColorStop(0, "rgba(220,140,60,0.25)"); g2.addColorStop(1, "rgba(220,140,60,0)");
    ctx.fillStyle = g2; ctx.fillRect(0, 60, 420, 480);
    ctx.fillStyle = "#3a2c1a"; ctx.fillRect(0, 640, W, 80);
  },
  cozy(ctx, r) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#f3e2c8"); g.addColorStop(1, "#e8d0ac");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // window with warm light
    ctx.fillStyle = "#c9a878"; ctx.fillRect(80, 90, 220, 260);
    ctx.fillStyle = "rgba(255,214,140,0.9)"; ctx.fillRect(96, 106, 188, 228);
    pen(ctx, [[186, 106], [186, 334]], { w: 6, color: "#c9a878", jitter: 0.8, rnd: r });
    pen(ctx, [[96, 220], [284, 220]], { w: 6, color: "#c9a878", jitter: 0.8, rnd: r });
    // potted plant right
    pen(ctx, [[1150, 640], [1150, 560]], { w: 7, color: "#6a4a2c", jitter: 1, rnd: r });
    oval(ctx, 1150, 540, 60, 44, { fill: "#5a8a4a", stroke: "#4a6a3a", w: 3, rnd: r });
    ctx.fillStyle = "#d8b98c"; ctx.fillRect(0, 650, W, 70);
  },
  history(ctx, r) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#efe3cc"); g.addColorStop(1, "#e0d0b0");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // distant castle silhouette
    ctx.fillStyle = "rgba(120,100,80,0.4)";
    ctx.fillRect(950, 320, 60, 180); ctx.fillRect(1030, 280, 80, 220); ctx.fillRect(1130, 340, 50, 160);
    for (const [x, w] of [[950, 60], [1030, 80], [1130, 50]]) {
      ctx.beginPath(); ctx.moveTo(x - 6, 320 + (w === 80 ? -40 : 0));
      ctx.lineTo(x + w / 2, 260 + (w === 80 ? -60 : 20)); ctx.lineTo(x + w + 6, 320 + (w === 80 ? -40 : 0));
      ctx.fill();
    }
    // ground path
    pen(ctx, [[-10, 640], [400, 620], [800, 660], [1300, 630]], { w: 26, color: "rgba(160,130,90,0.4)", jitter: 3, rnd: r });
  },
  noir(ctx, r) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#141a28"); g.addColorStop(1, "#1e2636");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // city silhouette
    ctx.fillStyle = "#0c1018";
    for (let x = 0; x < W; x += 90) ctx.fillRect(x, 300 + r() * 80, 70, H);
    // amber windows
    ctx.fillStyle = "rgba(232,161,60,0.7)";
    for (let i = 0; i < 22; i++) ctx.fillRect(10 + r() * 1240, 340 + r() * 240, 8, 10);
    // street lamp pool
    ctx.fillStyle = "rgba(232,161,60,0.14)";
    oval(ctx, 240, 640, 170, 46, { fill: "rgba(232,161,60,0.14)" });
    ctx.fillStyle = "#0a0e16"; ctx.fillRect(0, 660, W, 60);
  },
};

export function drawBackdrop(dir, file, palette, seed) {
  if (!palette.backdrop) return null;
  const ctx = makeCanvas(W, H);
  (BACKDROPS[palette.backdrop] || BACKDROPS.warm)(ctx, mulberry32(seed));
  save(ctx, dir, file);
  return `${dir}/${file}`;
}

// ---------- props (transparent bg, ~260x260 canvas) ----------
const PROPS = {
  money(ctx, r, a) {
    pen(ctx, [[40, 90], [220, 90], [220, 170], [40, 170]], { w: 5, color: a.ink, close: true, rnd: r });
    oval(ctx, 130, 130, 24, 24, { fill: a.accent, stroke: a.ink, w: 3, rnd: r });
    pen(ctx, [[70, 200], [190, 200]], { w: 4, color: a.ink, rnd: r });
    oval(ctx, 130, 226, 26, 26, { fill: a.accent, stroke: a.ink, w: 3.5, rnd: r });
  },
  phone(ctx, r, a) {
    pen(ctx, [[90, 30], [170, 30], [170, 210], [90, 210]], { w: 5, color: a.ink, close: true, rnd: r });
    ctx.fillStyle = a.accent; ctx.fillRect(100, 48, 60, 130);
    oval(ctx, 130, 196, 7, 7, { fill: a.ink });
  },
  idea(ctx, r, a) {
    oval(ctx, 130, 110, 52, 58, { fill: "#f5d76e", stroke: a.ink, w: 4, rnd: r });
    pen(ctx, [[112, 170], [112, 190], [148, 190], [148, 170]], { w: 4, color: a.ink, rnd: r });
    for (const [dx, dy] of [[-70, -50], [0, -80], [70, -50]]) pen(ctx, [[130, 40], [130 + dx, 40 + dy]], { w: 3, color: "#e8b93c", jitter: 1, rnd: r });
  },
  heart(ctx, r, a) {
    ctx.fillStyle = a.accent;
    ctx.beginPath(); ctx.moveTo(130, 200);
    ctx.bezierCurveTo(30, 130, 60, 40, 130, 90);
    ctx.bezierCurveTo(200, 40, 230, 130, 130, 200);
    ctx.fill(); pen(ctx, [[130, 90], [130, 200]], { w: 0.1, color: a.accent, jitter: 0, rnd: r });
    pen(ctx, [[60, 70], [40, 40]], { w: 4, color: a.ink, jitter: 1, rnd: r });
  },
  time(ctx, r, a) {
    oval(ctx, 130, 120, 70, 70, { fill: "#ffffff", stroke: a.ink, w: 5, rnd: r });
    pen(ctx, [[130, 120], [130, 70]], { w: 5, color: a.ink, jitter: 0.6, rnd: r });
    pen(ctx, [[130, 120], [168, 140]], { w: 5, color: a.accent, jitter: 0.6, rnd: r });
    pen(ctx, [[130, 48], [130, 38]], { w: 4, color: a.ink, jitter: 0.4, rnd: r });
  },
  chart(ctx, r, a) {
    ctx.fillStyle = a.accent; ctx.fillRect(60, 160, 40, 60); ctx.fillRect(110, 120, 40, 100); ctx.fillRect(160, 70, 40, 150);
    pen(ctx, [[50, 220], [210, 220]], { w: 5, color: a.ink, jitter: 1, rnd: r });
    pen(ctx, [[60, 140], [130, 100], [190, 50]], { w: 5, color: a.ink, jitter: 1, rnd: r });
    pen(ctx, [[190, 50], [172, 52], [190, 68]], { w: 4, color: a.ink, jitter: 0.5, rnd: r });
  },
  book(ctx, r, a) {
    pen(ctx, [[50, 80], [50, 190]], { w: 5, color: a.ink, jitter: 1, rnd: r });
    pen(ctx, [[50, 80], [120, 92], [126, 196]], { w: 4, color: a.ink, jitter: 1, rnd: r });
    pen(ctx, [[126, 196], [130, 92], [206, 80], [206, 190], [130, 196]], { w: 4, color: a.ink, jitter: 1, rnd: r });
    ctx.fillStyle = a.accent; ctx.fillRect(96, 96, 30, 8);
  },
  city(ctx, r, a) {
    ctx.fillStyle = a.accent;
    ctx.fillRect(30, 140, 50, 100); ctx.fillRect(90, 100, 60, 140); ctx.fillRect(160, 150, 60, 90);
    pen(ctx, [[120, 100], [120, 60]], { w: 4, color: a.ink, jitter: 0.6, rnd: r });
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    for (let i = 0; i < 10; i++) ctx.fillRect(38 + r() * 180, 110 + r() * 110, 8, 8);
    pen(ctx, [[20, 240], [240, 240]], { w: 5, color: a.ink, jitter: 1, rnd: r });
  },
  home(ctx, r, a) {
    pen(ctx, [[40, 130], [130, 50], [220, 130]], { w: 5, color: a.ink, jitter: 1.4, rnd: r });
    pen(ctx, [[60, 120], [60, 220], [200, 220], [200, 120]], { w: 5, color: a.ink, close: true, rnd: r });
    pen(ctx, [[112, 220], [112, 160], [148, 160], [148, 220]], { w: 4, color: a.ink, close: true, rnd: r });
    ctx.fillStyle = a.accent; ctx.fillRect(170, 140, 20, 20);
  },
  star(ctx, r, a) {
    ctx.fillStyle = "#f5c84c";
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2 - Math.PI / 2, rad = i % 2 ? 42 : 95;
      const x = 130 + Math.cos(ang) * rad, y = 130 + Math.sin(ang) * rad;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill();
    pen(ctx, [[130, 35], [130, 225]], { w: 0.1, color: "#f5c84c", jitter: 0, rnd: r });
  },
  warning(ctx, r, a) {
    pen(ctx, [[130, 40], [230, 200], [30, 200]], { w: 6, color: a.accent, close: true, rnd: r });
    pen(ctx, [[130, 90], [130, 150]], { w: 7, color: a.ink, jitter: 0.6, rnd: r });
    oval(ctx, 130, 176, 5, 5, { fill: a.ink });
  },
  food(ctx, r, a) {
    oval(ctx, 130, 150, 66, 62, { fill: "#d7372c", stroke: a.ink, w: 4, rnd: r });
    pen(ctx, [[130, 92], [130, 70]], { w: 5, color: "#5a7a3a", jitter: 0.6, rnd: r });
    oval(ctx, 152, 74, 18, 10, { fill: "#5a7a3a", rot: 0.5, rnd: r });
  },
  ball(ctx, r, a) {
    oval(ctx, 130, 130, 70, 70, { fill: a.accent, stroke: a.ink, w: 4, rnd: r });
    pen(ctx, [[70, 110], [190, 150]], { w: 4, color: a.ink, jitter: 1, rnd: r });
  },
  brain(ctx, r, a) {
    oval(ctx, 130, 130, 62, 54, { fill: "#f2b6c1", stroke: a.ink, w: 4, rnd: r });
    pen(ctx, [[130, 78], [130, 182]], { w: 3, color: a.ink, jitter: 0.3, rnd: r });
    for (const [x1, y1, x2, y2] of [[100, 110, 130, 125], [140, 100, 155, 130], [105, 150, 140, 145], [150, 155, 172, 142]])
      pen(ctx, [[x1, y1], [x2, y2]], { w: 3, color: a.ink, jitter: 1, rnd: r });
  },
  trophy(ctx, r, a) {
    pen(ctx, [[85, 50], [175, 50], [165, 130], [95, 130]], { w: 5, color: "#e8b93c", close: true, rnd: r });
    ctx.fillStyle = "#e8b93c"; ctx.fillRect(95, 55, 70, 20);
    pen(ctx, [[85, 70], [55, 70], [70, 110]], { w: 4, color: "#e8b93c", jitter: 0.5, rnd: r });
    pen(ctx, [[175, 70], [205, 70], [190, 110]], { w: 4, color: "#e8b93c", jitter: 0.5, rnd: r });
    pen(ctx, [[118, 130], [112, 175], [148, 175], [142, 130]], { w: 4, color: a.ink, rnd: r });
    pen(ctx, [[90, 185], [170, 185], [170, 200], [90, 200]], { w: 4, color: a.ink, close: true, rnd: r });
  },
  crown(ctx, r, a) {
    pen(ctx, [[40, 170], [40, 90], [85, 130], [130, 70], [175, 130], [220, 90], [220, 170]], { w: 5, color: "#e8b93c", close: true, rnd: r });
    pen(ctx, [[40, 170], [220, 170]], { w: 5, color: a.ink, jitter: 0.6, rnd: r });
    oval(ctx, 130, 66, 9, 9, { fill: "#d7372c", rnd: r });
    for (const x of [70, 130, 190]) oval(ctx, x, 150, 8, 8, { fill: a.accent, rnd: r });
  },
  rocket(ctx, r, a) {
    pen(ctx, [[130, 30], [160, 90], [160, 160], [100, 160], [100, 90]], { w: 5, color: a.ink, close: true, rnd: r });
    oval(ctx, 130, 100, 14, 14, { fill: a.accent, stroke: a.ink, w: 3, rnd: r });
    pen(ctx, [[100, 120], [70, 160], [100, 160]], { w: 4, color: a.ink, close: true, rnd: r });
    pen(ctx, [[160, 120], [190, 160], [160, 160]], { w: 4, color: a.ink, close: true, rnd: r });
    for (const dx of [-14, 0, 14])
      pen(ctx, [[130 + dx, 162], [130 + dx * 1.6, 205]], { w: 4, color: "#e8763c", jitter: 1, rnd: r });
  },
  hourglass(ctx, r, a) {
    pen(ctx, [[70, 45], [190, 45]], { w: 5, color: a.ink, jitter: 0.6, rnd: r });
    pen(ctx, [[70, 215], [190, 215]], { w: 5, color: a.ink, jitter: 0.6, rnd: r });
    pen(ctx, [[80, 50], [130, 120], [80, 210]], { w: 4, color: a.ink, close: true, rnd: r });
    pen(ctx, [[180, 50], [130, 120], [180, 210]], { w: 4, color: a.ink, close: true, rnd: r });
    ctx.fillStyle = a.accent;
    ctx.beginPath(); ctx.moveTo(105, 58); ctx.lineTo(155, 58); ctx.lineTo(130, 112); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(130, 128); ctx.lineTo(172, 205); ctx.lineTo(88, 205); ctx.closePath(); ctx.fill();
  },
  key(ctx, r, a) {
    oval(ctx, 90, 100, 34, 34, { fill: "#f5d76e", stroke: a.ink, w: 4, rnd: r });
    oval(ctx, 90, 100, 12, 12, { fill: "#ffffff", stroke: a.ink, w: 3, rnd: r });
    pen(ctx, [[118, 122], [200, 195]], { w: 6, color: a.ink, jitter: 0.3, rnd: r });
    pen(ctx, [[175, 170], [196, 150]], { w: 5, color: a.ink, rnd: r });
    pen(ctx, [[190, 187], [211, 167]], { w: 5, color: a.ink, rnd: r });
  },
  lock(ctx, r, a) {
    pen(ctx, [[80, 110], [80, 75], [100, 55], [130, 55], [160, 75], [160, 110]], { w: 6, color: a.ink, jitter: 0.5, rnd: r });
    ctx.fillStyle = a.accent; ctx.fillRect(55, 110, 150, 110);
    pen(ctx, [[55, 110], [205, 110], [205, 220], [55, 220]], { w: 5, color: a.ink, close: true, rnd: r });
    oval(ctx, 130, 155, 16, 16, { fill: "#ffffff", stroke: a.ink, w: 3, rnd: r });
    pen(ctx, [[130, 168], [130, 192]], { w: 5, color: a.ink, jitter: 0, rnd: r });
  },
  target(ctx, r, a) {
    oval(ctx, 130, 130, 78, 78, { fill: "#ffffff", stroke: a.ink, w: 4, rnd: r });
    oval(ctx, 130, 130, 52, 52, { fill: a.accent, stroke: a.ink, w: 3, rnd: r });
    oval(ctx, 130, 130, 26, 26, { fill: "#ffffff", stroke: a.ink, w: 3, rnd: r });
    oval(ctx, 130, 130, 10, 10, { fill: a.ink, rnd: r });
    pen(ctx, [[40, 220], [118, 142]], { w: 4, color: a.ink, jitter: 0.6, rnd: r });
    pen(ctx, [[118, 142], [118, 162], [98, 142]], { w: 3, color: a.ink, close: true, rnd: r });
  },
  puzzle(ctx, r, a) {
    pen(ctx, [[60, 90], [60, 190], [160, 190], [160, 128]], { w: 5, color: a.ink, jitter: 0.8, rnd: r });
    pen(ctx, [[160, 90], [60, 90]], { w: 5, color: a.ink, jitter: 0.8, rnd: r });
    oval(ctx, 160, 110, 15, 15, { fill: a.accent, stroke: a.ink, w: 3, rnd: r });
    oval(ctx, 110, 90, 15, 15, { fill: "#ffffff", stroke: a.ink, w: 3, rnd: r });
    ctx.fillStyle = a.accent; ctx.fillRect(70, 102, 40, 40);
  },
  gift(ctx, r, a) {
    ctx.fillStyle = a.accent; ctx.fillRect(55, 110, 150, 110);
    pen(ctx, [[55, 110], [205, 110], [205, 220], [55, 220]], { w: 5, color: a.ink, close: true, rnd: r });
    pen(ctx, [[55, 155], [205, 155]], { w: 4, color: a.ink, jitter: 0.4, rnd: r });
    pen(ctx, [[122, 110], [122, 220], [138, 220], [138, 110]], { w: 4, color: "#ffffff", jitter: 0, rnd: r });
    oval(ctx, 115, 95, 18, 13, { fill: "#ffffff", stroke: a.ink, w: 3, rot: -0.4, rnd: r });
    oval(ctx, 145, 95, 18, 13, { fill: "#ffffff", stroke: a.ink, w: 3, rot: 0.4, rnd: r });
  },
  coins(ctx, r, a) {
    for (const y of [200, 178, 156, 134])
      oval(ctx, 130, y, 52, 13, { fill: "#f5d76e", stroke: a.ink, w: 3.5, rnd: r });
    oval(ctx, 192, 204, 40, 11, { fill: "#f5d76e", stroke: a.ink, w: 3, rnd: r });
  },
  calendar(ctx, r, a) {
    pen(ctx, [[45, 60], [215, 60], [215, 215], [45, 215]], { w: 5, color: a.ink, close: true, jitter: 0.6, rnd: r });
    pen(ctx, [[45, 95], [215, 95]], { w: 4, color: a.ink, jitter: 0.4, rnd: r });
    ctx.fillStyle = a.accent; ctx.fillRect(47, 62, 166, 31);
    for (const x of [80, 130, 180]) pen(ctx, [[x, 42], [x, 68]], { w: 5, color: a.ink, jitter: 0.3, rnd: r });
    for (let i = 0; i < 6; i++) {
      const x = 60 + (i % 3) * 50, y = 110 + Math.floor(i / 3) * 40;
      ctx.fillStyle = i === 5 ? "#d7372c" : "#ffffff";
      ctx.fillRect(x, y, 24, 24);
      pen(ctx, [[x, y], [x + 24, y], [x + 24, y + 24], [x, y + 24]], { w: 2.5, color: a.ink, jitter: 0.2, rnd: r });
    }
  },
  bell(ctx, r, a) {
    ctx.fillStyle = a.accent;
    ctx.beginPath(); ctx.moveTo(70, 160); ctx.quadraticCurveTo(75, 60, 130, 55); ctx.quadraticCurveTo(185, 60, 190, 160); ctx.closePath(); ctx.fill();
    pen(ctx, [[60, 160], [200, 160]], { w: 6, color: a.ink, jitter: 0.4, rnd: r });
    oval(ctx, 130, 178, 12, 12, { fill: a.ink, rnd: r });
    for (const dx of [-45, 45]) pen(ctx, [[130 + dx * 0.6, 70], [130 + dx, 42]], { w: 3, color: "#e8b93c", jitter: 0.8, rnd: r });
  },
  shield(ctx, r, a) {
    pen(ctx, [[130, 40], [210, 70], [210, 140], [130, 210], [50, 140], [50, 70]], { w: 5, color: a.ink, close: true, rnd: r });
    ctx.fillStyle = a.accent; ctx.fillRect(88, 100, 84, 24); ctx.fillRect(118, 70, 24, 86);
  },
  moon(ctx, r, a) {
    ctx.fillStyle = "#f5d76e";
    ctx.beginPath(); ctx.arc(140, 130, 72, Math.PI * 0.32, Math.PI * 1.68); ctx.fill();
    oval(ctx, 88, 58, 5, 5, { fill: "#e8b93c", rnd: r });
    oval(ctx, 58, 102, 4, 4, { fill: "#e8b93c", rnd: r });
    oval(ctx, 70, 175, 4, 4, { fill: "#e8b93c", rnd: r });
  },
  cloud(ctx, r, a) {
    oval(ctx, 95, 130, 46, 32, { fill: "#ffffff", stroke: a.ink, w: 4, rnd: r });
    oval(ctx, 150, 120, 44, 38, { fill: "#ffffff", stroke: a.ink, w: 4, rnd: r });
    oval(ctx, 185, 140, 34, 24, { fill: "#ffffff", stroke: a.ink, w: 4, rnd: r });
    for (const [x, y] of [[85, 195], [125, 205], [165, 195]])
      pen(ctx, [[x, y - 12], [x, y]], { w: 4, color: "#4a7fc1", jitter: 0.4, rnd: r });
  },
  fire(ctx, r, a) {
    ctx.fillStyle = "#e8763c";
    ctx.beginPath(); ctx.moveTo(130, 35);
    ctx.bezierCurveTo(185, 90, 195, 130, 175, 175);
    ctx.bezierCurveTo(160, 205, 100, 205, 85, 175);
    ctx.bezierCurveTo(65, 130, 75, 90, 130, 35);
    ctx.fill();
    ctx.fillStyle = "#f5c84c";
    ctx.beginPath(); ctx.moveTo(130, 105); ctx.bezierCurveTo(155, 135, 155, 165, 130, 185); ctx.bezierCurveTo(105, 165, 105, 135, 130, 105); ctx.fill();
  },
  globe(ctx, r, a) {
    oval(ctx, 130, 120, 75, 75, { fill: "#bfe3f2", stroke: a.ink, w: 5, rnd: r });
    oval(ctx, 118, 92, 32, 18, { fill: "#7fc98f", rnd: r });
    oval(ctx, 158, 150, 24, 14, { fill: "#7fc98f", rnd: r });
    oval(ctx, 95, 150, 18, 11, { fill: "#7fc98f", rnd: r });
    pen(ctx, [[55, 120], [205, 120]], { w: 2.5, color: a.ink, jitter: 0.2, rnd: r });
    pen(ctx, [[130, 45], [130, 195]], { w: 2.5, color: a.ink, jitter: 0.2, rnd: r });
    pen(ctx, [[90, 220], [170, 220]], { w: 5, color: a.ink, jitter: 0.4, rnd: r });
  },
  mountain(ctx, r, a) {
    pen(ctx, [[25, 210], [100, 80], [150, 165], [190, 110], [235, 210]], { w: 5, color: a.ink, close: true, jitter: 1, rnd: r });
    pen(ctx, [[88, 96], [100, 80], [112, 96], [100, 108]], { w: 4, color: "#ffffff", close: true, rnd: r });
    pen(ctx, [[180, 122], [190, 110], [200, 122], [190, 132]], { w: 4, color: "#ffffff", close: true, rnd: r });
    oval(ctx, 210, 60, 22, 22, { fill: "#f5c84c", rnd: r });
  },
  tree(ctx, r, a) {
    pen(ctx, [[130, 220], [130, 120]], { w: 7, color: "#7a5230", jitter: 0.8, rnd: r });
    oval(ctx, 130, 90, 58, 48, { fill: "#7fc98f", stroke: a.ink, w: 3.5, rnd: r });
    oval(ctx, 88, 115, 32, 26, { fill: "#7fc98f", stroke: a.ink, w: 3, rnd: r });
    oval(ctx, 175, 118, 30, 24, { fill: "#7fc98f", stroke: a.ink, w: 3, rnd: r });
    oval(ctx, 160, 150, 9, 9, { fill: "#d7372c", rnd: r });
    oval(ctx, 105, 140, 9, 9, { fill: "#d7372c", rnd: r });
  },
  chat(ctx, r, a) {
    pen(ctx, [[45, 55], [215, 55], [215, 150], [110, 150], [85, 195], [85, 150], [45, 150]], { w: 5, color: a.ink, close: true, jitter: 0.8, rnd: r });
    for (const x of [90, 130, 170]) oval(ctx, x, 102, 9, 9, { fill: a.accent, rnd: r });
  },
  laptop(ctx, r, a) {
    pen(ctx, [[60, 60], [200, 60], [200, 150], [60, 150]], { w: 5, color: a.ink, close: true, jitter: 0.6, rnd: r });
    ctx.fillStyle = a.accent; ctx.fillRect(70, 70, 120, 70);
    pen(ctx, [[40, 150], [220, 150], [235, 190], [25, 190]], { w: 5, color: a.ink, close: true, jitter: 0.5, rnd: r });
    pen(ctx, [[60, 168], [200, 168]], { w: 3, color: "#ffffff", jitter: 0.3, rnd: r });
  },
  battery(ctx, r, a) {
    pen(ctx, [[50, 90], [195, 90], [195, 175], [50, 175]], { w: 5, color: a.ink, close: true, jitter: 0.5, rnd: r });
    pen(ctx, [[195, 115], [215, 115], [215, 150], [195, 150]], { w: 4, color: a.ink, close: true, rnd: r });
    ctx.fillStyle = a.accent;
    for (const [x, full] of [[60, 1], [95, 1], [130, 1]]) ctx.fillRect(x, 100, 28, 65);
    ctx.fillStyle = "#e5e5e5"; ctx.fillRect(165, 100, 22, 65);
    pen(ctx, [[95, 60], [110, 60], [95, 80], [110, 80]], { w: 3.5, color: "#e8b93c", close: true, jitter: 0.4, rnd: r });
  },
  medal(ctx, r, a) {
    pen(ctx, [[95, 40], [125, 95]], { w: 5, color: "#d7372c", jitter: 0.5, rnd: r });
    pen(ctx, [[165, 40], [135, 95]], { w: 5, color: "#d7372c", jitter: 0.5, rnd: r });
    oval(ctx, 130, 150, 55, 55, { fill: "#f5d76e", stroke: a.ink, w: 4, rnd: r });
    oval(ctx, 130, 150, 38, 38, { fill: "#f5c84c", stroke: a.ink, w: 2.5, rnd: r });
    pen(ctx, [[112, 150], [124, 166], [150, 134]], { w: 5, color: a.ink, jitter: 0.4, rnd: r });
  },
};

export const PROP_NAMES = Object.keys(PROPS);

export function drawProp(dir, file, name, palette, seed) {
  const ctx = makeCanvas(260, 260);
  const a = palette.mono ? { ink: "#1a1a1a", accent: "#1a1a1a" } : { ink: palette.ink, accent: palette.accent };
  (PROPS[name] || PROPS.star)(ctx, mulberry32(seed), a);
  save(ctx, dir, file);
}

// ---------- keyword maps (EN + HI) ----------
const PROP_WORDS = {
  money: ["money", "cash", "dollar", "rupee", "price", "cost", "rich", "buy", "sell", "pay", "profit", "loss", "budget", "market", "पैसा", "रुपया", "बाज़ार", "बाजार", "महंगा", "बचत"],
  phone: ["phone", "mobile", "call", "app", "screen", "message", "text", "social", "notification", "scroll", "फ़ोन", "मोबाइल", "कॉल", "स्क्रीन", "मैसेज"],
  idea: ["idea", "think", "learn", "discover", "invent", "brain", "mind", "smart", "knowledge", "science", "सोच", "विचार", "दिमाग", "सीख", "ज्ञान"],
  heart: ["love", "heart", "feel", "feeling", "happy", "sad", "care", "friend", "emotion", "प्यार", "दिल", "महसूस", "खुश", "दोस्त", "दुख", "दुःख"],
  time: ["time", "year", "day", "hour", "minute", "fast", "slow", "old", "history", "century", "समय", "साल", "इतिहास", "पुराना", "घंटा"],
  chart: ["grow", "growth", "rise", "fall", "drop", "increase", "decrease", "chart", "data", "statistic", "percent", "score", "बढ़", "गिर", "आंकड़े", "प्रतिशत"],
  book: ["book", "read", "study", "school", "story", "write", "learn", "exam", "किताब", "पढ़", "कहानी", "स्कूल", "परीक्षा"],
  city: ["city", "street", "town", "world", "country", "place", "building", "population", "शहर", "दुनिया", "देश", "गांव", "गाँव"],
  home: ["home", "house", "family", "live", "room", "parents", "mother", "father", "घर", "परिवार", "कमरा", "मां", "माँ", "पिता"],
  star: ["star", "dream", "goal", "win", "success", "best", "top", "hero", "champion", "सपना", "सफल", "जीत", "हीरो", "मैदान"],
  warning: ["risk", "danger", "careful", "warning", "problem", "fail", "lose", "afraid", "fear", "stop", "wrong", "mistake", "खतरा", "डर", "समस्या", "हार", "गलती", "रुको"],
  food: ["food", "eat", "health", "body", "sleep", "tired", "energy", "खाना", "सेहत", "नींद", "सुस्त", "भोजन"],
  ball: ["game", "play", "sport", "ball", "cricket", "team", "match", "खेल", "गेंद", "मैच", "टीम"],
  brain: ["brain", "mind", "memory", "remember", "forget", "smart", "intel", "दिमाग", "याद", "भूल", "स्मरण"],
  trophy: ["trophy", "win", "award", "prize", "champion", "achieve", "victory", "जीत", "इनाम", "सफल", "चैंपियन"],
  crown: ["king", "queen", "boss", "leader", "top", "rule", "power", "राजा", "रानी", "मालिक", "ताकत"],
  rocket: ["rocket", "launch", "grow", "fast", "boost", "speed", "rise", "sky", "space", "उफान", "तेज़ी", "रॉकेट"],
  hourglass: ["wait", "patience", "deadline", "urgent", "soon", "later", "left", "इंतज़ार", "देर", "जल्दी", "समय"],
  key: ["key", "secret", "answer", "solution", "unlock", "access", "formula", "चाबी", "राज़", "हल"],
  lock: ["lock", "secure", "safe", "protect", "private", "password", "बंद", "सुरक्षित", "ताला"],
  target: ["target", "goal", "aim", "focus", "hit", "plan", "लक्ष्य", "मंज़िल", "निशाना"],
  puzzle: ["puzzle", "mystery", "confus", "complicated", "tricky", "पहेली", "उलझन", "मुश्किल"],
  gift: ["gift", "reward", "bonus", "free", "present", "offer", "तोहफ़ा", "इनाम", "उपहार"],
  coins: ["save", "saving", "collect", "wealth", "rich", "pile", "बचत", "संचय", "दौलत", "जमा"],
  calendar: ["day", "week", "month", "year", "schedule", "routine", "habit", "daily", "दिन", "हफ़्ता", "महीना", "आदत", "रोज़"],
  bell: ["alarm", "warning", "notice", "announce", "alert", "घंटी", "ऐलान", "चेतावनी"],
  shield: ["protect", "safe", "defend", "guard", "immune", "बचाव", "सुरक्षा", "ढाल"],
  moon: ["night", "sleep", "dream", "rest", "dark", "evening", "रात", "नींद", "सपना", "चाँद"],
  cloud: ["weather", "mood", "stress", "rain", "worry", "sad", "मौसम", "टेंशन", "उदास", "बादल"],
  fire: ["burn", "passion", "angry", "hot", "trend", "viral", "आग", "गुस्सा", "जोश", "वायरल"],
  globe: ["world", "global", "country", "earth", "international", "travel", "दुनिया", "विश्व", "देश", "घूम"],
  mountain: ["challenge", "hard", "difficult", "climb", "obstacle", "overcome", "मुश्किल", "चढ़ाई", "पहाड़", "तकलीफ"],
  tree: ["grow", "nature", "root", "branch", "develop", "plant", "पेड़", "बीज", "जड़", "बढ़"],
  chat: ["talk", "speak", "say", "tell", "discuss", "message", "conversation", "बात", "बोल", "बातचीत"],
  laptop: ["computer", "work", "office", "job", "study", "online", "type", "काम", "लैपटॉप", "ऑफिस"],
  battery: ["energy", "tired", "charge", "power", "drain", "recharge", "ऊर्जा", "थक", "बैटरी", "चार्ज"],
  medal: ["medal", "honor", "first", "winner", "rank", "score", "सम्मान", "जीत", "पदक"],
};
const POSE_WORDS = {
  walk: ["go", "come", "walk", "journey", "move", "travel", "start", "begin", "run", "leave", "follow", "चल", "जा", "शुरू", "यात्रा", "दौड़"],
  wave: ["hello", "welcome", "hi", "friend", "thanks", "thank", "goodbye", "नमस्ते", "धन्यवाद", "मित्र", "शुभ"],
  point: ["you", "your", "this", "that", "why", "how", "what", "who", "question", "look", "see", "watch", "notice", "आप", "तुम", "क्यों", "क्या", "कैसे", "देखो", "यह", "वह"],
  think: ["think", "wonder", "imagine", "guess", "maybe", "believe", "consider", "idea", "why", "सोच", "विचार", "शायद", "कल्पना"],
  celebrate: ["great", "awesome", "amazing", "best", "success", "win", "happy", "enjoy", "celebrate", "finally", "बढ़िया", "शानदार", "खुश", "जीत", "कामयाब"],
  jump: ["jump", "excited", "wow", "surprise", "sudden", "big", "change", "boost", "ऊछल", "हैरान", "चौंक", "बड़ा"],
  carry: ["carry", "bring", "hold", "heavy", "load", "burden", "many", "lot", "ढो", "भारी", "बोझ", "बहुत"],
  hold: ["have", "keep", "get", "take", "give", "रख", "पकड़", "देना", "लेना", "संभाल"],
};

function wordBankHit(words, bank) {
  const lower = words.map(w => w.toLowerCase());
  for (const key of Object.keys(bank)) {
    if (lower.some(w => bank[key].some(k => w.includes(k) || k.includes(w)))) return key;
  }
  return null;
}

export function choosePose(words, seed) {
  const hit = wordBankHit(words, POSE_WORDS);
  if (hit) return hit;
  const fallback = ["stand", "point", "think", "celebrate", "wave", "jump", "carry", "hold"];
  return fallback[seed % fallback.length];
}

export function chooseProps(words, seed, count = 1) {
  const picks = [];
  const hit = wordBankHit(words, PROP_WORDS);
  if (hit) picks.push(hit);
  const spares = ["star", "idea", "trophy", "target", "brain", "coins", "rocket", "medal", "book", "chart", "time", "calendar"];
  while (picks.length < count) picks.push(spares[(seed + picks.length) % spares.length]);
  return picks.slice(0, count);
}
