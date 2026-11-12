// A6 Amber Noir (B3 vector vehicle) — dark warm city, amber light, deep plum shadows.
// Matte-black round head, cream eye marks, orange hood-down hoodie (free code-drawn look-alike).
import fs from "node:fs";
const captions = JSON.parse(fs.readFileSync(new URL("./captions.json", import.meta.url), "utf8"));
const AMBER = "#e8a13a", AMBER_DIM = "#c07a28", PLUM1 = "#241a22", PLUM2 = "#2e2130", PLUM3 = "#3a2936";
const INKB = "#17100d", CREAM = "#f2e8d5", HOOD = "#c2571f";
let uid = 0;
const id = (p) => `${p}-${++uid}`;

// hooded figure, origin at hip
function figure() {
  const legPath = [["M", 0, 0], ["Q", 5, 30, 1, 58]];
  const armPath = [["M", 0, 0], ["Q", 6, 28, 2, 54]];
  return {
    type: "group", id: id("actor"), x: 0, y: 0,
    motion: { role: "actor", reason: "The hooded figure moves through the amber-lit city" },
    children: [
      { type: "group", id: id("limb"), x: -11, y: 0, pivotX: 0, pivotY: 0, keys: [],
        motion: { role: "actor", reason: "Left leg steps through the shadowed street" },
        children: [{ type: "path", x: 0, y: 0, commands: legPath, stroke: INKB, lineWidth: 10 }] },
      { type: "group", id: id("limb"), x: 11, y: 0, pivotX: 0, pivotY: 0, keys: [],
        motion: { role: "actor", reason: "Right leg steps through the shadowed street" },
        children: [{ type: "path", x: 0, y: 0, commands: legPath, stroke: INKB, lineWidth: 10 }] },
      { type: "rect", x: -19, y: -112, w: 38, h: 112, radius: 14, fill: HOOD },
      { type: "path", x: 0, y: -112, commands: [["M", -19, 0], ["L", -19, -46]], stroke: AMBER_DIM, lineWidth: 2.5 },
      { type: "group", id: id("limb"), x: -21, y: -96, pivotX: 0, pivotY: 0, keys: [],
        motion: { role: "actor", reason: "Left arm swings low in the shadows" },
        children: [{ type: "path", x: 0, y: 0, commands: armPath, stroke: INKB, lineWidth: 9 }] },
      { type: "group", id: id("armR"), x: 21, y: -96, pivotX: 0, pivotY: 0, keys: [],
        motion: { role: "actor", reason: "Right arm gestures, walks and halts" },
        children: [{ type: "path", x: 0, y: 0, commands: armPath, stroke: INKB, lineWidth: 9 }] },
      { type: "ellipse", x: -30, y: -178, w: 60, h: 62, fill: INKB },
      { type: "ellipse", x: -18, y: -154, w: 10, h: 12, fill: CREAM },
      { type: "ellipse", x: 8, y: -154, w: 10, h: 12, fill: CREAM },
      { type: "path", x: -5, y: -136, commands: [["M", 0, 0], ["L", 10, 0]], stroke: CREAM, lineWidth: 2.5 },
    ],
  };
}

const shots = [];
const S = (start, end, layers) => shots.push({ start, end, layers });
const T = 8.14;

// --- building rows (plain scenery, no motion) ---
function skyline() {
  const layers = [
    { type: "rect", x: 0, y: 0, w: 1280, h: 720, fill: "#100c0a" },
  ];
  const rows = [
    { fill: PLUM1, top: 300, windows: false },
    { fill: PLUM2, top: 380, windows: true },
    { fill: PLUM3, top: 470, windows: true },
  ];
  for (const row of rows) {
    let x = 0;
    while (x < 1280) {
      const w = 90 + ((x * 7) % 120);
      const h = 180 + ((x * 13) % 220);
      layers.push({ type: "rect", x, y: 720 - h - (row.top - 300) / 6, w, h: h + 200, fill: row.fill });
      x += w + 14;
    }
    if (row.windows) {
      for (let wx = 30; wx < 1240; wx += 52) {
        for (let wy = row.top + 40; wy < 640; wy += 64) {
          if (((wx + wy) % 97) < 40) {
            layers.push({ type: "rect", x: wx, y: wy, w: 16, h: 22, fill: AMBER, alpha: 0.85 });
          }
        }
      }
    }
  }
  return layers;
}

// S1 0–2.2: title over the glowing skyline
{
  const sk = skyline();
  sk.push({ type: "text", id: id("title"), text: "AMBER NOIR", x: 90, y: 120, size: 62, bold: true, color: AMBER,
    keys: [{ t: 0.2, alpha: 0 }, { t: 0.9, alpha: 1 }] });
  // one flickering window
  sk.push({ type: "rect", id: id("prop"), x: 610, y: 500, w: 16, h: 22, fill: AMBER,
    motion: { role: "prop", reason: "A single window flickers awake over the dark city" },
    keys: [{ t: 0.4, alpha: 0.2 }, { t: 0.8, alpha: 0.9 }, { t: 1.3, alpha: 0.35 }, { t: 1.8, alpha: 0.9 }, { t: 2.2, alpha: 0.85 }] });
  S(0, 2.2, sk);
}

// S2 2.2–5.4: the hooded figure walks the shadowed street
{
  const c = figure();
  const legs = c.children.filter(l => l.id?.startsWith("limb") && l.y === 0);
  const armL = c.children.filter(l => l.id?.startsWith("limb") && l.y === -96)[0];
  const armR = c.children.find(l => l.id?.startsWith("armR"));
  for (let t = 0, i = 0; t < 3.2; t += 0.55, i++) {
    legs[0].keys.push({ t: +t.toFixed(2), angle: i % 2 ? 0.35 : -0.35 });
    legs[1].keys.push({ t: +t.toFixed(2), angle: i % 2 ? -0.35 : 0.35 });
    armL.keys.push({ t: +t.toFixed(2), angle: i % 2 ? -0.3 : 0.3 });
    armR.keys.push({ t: +t.toFixed(2), angle: i % 2 ? 0.3 : -0.3 });
  }
  const walk = { ...c, id: id("actor"), x: 300, y: 560, scaleX: 1.45, scaleY: 1.45,
    keys: [{ t: 0, x: 300 }, { t: 3.2, x: 640 }] };
  S(2.2, 5.4, [
    ...skyline(),
    // street lamp with warm pool
    { type: "path", id: id("prop"), x: 860, y: 470, commands: [["M", 0, 0], ["L", 0, -160]], stroke: "#3a2e28", lineWidth: 7,
      keys: [{ t: 0.1, progress: 0 }, { t: 0.7, progress: 1 }] },
    { type: "ellipse", id: id("prop"), x: 842, y: 300, w: 36, h: 22, fill: AMBER,
      motion: { role: "prop", reason: "The street lamp hums on and throws its amber pool" },
      keys: [{ t: 0.7, alpha: 0.2 }, { t: 1.1, alpha: 1 }] },
    { type: "ellipse", id: id("prop"), x: 762, y: 560, w: 200, h: 60, fill: AMBER, alpha: 0.13,
      motion: { role: "prop", reason: "Amber light pools on the wet street beneath the lamp" },
      keys: [{ t: 0.8, alpha: 0.05 }, { t: 1.4, alpha: 0.16 }, { t: 2.0, alpha: 0.11 }, { t: 3.2, alpha: 0.15 }] },
    walk,
  ]);
}

// S3 5.4–8.14: the figure halts in the light pool, eyes glint
{
  const c = figure();
  const armR = c.children.find(l => l.id?.startsWith("armR"));
  armR.keys = [{ t: 0, angle: 0 }, { t: 0.6, angle: -2.2 }, { t: 1.6, angle: -2.0 }, { t: 2.74, angle: -2.1 }];
  S(5.4, T, [
    ...skyline(),
    { type: "ellipse", id: id("prop"), x: 330, y: 580, w: 240, h: 66, fill: AMBER,
      motion: { role: "prop", reason: "A final amber pool holds the halted figure" },
      keys: [{ t: 0, alpha: 0.04 }, { t: 0.8, alpha: 0.15 }, { t: 1.8, alpha: 0.11 }, { t: 2.74, alpha: 0.14 }] },
    { ...c, id: id("actor"), x: 430, y: 560, scaleX: 1.45, scaleY: 1.45,
      keys: [{ t: 0, y: 560 }, { t: 1.2, y: 554 }, { t: 2.6, y: 559 }, { t: 2.74, y: 557 }] },
    { type: "text", id: id("title"), text: "DEEP SHADOWS", x: 700, y: 130, size: 50, bold: true, color: AMBER,
      keys: [{ t: 0.5, alpha: 0 }, { t: 1.2, alpha: 1 }] },
  ]);
}

const project = {
  version: 1, style: "B3", width: 1280, height: 720, fps: 30,
  television: { enabled: false, intensity: 0 },
  voice: { path: "narration.wav", lead: 0.15, tail: 0.35 },
  captions: captions.map(c => ({ ...c, end: Math.min(c.end, +(T - 0.02).toFixed(2)) })),
  shots,
  sfx: [
    { time: 0.6, kind: "tap", gain: 0.03 },
    { time: 3.1, kind: "chime", gain: 0.035 },
    { time: 5.7, kind: "pop", gain: 0.035 },
  ],
  ambience: [{ path: "../../quiet-room.wav", start: 0, end: T, gain: 0.035, loop: true, fadeIn: 1, fadeOut: 2 }],
};

for (const s of shots) {
  const span = s.end - s.start;
  const fix = (l) => { if (l.keys) for (const k of l.keys) if (k.t > span) k.t = span; if (l.children) l.children.forEach(fix); };
  s.layers.forEach(fix);
}
fs.writeFileSync(new URL("./project.json", import.meta.url), JSON.stringify(project, null, 2));
console.log(`project.json written: ${shots.length} shots, ends ${T}s`);
