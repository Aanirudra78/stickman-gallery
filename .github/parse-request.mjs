// Build the render request from workflow_dispatch inputs, or parse the
// [render] issue body (topic/script/style/voice/seconds) as fallback.
import fs from "node:fs";

const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
const eventName = process.env.GITHUB_EVENT_NAME;

const fields = { topic: "", script: "", style: "B2", voice: "English", seconds: "40" };

const envIn = (k) => String(process.env[k] || "").trim();
fields.topic = envIn("IN_TOPIC");
fields.script = envIn("IN_SCRIPT");
if (envIn("IN_STYLE")) fields.style = envIn("IN_STYLE");
if (envIn("IN_VOICE")) fields.voice = envIn("IN_VOICE");
if (envIn("IN_SECONDS")) fields.seconds = envIn("IN_SECONDS");

if (eventName === "issues" && !fields.topic && !fields.script) {
  const body = String(event.issue?.body || "");
  const keys = Object.keys(fields);
  let current = null;
  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.trim();
    const m = line.match(/^([a-z]+):\s*(.*)$/i);
    if (m && keys.includes(m[1].toLowerCase())) {
      current = m[1].toLowerCase();
      fields[current] = m[2].trim();
    } else if (current && line) {
      fields[current] += (fields[current] ? "\n" : "") + rawLine.trimEnd();
    }
  }
}

const valid = /^(B1|B2|A1\.1|A1\.2|A2\.1|A2\.2|A3|A4|A5|A6)$/;
if (!valid.test(fields.style)) throw new Error(`Unsupported style "${fields.style}"`);
if (!fields.topic && !fields.script) throw new Error("No topic or script provided");
fields.seconds = String(Math.min(90, Math.max(20, Number(fields.seconds) || 40)));
if (fields.voice.toLowerCase().startsWith("h")) fields.voice = "Hindi"; else fields.voice = "English";

const delim = `GHOUT-${Date.now()}`;
let out = "";
for (const [k, v] of Object.entries(fields)) {
  out += `${k}<<${delim}\n${v}\n${delim}\n`;
}
fs.appendFileSync(process.env.GITHUB_OUTPUT, out);
console.log(`request: style=${fields.style} voice=${fields.voice} seconds=${fields.seconds} script=${fields.script ? fields.script.length + " chars" : "topic-only"}`);
