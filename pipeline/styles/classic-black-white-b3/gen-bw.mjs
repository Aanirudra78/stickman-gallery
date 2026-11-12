// Classic Black & White (B3 vehicle, television off) — white lines on black, faceless figure.
import fs from "node:fs";
const captions = JSON.parse(fs.readFileSync(new URL("./captions.json", import.meta.url), "utf8"));
const W = "#f5f6f7", RED = "#e0443e";
let uid = 0;
const id = (p) => `${p}-${++uid}`;

// faceless line figure: hollow head, single-line limbs (local origin at hip)
function figure() {
  const limb = (cmds, x, y, reason) => ({
    type: "group", id: id("limb"), x, y, pivotX: 0, pivotY: 0, keys: [],
    motion: { role: "actor", reason },
    children: [{ type: "path", x: 0, y: 0, commands: cmds, stroke: W, lineWidth: 6 }],
  });
  return {
    type: "group", id: id("actor"), x: 0, y: 0,
    motion: { role: "actor", reason: "The faceless white-line figure acts out the classic style demo" },
    children: [
      limb([["M", 0, 0], ["L", -10, 58]], -8, 0, "Left leg steps and balances"),
      limb([["M", 0, 0], ["L", 10, 58]], 8, 0, "Right leg steps and balances"),
      { type: "path", x: 0, y: -112, commands: [["M", 0, 0], ["L", 0, 112]], stroke: W, lineWidth: 6 },
      limb([["M", 0, 0], ["Q", -6, 26, -2, 52]], -12, -98, "Left arm hangs and swings"),
      { type: "group", id: id("armR"), x: 12, y: -98, pivotX: 0, pivotY: 0, keys: [],
        motion: { role: "actor", reason: "Right arm waves, dribbles and points" },
        children: [{ type: "path", x: 0, y: 0, commands: [["M", 0, 0], ["Q", 6, 26, 2, 52]], stroke: W, lineWidth: 6 }] },
      { type: "ellipse", x: -30, y: -196, w: 60, h: 64, stroke: W, lineWidth: 6 },
    ],
  };
}

const shots = [];
const S = (start, end, layers) => shots.push({ start, end, layers });
const T = 7.86;

// S1 0–2.6: figure walks in, title
{
  const f = figure();
  const legs = f.children.filter(l => l.id?.startsWith("limb") && l.y === 0);
  const armL = f.children.filter(l => l.id?.startsWith("limb") && l.y === -98)[0];
  const armR = f.children.find(l => l.id?.startsWith("armR"));
  for (let t = 0, i = 0; t < 2.6; t += 0.5, i++) {
    legs[0].keys.push({ t: +t.toFixed(2), angle: i % 2 ? 0.3 : -0.3 });
    legs[1].keys.push({ t: +t.toFixed(2), angle: i % 2 ? -0.3 : 0.3 });
    armL.keys.push({ t: +t.toFixed(2), angle: i % 2 ? -0.25 : 0.25 });
    armR.keys.push({ t: +t.toFixed(2), angle: i % 2 ? 0.25 : -0.25 });
  }
  S(0, 2.6, [
    { ...f, id: id("actor"), x: 320, y: 460, scaleX: 1.5, scaleY: 1.5, keys: [{ t: 0, x: 320 }, { t: 2.6, x: 420 }] },
    { type: "text", id: id("title"), text: "CLASSIC B&W", x: 90, y: 120, size: 60, bold: true },
    { type: "path", id: id("prop"), x: 90, y: 220, commands: [["M", 0, 0], ["L", 300, 0]], stroke: W, lineWidth: 3,
      motion: { role: "prop", reason: "An underline draws itself beneath the title" },
      keys: [{ t: 0.4, progress: 0 }, { t: 1.2, progress: 1 }] },
  ]);
}

// S2 2.6–5.2: dribbles a red ball
{
  const f = figure();
  const armR = f.children.find(l => l.id?.startsWith("armR"));
  armR.keys = [
    { t: 0, angle: 0.5 }, { t: 0.4, angle: 0.15 }, { t: 0.8, angle: 0.5 },
    { t: 1.2, angle: 0.15 }, { t: 1.6, angle: 0.5 }, { t: 2.2, angle: 0.3 }, { t: 2.6, angle: 0.35 },
  ];
  S(2.6, 5.2, [
    { ...f, id: id("actor"), x: 420, y: 460, scaleX: 1.5, scaleY: 1.5,
      keys: [{ t: 0, y: 460 }, { t: 1.3, y: 454 }, { t: 2.6, y: 459 }] },
    { type: "ellipse", id: id("prop"), x: 540, y: 380, w: 46, h: 46, fill: RED,
      motion: { role: "prop", reason: "The one saturated accent: a red ball dribbles on the black canvas" },
      keys: [
        { t: 0, y: 380 }, { t: 0.4, y: 530 }, { t: 0.8, y: 380 }, { t: 1.2, y: 530 },
        { t: 1.6, y: 380 }, { t: 2.0, y: 528 }, { t: 2.6, y: 400 },
      ] },
  ]);
}

// S3 5.2–7.86: point + red dash
{
  const f = figure();
  const armR = f.children.find(l => l.id?.startsWith("armR"));
  armR.keys = [{ t: 0, angle: 0 }, { t: 0.5, angle: -2.4 }, { t: 1.6, angle: -2.3 }, { t: 2.66, angle: -2.35 }];
  S(5.2, T, [
    { ...f, id: id("actor"), x: 380, y: 460, scaleX: 1.5, scaleY: 1.5,
      keys: [{ t: 0, y: 460 }, { t: 1.2, y: 453 }, { t: 2.66, y: 458 }] },
    { type: "path", id: id("prop"), x: 620, y: 330, commands: [["M", 0, 0], ["L", 300, 0]], stroke: RED, lineWidth: 8,
      motion: { role: "prop", reason: "A red speed line shoots across to sell the fast pace" },
      keys: [{ t: 0.4, progress: 0 }, { t: 1.1, progress: 1 }, { t: 1.8, alpha: 0.5 }, { t: 2.66, alpha: 0.9 }] },
    { type: "text", id: id("title"), text: "FAST. DYNAMIC.", x: 620, y: 180, size: 56, bold: true,
      keys: [{ t: 0.2, alpha: 0 }, { t: 0.9, alpha: 1 }] },
  ]);
}

const project = {
  version: 1, style: "B3", width: 1280, height: 720, fps: 30,
  television: { enabled: false, intensity: 0 },
  voice: { path: "narration.wav", lead: 0.15, tail: 0.35 },
  captions,
  shots,
  sfx: [
    { time: 0.6, kind: "tap", gain: 0.04 },
    { time: 3.0, kind: "pop", gain: 0.035 },
    { time: 3.4, kind: "pop", gain: 0.035 },
    { time: 5.6, kind: "jingle", gain: 0.04 },
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
