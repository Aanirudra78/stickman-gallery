// Parse the [render] issue body into topic/script/style/voice/seconds step outputs.
// Body format (from the website form):
//   topic: ...
//   script: (multi-line until the next key or end)
//   style: CODE
//   voice: English|Hindi
//   seconds: N
import fs from "node:fs";

const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
const body = String(event.issue?.body || "");

const fields = { topic: "", script: "", style: "B2", voice: "English", seconds: "40" };
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

const valid = /^(B1|B2|A1\.1|A1\.2|A2\.1|A2\.2|A3|A4|A5|A6)$/;
if (!valid.test(fields.style)) throw new Error(`Unsupported style "${fields.style}"`);
if (!fields.topic.trim() && !fields.script.trim()) {
  throw new Error("Issue has neither topic nor script — nothing to render");
}
fields.seconds = String(Math.min(90, Math.max(20, Number(fields.seconds) || 40)));

// heredoc-style outputs preserve multi-line scripts exactly
const delim = `GHOUT-${Date.now()}`;
let out = "";
for (const [k, v] of Object.entries(fields)) {
  out += `${k}<<${delim}\n${v}\n${delim}\n`;
}
fs.appendFileSync(process.env.GITHUB_OUTPUT, out);
console.log(`parsed: style=${fields.style} voice=${fields.voice} seconds=${fields.seconds} topic="${fields.topic.slice(0, 60)}" script=${fields.script ? fields.script.length + " chars" : "none"}`);
