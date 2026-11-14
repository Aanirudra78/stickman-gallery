// Generic paste-script/topic -> stickman video pipeline (free, local, CI-friendly).
// Vehicles: B1 (minimal line, used by B1/A1.1/A1.2) and B2 (colorful hand-drawn,
// used by B2 + all remaining A-codes as their look-alike vehicle).
// Usage:
//   node autovideo.mjs --style "B2" --voice English --seconds 40 [--topic "..."] [--script "..."]
//   (TOPIC / SCRIPT env vars also accepted — used by the GitHub Action)
import { execFileSync, spawnSync } from "node:child_process";
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
  const MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-2.5-flash-lite", "gemini-flash-latest"];
  const t0 = Date.now();
  outer: for (let round = 0; round < 8; round++) {
    for (const model of MODELS) {
      let data = null, status = 0, netErr = "";
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(90000),
        });
        status = res.status;
        if (res.ok) data = await res.json();
      } catch (e) {
        netErr = String(e?.name || e);
      }
      if (data) {
        text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
        if (text) {
          console.log(`script generated via ${model} after ${Math.round((Date.now() - t0) / 1000)}s`);
          break outer;
        }
      } else if (netErr || [429, 500, 502, 503, 504].includes(status)) {
        console.log(`${model} ${netErr || "HTTP " + status}; trying next model immediately`);
      } else {
        console.log(`${model} HTTP ${status}; trying next model`);
      }
    }
    console.log(`round ${round}: all models busy; waiting 15s...`);
    await new Promise(r => setTimeout(r, 15000));
  }
  if (!text) throw new Error("Gemini script generation failed after retries");
  script = text;
}
fs.writeFileSync(path.join(dir, "narration.txt"), script.trim() + "\n", "utf8");

// sentences for shot planning (split on sentence enders incl. danda)
const sentences = script.replace(/\r/g, "").split(/(?<=[.!?।])\s+/).map(s => s.trim()).filter(Boolean);
if (!sentences.length) throw new Error("Script has no sentences");

// ---------- 2. TTS (free Gemini voice, with retry) ----------
{
  const ttsArgs = [path.join(ROOT, "gemini-tts-local.mjs"),
    "--text", path.join(dir, "narration.txt"),
    "--output", path.join(dir, "narration.wav"),
    "--model", "gemini-3.8-flash-tts", "--voice", "Bodi", "--allow-network"];
  let done = false;
  for (let attempt = 1; attempt <= 4 && !done; attempt++) {
    try {
      run("node", ttsArgs);
      done = true;
    } catch (e) {
      if (attempt === 4) throw e;
      console.log(`TTS attempt ${attempt} failed; cleaning up and waiting 20s...`);
      for (const f of ["narration.wav", "narration.wav.request.json"]) {
        try { fs.rmSync(path.join(dir, f), { force: true }); } catch {}
      }
      await new Promise(r => setTimeout(r, 20000));
    }
  }
}

// ---------- 3. probe duration ----------
const ffmpegExe = process.env.FFMPEG || "ffmpeg";
const ffprobeExe = process.env.FFPROBE || "ffprobe";
let voiceDur;
try {
  const probe = JSON.parse(execFileSync(ffprobeExe,
    ["-v", "error", "-show_entries", "format=duration", "-of", "json", path.join(dir, "narration.wav")],
    { encoding: "utf8" }));
  voiceDur = Number(probe.format.duration);
} catch {
  // no ffprobe available (e.g. local Windows) — read duration from ffmpeg's stderr banner
  const out = spawnSync(ffmpegExe,
    ["-i", path.join(dir, "narration.wav"), "-f", "null", "-"],
    { encoding: "utf8", stdio: ["ignore", "ignore", "pipe"] });
  const m = String(out.stderr).match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
  if (!m) throw new Error("could not probe narration duration");
  voiceDur = (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]);
}
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
  const props = chooseProps(shotWords, i + 7, 2 + (i % 2));
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

// pose verb for motion reasons
const POSE_VERB = { walk: "crosses the stage", wave: "greets with a raised arm",
  point: "leans in and points at the viewer", hold: "holds up the idea", stand: "acts out the moment",
  think: "ponders with a hand on the chin", celebrate: "throws both arms up in celebration",
  jump: "bounces up with excitement", carry: "shoulders the weight of the idea" };

// key times quantized DOWN to centiseconds: shot spans are raw float differences
// (e.g. 18.65-15.11 = 3.5399999999999991), so rounding up past them is invalid.
const qk = (t) => Math.floor(t * 100) / 100;

shots.forEach((s, i) => {
  const span = s.end - s.start;
  const layers = [];
  const bg = `art/bg-${i}.png`;
  if (fs.existsSync(path.join(dir, bg))) layers.push({ id: `bg-${i}`, type: "image", path: bg, x: 0, y: 0, w: W, h: H });
  if (s.title) {
    layers.push({ type: "text", text: s.title, x: 90, y: 130, size: 60, bold: true,
      color: palette.mono ? "#1a1a1a" : palette.accent,
      keys: [{ t: 0, y: 98, alpha: 0 }, { t: qk(Math.min(0.5, span / 3)), y: 130, alpha: 1 }] });
    project.sfx.push({ time: qk(s.start + 0.35), kind: "chime", gain: 0.025 });
  }

  // ----- actor choreography: slide-in entrance, living bob cadence, mid-shot emphasis hop -----
  const threeProps = s.props.length > 2;
  const sideX = s.pose === "walk" ? 340 : (threeProps ? 720 : (i % 2 ? 560 : 700)); // alternate sides for variety; stay right when 3 props fill the left
  const fromX = s.pose === "walk" ? 170 : sideX + (i % 2 ? 130 : -130);
  const settle = Math.min(0.55, span / 3);
  const cadence = s.pose === "walk" ? 0.9 : 1.1;
  const bobTimes = [];
  for (let t = settle + cadence; t <= span + 0.001; t += cadence) {
    const tt = qk(Math.min(t, span));
    if (!bobTimes.length || tt > bobTimes[bobTimes.length - 1]) bobTimes.push(tt);
  }
  const events = [{ t: 0, p: { x: fromX, alpha: 0 } },
    { t: qk(settle), p: { x: sideX, y: 55, alpha: 1, w: 430 } }];
  for (const t of bobTimes) events.push({ t, bob: true });
  if (span > settle + 1.9) {
    const hop = (settle + span) / 2;
    events.push({ t: qk(hop - 0.18), p: { y: 34 } });
    events.push({ t: qk(hop), p: { y: 102, w: 458 }, tap: true });
    events.push({ t: qk(hop + 0.28), p: { y: 55, w: 430 } });
  }
  if (s.pose === "walk" && span > settle + 0.35) events.push({ t: qk(span), p: { x: 760 } });
  events.sort((a, b) => a.t - b.t);
  const K = [];
  for (const e of events) {
    if (K.length && e.t <= K[K.length - 1].t) continue;
    const n = K.length;
    if (e.bob) {
      const k = { t: e.t, y: n % 2 ? 78 : 46, angle: +(0.05 * (n % 2 ? 1 : -1)).toFixed(3), w: n % 2 ? 446 : 430, alpha: 1 };
      if (s.pose === "walk") k.x = +(340 + 420 * (e.t / span)).toFixed(1);
      K.push(k);
    } else {
      K.push({ t: e.t, ...e.p });
    }
    if (e.tap) project.sfx.push({ time: qk(s.start + e.t), kind: "tap", gain: 0.03 });
  }
  layers.push({ id: `actor-${i}`, type: "image", path: `art/char-${i}.png`,
    x: sideX, y: 55, w: 430, h: 537.5,
    motion: { role: "actor", reason: `The character ${POSE_VERB[s.pose] || "acts out the moment"} while narrating "${s.text.slice(0, 50)}"` },
    keys: K });

  // ----- props: staggered spin-in entrances, then lively bob -----
  s.props.forEach((p, k) => {
    const px = (threeProps ? 105 : 120) + k * (threeProps ? 195 : 210), py = 330 + (k % 2) * 60;
    const size = threeProps ? 178 : 190;
    const appear = Math.min(0.4 + k * 0.3, span / 2);
    const settleP = Math.min(appear + 0.24, span);
    const PK = [{ t: 0, x: px - 18, y: py + 34, w: +(size * 0.79).toFixed(1), alpha: 0, angle: -0.28 },
      { t: qk(appear), x: px, y: py + 6, w: +(size * 1.06).toFixed(1), alpha: 1, angle: 0.05 }];
    for (let t = settleP; t <= span + 0.001; t += 1.1) {
      const tt = qk(Math.min(t, span));
      if (PK[PK.length - 1].t >= tt) break;
      const n = PK.length;
      PK.push({ t: tt, y: py + (n % 2 ? 14 : -12), w: +(size * (1 + 0.037 * (n % 2 ? 1 : -1))).toFixed(1), angle: +(0.035 * (n % 2 ? -1 : 1)).toFixed(3) });
    }
    layers.push({ id: `prop-${i}-${k}`, type: "image", path: p, x: px, y: py, w: size, h: size,
      motion: { role: "prop", reason: `${p.replace("art/prop-", "").replace(/-\d+\.png$/, "")} prop lands and reacts to "${s.text.slice(0, 40)}"` },
      keys: PK });
    project.sfx.push({ time: qk(s.start + appear), kind: "pop", gain: 0.03 });
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
