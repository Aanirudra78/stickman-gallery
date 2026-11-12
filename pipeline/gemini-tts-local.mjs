// Project-local Gemini TTS adapter for gemini-3.8-flash-tts (returns complete audio/wav payloads).
// One request, no retries, no key values printed. Follows the installed skill's receipt pattern.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const args = process.argv.slice(2);
const flag = (name) => args[args.indexOf(name) + 1];
const required = (name) => {
  if (!args.includes(name) || !flag(name)) throw new Error(`Required ${name}`);
  return flag(name);
};

const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error("Set GEMINI_API_KEY in the environment");
if (!args.includes("--allow-network")) throw new Error("Network disabled; require explicit --allow-network");

const model = required("--model");
const voice = required("--voice");
const output = path.resolve(required("--output"));
const receipt = `${output}.request.json`;
if (fs.existsSync(output) || fs.existsSync(receipt)) {
  throw new Error("Output or prior request receipt exists; inspect it before any retry");
}

const text = fs.readFileSync(required("--text"), "utf8");
const body = {
  contents: [{ role: "user", parts: [{ text }] }],
  generationConfig: {
    responseModalities: ["AUDIO"],
    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
  },
};

const record = {
  kind: "speech-local", model, voice,
  requested_at: new Date().toISOString(),
  status: "submitted_or_unknown",
};
fs.writeFileSync(receipt, JSON.stringify(record, null, 2), { flag: "wx" });
try {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(180000),
    }
  );
  if (!res.ok) throw new Error(`Provider HTTP ${res.status}; response body deliberately omitted`);
  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const payload = parts.find((p) => p.inlineData?.mimeType?.startsWith("audio/"))?.inlineData;
  if (!payload?.data) throw new Error("No audio payload returned");
  const bytes = Buffer.from(payload.data, "base64");
  fs.writeFileSync(output, bytes, { flag: "wx" });
  Object.assign(record, {
    status: "complete", output,
    mime: payload.mimeType,
    sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
  });
} catch (e) {
  record.status = "failed_or_unknown";
  record.error = e.message;
  throw e;
} finally {
  fs.writeFileSync(receipt, JSON.stringify(record, null, 2));
}
console.log(JSON.stringify({ output, receipt }));
