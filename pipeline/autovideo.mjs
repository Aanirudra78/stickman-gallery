// Generic paste-script/topic -> stickman video pipeline (free, local, CI-friendly).
// Vehicles: B1 (minimal line, used by B1/A1.1/A1.2) and B2 (colorful hand-drawn,
// used by B2 + all remaining A-codes as their look-alike vehicle).
// Usage:
//   node autovideo.mjs --style "B2" --voice English --seconds 40 [--topic "..."] [--script "..."]
//   (TOPIC / SCRIPT env vars also accepted — used by the GitHub Action)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PALETTES, drawBackdrop, drawProp, choosePose, chooseProps, drawCharacter } from "./autovideo-art.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const RUNTIME = path.join(ROOT, "runtime");
const [, , ...args] = process.argv;
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

const styleCode = flag("--style") || "B2";
const voiceLang = (flag("--voice") || "English").toLowerCase().startsWith("h") ? "hi" : "en";
const targetSeconds = Math.min(90, Math.max(20, Number(flag("--seconds")) || 40));
let topic = flag("--topic") ?? process.env.TOPIC ?? "";
let script = flag("--script") ?? process.env.SCRIPT ?? "";
const outDir = flag("--out") || path.join(ROOT, "output-video");
if (!topic && !script) throw new Error("Provide --topic or --script (or TOPIC/SCRIPT env vars)");

const palette = PALETTES[styleCode];
if (!palette) throw new Error(`Unknown style "${styleCode}". Supported: ${Object.keys(PALETTES).join(", ")}`);
const vehicle = palette.style; // "B1" or "B2"
const GEMINI_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_KEY) throw new Error("GEMINI_API_KEY not set");

const run = (cmd, argv, opts = {}) => {
  console.log(`\n>>> ${path.basename(cmd)} ${argv.slice(-3).join(" ")}`);
  execFileSync(cmd, argv, { stdio: "inherit", cwd: opts.cwd || ROOT, env: process.env, ...opts });
};

// ---------- fresh work dir ----------
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const dir = path.join(ROOT, `run-${stamp}`);
fs.mkdirSync(path.join(dir, "art"), { recursive: true });

// ---------- 1. script ----------
const isScript = script.trim().length > 0;
if (!isScript) {
  console.log(`Topic-only input; asking Gemini to write a ${voiceLang === "hi" ? "Hindi" : "English"} script (${targetSeconds}s)...`);
  const prompt =
    `Write a narration script for a short stickman explainer video about: "${topic}".\n` +
    `Language: ${voiceLang === "hi" ? "Hindi (Devanagari script)" : "English"}.\n` +
    `Rules: about ${Math.round(targetSeconds * 2.9)} words total. Plain spoken sentences, one idea per sentence.\n` +
    `Simple words, energetic tone, no headings, no numbering, no markdown, no stage directions.\n` +
    `End with a short question to the viewer.`;
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.9 },
  };
  let text = "";
  outer: for (const model of ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.5-flash", "gemini-flash-latest"]) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000),
      });
      if (res.ok) {
        const data = await res.json();
        text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
        if (text) break outer;
      } else if ([429, 500, 503].includes(res.status)) {
        console.log(`${model} HTTP ${res.status}; waiting 45s before retry...`);
        await new Promise(r => setTimeout(r, 45000));
      } else {
        console.log(`${model} HTTP ${res.status}; trying next model`);
        break;
      }
    }
  }
  if (!text) throw new Error("Gemini script generation failed after retries");
  script = text;
}
fs.writeFileSync(path.join(dir, "narration.txt"), script.trim() + "\n", "utf8");

// sentences for shot planning (split on sentence enders incl. danda)
const sentences = script.replace(/\r/g, "").split(/(?<=[.!?।])\s+/).map(s => s.trim()).filter(Boolean);
if (!sentences.length) throw new Error("Script has no sentences");

// ---------- 2. TTS (free Gemini voice) ----------
run("node", [path.join(ROOT, "gemini-tts-local.mjs"),
  "--text", path.join(dir, "narration.txt"),
  "--output", path.join(dir, "narration.wav"),
  "--model", "gemini-3.8-flash-tts", "--voice", "Bodi", "--allow-network"]);

// ---------- 3. probe duration ----------
const ffmpegExe = process.env.FFMPEG || "ffmpeg";
const ffprobeExe = process.env.FFPROBE || "ffprobe";
const probe = JSON.parse(execFileSync(ffprobeExe,
  ["-v", "error", "-show_entries", "format=duration", "-of", "json", path.join(dir, "narration.wav")],
  { encoding: "utf8" }));
const voiceDur = Number(probe.format.duration);
const T = +(voiceDur + 0.15 + 0.35).toFixed(2); // voice lead 0.15 + tail 0.35
console.log(`voice ${voiceDur.toFixed(2)}s -> film T=${T}s`);

// ---------- 4. word alignment + captions ----------
run("node", [path.join(ROOT, "align-words.mjs"), path.join(dir, "narration.wav"), path.join(dir, "words.json")]);
run("node", [path.join(ROOT, "fix-words.mjs"), path.join(dir, "narration.txt"), path.join(dir, "words.json"), path.join(dir, "script-words.json")]);
run("node", [path.join(RUNTIME, "scripts", "autopilot.mjs"), "captions",
  path.join(dir, "script-words.json"), path.join(dir, "captions.json"), "--lead", "0.15"], { cwd: RUNTIME });

const words = JSON.parse(fs.readFileSync(path.join(dir, "script-words.json"), "utf8")).words;

// ---------- 5. shot planning (contiguous cuts, ≤2.8s or sentence-bounded) ----------
const chunks = [];
let cur = [];
for (const w of words) {
  cur.push(w);
  const span = w.end - cur[0].start;
  const isSentenceEnd = /[.!?।]$/.test(w.word);
  if ((isSentenceEnd && span > 0.9) || span > 2.8) { chunks.push(cur); cur = []; }
}
if (cur.length) {
  if (chunks.length && cur.length <= 2) chunks[chunks.length - 1].push(...cur);
  else chunks.push(cur);
}
// strict contiguity: compute boundaries first, then assign exact shared edges
const bounds = [0];
for (let i = 1; i < chunks.length; i++) {
  const prevEnd = chunks[i - 1][chunks[i - 1].length - 1].end;
  const nextStart = chunks[i][0].start;
  bounds.push(+(((prevEnd + nextStart) / 2).toFixed(2)));
}
bounds.push(T);
const shots = [];
for (let i = 0; i < chunks.length; i++) {
  const start = bounds[i], end = bounds[i + 1];
  if (end <= start) throw new Error(`shot ${i} has nonpositive span (${start}-${end}); script too dense`);
  shots.push({ start, end, text: chunks[i].map(w => w.word).join(" ") });
}
console.log(`planned ${shots.length} shots`);

// ---------- 6. art generation ----------
let seedCounter = 100;
shots.forEach((s, i) => {
  const shotWords = s.text.split(/\s+/).filter(w => !/^[.!?।,;:]+$/.test(w));
  const pose = choosePose(shotWords, i);
  const props = chooseProps(shotWords, i + 7, i % 2 ? 2 : 1);
  drawCharacter(dir, `art/char-${i}.png`, pose, palette.costume, (seedCounter += 13));
  s.pose = pose;
  s.props = props.map((p, k) => {
    drawProp(dir, `art/prop-${i}-${k}.png`, p, palette, (seedCounter += 29));
    return `art/prop-${i}-${k}.png`;
  });
  if (palette.backdrop) drawBackdrop(dir, `art/bg-${i}.png`, palette, 500 + i * 17);
  if (i === 0) {
    const title = (isScript ? shotWords.slice(0, 4) : topic.split(/\s+/).slice(0, 4)).join(" ").toUpperCase();
    s.title = title.slice(0, 24);
  }
});
console.log("art generated");

// ---------- 7. project assembly ----------
const W = 1280, H = 720;
const project = {
  version: 1, style: vehicle, width: W, height: H, fps: 30,
  voice: { path: "narration.wav", lead: 0.15, tail: 0.35 },
  captions: JSON.parse(fs.readFileSync(path.join(dir, "captions.json"), "utf8"))
    .map(c => ({ ...c, end: Math.min(c.end, +(T - 0.02).toFixed(2)) })),
  shots: [],
  sfx: [],
  ambience: [{ path: "../quiet-room.wav", start: 0, end: T, gain: 0.045, loop: true, fadeIn: 1, fadeOut: 2 }],
};
if (voiceLang === "hi") {
  // Devanagari needs a caption face with coverage; declare a scoped fallback font.
  const hindiFont = process.env.HINDI_FONT || "/usr/share/fonts/truetype/noto/NotoSansDevanagari-Regular.ttf";
  if (fs.existsSync(hindiFont)) {
    project.captionFont = hindiFont;
    project.caption_override = { kind: "language_fallback", language: "hi",
      reason: "Narration is Hindi (Devanagari); the bundled Noto Sans lacks Devanagari glyphs, so a scoped Devanagari face is declared instead of a silent restyle." };
  }
}

shots.forEach((s, i) => {
  const span = +(s.end - s.start).toFixed(2);
  const layers = [];
  const bg = `art/bg-${i}.png`;
  if (fs.existsSync(path.join(dir, bg))) layers.push({ id: `bg-${i}`, type: "image", path: bg, x: 0, y: 0, w: W, h: H });
  if (s.title) {
    layers.push({ type: "text", text: s.title, x: 90, y: 130, size: 60, bold: true,
      color: palette.mono ? "#1a1a1a" : palette.accent,
      keys: [{ t: 0, alpha: 0 }, { t: Math.min(0.35, span / 3), alpha: 1 }] });
  }
  // actor with continuous gentle motion (every <=1.2s) so no 2.5s dead span
  const bob = [];
  for (let t = 0; t <= span + 0.001; t += 1.2) {
    const tt = +Math.min(t, span).toFixed(2);
    if (bob.length && tt <= bob[bob.length - 1].t) break;
    bob.push({ t: tt, y: (bob.length % 2 ? 64 : 46) + (tt === span && bob.length % 2 ? -18 : 0), angle: +(0.02 * (bob.length % 2 ? 1 : -1)).toFixed(3) });
  }
  const actor = { id: `actor-${i}`, type: "image", path: `art/char-${i}.png`,
    x: s.pose === "walk" ? 340 : 700, y: 55, w: 430, h: 537.5,
    motion: { role: "actor", reason: `The character acts out "${s.text.slice(0, 60)}" with living hand-drawn body motion` },
    keys: bob };
  if (s.pose === "walk") actor.keys = actor.keys.map(k => ({ ...k, x: 340 + (k.t / span) * 420 }));
  layers.push(actor);
  // props: pop in, then gentle bob
  s.props.forEach((p, k) => {
    const px = 120 + k * 210, py = 330 + (k % 2) * 60;
    const size = 190;
    const keys = [{ t: 0, y: py + 26, alpha: 0 }];
    const appear = Math.min(0.4, span / 3);
    keys.push({ t: +appear.toFixed(2), y: py, alpha: 1, angle: 0.05 });
    for (let t = appear + 1.1; t <= span + 0.001; t += 1.2) {
      const tt = +Math.min(t, span).toFixed(2);
      keys.push({ t: tt, y: py + (keys.length % 2 ? 12 : -10), angle: +(0.03 * (keys.length % 2 ? -1 : 1)).toFixed(3) });
    }
    layers.push({ id: `prop-${i}-${k}`, type: "image", path: p, x: px, y: py, w: size, h: size,
      motion: { role: "prop", reason: `${p.replace("art/prop-", "").replace(/-\d+\.png$/, "")} visual for "${s.text.slice(0, 50)}"` },
      keys });
    project.sfx.push({ time: +(s.start + appear).toFixed(2), kind: "pop", gain: 0.03 });
  });
  project.shots.push({ start: s.start, end: s.end, layers });
});
project.sfx = project.sfx.filter((s, i, a) => a.findIndex(x => Math.abs(x.time - s.time) < 0.2) === i);
fs.writeFileSync(path.join(dir, "project.json"), JSON.stringify(project, null, 2));
console.log(`project.json: ${project.shots.length} shots, T=${T}s`);

// ---------- 8. validate + preview + approve + render ----------
const autopilot = path.join(RUNTIME, "scripts", "autopilot.mjs");
run("node", [autopilot, "validate", path.join(dir, "project.json")], { cwd: RUNTIME });
run("node", [autopilot, "preview", path.join(dir, "project.json"), "--replace"], { cwd: RUNTIME });
run("node", [autopilot, "approve", path.join(dir, "project.json"),
  "--note", `Approved by Aanirudra78 via the stickman2 GitHub Action workflow_dispatch request (topic/script provided in the run inputs).`], { cwd: RUNTIME });
run("node", [autopilot, "render", path.join(dir, "project.json"), "--replace"], { cwd: RUNTIME });

// ---------- 9. deliver ----------
fs.mkdirSync(outDir, { recursive: true });
const rendered = fs.readdirSync(path.join(dir, "output")).filter(f => f.endsWith(".mp4"));
if (!rendered.length) throw new Error("render produced no mp4");
const src = path.join(dir, "output", rendered[0]);
const dest = path.join(outDir, `${styleCode.replace(/[^A-Za-z0-9.]/g, "")}-${stamp}.mp4`);
fs.copyFileSync(src, dest);
console.log(`\nVIDEO READY: ${dest}`);
