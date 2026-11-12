// Retro TV (B3) 10s style demo — pure declarative vector art, no images needed.
import fs from "node:fs";
const captions = JSON.parse(fs.readFileSync(new URL("./captions.json", import.meta.url), "utf8"));
const W = "#f2f3f5", DARK = "#1c1f24", GOLD = "#e8b73a";
let uid = 0;
const id = (p) => `${p}-${++uid}`;

// rounded white character, local origin at hip (0,0); ~220 units tall before scale
function character({ armPose = "down" } = {}) {
  const armPath = (bend) => [["M", 0, 0], ["Q", bend, 30, bend * 0.4, 62]];
  const legPath = [["M", 0, 0], ["Q", 4, 30, 0, 58]];
  return {
    type: "group", id: id("actor"), x: 0, y: 0,
    motion: { role: "actor", reason: "The rounded white TV character acts out the style demo with limb motion" },
    children: [
      // legs
      { type: "group", id: id("limb"), x: -12, y: 0, pivotX: 0, pivotY: 0, keys: [],
        motion: { role: "actor", reason: "Left leg drives the walk/wave rhythm" },
        children: [{ type: "path", x: 0, y: 0, commands: legPath, stroke: W, lineWidth: 11 }] },
      { type: "group", id: id("limb"), x: 12, y: 0, pivotX: 0, pivotY: 0, keys: [],
        motion: { role: "actor", reason: "Right leg drives the walk/wave rhythm" },
        children: [{ type: "path", x: 0, y: 0, commands: legPath, stroke: W, lineWidth: 11 }] },
      // torso
      { type: "rect", x: -17, y: -118, w: 34, h: 118, radius: 16, fill: W },
      // left arm (hangs)
      { type: "group", id: id("limb"), x: -19, y: -100, pivotX: 0, pivotY: 0, keys: [],
        motion: { role: "actor", reason: "Left arm balances the action" },
        children: [{ type: "path", x: 0, y: 0, commands: armPath(-8), stroke: W, lineWidth: 10 }] },
      // right arm (animated per shot via keys injected later)
      { type: "group", id: id("armR"), x: 19, y: -100, pivotX: 0, pivotY: 0, keys: [],
        motion: { role: "actor", reason: "Right arm performs the wave / walk swing / point" },
        children: [{ type: "path", x: 0, y: 0, commands: armPath(8), stroke: W, lineWidth: 10 }] },
      // head
      { type: "ellipse", x: -34, y: -196, w: 68, h: 72, fill: W },
      { type: "ellipse", x: -22, y: -172, w: 9, h: 11, fill: DARK },
      { type: "ellipse", x: 13, y: -172, w: 9, h: 11, fill: DARK },
    ],
  };
}

const shots = [];
const S = (start, end, layers) => shots.push({ start, end, layers });
const T = 10.86;

// S1 0–3.4: wave hello + RETRO TV title
{
  const c = character();
  const armR = c.children.find(l => l.id?.startsWith("armR"));
  armR.keys = [
    { t: 0, angle: 0 }, { t: 0.5, angle: -2.3 }, { t: 0.9, angle: -1.9 },
    { t: 1.3, angle: -2.4 }, { t: 1.7, angle: -1.9 }, { t: 2.2, angle: -2.3 }, { t: 3.0, angle: -0.6 }, { t: 3.4, angle: 0 },
  ];
  const body = { ...c, id: id("actor"), keys: [{ t: 0, y: 470 }, { t: 1.2, y: 462 }, { t: 2.4, y: 468 }, { t: 3.4, y: 464 }] };
  body.x = 500;
  S(0, 3.4, [
    { ...body, x: 500, y: 470, scaleX: 1.35, scaleY: 1.35 },
    { type: "text", id: id("title"), text: "RETRO TV", x: 90, y: 110, size: 64, bold: true },
    { type: "rect", id: id("prop"), x: 90, y: 200, w: 250, h: 160, radius: 18, stroke: W, lineWidth: 4,
      motion: { role: "prop", reason: "A little TV set powers on beside the title" },
      keys: [{ t: 0.2, alpha: 0 }, { t: 0.8, alpha: 1 }, { t: 2.0, y: 196 }, { t: 3.4, y: 200 }] },
    { type: "path", id: id("prop"), x: 170, y: 200, commands: [["M", 0, 0], ["L", -22, -34]], stroke: W, lineWidth: 4,
      motion: { role: "prop", reason: "TV antenna settles after power-on" },
      keys: [{ t: 0.3, progress: 0 }, { t: 0.9, progress: 1 }, { t: 2.0, angle: 0.03 }, { t: 3.4, angle: -0.03 }] },
    { type: "path", id: id("prop"), x: 220, y: 200, commands: [["M", 0, 0], ["L", 22, -34]], stroke: W, lineWidth: 4,
      motion: { role: "prop", reason: "Second antenna settles after power-on" },
      keys: [{ t: 0.4, progress: 0 }, { t: 1.0, progress: 1 }, { t: 2.2, angle: -0.03 }, { t: 3.4, angle: 0.03 }] },
  ]);
}

// S2 3.4–6.9: walk across, "3 AM" text
{
  const c = character();
  const armR = c.children.find(l => l.id?.startsWith("armR"));
  const legs = c.children.filter(l => l.id?.startsWith("limb") && l.y === 0);
  const armL = c.children.filter(l => l.id?.startsWith("limb") && l.y === -100)[0];
  const swing = [];
  for (let t = 0, i = 0; t < 3.5; t += 0.55, i++) {
    legs[0].keys.push({ t: +t.toFixed(2), angle: i % 2 ? 0.4 : -0.4 });
    legs[1].keys.push({ t: +t.toFixed(2), angle: i % 2 ? -0.4 : 0.4 });
    armL.keys.push({ t: +t.toFixed(2), angle: i % 2 ? -0.35 : 0.35 });
    armR.keys.push({ t: +t.toFixed(2), angle: i % 2 ? 0.35 : -0.35 });
  }
  const walk = { ...c, id: id("actor"), x: 260, y: 470, scaleX: 1.35, scaleY: 1.35,
    keys: [{ t: 0, x: 260 }, { t: 3.5, x: 660 }] };
  S(3.4, 6.9, [
    walk,
    { type: "text", id: id("title"), text: "3 AM", x: 90, y: 110, size: 64, bold: true },
    { type: "ellipse", id: id("prop"), x: 760, y: 140, w: 90, h: 90, fill: GOLD,
      motion: { role: "prop", reason: "A small gold moon glows while the character crosses the dark field" },
      keys: [{ t: 0, alpha: 0 }, { t: 0.6, alpha: 0.9 }, { t: 1.8, y: 136 }, { t: 3.5, y: 140 }] },
  ]);
}

// S3 6.9–10.86: point at the mystery
{
  const c = character();
  const armR = c.children.find(l => l.id?.startsWith("armR"));
  armR.keys = [
    { t: 0, angle: 0 }, { t: 0.6, angle: -2.6 }, { t: 1.4, angle: -2.4 }, { t: 2.4, angle: -2.6 }, { t: 3.96, angle: -2.5 },
  ];
  S(6.9, T, [
    { ...c, id: id("actor"), x: 430, y: 470, scaleX: 1.35, scaleY: 1.35,
      keys: [{ t: 0, y: 470 }, { t: 1.4, y: 462 }, { t: 2.8, y: 468 }, { t: 3.96, y: 463 }] },
    { type: "text", id: id("title"), text: "?", x: 800, y: 130, size: 150, bold: true, color: GOLD,
      keys: [{ t: 0.3, alpha: 0 }, { t: 1.0, alpha: 1 }, { t: 2.0, y: 122 }, { t: 3.2, y: 130 }] },
    { type: "ellipse", id: id("prop"), x: 790, y: 320, w: 130, h: 130, stroke: GOLD, lineWidth: 3,
      motion: { role: "prop", reason: "A pulsing gold ring frames the mystery mark" },
      keys: [{ t: 0.6, alpha: 0, w: 110 }, { t: 1.4, alpha: 0.7, w: 134 }, { t: 2.4, alpha: 0.4, w: 122 }, { t: 3.96, alpha: 0.7, w: 134 }] },
  ]);
}

const project = {
  version: 1, style: "B3", width: 1280, height: 720, fps: 30,
  television: { enabled: true, intensity: 0.45 },
  voice: { path: "narration.wav", lead: 0.15, tail: 0.35 },
  captions,
  shots,
  sfx: [
    { time: 0.5, kind: "chime", gain: 0.04 },
    { time: 3.6, kind: "pop", gain: 0.04 },
    { time: 7.3, kind: "chime", gain: 0.04 },
  ],
  ambience: [{ path: "../../quiet-room.wav", start: 0, end: T, gain: 0.04, loop: true, fadeIn: 1, fadeOut: 2 }],
};

// float-safe key clamp
for (const s of shots) {
  const span = s.end - s.start;
  for (const l of s.layers) {
    const fix = (layer) => { if (layer.keys) for (const k of layer.keys) if (k.t > span) k.t = span; if (layer.children) layer.children.forEach(fix); };
    fix(l);
  }
}
fs.writeFileSync(new URL("./project.json", import.meta.url), JSON.stringify(project, null, 2));
console.log(`project.json written: ${shots.length} shots, ends ${T}s`);
