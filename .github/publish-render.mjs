// Publish the freshly rendered MP4 into renders/ + update renders/manifest.json,
// and write the issue-comment markdown to render-comment.md.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "pipeline", "output-video");
const files = fs.readdirSync(outDir).filter(f => f.endsWith(".mp4"));
if (!files.length) throw new Error("no rendered mp4 found");

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const src = path.join(outDir, files[0]);
const name = `${stamp}-${process.env.RENDER_STYLE || "video"}.mp4`.replace(/[^A-Za-z0-9.-]/g, "-");
const destRel = `renders/${name}`;

fs.mkdirSync(path.join(root, "renders"), { recursive: true });
fs.copyFileSync(src, path.join(root, destRel));

const manifestPath = path.join(root, "renders", "manifest.json");
let manifest = [];
if (fs.existsSync(manifestPath)) manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.unshift({
  file: destRel,
  title: (process.env.RENDER_TOPIC || "Rendered video").slice(0, 80),
  style: process.env.RENDER_STYLE || "",
  voice: process.env.RENDER_VOICE || "",
  date: new Date().toISOString().slice(0, 10),
  by: "issue",
});
fs.writeFileSync(manifestPath, JSON.stringify(manifest.slice(0, 60), null, 2));

const watchUrl = `https://aanirudra78.github.io/stickman-gallery/#your-videos`;
const runUrl = process.env.GITHUB_SERVER_URL ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : "";
fs.writeFileSync("render-comment.md",
  `\nWatch it on the site: **${watchUrl}** (newest card)\n` +
  `\nDirect file: [\`${destRel}\`](https://aanirudra78.github.io/stickman-gallery/${destRel})\n` +
  (runUrl ? `\nRender log: ${runUrl}\n` : ""));
console.log(`published ${destRel}; manifest has ${manifest.length} entries`);
