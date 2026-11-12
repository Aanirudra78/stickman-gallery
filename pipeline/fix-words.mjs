// Remaps approved narration words onto Whisper's word timings (LCS diff).
// Output keeps the approved text verbatim; timings come from the aligned audio.
import fs from "node:fs";

const [, , scriptPath, whisperPath, outPath] = process.argv;
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9']/g, "");

const scriptText = fs.readFileSync(scriptPath, "utf8");
const scriptTokens = scriptText
  .split(/\s+/)
  .filter(Boolean)
  .map((w, i) => ({ raw: w, norm: norm(w), i }));

const { words: wTokens } = JSON.parse(fs.readFileSync(whisperPath, "utf8"));
const wWords = wTokens.map((w) => ({ ...w, norm: norm(w.word) }));

// LCS over normalized tokens
const n = scriptTokens.length, m = wWords.length;
const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
for (let i = n - 1; i >= 0; i--) {
  for (let j = m - 1; j >= 0; j--) {
    dp[i][j] = scriptTokens[i].norm === wWords[j].norm
      ? dp[i + 1][j + 1] + 1
      : Math.max(dp[i + 1][j], dp[i][j + 1]);
  }
}
// walk to produce alignment groups
const groups = []; // {scriptIdxs:[], whisperIdx or null}
let i = 0, j = 0;
while (i < n && j < m) {
  if (scriptTokens[i].norm === wWords[j].norm) {
    groups.push({ scriptIdxs: [i], wIdx: j });
    i++; j++;
  } else if (dp[i + 1][j] >= dp[i][j + 1]) {
    // script word unmatched ahead: start a group of script words with no whisper token yet
    const idxs = [];
    while (i < n && (j >= m || scriptTokens[i].norm !== wWords[j].norm)) {
      if (j < m && dp[i + 1][j] >= dp[i][j + 1]) break;
      idxs.push(i); i++;
    }
    if (idxs.length === 0) { idxs.push(i); i++; }
    groups.push({ scriptIdxs: idxs, wIdx: null });
  } else {
    j++; // extra/misheard whisper token -> skip
  }
}
while (i < n) groups.push({ scriptIdxs: [i++], wIdx: null });

// resolve: consecutive unmatched script groups between two matched anchors share the gap
const out = [];
for (let g = 0; g < groups.length; g++) {
  const grp = groups[g];
  if (grp.wIdx != null) {
    const wt = wWords[grp.wIdx];
    const k = grp.scriptIdxs.length;
    if (k === 1) {
      out.push({ word: scriptTokens[grp.scriptIdxs[0]].raw, start: wt.start, end: wt.end });
    } else {
      // multiple script words mapped to one whisper token (e.g. "$100" -> "a hundred dollars")
      const span = (wt.end - wt.start) / k;
      grp.scriptIdxs.forEach((si, x) => {
        out.push({ word: scriptTokens[si].raw, start: +(wt.start + span * x).toFixed(3), end: +(wt.start + span * (x + 1)).toFixed(3) });
      });
    }
  } else {
    // find surrounding anchors to interpolate
    let prev = null, next = null;
    for (let p = g - 1; p >= 0 && !prev; p--) if (groups[p].wIdx != null) prev = wWords[groups[p].wIdx];
    for (let q = g + 1; q < groups.length && !next; q++) if (groups[q].wIdx != null) next = wWords[groups[q].wIdx];
    const start = prev ? prev.end : (next ? Math.max(0, next.start - 0.12 * grp.scriptIdxs.length) : 0);
    const end = next ? next.start : (prev ? prev.end + 0.12 * grp.scriptIdxs.length : start + 0.12 * grp.scriptIdxs.length);
    const span = (end - start) / grp.scriptIdxs.length;
    grp.scriptIdxs.forEach((si, x) => {
      out.push({ word: scriptTokens[si].raw, start: +(start + span * x).toFixed(3), end: +(start + span * (x + 1)).toFixed(3) });
    });
  }
}

// sanity: monotonic non-overlapping
for (let x = 1; x < out.length; x++) {
  if (out[x].start < out[x - 1].end) out[x].start = out[x - 1].end;
  if (out[x].end <= out[x].start) out[x].end = out[x].start + 0.05;
}
fs.writeFileSync(outPath, JSON.stringify({ words: out }, null, 2));
console.log(`Remapped ${out.length} script words. Sample:`);
out.slice(0, 6).forEach((w) => console.log(`  ${w.start}-${w.end} "${w.word}"`));
