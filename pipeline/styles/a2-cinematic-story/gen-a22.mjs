// A2.2 Cinematic Story (Style 2B) — red beanie hero inside warm, cinematic full-color worlds.
import { drawCharacter, makeCanvas, save, pen, oval, mulberry32, INK } from "file:///C:/Users/sanir/Music/web/stick/artlib.mjs";
import fs from "node:fs";

const DIR = "C:\\Users\\sanir\\Music\\web\\stick\\styles\\a2-cinematic-story";
const captions = JSON.parse(fs.readFileSync(`${DIR}\\captions.json`, "utf8"));
let uid = 0;
const id = (p) => `${p}-${++uid}`;

// --- backgrounds (1280x720, cinematic warm grade + vignette baked in) ---
function duskRoom(dir) {
  const ctx = makeCanvas(1280, 720);
  const g = ctx.createLinearGradient(0, 0, 0, 720);
  g.addColorStop(0, "#3a2438"); g.addColorStop(0.55, "#7a4030"); g.addColorStop(1, "#b06a38");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1280, 720);
  // window with golden-hour shaft
  ctx.fillStyle = "#f2c063"; ctx.fillRect(120, 110, 280, 260);
  ctx.strokeStyle = "#2a1a20"; ctx.lineWidth = 14;
  ctx.strokeRect(120, 110, 280, 260);
  ctx.beginPath(); ctx.moveTo(260, 110); ctx.lineTo(260, 370); ctx.moveTo(120, 240); ctx.lineTo(400, 240); ctx.stroke();
  // light shaft
  const shaft = ctx.createLinearGradient(400, 240, 900, 560);
  shaft.addColorStop(0, "rgba(242,192,99,0.35)"); shaft.addColorStop(1, "rgba(242,192,99,0)");
  ctx.fillStyle = shaft;
  ctx.beginPath(); ctx.moveTo(400, 110); ctx.lineTo(820, 560); ctx.lineTo(1040, 560); ctx.lineTo(400, 370); ctx.closePath(); ctx.fill();
  // floor
  ctx.fillStyle = "#4a2c22"; ctx.fillRect(0, 560, 1280, 160);
  ctx.fillStyle = "rgba(242,192,99,0.10)"; ctx.fillRect(0, 560, 1280, 26);
  // plant silhouette
  ctx.fillStyle = "#241a1c";
  ctx.beginPath(); ctx.roundRect(940, 470, 66, 96, 8); ctx.fill();
  ctx.fillStyle = "#33261f";
  for (const [x, y, rx, ry] of [[973, 430, 24, 44], [942, 452, 20, 34], [1004, 452, 20, 34]]) {
    ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  }
  vignette(ctx);
  save(ctx, dir, "bg-room.png");
}
function duskRoad(dir) {
  const ctx = makeCanvas(1280, 720), r = mulberry32(51);
  const sky = ctx.createLinearGradient(0, 0, 0, 460);
  sky.addColorStop(0, "#2c2340"); sky.addColorStop(0.6, "#8a4a34"); sky.addColorStop(1, "#e08a3c");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 1280, 460);
  // setting sun
  ctx.fillStyle = "#f2c063"; ctx.beginPath(); ctx.arc(960, 420, 62, 0, Math.PI * 2); ctx.fill();
  // hills
  ctx.fillStyle = "#3a2030";
  ctx.beginPath(); ctx.moveTo(0, 460); ctx.quadraticCurveTo(300, 380, 640, 460); ctx.lineTo(640, 500); ctx.lineTo(0, 500); ctx.fill();
  ctx.beginPath(); ctx.moveTo(560, 480); ctx.quadraticCurveTo(960, 400, 1280, 470); ctx.lineTo(1280, 510); ctx.lineTo(560, 510); ctx.fill();
  // road
  ctx.fillStyle = "#33222a"; ctx.fillRect(0, 470, 1280, 250);
  ctx.strokeStyle = "rgba(242,192,99,0.55)"; ctx.lineWidth = 8; ctx.setLineDash([40, 34]);
  ctx.beginPath(); ctx.moveTo(600, 720); ctx.lineTo(660, 470); ctx.stroke(); ctx.setLineDash([]);
  // poles with warm lamps
  for (const x of [180, 520, 860]) {
    ctx.strokeStyle = "#241a1c"; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(x, 470); ctx.lineTo(x, 330); ctx.lineTo(x + 34, 330); ctx.stroke();
    ctx.fillStyle = "#f2b95a"; ctx.beginPath(); ctx.arc(x + 40, 336, 12, 0, Math.PI * 2); ctx.fill();
  }
  // grass tufts
  ctx.strokeStyle = "#2a1a22"; ctx.lineWidth = 3;
  for (let i = 0; i < 10; i++) {
    const x = 60 + r() * 1160, y = 690 + r() * 20;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 6, y - 14); ctx.stroke();
  }
  vignette(ctx);
  save(ctx, dir, "bg-road.png");
}
function summit(dir) {
  const ctx = makeCanvas(1280, 720);
  const sky = ctx.createLinearGradient(0, 0, 0, 720);
  sky.addColorStop(0, "#452a4a"); sky.addColorStop(0.5, "#b0563a"); sky.addColorStop(0.8, "#f2a24a"); sky.addColorStop(1, "#f2c063");
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 1280, 720);
  // rising sun
  ctx.fillStyle = "#f6d27a"; ctx.beginPath(); ctx.arc(640, 560, 90, 0, Math.PI * 2); ctx.fill();
  // peak silhouette
  ctx.fillStyle = "#241a28";
  ctx.beginPath(); ctx.moveTo(0, 720); ctx.lineTo(240, 430); ctx.lineTo(420, 560); ctx.lineTo(640, 350); ctx.lineTo(900, 560); ctx.lineTo(1080, 440); ctx.lineTo(1280, 720); ctx.closePath(); ctx.fill();
  // snow on central peak
  ctx.fillStyle = "#f2e4d0";
  ctx.beginPath(); ctx.moveTo(640, 350); ctx.lineTo(600, 404); ctx.lineTo(640, 420); ctx.lineTo(682, 404); ctx.closePath(); ctx.fill();
  // flag on the summit
  ctx.strokeStyle = "#241a28"; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(640, 350); ctx.lineTo(640, 300); ctx.stroke();
  ctx.fillStyle = "#d9484f";
  ctx.beginPath(); ctx.moveTo(640, 300); ctx.lineTo(692, 312); ctx.lineTo(640, 324); ctx.closePath(); ctx.fill();
  vignette(ctx);
  save(ctx, dir, "bg-summit.png");
}
function vignette(ctx) {
  const v = ctx.createRadialGradient(640, 360, 260, 640, 360, 860);
  v.addColorStop(0, "rgba(20,10,20,0)"); v.addColorStop(1, "rgba(20,10,20,0.55)");
  ctx.fillStyle = v; ctx.fillRect(0, 0, 1280, 720);
}

// --- character (reuse the beanie costume from artlib, same hero as A2.1) ---
const beanie = { type: "beanie", color: "#d63a2f", shirtColor: "#f4c531", limbColor: "#2a2e35" };
drawCharacter(DIR, "char-hold.png", "hold", beanie, 161);
drawCharacter(DIR, "char-walk.png", "walk", beanie, 162);
drawCharacter(DIR, "char-point.png", "point", beanie, 163);
duskRoom(DIR); duskRoad(DIR); summit(DIR);

// --- manifest ---
const T = 9.62;
const CW = 320, CH = 400;
const img = (path, x, y, w, h, role, reason, keys) => ({
  type: "image", id: id(role), path, x, y, w, h,
  ...(keys ? { motion: { role, reason }, keys } : {}),
});
const bg = (path) => ({ type: "image", path, x: 0, y: 0, w: 1280, h: 720 });
const bob = (span, y0, amp = 7) => {
  const ks = [];
  for (let t = 0; t < span - 1e-6; t += 1.0) ks.push({ t: +t.toFixed(2), y: +(y0 + (ks.length % 2 === 0 ? -amp : amp)).toFixed(1) });
  ks.push({ t: +span.toFixed(2), y: y0 });
  return ks;
};
const shots = [];
const S = (s, e, l) => shots.push({ start: s, end: e, layers: l });

// S1 0–3.2: hero in the golden-hour room
S(0, 3.2, [
  bg("bg-room.png"),
  { type: "image", id: id("actor"), path: "char-hold.png", x: 620, y: 250, w: CW, h: CH,
    motion: { role: "actor", reason: "The beanie hero stands in the golden-hour light, breathing gently" },
    keys: bob(3.2, 250, 6) },
  { type: "text", id: id("title"), text: "CINEMATIC STORY", x: 90, y: 110, size: 52, bold: true, color: "#f6d27a",
    keys: [{ t: 0.2, alpha: 0 }, { t: 0.9, alpha: 1 }] },
]);

// S2 3.2–6.5: walking the dusk road into the sun
S(3.2, 6.5, [
  bg("bg-road.png"),
  { type: "image", id: id("actor"), path: "char-walk.png", x: 300, y: 300, w: CW, h: CH,
    motion: { role: "actor", reason: "The hero walks the dusk road toward the setting sun" },
    keys: [{ t: 0, x: 300, y: 300 }, { t: 1.1, x: 390, y: 294 }, { t: 2.2, x: 470, y: 300 }, { t: 3.3, x: 550, y: 296 }] },
]);

// S3 6.5–9.62: the summit payoff
S(6.5, T, [
  bg("bg-summit.png"),
  { type: "image", id: id("actor"), path: "char-point.png", x: 420, y: 280, w: CW, h: CH,
    motion: { role: "actor", reason: "On the summit the hero points back at the journey's reward" },
    keys: bob(T - 6.5, 280, 7) },
  { type: "text", id: id("title"), text: "THE REWARD", x: 700, y: 130, size: 50, bold: true, color: "#f6d27a",
    keys: [{ t: 0.4, alpha: 0 }, { t: 1.1, alpha: 1 }] },
]);

const project = {
  version: 1, style: "B2", width: 1280, height: 720, fps: 30,
  voice: { path: "narration.wav", lead: 0.15, tail: 0.35 },
  captions: captions.map(c => ({ ...c, end: Math.min(c.end, +(T - 0.02).toFixed(2)) })),
  shots,
  sfx: [
    { time: 0.6, kind: "paper", gain: 0.03 },
    { time: 3.4, kind: "tap", gain: 0.035 },
    { time: 6.7, kind: "chime", gain: 0.04 },
  ],
  ambience: [{ path: "../../quiet-room.wav", start: 0, end: T, gain: 0.035, loop: true, fadeIn: 1, fadeOut: 2 }],
};
for (const s of shots) {
  const span = s.end - s.start;
  const fix = (l) => { if (l.keys) for (const k of l.keys) if (k.t > span) k.t = span; if (l.children) l.children.forEach(fix); };
  s.layers.forEach(fix);
}
fs.writeFileSync(`${DIR}\\project.json`, JSON.stringify(project, null, 2));
console.log(`project.json written: ${shots.length} shots, ends ${T}s`);
