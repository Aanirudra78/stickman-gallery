// Project-local word-timestamp aligner using transformers.js Whisper (base, timestamped).
// Reads a 16-bit PCM WAV, returns {words:[{start,end,word}]} compatible with the runtime's captions command.
import fs from "node:fs";
import { pipeline } from "@huggingface/transformers";

const [, , wavPath, outPath] = process.argv;
if (!wavPath || !outPath) {
  console.error("Usage: node align-words.mjs input.wav output.json");
  process.exit(1);
}

// --- decode PCM s16le WAV manually ---
const buf = fs.readFileSync(wavPath);
if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") {
  throw new Error("Not a WAV file");
}
// find data chunk
let pos = 12, dataOffset = -1, dataLen = 0, sampleRate = 16000;
while (pos + 8 <= buf.length) {
  const id = buf.toString("ascii", pos, pos + 4);
  const size = buf.readUInt32LE(pos + 4);
  if (id === "fmt ") {
    sampleRate = buf.readUInt32LE(pos + 12);
  }
  if (id === "data") {
    dataOffset = pos + 8;
    dataLen = size;
    break;
  }
  pos += 8 + size + (size % 2);
}
if (dataOffset < 0) throw new Error("No data chunk in WAV");

let samples = new Float32Array(dataLen / 2);
for (let i = 0; i < samples.length; i++) {
  samples[i] = buf.readInt16LE(dataOffset + i * 2) / 32768;
}
console.error(`Decoded ${samples.length} samples @ ${sampleRate} Hz (${(samples.length / sampleRate).toFixed(2)}s)`);

// --- resample to 16 kHz (Whisper's expected rate) by linear interpolation ---
const TARGET = 16000;
if (sampleRate !== TARGET) {
  const outLen = Math.round(samples.length * TARGET / sampleRate);
  const rs = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const t = i * (samples.length - 1) / (outLen - 1 || 1);
    const lo = Math.floor(t), hi = Math.min(samples.length - 1, lo + 1);
    rs[i] = samples[lo] + (samples[hi] - samples[lo]) * (t - lo);
  }
  samples = rs;
  sampleRate = TARGET;
  console.error(`Resampled to ${sampleRate} Hz (${(samples.length / sampleRate).toFixed(2)}s)`);
}

// --- transcribe with word timestamps ---
const transcriber = await pipeline(
  "automatic-speech-recognition",
  "onnx-community/whisper-base_timestamped",
  { dtype: "q8" }
);
const output = await transcriber(samples, {
  return_timestamps: "word",
  chunk_length_s: 30,
  stride_length_s: 5,
});

const words = (output.chunks || [])
  .map((c) => ({
    word: String(c.text ?? "").trim(),
    start: Array.isArray(c.timestamp) ? c.timestamp[0] : c.timestamp,
    end: Array.isArray(c.timestamp) ? c.timestamp[1] : c.timestamp,
  }))
  .filter((w) => w.word && Number.isFinite(w.start) && Number.isFinite(w.end));

fs.writeFileSync(outPath, JSON.stringify({ words }, null, 2));
console.log(`Aligned ${words.length} words -> ${outPath}`);
console.log(output.text.slice(0, 300));
