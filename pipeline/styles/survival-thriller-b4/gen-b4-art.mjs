// B4 Survival Thriller demo art — painted night city, cel shading, white-head stick cast.
// Grammar: white circular head, minimal black face, black stick body, compact white gloves.
import { makeCanvas, save, pen, oval, mulberry32 } from "file:///C:/Users/sanir/Music/web/stick/artlib.mjs";

const DIR = "C:\\Users\\sanir\\Music\\web\\stick\\styles\\survival-thriller-b4\\art";
const INK = "#20232e", HEAD = "#f2efe9", GLOVE = "#f2efe9";

function nightSky(ctx, r) {
  const g = ctx.createLinearGradient(0, 0, 0, 720);
  g.addColorStop(0, "#2a3448"); g.addColorStop(0.6, "#1c2333"); g.addColorStop(1, "#141a28");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1280, 720);
  // faint stars
  ctx.fillStyle = "rgba(235,240,250,0.5)";
  for (let i = 0; i < 26; i++) ctx.fillRect(20 + r() * 1240, 20 + r() * 260, 2.4, 2.4);
}

// dark city blocks with a few dead windows (faint outlines, unlit)
function cityRow(ctx, y0, h, fill, r, lit = false) {
  let x = -40;
  while (x < 1320) {
    const w = 90 + r() * 130;
    ctx.fillStyle = fill;
    ctx.fillRect(x, y0 - r() * 40, w, h + 80);
    // cel edge shade
    ctx.fillStyle = "rgba(10,14,24,0.45)";
    ctx.fillRect(x + w - 14, y0 - r() * 40, 14, h + 80);
    if (!lit) for (let wx = x + 14; wx < x + w - 22; wx += 30) {
      for (let wy = y0 + 18; wy < y0 + h - 20; wy += 38) {
        if (r() < 0.55) { ctx.fillStyle = "rgba(70,82,108,0.5)"; ctx.fillRect(wx, wy, 14, 20); }
      }
    }
    x += w + 18;
  }
}

// the tower: right-of-center, dark, with one watcher window at (870–950, 240–320)
function tower(ctx, { watcher = false } = {}) {
  // main slab
  ctx.fillStyle = "#232b3c"; ctx.fillRect(770, 90, 320, 560);
  // lit streetlight side (left face catches city glow)
  ctx.fillStyle = "#2d3850"; ctx.fillRect(770, 90, 60, 560);
  ctx.fillStyle = "rgba(10,14,24,0.5)"; ctx.fillRect(1066, 90, 24, 560);
  // roof cap
  ctx.fillStyle = "#1a2130"; ctx.fillRect(756, 76, 348, 22);
  // window grid (dark + faint dead outlines)
  for (let wy = 130; wy < 630; wy += 62) {
    for (let wx = 800; wx < 1066; wx += 66) {
      const isWatcher = watcher === "both" || (wx >= 866 && wx < 998 && wy >= 240 && wy < 364);
      if (watcher && isWatcher) continue;
      ctx.fillStyle = "rgba(58,68,94,0.55)"; ctx.fillRect(wx, wy, 40, 42);
      ctx.fillStyle = "rgba(16,20,30,0.6)"; ctx.fillRect(wx, wy, 40, 8);
    }
  }
  if (watcher) {
    // THE window: warm lit, black watcher silhouette (round head + shoulders)
    ctx.fillStyle = "#e3b45c"; ctx.fillRect(866, 240, 132, 124);
    ctx.fillStyle = "rgba(120,80,20,0.35)"; ctx.fillRect(866, 240, 132, 12);
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(918, 300, 26, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(876, 364); ctx.quadraticCurveTo(918, 322, 962, 364); ctx.lineTo(962, 364); ctx.quadraticCurveTo(918, 352, 876, 364); ctx.fill();
    // glow spill
    const g = ctx.createRadialGradient(932, 302, 14, 932, 302, 110);
    g.addColorStop(0, "rgba(227,180,92,0.38)"); g.addColorStop(1, "rgba(227,180,92,0)");
    ctx.fillStyle = g; ctx.fillRect(822, 192, 220, 220);
  }
  // antenna
  pen(ctx, [[930, 76], [930, 24]], { w: 5, color: INK, jitter: 0.5, rnd: mulberry32(71) });
}

// stick figure with white gloves; origin at hip
function stickman(ctx, x, y, s, { pose = "stand", face = "away" } = {}, r) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineCap = "round";
  // legs
  ctx.strokeStyle = INK; ctx.lineWidth = 9;
  if (pose === "crouch") {
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-34, 16, -30, 46); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, 0); ctx.quadraticCurveTo(30, 30, 22, 52); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(-7, 0); ctx.quadraticCurveTo(-12, 30, -9, 58); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(7, 0); ctx.quadraticCurveTo(13, 30, 10, 58); ctx.stroke();
  }
  // torso
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(2, -40, 0, -78); ctx.stroke();
  // arms to radio (both hands up)
  if (pose === "crouch") {
    ctx.beginPath(); ctx.moveTo(-2, -66); ctx.quadraticCurveTo(-30, -52, -26, -24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, -66); ctx.quadraticCurveTo(26, -58, 24, -30); ctx.stroke();
    // radio held at chest with two gloves
    ctx.fillStyle = "#15181f"; ctx.fillRect(-14, -30, 30, 44);
    ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(-14, -30, 30, 44);
    ctx.fillStyle = "#4a5568"; ctx.fillRect(-9, -24, 20, 16);
    pen(ctx, [[6, -30], [12, -48]], { w: 3.4, color: INK, jitter: 0.4, rnd: r });
    // gloves
    for (const [gx, gy] of [[-26, -24], [24, -30]]) {
      ctx.fillStyle = GLOVE; ctx.strokeStyle = INK; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.ellipse(gx, gy, 9, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  } else {
    ctx.beginPath(); ctx.moveTo(-2, -66); ctx.quadraticCurveTo(-22, -34, -16, -6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, -66); ctx.quadraticCurveTo(24, -40, 30, -12); ctx.stroke();
    for (const [gx, gy] of [[-16, -6], [30, -12]]) {
      ctx.fillStyle = GLOVE; ctx.strokeStyle = INK; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.ellipse(gx, gy, 9, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  }
  // head (white circle, minimal black face)
  const hy = -112;
  ctx.fillStyle = HEAD; ctx.strokeStyle = INK; ctx.lineWidth = 4.5;
  ctx.beginPath(); ctx.arc(0, hy, 27, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  if (face === "side") { // profile looking right
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(10, hy - 2, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(14, hy + 8); ctx.lineTo(22, hy + 8); ctx.stroke();
  } else if (face === "up") { // looking up
    ctx.fillStyle = INK;
    ctx.beginPath(); ctx.arc(-8, hy - 8, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6, hy - 8, 2.6, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

// ---- scene 1: opening before/after (identical except the watcher window) ----
function openingBase(watcher) {
  const ctx = makeCanvas(1280, 720);
  const r = mulberry32(101);
  nightSky(ctx, r);
  cityRow(ctx, 420, 220, "#262e40", mulberry32(102));
  tower(ctx, { watcher });
  // foreground rooftop parapet
  ctx.fillStyle = "#161c2a"; ctx.fillRect(0, 640, 1280, 80);
  ctx.fillStyle = "#20283a"; ctx.fillRect(0, 620, 1280, 26);
  // subtle vignette
  const v = ctx.createRadialGradient(640, 340, 300, 640, 340, 840);
  v.addColorStop(0, "rgba(8,10,18,0)"); v.addColorStop(1, "rgba(8,10,18,0.42)");
  ctx.fillStyle = v; ctx.fillRect(0, 0, 1280, 720);
  save(ctx, DIR, watcher ? "opening-after.png" : "opening-before.png");
}

// ---- scene 2: street level looking up ----
function streetUp() {
  const ctx = makeCanvas(1280, 720);
  const r = mulberry32(111);
  nightSky(ctx, r);
  cityRow(ctx, 260, 380, "#28304a", mulberry32(112));
  tower(ctx, { watcher: true });
  // street foreground
  ctx.fillStyle = "#12161f"; ctx.fillRect(0, 600, 1280, 120);
  ctx.fillStyle = "rgba(227,180,92,0.10)"; ctx.fillRect(0, 600, 1280, 8);
  // low fog band
  ctx.fillStyle = "rgba(150,160,190,0.10)";
  oval(ctx, 400, 560, 260, 26, { fill: ctx.fillStyle });
  oval(ctx, 900, 585, 300, 22, { fill: "rgba(150,160,190,0.08)" });
  // survivor from behind, looking up at the tower
  stickman(ctx, 430, 600, 1.15, { pose: "stand", face: "up" }, r);
  save(ctx, DIR, "street-up.png");
}

// ---- scene 3: rooftop with radio ----
function rooftopRadio() {
  const ctx = makeCanvas(1280, 720);
  const r = mulberry32(121);
  nightSky(ctx, r);
  cityRow(ctx, 380, 260, "#262e40", mulberry32(122));
  tower(ctx, { watcher: true });
  // parapet
  ctx.fillStyle = "#161c2a"; ctx.fillRect(0, 620, 1280, 100);
  ctx.fillStyle = "#232c40"; ctx.fillRect(0, 600, 1280, 24);
  // survivor crouched at the parapet, radio in gloves
  stickman(ctx, 520, 596, 1.2, { pose: "crouch", face: "side" }, r);
  // rim light from the watcher window
  const g = ctx.createLinearGradient(0, 300, 1280, 720);
  g.addColorStop(0, "rgba(227,180,92,0.05)"); g.addColorStop(1, "rgba(227,180,92,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1280, 720);
  save(ctx, DIR, "rooftop-radio.png");
}

// ---- scene 4: final close-up of the lit window ----
function windowCloseup() {
  const ctx = makeCanvas(1280, 720);
  const r = mulberry32(131);
  // dark facade close-up
  ctx.fillStyle = "#1d2433"; ctx.fillRect(0, 0, 1280, 720);
  ctx.fillStyle = "rgba(40,50,74,0.6)";
  for (let wy = 0; wy < 720; wy += 90) for (let wx = 0; wx < 1280; wx += 96) ctx.fillRect(wx + 18, wy + 20, 60, 50);
  // one big lit window, watcher framed
  ctx.fillStyle = "#e3b45c"; ctx.fillRect(470, 190, 340, 330);
  ctx.strokeStyle = INK; ctx.lineWidth = 10; ctx.strokeRect(470, 190, 340, 330);
  ctx.beginPath(); ctx.moveTo(640, 190); ctx.lineTo(640, 520); ctx.stroke();
  // watcher silhouette on the left pane, half-turned
  ctx.fillStyle = INK;
  ctx.beginPath(); ctx.arc(556, 350, 52, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(492, 520); ctx.quadraticCurveTo(556, 396, 622, 520); ctx.fill();
  // curtain edge on the right pane
  ctx.fillStyle = "rgba(120,86,32,0.5)"; ctx.fillRect(640, 190, 40, 330);
  // glow into the dark
  const g = ctx.createRadialGradient(640, 355, 80, 640, 355, 460);
  g.addColorStop(0, "rgba(227,180,92,0.22)"); g.addColorStop(1, "rgba(227,180,92,0)");
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1280, 720);
  save(ctx, DIR, "window-closeup.png");
}

openingBase(false); openingBase(true); streetUp(); rooftopRadio(); windowCloseup();
console.log("B4 art done");
