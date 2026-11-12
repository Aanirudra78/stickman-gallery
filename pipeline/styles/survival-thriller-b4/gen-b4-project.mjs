// Assemble the B4 demo project: opening shot + body shots + audio tracks + captions.
import fs from "node:fs";
const DIR = "C:\\Users\\sanir\\Music\\web\\stick\\styles\\survival-thriller-b4";
const opening = JSON.parse(fs.readFileSync(`${DIR}\\opening-layers.json`, "utf8"));
const captions = JSON.parse(fs.readFileSync(`${DIR}\\captions.json`, "utf8"));

const T = 10.12; // voice end exactly (lead 0, tail 0)
const project = {
  version: 1, style: "B4", width: 1280, height: 720, fps: 30,
  voice: {
    path: "narration.wav", lead: 0, tail: 0,
    name: "Gemini Bodi", id: "gemini-3.8-flash-tts/Bodi",
    user_override: "User's standing free-only constraint (no billing) rules out the ai33/ElevenLabs Brian voice; free Gemini TTS voice Bodi chosen instead, matching the Dispatch original film's Gemini-voice precedent. Recorded in the 2026-11-12 chat session.",
  },
  captions: captions.map(c => ({ ...c, end: Math.min(c.end, +(T - 0.02).toFixed(2)) })),
  shots: [
    opening.shot,
    { start: 3.0, end: 6.0, layers: [
      { type: "image", path: "art/street-up.png", x: 0, y: 0, w: 1280, h: 720 },
    ] },
    { start: 6.0, end: 9.0, layers: [
      { type: "image", path: "art/rooftop-radio.png", x: 0, y: 0, w: 1280, h: 720 },
    ] },
    { start: 9.0, end: T, layers: [
      { type: "image", path: "art/window-closeup.png", x: 0, y: 0, w: 1280, h: 720 },
    ] },
  ],
  sfx: [
    { time: 1.05, kind: "tap", gain: 0.05 },
    { time: 3.45, kind: "tap", gain: 0.04 },
    { time: 9.25, kind: "pop", gain: 0.035 },
  ],
  ambience: [
    { path: "../../quiet-room.wav", start: 0, end: T, gain: 0.045, loop: true, fadeIn: 1, fadeOut: 2 },
  ],
  dialogue: [],
  audio_cuts: [],
  opening: opening.opening,
};
fs.writeFileSync(`${DIR}\\project.json`, JSON.stringify(project, null, 2));
console.log(`project.json assembled: ${project.shots.length} shots, ends ${T}s`);

