'use strict';
// Act II — from theatre of shadow to pure abstraction.

/* ───────────────────────── VI. Baroque ───────────────────────── */
SCENES.push({
  key: 'baroque', dur: 30, handle: '@caravaggio',
  meta: { num: 'VI', eraZh: '十七世纪 · 罗马', eraEn: '17th century · Rome', zh: '光影剧场', en: 'Theatre of Shadow',
    qZh: '卡拉瓦乔让光像刀一样切开黑暗——信仰、欲望与死亡，在同一束光里登场。', qEn: 'Caravaggio let light cut the darkness like a blade — faith, desire and death enter in a single beam.', by: '',
    lZh: '美，是激情，是运动，是被戏剧照亮的一瞬。', lEn: 'Beauty as passion, as motion — an instant lit like theatre.' },
  swatch: [[150, 18, 28], [10, 6, 6], [230, 210, 170], [200, 140, 60]],
  audio: { root: 73.42, chord: [0, 3, 7, 12], wave: 'sawtooth', cutoff: 600, level: 0.06,
    notes: { scale: [0, 3, 7, 10, 12, 15], oct: [2, 3], rate: 0.19, wave: 'sawtooth', decay: 0.55, gain: 0.04, pattern: 'arp', cutoff: 2400, wet: 0.45 },
    drum: { every: 3.2, gain: 0.25, freq: 70, decay: 1.2, wet: 0.7 } },
  init(S) {
    const bw = S.bw = 330, bh = S.bh = Math.round(330 * S.h / S.w), asp = S.w / S.h;
    S.low = U.canvas(bw, bh); S.lg = S.low.getContext('2d'); S.img = S.lg.createImageData(bw, bh);
    S.H = new Float32Array((bw + 1) * (bh + 1));
    // Crimson curtain above, golden cloth falling to the right, white linen below.
    S.base = new Float32Array(bw * bh * 3);
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const px = x / bw * asp, py = y / bh, i = (y * bw + x) * 3;
      let c = [176, 20, 28];
      c = U.mix(c, [206, 148, 58], U.smooth(0.02, 0.1, px / asp - 0.66 - 0.06 * Math.sin(py * 5)) * U.smooth(0.25, 0.4, py));
      c = U.mix(c, [232, 220, 198], U.smooth(0.7, 0.8, py + 0.06 * Math.sin(px * 3.5 + 1.3)));
      S.base[i] = c[0]; S.base[i + 1] = c[1]; S.base[i + 2] = c[2];
    }
    S.motes = Array.from({ length: 160 }, () => ({ x: S.rnd(), y: S.rnd(), z: S.rnd() }));
    const N = S.N;
    S.crack = U.texture(S.w, S.h, S.u, (X, Y, o) => {
      const r = Math.pow(1 - Math.abs(N.n2(X * 0.02, Y * 0.02)), 30) + Math.pow(1 - Math.abs(N.n2(X * 0.045 + 9, Y * 0.045)), 40) * 0.7;
      const v = 255 - Math.min(1, r) * 45;
      o[0] = v; o[1] = v * 0.94; o[2] = v * 0.82;
    }, 1000);
  },
  frame(S, t) {
    const { g, w, h, u, N, bw, bh, H } = S, W1 = bw + 1, asp = w / h;
    // Sharp-creased folds: |sin| gives soft crowns and knife-edge valleys.
    for (let y = 0; y <= bh; y++) {
      const ny = y / bh, swag = U.smooth(0.42, 0.0, ny);
      for (let x = 0; x <= bw; x++) {
        const nx = x / bw * asp, wv = N.n3(nx * 0.9, ny * 0.8, t * 0.035) + 0.35 * N.n2(nx * 2.1 + 5 + t * 0.03, ny * 1.7);
        const vert = Math.abs(Math.sin(nx * 6.5 + wv * 2.6 + 0.5 * Math.sin(ny * 2.2 + nx))) * 0.7 + Math.abs(Math.sin(nx * 15 + wv * 5 + ny * 2)) * 0.22;
        const hang = Math.abs(Math.sin(ny * 11 - Math.pow(Math.abs(Math.sin(nx * 2.2 + 0.4)), 0.7) * 5 + wv * 1.5)) * 0.6;
        H[y * W1 + x] = vert * (1 - swag) + hang * swag;
      }
    }
    const d = S.img.data, base = S.base;
    let lx = -0.6, ly = -0.55, lz = 0.58; const ll = Math.hypot(lx, ly, lz); lx /= ll; ly /= ll; lz /= ll;
    let hx = lx, hy = ly, hz = lz + 1; const hl = Math.hypot(hx, hy, hz); hx /= hl; hy /= hl; hz /= hl;
    const reveal = U.smooth(0.3, 8, t), bx0 = 0.25 + 0.12 * Math.sin(t * 0.07), by0 = -0.25;
    let Dx = 0.8, Dy = 1; const dl = Math.hypot(Dx, Dy); Dx /= dl; Dy /= dl;
    const beamW = 0.62 + 0.08 * Math.sin(t * 0.11), sc = bw / 70;
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const i = y * W1 + x;
      let nxv = -(H[i + 1] - H[i]) * sc, nyv = -(H[i + W1] - H[i]) * sc, nz = 1;
      const l = 1 / Math.hypot(nxv, nyv, nz); nxv *= l; nyv *= l; nz *= l;
      const diff = Math.max(0, nxv * lx + nyv * ly + nz * lz);
      const spec = Math.pow(Math.max(0, nxv * hx + nyv * hy + nz * hz), 28);
      const px = x / bw * asp, py = y / bh;
      const along = (px - bx0) * Dx + (py - by0) * Dy, dist = Math.abs((px - bx0) * Dy - (py - by0) * Dx);
      const beam = Math.pow(Math.max(0, 1 - dist / beamW), 1.5) * reveal * U.clamp(1.3 - along * 0.4);
      const ao = 0.35 + 0.65 * U.clamp(H[i] * 1.4);
      const lit = (diff * 1.35 * beam + 0.05 * reveal + 0.01) * ao, sp = spec * beam * 230;
      const o = (y * bw + x) * 4, b = (y * bw + x) * 3;
      d[o] = base[b] * lit + sp; d[o + 1] = base[b + 1] * lit + sp * 0.8; d[o + 2] = base[b + 2] * lit + sp * 0.6; d[o + 3] = 255;
    }
    S.lg.putImageData(S.img, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(S.low, 0, 0, w, h);
    g.globalCompositeOperation = 'multiply'; g.drawImage(S.crack, 0, 0, w, h);
    g.globalCompositeOperation = 'lighter';
    // Dust drifting through the shaft of light.
    for (const m of S.motes) {
      m.y += 0.0004 * (0.5 + m.z); m.x += 0.0002 * N.n2(m.y * 4, m.z * 9);
      if (m.y > 1) { m.y = 0; m.x = S.rnd(); }
      const px = m.x * asp, dist = Math.abs((px - bx0) * Dy - (m.y - by0) * Dx), a = Math.max(0, 1 - dist / (beamW * 0.6)) * reveal * 0.7;
      if (a > 0.02) { g.fillStyle = `rgba(255,225,180,${a})`; g.fillRect(m.x * w, m.y * h, (1 + m.z * 1.5) * u, (1 + m.z * 1.5) * u); }
    }
    g.globalCompositeOperation = 'source-over';
  },
});

/* ───────────────────────── VII. Impressionism ───────────────────────── */
const BOATS = [[0.36, 0.78, 0.05, 0.011, [32, 46, 66]], [0.22, 0.69, 0.04, 0.009, [48, 62, 82]], [0.5, 0.64, 0.026, 0.006, [72, 86, 104]]];
const MASTS = [0.06, 0.09, 0.13, 0.69, 0.73, 0.77, 0.85, 0.89, 0.93];
function sunriseColor(S, nx, ny, t, out) {
  const N = S.N, asp = S.w / S.h, hz = 0.56;
  let c;
  if (ny < hz) {
    const k = ny / hz;
    c = U.mix([112, 130, 152], [208, 176, 160], k * k);
    const ds = Math.hypot((nx - 0.62) * asp, ny - 0.3);
    c = U.mix(c, [236, 150, 92], Math.exp(-ds * ds * 22) * 0.7);
    c = U.mix(c, [150, 152, 168], 0.28 * (N.fbm2(nx * 3, ny * 8 + t * 0.02, 3) * 0.5 + 0.5));
    if (ny > 0.38) {
      const sky = 0.5 - 0.035 * (0.5 + 0.5 * N.n2(nx * 6, 1)) - (nx < 0.18 || nx > 0.66 ? 0.05 : 0);
      if (ny > sky) c = U.mix(c, [98, 110, 128], 0.7);
      for (const mx of MASTS) if (Math.abs(nx - mx) < 0.0022 && ny > 0.36) c = U.mix(c, [80, 92, 112], 0.85);
    }
    if (ds < 0.03) c = [246, 92, 32];
  } else {
    const k = (ny - hz) / (1 - hz);
    c = U.mix([98, 122, 132], [40, 74, 96], k);
    if (N.n2(nx * 4, ny * 40 + t * 0.3) > 0.3) c = U.mix(c, [132, 152, 152], 0.3);
    const wd = 0.02 + 0.06 * k, dx = Math.abs(nx - 0.62);
    if (dx < wd) {
      const band = N.n2(nx * 10, ny * 60 - t * 0.6);
      if (band > -0.1) c = U.mix(c, [246, 112, 46], U.clamp((1 - dx / wd) * (band + 0.1) * 1.4));
    }
  }
  for (const [bx0, by, bw, bh, col] of BOATS) {
    const bx = bx0 + t * 0.0012, ex = (nx - bx) * asp / bw, ey = (ny - by) / bh;
    if (ex * ex + ey * ey < 1 || (Math.abs((nx - bx) * asp) < bw * 0.12 && ny < by && ny > by - bh * 5)) c = col;
  }
  out[0] = c[0]; out[1] = c[1]; out[2] = c[2];
}

SCENES.push({
  key: 'impression', dur: 32, handle: '@monet.1872',
  meta: { num: 'VII', eraZh: '1872 · 勒阿弗尔', eraEn: '1872 · Le Havre', zh: '印象·日出', en: 'Impression, Sunrise',
    qZh: '“我想画的，是包围着它们的空气。”', qEn: '“I want to paint the air that surrounds them.”', by: '克劳德·莫奈 · Claude Monet',
    lZh: '美，不再是永恒，而是此刻的光。', lEn: 'Beauty is no longer the eternal — it is the light of this very moment.' },
  swatch: [[112, 130, 152], [246, 112, 46], [40, 74, 96], [208, 176, 160]],
  audio: { root: 77.78, chord: [0, 4, 7, 11, 14], wave: 'sine', cutoff: 1200, level: 0.08, noise: 0.01, noiseFreq: 1400,
    notes: { scale: [0, 2, 4, 6, 8, 10], oct: [2, 3], rate: 0.85, wave: 'sine', decay: 3, gain: 0.07, harm: 4.02, wet: 0.85 } },
  init(S) { S.g.fillStyle = 'rgb(126,134,146)'; S.g.fillRect(0, 0, S.w, S.h); S.col = [0, 0, 0]; },
  frame(S, t, dt) {
    const { g, w, h, u, N, rnd } = S, n = Math.min(1200, Math.round(36000 * dt)), prog = U.clamp(t / 26);
    const L = (30 - 21 * prog) * u, c = S.col;
    g.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      let nx = rnd(), ny = rnd();
      if (rnd() < 0.28) { nx = 0.62 + (rnd() - 0.5) * 0.18; ny = 0.5 + rnd() * 0.5; }
      sunriseColor(S, nx, ny, t, c);
      const j = (rnd() - 0.5) * 36;
      let r = c[0] + j + (rnd() - 0.5) * 14, gg = c[1] + j + (rnd() - 0.5) * 14, b = c[2] + j + (rnd() - 0.5) * 14;
      if (rnd() < 0.04) { if (ny > 0.56) { r += 60; gg += 10; b -= 30; } else { r -= 30; b += 40; } }
      const water = ny > 0.56, a = water ? (rnd() - 0.5) * 0.25 : -0.35 + N.n2(nx * 3, ny * 3) * 0.5;
      const len = L * (0.6 + rnd() * 0.8) * (water ? 1.4 : 1), x = nx * w, y = ny * h, ca = Math.cos(a) * len / 2, sa = Math.sin(a) * len / 2;
      g.strokeStyle = `rgba(${r | 0},${gg | 0},${b | 0},0.72)`; g.lineWidth = L * 0.38 * (0.7 + rnd() * 0.6);
      g.beginPath(); g.moveTo(x - ca, y - sa); g.lineTo(x + ca, y + sa); g.stroke();
    }
  },
});

/* ───────────────────────── VIII. The Starry Night ───────────────────────── */
const VORT = [{ x: 0.42, y: 0.32, s: 1.5, r: 0.13 }, { x: 0.58, y: 0.4, s: -1.2, r: 0.1 }];
const STARS = [[0.1, 0.14], [0.25, 0.1], [0.62, 0.12], [0.74, 0.3], [0.93, 0.38], [0.3, 0.52], [0.06, 0.4]];
const MOON = [0.87, 0.16];
const hillY = nx => 0.7 + 0.04 * Math.sin(nx * 5 + 1) + 0.02 * Math.sin(nx * 13);
function inCypress(nx, ny) {
  if (ny < 0.05) return false;
  const c = 0.17 + 0.015 * Math.sin(ny * 25), hw = 0.075 * Math.pow((ny - 0.05) / 0.95, 0.7);
  return Math.abs(nx - c) < hw;
}
// Village drawn into a small colour-coded mask: red = walls and roofs, green = lit windows.
let VILLAGE = null;
function villageMask() {
  const W = 400, H = 225, c = U.canvas(W, H), g = c.getContext('2d'), rnd = U.mulberry32(77);
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  for (let k = 0; k < 46; k++) {
    const nx = 0.3 + rnd() * 0.62, base = (hillY(nx) + 0.1 + rnd() * 0.12) * H, x = nx * W, bw = (5 + rnd() * 9), bh = (4 + rnd() * 6);
    g.fillStyle = '#f00'; g.fillRect(x, base - bh, bw, bh);
    g.beginPath(); g.moveTo(x - 1, base - bh); g.lineTo(x + bw / 2, base - bh - 3 - rnd() * 3); g.lineTo(x + bw + 1, base - bh); g.fill();
    if (rnd() < 0.7) { g.fillStyle = '#0f0'; g.fillRect(x + 1.5 + rnd() * (bw - 4), base - bh + 1.5, 2, 2); }
  }
  const cx = 0.56 * W, cb = (hillY(0.56) + 0.17) * H;
  g.fillStyle = '#f00'; g.fillRect(cx - 5, cb - 16, 10, 16);
  g.beginPath(); g.moveTo(cx - 3, cb - 16); g.lineTo(cx, cb - 46); g.lineTo(cx + 3, cb - 16); g.fill();
  const d = g.getImageData(0, 0, W, H).data;
  VILLAGE = (nx, ny) => { const o = ((Math.min(H - 1, ny * H | 0)) * W + Math.min(W - 1, nx * W | 0)) * 4; return d[o + 1] > 128 ? 'win' : d[o] > 128 ? 'vil' : ''; };
}
function starryRegion(nx, ny, asp) {
  if (inCypress(nx, ny)) return 'cy';
  const hy = hillY(nx);
  if (ny > hy) return VILLAGE(nx, ny) || 'hill';
  if (Math.hypot((nx - MOON[0]) * asp, ny - MOON[1]) < 0.065) return 'moon';
  for (const s of STARS) if (Math.hypot((nx - s[0]) * asp, ny - s[1]) < 0.045) return 'star';
  return 'sky';
}
const PAL_SKY = [[24, 44, 108], [40, 78, 158], [78, 118, 188], [140, 170, 210], [208, 220, 200]];

SCENES.push({
  key: 'starry', dur: 34, handle: '@vincent',
  meta: { num: 'VIII', eraZh: '1889 · 圣雷米', eraEn: '1889 · Saint-Rémy-de-Provence', zh: '星月夜', en: 'The Starry Night',
    qZh: '“我对任何事都没有把握，但星星的景象让我做梦。”', qEn: '“I know nothing with any certainty, but the sight of the stars makes me dream.”', by: '梵高致提奥的信，1888 · Vincent van Gogh, letter to Theo, 1888',
    lZh: '美，从眼睛转向内心——世界开始随着情感旋转。', lEn: 'Beauty turns inward; the world begins to spin with feeling.' },
  swatch: [[24, 44, 108], [240, 210, 80], [78, 118, 188], [20, 40, 30]],
  audio: { root: 61.74, chord: [0, 7, 12, 16, 19], wave: 'triangle', cutoff: 900, level: 0.08,
    notes: { scale: [0, 4, 7, 11, 14], oct: [2, 3], rate: 0.21, wave: 'sine', decay: 1.6, gain: 0.05, pattern: 'arp', wet: 0.75 } },
  init(S) {
    const { w, h } = S;
    if (!VILLAGE) villageMask();
    S.paint = S.layer();
    S.paint.g.fillStyle = 'rgb(16,26,62)'; S.paint.g.fillRect(0, 0, w, h);
    S.P = Array.from({ length: 1500 }, () => ({ x: 0, y: 0, life: 0, reg: '', col: '' }));
  },
  spawn(S, p) {
    const asp = S.w / S.h, rnd = S.rnd;
    let nx = rnd(), ny = rnd();
    if (rnd() < 0.5) ny *= 0.72;
    else if (rnd() < 0.3) { nx = 0.3 + rnd() * 0.62; ny = hillY(nx) + 0.05 + rnd() * 0.25; }
    const reg = starryRegion(nx, ny, asp), n = S.N.n2(nx * 5, ny * 5);
    let c;
    if (reg === 'sky') c = PAL_SKY[Math.min(4, Math.floor(Math.pow(n * 0.5 + 0.5, 1.4) * 5))];
    else if (reg === 'star') c = [[240, 212, 80], [252, 242, 175], [222, 192, 62], [170, 200, 220]][Math.floor(rnd() * 4)];
    else if (reg === 'moon') c = [[250, 200, 60], [252, 230, 120], [240, 170, 40]][Math.floor(rnd() * 3)];
    else if (reg === 'cy') c = [[14, 28, 24], [30, 50, 36], [58, 70, 40], [20, 34, 50]][Math.floor(rnd() * 4)];
    else if (reg === 'hill') c = [[20, 40, 80], [32, 60, 100], [52, 82, 110], [40, 70, 70]][Math.floor(rnd() * 4)];
    else if (reg === 'win') c = [[250, 215, 80], [255, 236, 140]][Math.floor(rnd() * 2)];
    else c = [[18, 30, 60], [34, 54, 92], [62, 74, 96], [20, 26, 40]][Math.floor(rnd() * 4)];
    const j = (rnd() - 0.5) * 20;
    p.x = nx * S.w; p.y = ny * S.h; p.reg = reg; p.life = 25 + rnd() * 50;
    p.col = `rgba(${(c[0] + j) | 0},${(c[1] + j) | 0},${(c[2] + j) | 0},0.85)`;
  },
  frame(S, t, dt) {
    const { g, w, h, u, N } = S, pg = S.paint.g, asp = w / h, step = 2.4 * u * Math.min(2, dt * 60);
    pg.lineCap = 'round';
    for (const p of S.P) {
      if (p.life <= 0) this.spawn(S, p);
      const nx = p.x / w, ny = p.y / h;
      let vx = 0.6, vy = 0;
      if (p.reg === 'cy') { vx = 0.25 * Math.sin(ny * 30 + t); vy = -1; }
      else if (p.reg === 'vil' || p.reg === 'win') { const a = S.N.n2(p.x * 0.05 / u, p.y * 0.05 / u) * 3; vx = Math.cos(a); vy = Math.sin(a); }
      else if (p.reg === 'hill') { vx = 1; vy = (hillY(nx + 0.01) - hillY(nx)) * 100 * 0.4; }
      else {
        for (const v of VORT) {
          const dx = (nx - v.x) * asp, dy = ny - v.y, d = Math.hypot(dx, dy) + 1e-4, f = v.s * Math.exp(-(d / v.r) * (d / v.r)) * 3;
          vx += -dy / d * f; vy += dx / d * f;
        }
        for (const s of [...STARS, MOON]) {
          const dx = (nx - s[0]) * asp, dy = ny - s[1], d = Math.hypot(dx, dy) + 1e-4, f = Math.exp(-(d / 0.06) * (d / 0.06)) * 2.5;
          vx += -dy / d * f; vy += dx / d * f;
        }
        const a = N.n3(nx * 3, ny * 3, t * 0.05) * Math.PI;
        vx += 0.35 * Math.cos(a); vy += 0.35 * Math.sin(a);
      }
      const vl = Math.hypot(vx, vy) + 1e-6, x2 = p.x + vx / vl * step, y2 = p.y + vy / vl * step;
      pg.lineWidth = (p.reg === 'vil' || p.reg === 'win' ? 2 : 3.4) * u;
      pg.strokeStyle = p.col; pg.beginPath(); pg.moveTo(p.x, p.y); pg.lineTo(x2, y2); pg.stroke();
      p.x = x2; p.y = y2; p.life--;
      if (x2 < 0 || x2 > w || y2 < 0 || y2 > h || starryRegion(x2 / w, y2 / h, asp) !== p.reg) p.life = 0;
    }
    g.globalCompositeOperation = 'source-over';
    g.drawImage(S.paint.c, 0, 0);
    g.globalCompositeOperation = 'lighter';
    const k = U.smooth(4, 12, t);
    for (const s of [...STARS, MOON]) {
      const sx = s[0] * w, sy = s[1] * h, r = (s === MOON ? 90 : 55) * u * (0.9 + 0.1 * Math.sin(t * 2 + s[0] * 20));
      const gr = g.createRadialGradient(sx, sy, 0, sx, sy, r);
      gr.addColorStop(0, `rgba(255,250,215,${0.75 * k})`); gr.addColorStop(0.18, `rgba(255,235,150,${0.35 * k})`); gr.addColorStop(1, 'rgba(255,220,120,0)');
      g.fillStyle = gr; g.fillRect(sx - r, sy - r, r * 2, r * 2);
    }
    g.globalCompositeOperation = 'source-over';
  },
});

/* ───────────────────────── IX. Cubism ───────────────────────── */
function cubistSubject(S, v) {
  const { w, h, u } = S, c = U.canvas(w, h), g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, v ? 'rgb(150,136,108)' : 'rgb(170,150,112)'); bg.addColorStop(1, 'rgb(112,92,66)');
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  const line = (lw = 2.4) => { g.strokeStyle = 'rgba(30,22,16,0.85)'; g.lineWidth = lw * u; g.stroke(); };
  g.fillStyle = 'rgb(128,100,68)'; g.beginPath();
  if (!v) { g.moveTo(0.06 * w, 0.72 * h); g.lineTo(0.94 * w, 0.66 * h); g.lineTo(w, h); g.lineTo(0, h); }
  else { g.moveTo(0, 0.6 * h); g.lineTo(w, 0.76 * h); g.lineTo(w, h); g.lineTo(0, h); }
  g.closePath(); g.fill(); line();
  // Guitar.
  g.save();
  if (v) { g.translate(0.55 * w, 0.5 * h); g.rotate(-Math.PI / 2 + 0.2); g.translate(-0.47 * w, -0.45 * h); }
  const gx = 0.47 * w, gb = g.createLinearGradient(gx - 0.16 * h, 0, gx + 0.16 * h, 0);
  gb.addColorStop(0, 'rgb(212,172,104)'); gb.addColorStop(1, 'rgb(146,106,58)');
  g.fillStyle = gb; g.beginPath(); g.arc(gx, 0.62 * h, 0.15 * h, 0, 7); g.arc(gx, 0.42 * h, 0.115 * h, 0, 7); g.fill();
  g.beginPath(); g.arc(gx, 0.62 * h, 0.15 * h, 0, 7); line(); g.beginPath(); g.arc(gx, 0.42 * h, 0.115 * h, 0, 7); line();
  g.fillStyle = 'rgb(92,68,44)'; g.fillRect(gx - 0.025 * h, 0.06 * h, 0.05 * h, 0.28 * h);
  g.fillStyle = 'rgb(36,26,18)'; g.beginPath(); g.arc(gx, 0.52 * h, 0.05 * h, 0, 7); g.fill();
  g.strokeStyle = 'rgba(236,226,200,0.7)'; g.lineWidth = 1 * u;
  for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(gx + k * 0.007 * h, 0.07 * h); g.lineTo(gx + k * 0.009 * h, 0.7 * h); g.stroke(); }
  g.restore();
  // Bottle.
  g.fillStyle = 'rgb(98,110,88)';
  if (!v) {
    g.beginPath(); g.moveTo(0.7 * w - 0.045 * h, 0.75 * h); g.lineTo(0.7 * w - 0.045 * h, 0.4 * h); g.lineTo(0.7 * w - 0.018 * h, 0.32 * h);
    g.lineTo(0.7 * w - 0.018 * h, 0.2 * h); g.lineTo(0.7 * w + 0.018 * h, 0.2 * h); g.lineTo(0.7 * w + 0.018 * h, 0.32 * h);
    g.lineTo(0.7 * w + 0.045 * h, 0.4 * h); g.lineTo(0.7 * w + 0.045 * h, 0.75 * h); g.closePath(); g.fill(); line();
    g.fillStyle = 'rgba(220,220,190,0.55)'; g.fillRect(0.7 * w - 0.03 * h, 0.42 * h, 0.012 * h, 0.3 * h);
  } else {
    g.beginPath(); g.arc(0.72 * w, 0.55 * h, 0.065 * h, 0, 7); g.fill(); line();
    g.fillStyle = 'rgb(60,70,56)'; g.beginPath(); g.arc(0.72 * w, 0.55 * h, 0.025 * h, 0, 7); g.fill(); line();
  }
  // Face — profile in one view, frontal in the other.
  g.fillStyle = 'rgb(178,162,134)';
  if (!v) {
    g.beginPath();
    U.PROFILE.forEach((p, i) => { const x = 0.08 * w + p[0] * 0.24 * w, y = 0.1 * h + p[1] * 0.52 * h; i ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.closePath(); g.fill(); line();
    g.fillStyle = 'rgb(30,22,16)'; g.beginPath(); g.ellipse(0.08 * w + 0.66 * 0.24 * w, 0.1 * h + 0.37 * 0.52 * h, 0.012 * h, 0.006 * h, 0, 0, 7); g.fill();
  } else {
    g.beginPath(); g.ellipse(0.2 * w, 0.34 * h, 0.09 * h, 0.13 * h, 0, 0, 7); g.fill(); line();
    g.fillStyle = 'rgb(30,22,16)';
    for (const s of [-1, 1]) { g.beginPath(); g.ellipse(0.2 * w + s * 0.035 * h, 0.31 * h, 0.016 * h, 0.008 * h, 0, 0, 7); g.fill(); }
    g.beginPath(); g.moveTo(0.2 * w, 0.32 * h); g.lineTo(0.192 * w, 0.38 * h); g.lineTo(0.2 * w + 0.01 * h, 0.385 * h); line(2);
    g.beginPath(); g.moveTo(0.2 * w - 0.03 * h, 0.42 * h); g.quadraticCurveTo(0.2 * w, 0.435 * h, 0.2 * w + 0.03 * h, 0.42 * h); line(2);
  }
  // Newspaper and score.
  g.save(); g.translate(0.58 * w, 0.78 * h); g.rotate(v ? 0.12 : -0.05);
  g.fillStyle = 'rgb(224,212,184)'; g.fillRect(0, 0, 0.2 * w, 0.12 * h);
  g.fillStyle = 'rgb(34,26,20)'; g.font = `bold ${0.065 * h}px Georgia,serif`; g.fillText('JOU', 0.01 * w, 0.07 * h);
  g.fillStyle = 'rgba(34,26,20,0.5)';
  for (let k = 0; k < 4; k++) g.fillRect(0.01 * w, 0.085 * h + k * 0.008 * h, 0.17 * w, 0.003 * h);
  g.restore();
  g.strokeStyle = 'rgba(34,26,20,0.7)'; g.lineWidth = 1.2 * u;
  for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(0.1 * w, 0.8 * h + k * 0.012 * h); g.lineTo(0.3 * w, 0.78 * h + k * 0.012 * h); g.stroke(); }
  return c;
}

SCENES.push({
  key: 'cubism', dur: 30, handle: '@picasso',
  meta: { num: 'IX', eraZh: '1907 — 1914 · 巴黎', eraEn: '1907 – 1914 · Paris', zh: '同时性', en: 'Simultaneity',
    qZh: '“我画我所想到的物体，而不是我所看到的。”', qEn: '“I paint objects as I think them, not as I see them.”', by: '巴勃罗·毕加索 · Pablo Picasso',
    lZh: '一个视点，已不足以容纳现代。', lEn: 'A single point of view can no longer hold the modern world.' },
  swatch: [[170, 150, 112], [112, 92, 66], [98, 110, 88], [224, 212, 184]],
  audio: { root: 69.3, chord: [0, 1, 6, 11], wave: 'triangle', cutoff: 700, level: 0.06,
    notes: { scale: [0, 1, 4, 6, 7, 10], oct: [2, 3], rate: 0.36, wave: 'square', decay: 0.28, gain: 0.035, cutoff: 1800, wet: 0.35 } },
  init(S) {
    const { w, h, u, rnd } = S;
    S.views = [cubistSubject(S, 0), cubistSubject(S, 1)];
    const cols = Math.max(6, Math.round(10 * w / h / 1.78)), rows = 6, cw = w / cols, ch = h / rows, pts = [];
    for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) {
      const edgeX = i === 0 || i === cols, edgeY = j === 0 || j === rows;
      pts.push([i * cw + (edgeX ? 0 : (rnd() - 0.5) * cw * 0.7), j * ch + (edgeY ? 0 : (rnd() - 0.5) * ch * 0.7)]);
    }
    const P = (i, j) => pts[j * (cols + 1) + i];
    S.facets = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1);
      for (const tri of rnd() < 0.5 ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]]) {
        const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3, cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
        const xs = tri.map(p => p[0]), ys = tri.map(p => p[1]);
        S.facets.push({ tri, cx, cy, bx: Math.min(...xs), by: Math.min(...ys), bw: Math.max(...xs) - Math.min(...xs), bh: Math.max(...ys) - Math.min(...ys),
          ph: rnd() * 6.28, amp: 0.4 + rnd() * 0.9, base: rnd() < 0.3 ? 1 : 0, ang: rnd() * 6.28, hatch: rnd() < 0.3, dir: rnd() < 0.5 ? 1 : -1 });
      }
    }
    S.cell = Math.min(cw, ch);
    const hc = U.canvas(32 * u, 32 * u), hg = hc.getContext('2d');
    hg.strokeStyle = 'rgba(30,22,14,0.8)'; hg.lineWidth = 1.2 * u;
    for (let k = 0; k < 5; k++) { hg.beginPath(); hg.moveTo(k * 7 * u, 26 * u); hg.lineTo(k * 7 * u + 10 * u, 6 * u); hg.stroke(); }
    S.hatch = S.g.createPattern(hc, 'repeat');
  },
  frame(S, t) {
    const { g, w, h, u } = S;
    g.globalCompositeOperation = 'source-over'; g.fillStyle = 'rgb(120,100,72)'; g.fillRect(0, 0, w, h);
    const frag = 0.2 + 0.8 * (0.5 - 0.5 * Math.cos(t * 2 * Math.PI / 15));
    for (const f of S.facets) {
      const view = Math.sin(t * 0.35 + f.ph * 5) > 0.55 ? 1 - f.base : f.base;
      const s = 1 + 0.08 * Math.sin(t * 0.4 + f.ph) * f.amp * frag;
      const dx = Math.sin(t * 0.3 + f.ph) * f.amp * S.cell * 0.22 * frag, dy = Math.cos(t * 0.27 + f.ph * 1.3) * f.amp * S.cell * 0.22 * frag;
      g.save(); g.beginPath(); g.moveTo(f.tri[0][0], f.tri[0][1]); g.lineTo(f.tri[1][0], f.tri[1][1]); g.lineTo(f.tri[2][0], f.tri[2][1]); g.closePath(); g.clip();
      const pad = 4 * u, bx = f.bx - pad, by = f.by - pad, bw = f.bw + 2 * pad, bh = f.bh + 2 * pad;
      const sx = f.cx + (bx - f.cx - dx) / s, sy = f.cy + (by - f.cy - dy) / s;
      g.drawImage(S.views[view], sx, sy, bw / s, bh / s, bx, by, bw, bh);
      const r = Math.max(f.bw, f.bh), ca = Math.cos(f.ang + t * 0.05 * f.dir) * r, sa = Math.sin(f.ang + t * 0.05 * f.dir) * r;
      const lg = g.createLinearGradient(f.cx - ca, f.cy - sa, f.cx + ca, f.cy + sa);
      lg.addColorStop(0, 'rgba(255,242,214,0.28)'); lg.addColorStop(1, 'rgba(26,18,10,0.38)');
      g.fillStyle = lg; g.fill();
      if (f.hatch) { g.globalAlpha = 0.18; g.fillStyle = S.hatch; g.fill(); g.globalAlpha = 1; }
      g.restore();
    }
    g.lineJoin = 'round';
    for (const f of S.facets) {
      g.beginPath(); g.moveTo(f.tri[0][0], f.tri[0][1]); g.lineTo(f.tri[1][0], f.tri[1][1]);
      g.strokeStyle = 'rgba(36,26,18,0.55)'; g.lineWidth = 1.6 * u; g.stroke();
      g.beginPath(); g.moveTo(f.tri[1][0] + 1.5 * u, f.tri[1][1] + 1.5 * u); g.lineTo(f.tri[2][0] + 1.5 * u, f.tri[2][1] + 1.5 * u);
      g.strokeStyle = 'rgba(240,228,200,0.25)'; g.lineWidth = 1.2 * u; g.stroke();
    }
  },
});

/* ───────────────────────── X. Abstraction: Kandinsky → Mondrian ───────────────────────── */
const KC = { Y: [242, 196, 48], B: [36, 64, 150], R: [205, 45, 40], K: [22, 22, 26], P: [222, 120, 150], V: [110, 70, 150], T: [60, 160, 170], O: [235, 120, 40], W: [245, 240, 228] };
function kElem(g, e, u) {
  const r = e.r;
  switch (e.type) {
    case 'rings': e.cols.forEach((c, k) => { g.fillStyle = U.rgb(c); g.beginPath(); g.arc(0, 0, r * (1 - k / e.cols.length), 0, 7); g.fill(); }); break;
    case 'halo': {
      const gr = g.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 1.5);
      gr.addColorStop(0, 'rgba(20,20,26,0.9)'); gr.addColorStop(1, 'rgba(20,20,26,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 1.5, 0, 7); g.fill();
      g.fillStyle = U.rgb(e.cols[0]); g.beginPath(); g.arc(0, 0, r * 0.85, 0, 7); g.fill(); break;
    }
    case 'line': g.strokeStyle = U.rgb(KC.K); g.lineWidth = e.lw * u; g.lineCap = 'butt'; g.beginPath(); g.moveTo(-r, 0); g.lineTo(r, 0); g.stroke(); break;
    case 'lines': g.strokeStyle = U.rgb(KC.K); g.lineWidth = 1.5 * u; for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(-r, k * 7 * u); g.lineTo(r, k * 7 * u + k * 4 * u); g.stroke(); } break;
    case 'tri': g.fillStyle = U.rgb(e.cols[0]); g.beginPath(); g.moveTo(0, -r); g.lineTo(r * 0.8, r * 0.6); g.lineTo(-r * 0.8, r * 0.6); g.closePath(); g.fill(); break;
    case 'arc': g.strokeStyle = U.rgb(e.cols[0]); g.lineWidth = e.lw * u; g.lineCap = 'round'; g.beginPath(); g.arc(0, 0, r, -2.4, -0.4); g.stroke(); break;
    case 'check': { const s = r / 2; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? U.rgb(KC.K) : U.rgb(e.cols[0]); g.fillRect(-r + i * s, -r + j * s, s, s); } break; }
    case 'semi': g.fillStyle = U.rgb(e.cols[0]); g.beginPath(); g.arc(0, 0, r, Math.PI, 0); g.closePath(); g.fill(); break;
  }
}
function bsp(x, y, w, h, depth, rnd, lines, rects, minS) {
  if (depth === 0 || (w < minS * 2 && h < minS * 2) || (depth < 3 && rnd() < 0.3)) { rects.push({ x, y, w, h }); return; }
  if (w > h * 0.9 ? w > minS * 2 : h < minS * 2) {
    const s = x + w * (0.28 + rnd() * 0.44);
    lines.push({ x0: s, y0: y, x1: s, y1: y + h });
    bsp(x, y, s - x, h, depth - 1, rnd, lines, rects, minS); bsp(s, y, x + w - s, h, depth - 1, rnd, lines, rects, minS);
  } else {
    const s = y + h * (0.28 + rnd() * 0.44);
    lines.push({ x0: x, y0: s, x1: x + w, y1: s });
    bsp(x, y, w, s - y, depth - 1, rnd, lines, rects, minS); bsp(x, s, w, y + h - s, depth - 1, rnd, lines, rects, minS);
  }
}

SCENES.push({
  key: 'abstraction', dur: 36, ink: 'dark', zoom: 0.015, handle: '@kandinsky',
  meta: { num: 'X', eraZh: '1911 — 1930 · 慕尼黑 · 巴黎 · 阿姆斯特丹', eraEn: '1911 – 1930 · Munich · Paris · Amsterdam', zh: '内在的声音', en: 'The Inner Sound',
    qZh: '“色彩是琴键，眼睛是音锤，心灵是绷满琴弦的钢琴。”', qEn: '“Colour is the keyboard, the eyes are the hammers, the soul is the piano with many strings.”', by: '瓦西里·康定斯基《论艺术的精神》 · Wassily Kandinsky, 1911',
    lZh: '艺术告别了模仿，开始直接与灵魂对话。', lEn: 'Art stopped imitating the world and began speaking directly to the soul.' },
  swatch: [[242, 196, 48], [36, 64, 150], [205, 45, 40], [245, 242, 236]],
  audio: { root: 65.41, chord: [0, 7, 14], wave: 'sine', cutoff: 900, level: 0.07 },
  init(S) {
    const { w, h, u, rnd } = S;
    const types = ['rings', 'rings', 'halo', 'line', 'line', 'lines', 'tri', 'tri', 'arc', 'check', 'semi', 'rings'];
    const pal = Object.values(KC).filter(c => c !== KC.K && c !== KC.W);
    const pick = () => pal[Math.floor(rnd() * pal.length)];
    S.els = [];
    for (let i = 0; i < 34; i++) {
      const type = i === 0 ? 'halo' : types[Math.floor(rnd() * types.length)];
      const r = (i === 0 ? 150 : type === 'line' ? 120 + rnd() * 260 : 20 + rnd() * 70) * u;
      const cols = Array.from({ length: 2 + Math.floor(rnd() * 3) }, pick);
      if (i === 0) cols[0] = KC.B;
      S.els.push({ type, r, cols, lw: 3 + rnd() * 10, x: (0.1 + rnd() * 0.8) * w, y: (0.12 + rnd() * 0.7) * h, rot: rnd() * 6.28, ph: rnd() * 6.28, t0: 0.4 + i * 0.45, sounded: false });
    }
    S.els[0].x = w * 0.62; S.els[0].y = h * 0.4;
    const lines = [], rects = [];
    bsp(0, 0, w, h, 5, rnd, lines, rects, h * 0.12);
    S.lines = lines.map((l, i) => ({ ...l, t0: 17.5 + i * 0.42, sounded: false }));
    rects.sort((a, b) => b.w * b.h - a.w * a.h);
    const fills = [[1, KC.R], [3, KC.B], [5, KC.Y], [Math.min(8, rects.length - 1), KC.Y], [Math.min(10, rects.length - 1), KC.K]];
    S.fills = fills.filter(([i]) => rects[i]).map(([i, c], k) => ({ ...rects[i], c, t0: 25 + k * 0.6 }));
    S.boogie = [];
    S.lines.forEach((l, i) => { for (let k = 0; k < 3; k++) S.boogie.push({ l, p: rnd(), v: (0.04 + rnd() * 0.08) * (rnd() < 0.5 ? -1 : 1), c: [KC.Y, KC.R, KC.B, [190, 190, 190]][(i + k) % 4] }); });
  },
  frame(S, t) {
    const { g, w, h, u } = S;
    const m = U.smooth(15, 19, t);
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = U.rgb(U.mix([238, 228, 206], [245, 243, 237], m)); g.fillRect(0, 0, w, h);
    const lw = 13 * u;
    // Mondrian: coloured planes, then the black grid.
    for (const f of S.fills) {
      const k = U.ease(U.smooth(f.t0, f.t0 + 0.8, t));
      if (k <= 0) continue;
      g.fillStyle = U.rgb(f.c); g.fillRect(f.x, f.y, f.w * k, f.h);
      if (!f.sounded) { f.sounded = true; AUDIO.note([0, 4, 7, 12, 16][S.fills.indexOf(f)], { oct: 3, wave: 'triangle', decay: 1.5, gain: 0.09, wet: 0.5 }); }
    }
    g.fillStyle = U.rgb(KC.K);
    for (const l of S.lines) {
      const k = U.ease(U.smooth(l.t0, l.t0 + 0.55, t));
      if (k <= 0) continue;
      if (!l.sounded) { l.sounded = true; AUDIO.note([0, 7, 12, 19][S.lines.indexOf(l) % 4], { oct: 2, wave: 'square', decay: 0.25, gain: 0.04, cutoff: 1200, wet: 0.3 }); }
      if (l.x0 === l.x1) g.fillRect(l.x0 - lw / 2, l.y0, lw, (l.y1 - l.y0) * k);
      else g.fillRect(l.x0, l.y0 - lw / 2, (l.x1 - l.x0) * k, lw);
    }
    if (t > 28) {
      const a = U.smooth(28, 30, t);
      for (const b of S.boogie) {
        b.p = (b.p + b.v * 0.016 + 1) % 1;
        const x = U.lerp(b.l.x0, b.l.x1, b.p), y = U.lerp(b.l.y0, b.l.y1, b.p);
        g.globalAlpha = a; g.fillStyle = U.rgb(b.c); g.fillRect(x - lw / 2, y - lw / 2, lw, lw);
      }
      g.globalAlpha = 1;
    }
    // Kandinsky: forms that sound as they appear, then drift away.
    const fade = 1 - U.smooth(15, 19.5, t);
    if (fade > 0) {
      for (const e of S.els) {
        if (t < e.t0) continue;
        if (!e.sounded) {
          e.sounded = true;
          const deg = { rings: [12, 'sine', 2.5], halo: [0, 'sine', 4], line: [-5, 'triangle', 1.2], lines: [2, 'triangle', 0.8], tri: [19, 'triangle', 0.7], arc: [9, 'sine', 1.8], check: [14, 'square', 0.4], semi: [4, 'sine', 2] }[e.type];
          AUDIO.note(deg[0] + [0, 2, 4, 7][Math.floor(S.rnd() * 4)], { oct: 3, wave: deg[1], decay: deg[2], gain: deg[1] === 'square' ? 0.03 : 0.08, wet: 0.7, cutoff: 3000 });
        }
        const k = U.smooth(e.t0, e.t0 + 0.7, t), sc = k < 1 ? 1 - Math.pow(1 - k, 3) * Math.cos(k * 9) : 1;
        g.save(); g.globalAlpha = fade * Math.min(1, k * 2);
        g.translate(e.x + Math.sin(t * 0.4 + e.ph) * 8 * u, e.y + Math.cos(t * 0.33 + e.ph) * 8 * u - (1 - fade) * 120 * u);
        g.rotate(e.rot + Math.sin(t * 0.2 + e.ph) * 0.1); g.scale(sc, sc);
        kElem(g, e, u); g.restore();
      }
    }
  },
});
