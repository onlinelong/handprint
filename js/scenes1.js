'use strict';
// Act I — from the first mark to the vanishing point.
const SCENES = [];
const ARCHIVE = {}; // chapter key -> {c: thumbnail canvas, handle}

const INK_FONT = '"STKaiti","Kaiti SC","KaiTi","Noto Serif SC",serif';

// One cave wall, shared: the epilogue returns to the very surface where the film began.
const ROCK = {};
function rockTexture(S) {
  const key = S.w + 'x' + S.h;
  if (ROCK[key]) return ROCK[key];
  const N = S.N;
  return ROCK[key] = U.texture(S.w, S.h, S.u, (X, Y, o) => {
    const wx = X + 70 * N.fbm2(X * 0.003, Y * 0.003, 3), wy = Y + 70 * N.fbm2(X * 0.003 + 11, Y * 0.003, 3);
    const n = N.fbm2(wx * 0.0032, wy * 0.0032, 5), r = N.fbm2(X * 0.03 + 5, Y * 0.03, 3);
    const ridge = Math.pow(1 - Math.abs(N.fbm2(wx * 0.005 + 9, wy * 0.005, 4)), 26);
    const calc = U.smooth(-0.1, 0.35, N.fbm2(wx * 0.0018 + 40, wy * 0.0018, 4));
    const pore = N.n2(X * 0.15, Y * 0.15) > 0.6 ? 0.06 : 0;
    const v = 0.7 + 0.24 * n + 0.07 * r - 0.14 * ridge - pore;
    const c = U.mix([166, 124, 90], [214, 198, 174], calc);
    o[0] = c[0] * v; o[1] = c[1] * v; o[2] = c[2] * v;
  }, 560);
}

// Spray pigment around a hand: the negative stencil of Sulawesi, Chauvet, Cueva de las Manos.
function sprayHand(S, g, H, mask, count, am = 1) {
  const cos = Math.cos(-H.rot), sin = Math.sin(-H.rot);
  g.fillStyle = U.rgb(H.col);
  for (let i = 0; i < count; i++) {
    const r = Math.abs(U.gauss(S.rnd)) * H.s * 1.05, a = S.rnd() * 6.2832;
    const dx = Math.cos(a) * r, dy = Math.sin(a) * r * 1.25 - 0.12 * H.s;
    const lx = ((dx * cos - dy * sin) / H.s) * H.flip, ly = (dx * sin + dy * cos) / H.s;
    if (mask.insideU(lx, ly)) continue;
    g.globalAlpha = Math.min(1, (0.06 + S.rnd() * 0.16) * am);
    const sz = (0.5 + S.rnd() * 1.7) * S.u;
    g.fillRect(H.x + dx, H.y + dy, sz, sz);
  }
  g.globalAlpha = 1;
}

/* ───────────────────────── Prologue ───────────────────────── */
SCENES.push({
  key: 'prologue', dur: 20, zoom: 0.05, name: { zh: '序', en: 'Prologue' },
  swatch: [[0, 0, 0], [255, 200, 140]],
  audio: { root: 55, chord: [0, 7, 12, 19], wave: 'sine', cutoff: 600, level: 0.11, noise: 0.018, noiseFreq: 300 },
  captions: [
    { slot: 'b', at: 2.8, to: 11.6, kind: 'hero', zh: '手印', en: 'HANDPRINT', subZh: '人类审美的四万年', subEn: 'Forty Thousand Years of Seeing' },
    { slot: 'b', at: 12.4, to: 18.6, kind: 'line', zh: '在第一幅画出现之前，只有黑暗——和凝视黑暗的眼睛。', en: 'Before the first image, there was only darkness — and an eye that looked into it.' },
  ],
  init(S) {
    S.m = [];
    for (let i = 0; i < 260; i++) S.m.push({ x: S.rnd() * S.w, y: S.rnd() * S.h, z: S.rnd(), p: S.rnd() * 6.28 });
  },
  frame(S, t, dt) {
    const { g, w, h, u, N } = S, k = U.smooth(0.5, 9, t), flare = U.smooth(14.5, 19.8, t);
    const cx = S.cx, cy = h * 0.6;
    g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const br = 0.86 + 0.09 * Math.sin(t * 1.1) + 0.05 * N.n2(t * 3, 0);
    const r = (30 + 300 * k + 900 * flare) * u * br;
    g.globalCompositeOperation = 'lighter';
    const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
    gr.addColorStop(0, `rgba(255,226,180,${0.85 * k})`);
    gr.addColorStop(0.12, `rgba(255,165,85,${0.32 * k})`);
    gr.addColorStop(0.5, `rgba(120,50,20,${0.12 * k})`);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const step = Math.min(2, dt * 60);
    for (const m of S.m) {
      m.x += N.n3(m.x * 0.0015 / u, m.y * 0.0015 / u, t * 0.1) * 0.5 * u * (1 + m.z) * step;
      m.y -= (0.1 + 0.35 * m.z) * u * step;
      if (m.y < -5) { m.y = h + 5; m.x = S.rnd() * w; }
      const d = Math.hypot(m.x - cx, m.y - cy) / (r * 1.6 + 1);
      const a = Math.max(0, 1 - d) * k * (0.3 + 0.7 * Math.pow(Math.sin(t * 1.5 + m.p), 2));
      if (a < 0.01) continue;
      const s = (0.8 + m.z * 2) * u;
      g.fillStyle = `rgba(255,${(190 + m.z * 40) | 0},150,${a})`; g.fillRect(m.x, m.y, s, s);
    }
    g.globalCompositeOperation = 'source-over';
  },
});

/* ───────────────────────── I. The Cave ───────────────────────── */
const HORSE = {
  back: [[0.05,0.30],[0.10,0.20],[0.13,0.12],[0.16,0.19],[0.22,0.16],[0.30,0.18],[0.40,0.22],[0.55,0.22],[0.70,0.21],[0.82,0.25],[0.88,0.32]],
  tail: [[0.88,0.30],[0.94,0.36],[0.97,0.46],[0.97,0.56]],
  belly: [[0.88,0.33],[0.85,0.42],[0.80,0.48],[0.70,0.52],[0.55,0.57],[0.40,0.56],[0.24,0.50],[0.20,0.42]],
  jaw: [[0.05,0.30],[0.05,0.33],[0.09,0.37],[0.15,0.36],[0.20,0.42]],
  mane: [[0.13,0.16],[0.20,0.13],[0.28,0.14],[0.35,0.18]],
  legs: [[[0.25,0.50],[0.235,0.62],[0.25,0.71]], [[0.31,0.54],[0.325,0.63],[0.30,0.71]], [[0.72,0.52],[0.745,0.62],[0.73,0.71]], [[0.80,0.48],[0.835,0.6],[0.815,0.70]]],
  body: [[0.05,0.30],[0.10,0.20],[0.15,0.17],[0.22,0.16],[0.30,0.18],[0.40,0.22],[0.55,0.22],[0.70,0.21],[0.82,0.25],[0.88,0.33],[0.85,0.42],
    [0.80,0.48],[0.70,0.52],[0.55,0.57],[0.40,0.56],[0.24,0.50],[0.20,0.42],[0.15,0.36],[0.09,0.37],[0.05,0.33]],
};

SCENES.push({
  key: 'cave', dur: 34, handle: '@lascaux.17000bce',
  meta: { num: 'I', eraZh: '约公元前四万年 — 前一万五千年 · 苏拉威西 · 肖维 · 拉斯科', eraEn: 'c. 40,000 – 15,000 BCE · Sulawesi · Chauvet · Lascaux',
    zh: '最初的印记', en: 'The First Mark',
    qZh: '“我在这里。”——不是一句话，而是一只按在岩壁上的手。', qEn: '“I was here.” — not a word, but a hand pressed against stone.', by: '',
    lZh: '美，始于确认存在。', lEn: 'Beauty begins as proof of existence.' },
  swatch: [[150, 52, 28], [60, 38, 28], [190, 140, 90], [30, 18, 12]],
  audio: { root: 55, chord: [0, 7, 10], wave: 'triangle', cutoff: 320, level: 0.13, noise: 0.03, noiseFreq: 400,
    notes: { scale: [0, 3, 5, 7, 10], oct: [2, 3], rate: 2.4, wave: 'sine', attack: 0.25, decay: 2.6, gain: 0.07, pattern: 'walk', glide: 0.985, wet: 0.8 },
    drum: { every: 2.4, gain: 0.32, freq: 90, decay: 0.7 } },
  init(S) {
    const { w, h, u } = S;
    S.rock = rockTexture(S);
    S.art = S.layer();
    S.mask = U.handMask();
    const pos = [[0.13, 0.30, -0.25], [0.25, 0.64, 0.15], [0.07, 0.74, -0.5], [0.89, 0.76, 0.35], [0.86, 0.22, 0.1], [0.36, 0.20, -0.1]];
    const cols = [[160, 52, 28], [128, 40, 22], [52, 32, 24], [170, 72, 32], [150, 48, 26], [62, 38, 28]];
    const times = [2.4, 4.9, 7.4, 22.5, 25, 27.5];
    S.hands = pos.map((p, i) => ({ x: p[0] * w, y: p[1] * h, rot: p[2], s: (50 + S.rnd() * 14) * u, col: cols[i], t0: times[i], dur: 2.6, flip: S.rnd() < 0.3 ? -1 : 1 }));
    const hw = Math.min(w * 0.5, h * 1.0), ox = w * 0.55 - hw * 0.45, oy = h * 0.2;
    const M = p => [ox + p[0] * hw, oy + p[1] * hw];
    const strokes = [HORSE.back, HORSE.jaw, HORSE.mane, HORSE.belly, HORSE.tail, ...HORSE.legs];
    const paths = strokes.map(s => U.resample(U.catmull(s.map(M), 12), 2 * u));
    const total = paths.reduce((a, p) => a + p.length, 0);
    S.pl = new U.Plotter(S.art.g);
    let t0 = 8.5;
    paths.forEach((p, i) => {
      const d = Math.max(0.6, 11 * p.length / total);
      const jit = p.map(([x, y], j) => [x + S.N.n2(j * 0.05, i) * 2.2 * u, y + S.N.n2(j * 0.05, i + 9) * 2.2 * u]);
      const wide = i === 2 ? 11 : 5.5;
      S.pl.add(p, t0, d, { color: 'rgb(26,17,12)', alpha: 0.55, width: wide * u });
      S.pl.add(jit, t0 + 0.08, d, { color: 'rgb(18,12,9)', alpha: 0.4, width: 2.4 * u });
      t0 += d * 0.92;
    });
    const body = U.catmull(HORSE.body.map(M), 8);
    S.bodyPath = new Path2D(); body.forEach(([x, y], i) => (i ? S.bodyPath.lineTo(x, y) : S.bodyPath.moveTo(x, y))); S.bodyPath.closePath();
    const xs = body.map(p => p[0]), ys = body.map(p => p[1]);
    S.bbox = { bx: Math.min(...xs), by: Math.min(...ys), bw: Math.max(...xs) - Math.min(...xs), bh: Math.max(...ys) - Math.min(...ys) };
    S.eye = M([0.11, 0.24]);
    S.dots = Array.from({ length: 7 }, (_, i) => ({ x: w * (0.62 + i * 0.035), y: h * 0.9 + Math.sin(i) * 4 * u, t: 28.5 + i * 0.35, done: false }));
    S.embers = [];
  },
  frame(S, t, dt) {
    const { g, w, h, u, N } = S, ag = S.art.g;
    const count = Math.min(2200, Math.round(60000 * dt));
    for (const H of S.hands) if (t >= H.t0 && t < H.t0 + H.dur) sprayHand(S, ag, H, S.mask, count);
    S.pl.update(t);
    if (t > 17.5 && t < 25) { // ochre dabbed into the rock, darker at the head and mane
      ag.save(); ag.clip(S.bodyPath);
      const { bx, by, bw, bh } = S.bbox;
      for (let k = 0; k < 26; k++) {
        const cx = bx + S.rnd() * bw, cy = by + S.rnd() * bh, head = U.smooth(0.32, 0.12, (cx - bx) / bw);
        const col = U.mix([178, 98, 46], [70, 38, 22], head * 0.85);
        ag.fillStyle = U.rgb(col);
        for (let m = 0; m < 26; m++) {
          ag.globalAlpha = 0.05 + S.rnd() * 0.08;
          const sz = (1 + S.rnd() * 3) * u;
          ag.fillRect(cx + U.gauss(S.rnd) * 22 * u, cy + U.gauss(S.rnd) * 22 * u, sz, sz);
        }
      }
      ag.restore();
      if (!S.eyeDone && t > 20) { ag.fillStyle = 'rgba(20,12,8,0.8)'; ag.beginPath(); ag.arc(S.eye[0], S.eye[1], 4 * u, 0, 7); ag.fill(); S.eyeDone = true; }
    }
    for (const d of S.dots) if (!d.done && t > d.t) {
      d.done = true;
      for (let k = 0; k < 14; k++) { ag.fillStyle = `rgba(150,44,24,${0.25 + S.rnd() * 0.3})`; ag.beginPath(); ag.arc(d.x + U.gauss(S.rnd) * 3 * u, d.y + U.gauss(S.rnd) * 3 * u, (3 + S.rnd() * 5) * u, 0, 7); ag.fill(); }
      AUDIO.note([0, 3, 7, 10, 12, 15, 19][S.dots.indexOf(d)], { oct: 3, wave: 'sine', decay: 1.6, gain: 0.05, wet: 0.8 });
    }

    g.globalCompositeOperation = 'source-over';
    g.drawImage(S.rock, 0, 0, w, h);
    g.globalCompositeOperation = 'multiply'; g.drawImage(S.art.c, 0, 0); g.globalCompositeOperation = 'source-over';
    // Torchlight: a breathing, wandering pool of warmth.
    const on = U.smooth(0, 4.5, t);
    const fl = 0.9 + 0.06 * N.n2(t * 4, 1) + 0.04 * N.n2(t * 11, 3);
    const tx = w * (0.5 + 0.14 * N.n2(t * 0.11, 7)), ty = h * (0.72 + 0.08 * N.n2(t * 0.1, 9));
    const R = Math.max(w, h) * 0.78 * fl * (0.2 + 0.8 * on);
    g.globalCompositeOperation = 'multiply';
    const gr = g.createRadialGradient(tx, ty, 0, tx, ty, R);
    gr.addColorStop(0, 'rgb(255,228,186)'); gr.addColorStop(0.35, 'rgb(225,150,92)');
    gr.addColorStop(0.72, 'rgb(64,32,18)'); gr.addColorStop(1, 'rgb(6,3,2)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighter';
    const gl = g.createRadialGradient(tx, ty, 0, tx, ty, R * 0.5);
    gl.addColorStop(0, `rgba(255,140,60,${0.1 * on * fl})`); gl.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gl; g.fillRect(0, 0, w, h);
    if (S.rnd() < 0.5 * on) S.embers.push({ x: tx + (S.rnd() - 0.5) * 60 * u, y: ty + 40 * u, v: (1 + S.rnd() * 2) * u, life: 1 });
    for (const e of S.embers) {
      e.y -= e.v * dt * 60; e.x += N.n2(e.y * 0.01 / u, e.v) * 1.2 * u; e.life -= dt * 0.35;
      if (e.life <= 0) continue;
      g.fillStyle = `rgba(255,${(150 + 80 * e.life) | 0},70,${e.life * 0.8})`; g.fillRect(e.x, e.y, 2 * u, 2 * u);
    }
    S.embers = S.embers.filter(e => e.life > 0);
    g.globalCompositeOperation = 'source-over';
  },
});

/* ───────────────────────── II. Classical Greece ───────────────────────── */
function meanderPts(x0, y0, width, gu, step) {
  const unit = 4 * gu, n = Math.floor(width / unit), xs = x0 + (width - n * unit) / 2, pts = [];
  const P = [[0, 4], [0, 0], [3, 0], [3, 2], [1, 2], [1, 4], [4, 4]];
  for (let i = 0; i < n; i++) for (const p of (i === 0 ? P : P.slice(1))) pts.push([xs + i * unit + p[0] * gu, y0 + p[1] * gu]);
  return { pts: U.resample(pts, step), x0: xs, x1: xs + n * unit };
}

SCENES.push({
  key: 'greek', dur: 32, ink: 'dark', handle: '@parthenon',
  meta: { num: 'II', eraZh: '公元前五世纪 · 雅典', eraEn: '5th century BCE · Athens', zh: '万物的尺度', en: 'The Measure of All Things',
    qZh: '“人是万物的尺度。”', qEn: '“Man is the measure of all things.”', by: '普罗泰戈拉 · Protagoras',
    lZh: '美，是比例，是秩序，是可以被计算的和谐。', lEn: 'Beauty as proportion — a harmony that can be measured.' },
  swatch: [[236, 230, 218], [185, 75, 45], [60, 48, 38], [200, 170, 120]],
  audio: { root: 73.42, chord: [0, 7, 12, 15], wave: 'triangle', cutoff: 900, level: 0.08,
    notes: { scale: [0, 2, 3, 5, 7, 9, 10], oct: [2, 3], rate: 0.75, wave: 'triangle', decay: 2.2, gain: 0.07, pattern: 'walk', harm: 2, wet: 0.55 } },
  init(S) {
    const { w, h, u, N } = S;
    S.base = S.layer();
    const bg = S.base.g;
    const mar = U.texture(w, h, u, (X, Y, o) => {
      const n = N.fbm2(X * 0.0025, Y * 0.0025, 5), n2 = N.fbm2(X * 0.006 + 20, Y * 0.006, 4);
      const v = Math.abs(Math.sin((X * 0.0019 + Y * 0.0011 + n * 3.4) * Math.PI));
      const v2 = Math.abs(Math.sin((X * 0.0007 - Y * 0.0016 + n2 * 2.2) * Math.PI * 3));
      const vein = Math.pow(1 - v, 9) * 0.16 + Math.pow(1 - v2, 26) * 0.07;
      const b = 0.95 + N.fbm2(X * 0.04, Y * 0.04, 2) * 0.015 + n * 0.03 - vein;
      o[0] = 238 * b; o[1] = 232 * b; o[2] = 222 * b - vein * 25;
    });
    bg.drawImage(mar, 0, 0, w, h);
    const vg = bg.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(90,70,50,0.35)');
    bg.fillStyle = vg; bg.fillRect(0, 0, w, h);

    const pl = S.pl = new U.Plotter(bg), st = 2.5 * u;
    const ink = { color: 'rgb(48,38,30)', width: 1.4 * u, alpha: 0.85 };
    const terra = { color: 'rgb(178,74,44)', width: 1.8 * u, alpha: 0.9 };
    // Meander bands, top and bottom.
    const gu = 7 * u, mt = meanderPts(70 * u, 34 * u, w - 140 * u, gu, st), mb = meanderPts(70 * u, h - 34 * u - 4 * gu, w - 140 * u, gu, st);
    pl.add(mt.pts, 0.2, 24, { color: 'rgb(150,62,38)', width: 2.2 * u, alpha: 0.85 });
    pl.add(mb.pts.slice().reverse(), 0.2, 24, { color: 'rgb(150,62,38)', width: 2.2 * u, alpha: 0.85 });
    for (const [m, y] of [[mt, 34 * u], [mb, h - 34 * u - 4 * gu]]) {
      pl.add(U.linePts(m.x0, y - 8 * u, m.x1, y - 8 * u, st), 0.5, 6, ink);
      pl.add(U.linePts(m.x1, y + 4 * gu + 8 * u, m.x0, y + 4 * gu + 8 * u, st), 0.5, 6, ink);
    }
    // The golden rectangle that contains the temple.
    const phi = (1 + Math.sqrt(5)) / 2;
    const TW = Math.min(w * 0.56, h * 0.58 * phi), TH = TW / phi, x0 = w / 2 - TW / 2, y0 = h / 2 - TH / 2 + 0.01 * h, cx = w / 2;
    S.rect = { x0, y0, TW, TH };
    // Flower of life, faint, behind everything.
    const R0 = TH * 0.5;
    for (let k = 0; k < 7; k++) {
      const a = k * Math.PI / 3, ccx = cx + (k ? Math.cos(a) * R0 : 0), ccy = y0 + TH / 2 + (k ? Math.sin(a) * R0 : 0);
      pl.add(U.arcPts(ccx, ccy, R0, -Math.PI / 2, Math.PI * 1.5, st), 0.6 + k * 0.85, 2.4, { color: 'rgb(176,146,96)', width: 1 * u, alpha: 0.42 });
    }
    pl.add(U.resample([[x0, y0], [x0 + TW, y0], [x0 + TW, y0 + TH], [x0, y0 + TH], [x0, y0]], st), 3, 3.4, terra);
    // Temple elevation.
    const segs = [];
    const L = (ax, ay, bx, by) => segs.push(U.linePts(ax, ay, bx, by, st));
    const Y = f => y0 + f * TH, X = f => x0 + f * TW;
    segs.push(U.resample([[X(0), Y(0.2)], [cx, Y(0)], [X(1), Y(0.2)]], st));
    segs.push(U.resample([[X(0.05), Y(0.185)], [cx, Y(0.045)], [X(0.95), Y(0.185)]], st));
    for (const f of [0.2, 0.225, 0.3, 0.37]) L(X(0), Y(f), X(1), Y(f));
    for (let k = 0; k <= 15; k++) { const x = X(0.03 + k * 0.94 / 15); L(x - 0.006 * TW, Y(0.232), x - 0.006 * TW, Y(0.293)); L(x + 0.006 * TW, Y(0.232), x + 0.006 * TW, Y(0.293)); }
    const cw = 0.06 * TW;
    for (let k = 0; k < 8; k++) {
      const xc = X(0.08 + k * 0.84 / 7);
      L(xc - cw * 0.62, Y(0.37), xc + cw * 0.62, Y(0.37)); L(xc - cw * 0.62, Y(0.385), xc + cw * 0.62, Y(0.385));
      segs.push(U.resample([[xc - cw * 0.6, Y(0.385)], [xc - cw * 0.45, Y(0.405)], [xc - cw * 0.42, Y(0.42)]], st));
      segs.push(U.resample([[xc + cw * 0.6, Y(0.385)], [xc + cw * 0.45, Y(0.405)], [xc + cw * 0.42, Y(0.42)]], st));
      L(xc - cw * 0.42, Y(0.42), xc - cw * 0.5, Y(0.87)); L(xc + cw * 0.42, Y(0.42), xc + cw * 0.5, Y(0.87));
      L(xc - cw * 0.14, Y(0.43), xc - cw * 0.17, Y(0.86)); L(xc + cw * 0.14, Y(0.43), xc + cw * 0.17, Y(0.86));
    }
    L(X(0.02), Y(0.87), X(0.98), Y(0.87)); L(X(0.01), Y(0.91), X(0.99), Y(0.91)); L(X(0.005), Y(0.955), X(0.995), Y(0.955)); L(X(0), Y(1), X(1), Y(1));
    segs.forEach((p, i) => pl.add(p, 6 + i * (8 / segs.length), 0.9, ink));
    // Golden subdivision and spiral.
    let x = x0, y = y0, W2 = TW, H2 = TH;
    const spiral = [];
    for (let i = 0; i < 9; i++) {
      const d = i % 4;
      let line, arc;
      if (d === 0) { const s = H2; line = [[x + s, y], [x + s, y + H2]]; arc = U.arcPts(x + s, y + H2, s, Math.PI, Math.PI * 1.5, st); x += s; W2 -= s; }
      else if (d === 1) { const s = W2; line = [[x, y + s], [x + W2, y + s]]; arc = U.arcPts(x, y + s, s, -Math.PI / 2, 0, st); y += s; H2 -= s; }
      else if (d === 2) { const s = H2; line = [[x + W2 - s, y], [x + W2 - s, y + H2]]; arc = U.arcPts(x + W2 - s, y, s, 0, Math.PI / 2, st); W2 -= s; }
      else { const s = W2; line = [[x, y + H2 - s], [x + W2, y + H2 - s]]; arc = U.arcPts(x + W2, y + H2 - s, s, Math.PI / 2, Math.PI, st); H2 -= s; }
      pl.add(U.resample(line, st), 13.5 + i * 0.6, 0.7, { color: 'rgb(178,74,44)', width: 1 * u, alpha: 0.6 });
      spiral.push(...arc);
    }
    pl.add(spiral, 17.5, 9.5, { color: 'rgb(170,64,36)', width: 3 * u, alpha: 0.95 });
  },
  frame(S, t) {
    const { g, w, h, u } = S;
    S.pl.update(t);
    if (t > 26.5 && !S.txt) {
      S.txt = true;
      const bg = S.base.g, r = S.rect;
      bg.fillStyle = 'rgba(150,60,36,0.9)'; bg.font = `italic ${24 * u}px "Cormorant Garamond",Georgia,serif`;
      bg.textAlign = 'right'; bg.fillText('φ = 1.6180339…', r.x0 + r.TW, r.y0 + r.TH + 44 * u);
      bg.fillStyle = 'rgba(48,38,30,0.75)'; bg.font = `${16 * u}px "Cormorant Garamond",Georgia,serif`;
      bg.textAlign = 'left'; bg.fillText('Μ Ε Τ Ρ Ο Ν   Α Ρ Ι Σ Τ Ο Ν', r.x0, r.y0 + r.TH + 44 * u);
      AUDIO.note(12, { oct: 3, wave: 'sine', decay: 4, gain: 0.08, harm: 3, wet: 0.8 });
    }
    g.drawImage(S.base.c, 0, 0);
    // Slow Mediterranean daylight passing across the marble.
    g.globalCompositeOperation = 'multiply';
    const lx = w * (0.15 + 0.7 * t / S.dur);
    const gr = g.createRadialGradient(lx, h * 0.1, 0, lx, h * 0.1, Math.max(w, h) * 0.9);
    gr.addColorStop(0, 'rgb(255,252,244)'); gr.addColorStop(1, 'rgb(214,200,182)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-over';
  },
});

/* ───────────────────────── III. Song Landscape ───────────────────────── */
function pine(g, x, y, s, rnd, ink) {
  const lean = (rnd() - 0.5) * 0.4 * s;
  g.strokeStyle = `rgba(24,21,18,${0.85 * ink})`; g.lineCap = 'round';
  g.lineWidth = s * 0.05; g.beginPath(); g.moveTo(x, y);
  g.quadraticCurveTo(x + lean * 0.2 + (rnd() - 0.5) * s * 0.15, y - s * 0.5, x + lean, y - s); g.stroke();
  for (let k = 0; k < 6; k++) {
    const f = 0.3 + k * 0.13, bx = x + lean * f * f, by = y - s * f, dir = k % 2 ? 1 : -1;
    const L = s * (0.42 - k * 0.05) * (0.7 + rnd() * 0.5), ex = bx + dir * L, ey = by - L * 0.15 + (rnd() - 0.5) * s * 0.1;
    g.lineWidth = s * 0.018; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo((bx + ex) / 2, by - s * 0.05, ex, ey); g.stroke();
    g.lineWidth = s * 0.009;
    for (let m = 0; m < 4; m++) {
      const q = 0.35 + m * 0.21, nx = bx + (ex - bx) * q, ny = by + (ey - by) * q - s * 0.025;
      g.beginPath();
      for (let r = 0; r < 15; r++) { const a = -Math.PI * 1.05 + (r / 14) * Math.PI * 1.1, l = s * (0.08 + rnd() * 0.05); g.moveTo(nx, ny); g.lineTo(nx + Math.cos(a) * l, ny + Math.sin(a) * l * 0.55); }
      g.stroke();
    }
  }
}

function inkMountain(S, d, li) {
  const { w, h, u, N, rnd } = S, W = w + 2 * S.pad, c = U.canvas(W, h), g = c.getContext('2d');
  const ridge = x => {
    const nx = (x - S.pad) / w;
    let env = 0;
    for (const [px, pw, ph] of d.peaks) { const z = (nx - px) / pw; env += ph * Math.exp(-z * z); }
    const r = 1 - Math.abs(N.n2(nx * 9 + li * 13, li * 7)), f = 0.5 + 0.5 * N.fbm2(nx * 22 + li * 3, li, 3);
    return h * d.base - h * d.amp * (env * (0.72 + 0.28 * r) + 0.06 * f * Math.min(1, env * 3 + 0.15));
  };
  const step = 2 * u, xs = [], ys = [];
  for (let x = 0; x <= W; x += step) { xs.push(x); ys.push(ridge(x)); }
  const ink = a => `rgba(22,20,18,${a})`;
  const top = Math.min(...ys), wash = g.createLinearGradient(0, top, 0, h * d.base);
  wash.addColorStop(0, ink(0.22 * d.ink)); wash.addColorStop(1, ink(0.03 * d.ink));
  g.beginPath(); g.moveTo(0, h);
  for (let i = 0; i < xs.length; i++) g.lineTo(xs[i], ys[i]);
  g.lineTo(W, h); g.closePath(); g.fillStyle = wash; g.fill();
  const ridgeStroke = (off, amp, k) => {
    g.beginPath();
    for (let j = 0; j < xs.length; j += 2) { const jy = ys[j] + off + N.n2(xs[j] * 0.012 / u, k * 3.1) * amp; j ? g.lineTo(xs[j], jy) : g.moveTo(xs[j], jy); }
    g.stroke();
  };
  // Broad wet washes bleeding down from the ridge…
  g.lineJoin = 'round';
  for (let k = 0; k < 26; k++) {
    g.strokeStyle = ink(d.ink * 0.06 * Math.pow(1 - k / 26, 1.3)); g.lineWidth = (8 + k * 1.6 + rnd() * 6) * u;
    ridgeStroke(Math.pow(k, 1.5) * 1.7 * u + 4 * u, (4 + k * 0.8) * u, k);
  }
  // …and a few dry, crisp brush lines on the contour itself.
  for (let k = 0; k < 3; k++) { g.strokeStyle = ink(d.ink * (0.5 - k * 0.14)); g.lineWidth = (1.4 + rnd() * 1.6) * u; ridgeStroke(k * 2.5 * u, 1.6 * u, k + 40); }
  // Hemp-fibre texture strokes (披麻皴).
  for (let k = 0; k < d.tex; k++) {
    const x = rnd() * W, j = Math.min(ys.length - 1, Math.round(x / step)), y0 = ys[j], depth = h * d.base - y0;
    if (depth < 10 * u) continue;
    const y = y0 + rnd() * depth * 0.65 + 3 * u;
    const slope = (ys[Math.min(ys.length - 1, j + 3)] - ys[Math.max(0, j - 3)]) / (6 * step);
    const dxr = U.clamp(Math.abs(slope) < 1e-3 ? 0 : 1 / slope, -1, 1) * 0.8;
    const len = (10 + rnd() * 34) * u, a = d.ink * (0.05 + rnd() * 0.16) * (1 - (y - y0) / depth * 0.8);
    g.strokeStyle = ink(a); g.lineWidth = (0.6 + rnd() * 1.4) * u; g.beginPath(); g.moveTo(x, y);
    g.quadraticCurveTo(x + dxr * len * 0.5 + (rnd() - 0.5) * 6 * u, y + len * 0.5, x + dxr * len + (rnd() - 0.5) * 8 * u, y + len); g.stroke();
  }
  // Moss dots (苔点).
  for (let k = 0; k < 120 * d.ink; k++) {
    const x = rnd() * W, j = Math.min(ys.length - 1, Math.round(x / step));
    if (h * d.base - ys[j] < 20 * u) continue;
    g.fillStyle = ink(0.4 + rnd() * 0.4); g.beginPath();
    g.ellipse(x, ys[j] + rnd() * 6 * u, (1.5 + rnd() * 2) * u, (1 + rnd() * 1.5) * u, rnd() * 3, 0, 7); g.fill();
  }
  for (let k = 0; k < (d.trees || 0); k++) {
    const pk = d.peaks[k % d.peaks.length], x = S.pad + (pk[0] + (rnd() - 0.5) * pk[1] * 1.6) * w;
    pine(g, x, ridge(x) + 6 * u, (d.treeSize + rnd() * 40) * u, rnd, d.ink);
  }
  // Dissolve the foot of the mountain into mist.
  g.globalCompositeOperation = 'destination-out';
  const fade = g.createLinearGradient(0, h * (d.base - d.amp * 0.18), 0, h * d.base + 0.04 * h);
  fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,1)');
  g.fillStyle = fade; g.fillRect(0, 0, W, h);
  return { c, speed: d.speed, d };
}

SCENES.push({
  key: 'song', dur: 36, ink: 'dark', handle: '@fan_kuan',
  meta: { num: 'III', eraZh: '北宋 · 约公元1000年 · 中国', eraEn: 'Northern Song · c. 1000 CE · China', zh: '气韵生动', en: 'Spirit Resonance',
    qZh: '“山以水为血脉，以草木为毛发，以烟云为神彩。”', qEn: '“Mountains take water as their blood, grass and trees as their hair, mist and cloud as their spirit.”',
    by: '郭熙《林泉高致》 · Guo Xi, The Lofty Message of Forests and Streams',
    lZh: '美，在留白之处——未被画出的，比画出的更多。', lEn: 'Beauty lives in the empty space: what is left unpainted says more.' },
  swatch: [[234, 224, 202], [40, 36, 32], [120, 112, 100], [175, 35, 30]],
  audio: { root: 98, chord: [0, 7, 12], wave: 'sine', cutoff: 700, level: 0.08, noise: 0.008, noiseFreq: 900,
    notes: { scale: [0, 2, 4, 7, 9], oct: [1, 2], rate: 1.7, wave: 'triangle', decay: 4, gain: 0.09, pattern: 'walk', glide: 0.992, harm: 3.01, wet: 0.85, cutoff: 2200 } },
  init(S) {
    const { w, h, u, N } = S;
    S.paper = U.texture(w, h, u, (X, Y, o) => {
      const n = N.fbm2(X * 0.008, Y * 0.008, 4), f = N.fbm2(X * 0.15, Y * 0.012, 2), st = N.fbm2(X * 0.0012 + 7, Y * 0.0012, 3);
      const v = 0.955 + 0.02 * n + 0.012 * f - 0.05 * Math.max(0, st);
      o[0] = 236 * v; o[1] = 226 * v; o[2] = 204 * v - st * 10;
    });
    S.pad = 80 * u;
    const defs = [
      { base: 0.50, amp: 0.24, ink: 0.30, peaks: [[0.15, 0.10, 0.55], [0.32, 0.09, 0.8], [0.70, 0.13, 0.65], [0.9, 0.08, 0.45]], tex: 400, speed: 0.6 },
      { base: 0.66, amp: 0.50, ink: 0.62, peaks: [[0.48, 0.075, 1.0], [0.37, 0.06, 0.62], [0.58, 0.06, 0.7], [0.66, 0.05, 0.4]], tex: 1800, speed: 1.2 },
      { base: 0.82, amp: 0.30, ink: 0.78, peaks: [[0.04, 0.10, 0.85], [0.2, 0.08, 0.55]], tex: 600, speed: 2.0, trees: 4, treeSize: 45 },
      { base: 1.02, amp: 0.34, ink: 0.92, peaks: [[0.86, 0.07, 1.0], [0.97, 0.07, 0.75], [0.76, 0.05, 0.35]], tex: 600, speed: 3.0, trees: 5, treeSize: 70 },
    ];
    S.L = defs.map((d, i) => inkMountain(S, d, i));
    S.birds = Array.from({ length: 5 }, (_, i) => ({ x: 0.2 + i * 0.05 + S.rnd() * 0.03, y: 0.2 + S.rnd() * 0.06, p: S.rnd() * 6 }));
    S.verse = ['山以水为血脉', '以烟云为神彩'];
    S.sealDots = Array.from({ length: 40 }, () => [S.rnd(), S.rnd(), S.rnd()]);
  },
  frame(S, t) {
    const { g, w, h, u } = S;
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.drawImage(S.paper, 0, 0, w, h);
    S.L.forEach((L, i) => {
      const a = U.smooth(i * 2.6, i * 2.6 + 7, t);
      if (a <= 0) return;
      g.globalAlpha = a; g.drawImage(L.c, -S.pad - (t - S.dur / 2) * L.speed * u, 0); g.globalAlpha = 1;
      // Drifting mist band above each layer.
      for (let k = 0; k < 2; k++) {
        const mx = (((k * 0.53 + i * 0.29 + t * 0.006 * (i + 1)) % 1.4) - 0.2) * w, my = h * (L.d.base - L.d.amp * 0.12), rx = w * 0.32, ry = h * 0.05;
        g.save(); g.translate(mx, my); g.scale(1, ry / rx);
        const mg = g.createRadialGradient(0, 0, 0, 0, 0, rx);
        mg.addColorStop(0, 'rgba(238,229,208,0.6)'); mg.addColorStop(1, 'rgba(238,229,208,0)');
        g.fillStyle = mg; g.fillRect(-rx, -rx, rx * 2, rx * 2); g.restore();
      }
    });
    // A lone fisherman on the river.
    const ba = U.smooth(9, 13, t), bx = w * (0.29 + t * 0.0022), by = h * 0.885;
    if (ba > 0) {
      g.globalAlpha = ba; g.strokeStyle = 'rgba(25,22,18,0.85)'; g.fillStyle = 'rgba(25,22,18,0.8)'; g.lineCap = 'round';
      g.lineWidth = 2.2 * u; g.beginPath(); g.moveTo(bx - 30 * u, by - 2 * u); g.quadraticCurveTo(bx, by + 8 * u, bx + 32 * u, by - 4 * u); g.stroke();
      g.lineWidth = 1.6 * u; g.beginPath(); g.moveTo(bx + 6 * u, by - 1 * u); g.lineTo(bx + 5 * u, by - 18 * u); g.stroke();
      g.beginPath(); g.arc(bx + 5 * u, by - 21 * u, 3 * u, 0, 7); g.fill();
      g.lineWidth = 1 * u; g.beginPath(); g.moveTo(bx + 16 * u, by - 34 * u); g.lineTo(bx - 14 * u, by + 16 * u); g.stroke();
      g.strokeStyle = 'rgba(25,22,18,0.25)';
      for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(bx - (40 - k * 6) * u, by + (8 + k * 6) * u); g.lineTo(bx + (20 + k * 10) * u, by + (8 + k * 6) * u); g.stroke(); }
      g.globalAlpha = 1;
    }
    // Birds.
    const bA = U.smooth(15, 18, t);
    if (bA > 0) {
      g.strokeStyle = `rgba(25,22,18,${0.7 * bA})`; g.lineWidth = 1.3 * u;
      for (const b of S.birds) {
        const x = (b.x + t * 0.004) * w, y = b.y * h + Math.sin(t * 0.8 + b.p) * 6 * u, f = Math.sin(t * 6 + b.p) * 3 * u;
        g.beginPath(); g.moveTo(x - 7 * u, y - f); g.quadraticCurveTo(x - 3 * u, y - 2 * u, x, y); g.quadraticCurveTo(x + 3 * u, y - 2 * u, x + 7 * u, y - f); g.stroke();
      }
    }
    // Inscription, written character by character, then the seal.
    const fs = 30 * u, colX = [w - 70 * u, w - 70 * u - fs * 1.35], top = h * 0.1;
    g.font = `${fs}px ${INK_FONT}`; g.textAlign = 'center'; g.textBaseline = 'top';
    let idx = 0;
    S.verse.forEach((line, ci) => [...line].forEach((ch, k) => {
      const a = U.smooth(14 + idx * 0.42, 14.6 + idx * 0.42, t); idx++;
      if (a > 0) { g.fillStyle = `rgba(28,24,20,${0.85 * a})`; g.fillText(ch, colX[ci], top + k * fs * 1.12); }
    }));
    const sa = U.smooth(20.5, 21.2, t);
    if (sa > 0) {
      if (!S.sealSound) { S.sealSound = true; AUDIO.hit({ freq: 300, q: 0.7, gain: 0.18, decay: 0.25, wet: 0.5 }); }
      const ss = 40 * u, sx = colX[1] - ss / 2, sy = top + 6 * fs * 1.12 + 14 * u, sc = 1 + 0.25 * (1 - U.smooth(20.5, 21, t));
      g.save(); g.translate(sx + ss / 2, sy + ss / 2); g.scale(sc, sc); g.rotate(0.02); g.globalAlpha = sa;
      g.fillStyle = 'rgba(176,36,30,0.88)'; g.fillRect(-ss / 2, -ss / 2, ss, ss);
      g.fillStyle = 'rgb(236,226,204)'; g.font = `${ss * 0.42}px ${INK_FONT}`; g.textBaseline = 'middle';
      g.fillText('气', 0, -ss * 0.21); g.fillText('韵', 0, ss * 0.23);
      for (const [a, b, c] of S.sealDots) { g.fillRect(-ss / 2 + a * ss, -ss / 2 + b * ss, c * 2.5 * u, c * 2.5 * u); }
      g.restore();
    }
    g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.globalAlpha = 1;
  },
});

/* ───────────────────────── IV. Gothic ───────────────────────── */
function glassCell(gg, path, col, cx, cy, rad, rnd, R) {
  gg.save(); gg.clip(path);
  gg.fillStyle = U.rgb(col); gg.fill(path);
  for (let k = 0; k < 14; k++) {
    const v = (rnd() - 0.5) * 80;
    gg.fillStyle = `rgba(${U.clamp(col[0] + v, 0, 255) | 0},${U.clamp(col[1] + v, 0, 255) | 0},${U.clamp(col[2] + v * 1.2, 0, 255) | 0},0.55)`;
    const px = cx + (rnd() - 0.5) * rad * 2, py = cy + (rnd() - 0.5) * rad * 2;
    gg.beginPath(); gg.moveTo(px, py);
    for (let m = 0; m < 3; m++) gg.lineTo(px + (rnd() - 0.5) * rad * 1.5, py + (rnd() - 0.5) * rad * 1.5);
    gg.fill();
  }
  gg.strokeStyle = 'rgba(12,9,8,0.9)'; gg.lineWidth = R * 0.004;
  for (let k = 0; k < 2; k++) { const a = rnd() * 6.28; gg.beginPath(); gg.moveTo(cx - Math.cos(a) * rad * 2, cy - Math.sin(a) * rad * 2); gg.lineTo(cx + Math.cos(a) * rad * 2, cy + Math.sin(a) * rad * 2); gg.stroke(); }
  const rg = gg.createRadialGradient(cx, cy, 0, cx, cy, rad * 1.2);
  rg.addColorStop(0, 'rgba(255,250,235,0.35)'); rg.addColorStop(1, 'rgba(0,0,0,0.3)');
  gg.fillStyle = rg; gg.fill(path);
  gg.restore();
  gg.strokeStyle = '#0b0807'; gg.lineWidth = R * 0.012; gg.stroke(path);
}

SCENES.push({
  key: 'gothic', dur: 32, handle: '@chartres',
  meta: { num: 'IV', eraZh: '十二至十三世纪 · 圣但尼 · 沙特尔', eraEn: '12th – 13th century · Saint-Denis · Chartres', zh: '新光', en: 'Lux Nova',
    qZh: '“愚钝的心灵借由物质升向真理。”', qEn: '“The dull mind rises to truth through that which is material.”', by: '絮热修道院长 · Abbot Suger of Saint-Denis',
    lZh: '美，是神圣之光穿过彩色玻璃，落在人间。', lEn: 'Beauty as divine light, broken into colour, falling upon the world.' },
  swatch: [[30, 60, 170], [170, 25, 40], [235, 190, 80], [20, 120, 70]],
  audio: { root: 65.41, chord: [0, 7, 12, 19, 24], wave: 'sawtooth', cutoff: 700, level: 0.07,
    notes: { scale: [0, 2, 3, 5, 7, 8, 10], oct: [2, 3], rate: 2.8, wave: 'sine', attack: 0.6, decay: 3.2, gain: 0.07, pattern: 'walk', fifth: 0.6, wet: 0.9 } },
  init(S) {
    const { w, h, u, N, rnd } = S;
    const R = S.R = Math.min(w * 0.42, h * 0.36), cx = w / 2, cy = S.wy = h * 0.42;
    S.wall = U.texture(w, h, u, (X, Y, o) => {
      const n = N.fbm2(X * 0.01, Y * 0.01, 4), row = Math.floor(Y / 48);
      const bx = ((X / 90 + (row % 2) * 0.5) % 1 + 1) % 1, by = (Y / 48) % 1;
      const v = (0.11 + 0.05 * n) * (bx < 0.03 || by < 0.05 ? 0.55 : 1);
      o[0] = v * 240; o[1] = v * 222; o[2] = v * 236;
    });
    const gc = U.canvas(w, h), gg = gc.getContext('2d');
    const P = (r, a) => [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    const BLUE = [30, 60, 170], RED = [170, 25, 40], GOLD = [235, 185, 70], GREEN = [25, 120, 70], VIOLET = [90, 40, 130];
    gg.fillStyle = '#16100e'; gg.beginPath(); gg.arc(cx, cy, R * 1.0, 0, 7); gg.fill();
    // Centre.
    const pc = new Path2D(); pc.arc(cx, cy, R * 0.13, 0, 7);
    glassCell(gg, pc, GOLD, cx, cy, R * 0.13, rnd, R);
    const pc2 = new Path2D(); pc2.arc(cx, cy, R * 0.06, 0, 7);
    glassCell(gg, pc2, [250, 240, 210], cx, cy, R * 0.06, rnd, R);
    // Petal rings with pointed (lancet) tips.
    const petals = (n, r0, r1, colFn, gap) => {
      for (let k = 0; k < n; k++) {
        const a0 = k * 2 * Math.PI / n + gap, a1 = (k + 1) * 2 * Math.PI / n - gap, am = (a0 + a1) / 2;
        const p = new Path2D(), s = P(r0, a0);
        p.moveTo(s[0], s[1]); p.arc(cx, cy, r0, a0, a1);
        const e = P(r1 * 0.8, a1), c1 = P(r1 * 0.96, a1), tip = P(r1, am), c2 = P(r1 * 0.96, a0), e2 = P(r1 * 0.8, a0);
        p.lineTo(e[0], e[1]); p.quadraticCurveTo(c1[0], c1[1], tip[0], tip[1]); p.quadraticCurveTo(c2[0], c2[1], e2[0], e2[1]); p.closePath();
        const m = P((r0 + r1) / 2, am);
        glassCell(gg, p, colFn(k), m[0], m[1], (r1 - r0) / 2, rnd, R);
      }
    };
    petals(12, R * 0.15, R * 0.45, k => (k % 2 ? RED : BLUE), 0.03);
    for (let k = 0; k < 12; k++) { const a = (k + 0.5) * Math.PI / 6, m = P(R * 0.28, a), p = new Path2D(); p.arc(m[0], m[1], R * 0.05, 0, 7); glassCell(gg, p, k % 2 ? GOLD : GREEN, m[0], m[1], R * 0.05, rnd, R); }
    petals(24, R * 0.48, R * 0.7, k => (k % 6 === 0 ? GREEN : k % 3 === 0 ? RED : k % 2 ? BLUE : VIOLET), 0.018);
    for (let k = 0; k < 24; k++) {
      const a = (k + 0.5) * Math.PI / 12, m = P(R * 0.81, a), rr = R * 0.075;
      const p = new Path2D(); p.arc(m[0], m[1], rr, 0, 7); glassCell(gg, p, GOLD, m[0], m[1], rr, rnd, R);
      const q = new Path2D(); q.arc(m[0], m[1], rr * 0.72, 0, 7); glassCell(gg, q, k % 2 ? RED : BLUE, m[0], m[1], rr * 0.72, rnd, R);
    }
    for (let k = 0; k < 48; k++) {
      const a0 = k * Math.PI / 24, a1 = (k + 1) * Math.PI / 24, p = new Path2D();
      p.arc(cx, cy, R * 0.97, a0, a1); p.arc(cx, cy, R * 0.92, a1, a0, true); p.closePath();
      const m = P(R * 0.945, (a0 + a1) / 2);
      glassCell(gg, p, [BLUE, RED, GOLD][k % 3], m[0], m[1], R * 0.03, rnd, R);
    }
    gg.strokeStyle = '#2a211d'; gg.lineWidth = R * 0.05; gg.beginPath(); gg.arc(cx, cy, R * 1.0, 0, 7); gg.stroke();
    S.glass = gc;
    // Lancets beneath the rose.
    const lc = U.canvas(w, h), lg = lc.getContext('2d');
    const top = cy + R * 1.12, wd = R * 0.3;
    for (let k = -2; k <= 2; k++) {
      const x = cx + k * R * 0.42, path = new Path2D();
      path.moveTo(x - wd / 2, h + 10); path.lineTo(x - wd / 2, top + wd * 0.5);
      path.quadraticCurveTo(x - wd / 2, top, x, top - wd * 0.35); path.quadraticCurveTo(x + wd / 2, top, x + wd / 2, top + wd * 0.5);
      path.lineTo(x + wd / 2, h + 10); path.closePath();
      lg.save(); lg.clip(path);
      for (let j = 0; top - wd * 0.4 + j * R * 0.24 < h; j++) {
        const y = top - wd * 0.4 + j * R * 0.24, pr = new Path2D(); pr.rect(x - wd / 2, y, wd, R * 0.24);
        glassCell(lg, pr, (j + k) % 2 ? BLUE : RED, x, y + R * 0.12, R * 0.12, rnd, R);
        const rd = new Path2D(); rd.arc(x, y + R * 0.12, wd * 0.3, 0, 7);
        glassCell(lg, rd, (j + k) % 3 === 0 ? GREEN : GOLD, x, y + R * 0.12, wd * 0.3, rnd, R);
      }
      lg.restore();
      lg.strokeStyle = '#2a211d'; lg.lineWidth = R * 0.025; lg.stroke(path);
    }
    S.lanc = lc;
    const both = U.canvas(w, h), bg2 = both.getContext('2d'); bg2.drawImage(gc, 0, 0); bg2.drawImage(lc, 0, 0);
    S.blur = U.blurred(both, 14); S.blur2 = U.blurred(both, 48);
    const RC = [[70, 100, 230], [230, 50, 70], [245, 195, 90], [70, 180, 120]];
    S.rays = Array.from({ length: 18 }, (_, k) => ({ a: -0.2 + (k / 17) * (Math.PI + 0.4), col: RC[k % 4], w0: 0.05 + rnd() * 0.08, w1: 0.3 + rnd() * 0.4, p: rnd() * 10 }));
    S.dust = Array.from({ length: 160 }, () => ({ x: rnd() * w, y: rnd() * h, z: rnd() }));
  },
  frame(S, t, dt) {
    const { g, w, h, u, N, R } = S, cx = w / 2, cy = S.wy;
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.drawImage(S.wall, 0, 0, w, h);
    const rev = U.ease(U.smooth(0.3, 13, t)), lan = U.smooth(9, 15, t);
    const I = (0.6 + 0.4 * U.smooth(1, 14, t)) * (0.82 + 0.18 * N.n2(t * 0.2, 5));
    // Glass revealed as a sweeping dawn around the rose.
    g.save(); g.beginPath(); g.moveTo(cx, cy);
    g.arc(cx, cy, R * 1.1, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rev); g.closePath(); g.clip();
    g.drawImage(S.glass, 0, 0); g.restore();
    if (lan > 0) { g.globalAlpha = lan; g.drawImage(S.lanc, 0, 0); g.globalAlpha = 1; }
    g.globalCompositeOperation = 'lighter';
    const vis = Math.max(rev, lan) * I;
    g.globalAlpha = 0.5 * vis; g.drawImage(S.blur, 0, 0, w, h);
    g.globalAlpha = 0.35 * vis; g.drawImage(S.blur2, 0, 0, w, h);
    g.globalAlpha = 1;
    // Light shafts falling into the nave.
    for (const r of S.rays) {
      const a = r.a + 0.04 * N.n2(t * 0.1, r.p), sx = cx + Math.cos(a) * R * 0.6, sy = cy + Math.sin(a) * R * 0.6;
      const dx = Math.cos(a) * 0.35, dy = 1, L = h * 1.3, ex = sx + dx * L, ey = sy + dy * L;
      const px = -dy, py = dx, n = Math.hypot(px, py), w0 = r.w0 * R, w1 = r.w1 * R;
      const lg = g.createLinearGradient(sx, sy, ex, ey);
      const al = 0.075 * vis * (0.6 + 0.4 * N.n2(t * 0.3, r.p + 3));
      lg.addColorStop(0, U.rgb(r.col, al)); lg.addColorStop(1, U.rgb(r.col, 0));
      g.fillStyle = lg; g.beginPath();
      g.moveTo(sx + px / n * w0, sy + py / n * w0); g.lineTo(ex + px / n * w1, ey + py / n * w1);
      g.lineTo(ex - px / n * w1, ey - py / n * w1); g.lineTo(sx - px / n * w0, sy - py / n * w0); g.closePath(); g.fill();
    }
    for (const d of S.dust) {
      d.y += (0.1 + d.z * 0.2) * u * dt * 60; d.x += N.n2(d.y * 0.01 / u, d.z * 9) * 0.4 * u;
      if (d.y > h) { d.y = 0; d.x = S.rnd() * w; }
      const a = vis * 0.5 * Math.max(0, N.n2(d.x * 0.004 / u, d.y * 0.004 / u + t * 0.05));
      if (a > 0.02) { g.fillStyle = `rgba(255,235,200,${a})`; g.fillRect(d.x, d.y, 1.6 * u, 1.6 * u); }
    }
    g.globalCompositeOperation = 'source-over';
  },
});

/* ───────────────────────── V. Renaissance ───────────────────────── */
SCENES.push({
  key: 'renaissance', dur: 32, ink: 'dark', handle: '@alberti',
  meta: { num: 'V', eraZh: '十五世纪 · 佛罗伦萨', eraEn: '15th century · Florence', zh: '消失点', en: 'The Vanishing Point',
    qZh: '“画面是一扇打开的窗，我们从中看见所画的事物。”', qEn: '“A painting is an open window through which the subject is seen.”', by: '阿尔伯蒂《论绘画》 · Leon Battista Alberti, On Painting, 1435',
    lZh: '世界第一次以一只人眼为中心，被重新排列。', lEn: 'For the first time, the world was arranged around a single human eye.' },
  swatch: [[228, 210, 172], [74, 48, 28], [165, 72, 48], [190, 160, 120]],
  audio: { root: 87.31, chord: [0, 4, 7, 12], wave: 'triangle', cutoff: 1100, level: 0.07,
    notes: { scale: [0, 2, 4, 5, 7, 9, 11], oct: [2, 3], rate: 0.55, wave: 'triangle', decay: 1.3, gain: 0.07, pattern: 'arp', cutoff: 2600, wet: 0.5 } },
  init(S) {
    const { w, h, u, N } = S;
    S.base = S.layer();
    const bg = S.base.g;
    const par = U.texture(w, h, u, (X, Y, o) => {
      const n = N.fbm2(X * 0.004, Y * 0.004, 5), s = N.fbm2(X * 0.0015 + 3, Y * 0.0015, 3), f = N.n2(X * 0.05, Y * 0.05);
      const fox = Math.max(0, N.n2(X * 0.02 + 40, Y * 0.02) - 0.7) * 1.2;
      const v = 0.93 + 0.04 * n - 0.06 * Math.max(0, s) + 0.01 * f - fox * 0.2;
      o[0] = 232 * v; o[1] = 212 * v; o[2] = 172 * v - s * 12;
    });
    bg.drawImage(par, 0, 0, w, h);
    const vg = bg.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(110,70,30,0.45)');
    bg.fillStyle = vg; bg.fillRect(0, 0, w, h);

    const hy = S.hy = h * 0.4, f = h * 0.95, E = 1.6, cx = w / 2, st = 3 * u;
    const P = (X, Y, Z) => [cx + f * X / Z, hy + f * (E - Y) / Z];
    S.P = P;
    const seg = (a, b, n = 60) => { const out = []; for (let i = 0; i <= n; i++) { const k = i / n; out.push(P(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k)); } return U.resample(out, st); };
    const curve = fn => { const out = []; for (let i = 0; i <= 80; i++) out.push(fn(i / 80)); return U.resample(out.map(p => P(...p)), st); };
    const sepia = { color: 'rgb(72,46,26)', width: 1.3 * u, alpha: 0.85 }, fine = { color: 'rgb(72,46,26)', width: 0.8 * u, alpha: 0.6 };
    const red = { color: 'rgb(168,72,46)', width: 0.8 * u, alpha: 0.5 };
    const pl = S.pl = new U.Plotter(bg);
    pl.add(U.linePts(0, hy, w, hy, st), 0.3, 2.4, { color: 'rgb(168,72,46)', width: 1 * u, alpha: 0.7 });
    pl.add(U.arcPts(cx, hy, 6 * u, 0, 6.3, 1 * u), 1.6, 0.8, { color: 'rgb(168,72,46)', width: 1.2 * u });
    for (let k = 0; k < 26; k++) {
      const a = -0.25 + (k / 25) * (Math.PI + 0.5), L = Math.hypot(w, h);
      pl.add(U.linePts(cx, hy, cx + Math.cos(a) * L, hy + Math.sin(a) * L, st * 2), 2 + k * 0.12, 1.6, red);
    }
    for (let X = -4; X <= 4; X++) pl.add(seg([X, 0, 2.2], [X, 0, 26]), 5 + (X + 4) * 0.3, 1.4, sepia);
    for (let k = 0; k <= 23; k++) { const Z = 2.2 + k; pl.add(seg([-4, 0, Z], [4, 0, Z], 20), 7.5 + k * 0.17, 0.7, fine); }
    // Arcaded loggias on both sides.
    const B = [];
    for (const sg of [-1, 1]) {
      const Xf = sg * 4;
      for (const Yl of [0, 4.2, 6, 6.3]) B.push(seg([Xf, Yl, 3], [Xf, Yl, 22]));
      for (const Z of [3, 22]) B.push(seg([Xf, 0, Z], [Xf, 6.3, Z]));
      B.push(seg([Xf, 0, 3], [sg * 9, 0, 3])); B.push(seg([Xf, 6.3, 3], [sg * 9, 6.3, 3]));
      for (let zc = 4; zc <= 20; zc += 2) {
        B.push(seg([Xf, 0, zc - 0.12], [Xf, 3, zc - 0.12], 20)); B.push(seg([Xf, 0, zc + 0.12], [Xf, 3, zc + 0.12], 20));
        if (zc < 20) {
          B.push(curve(k => { const th = Math.PI * k; return [Xf, 3 + Math.sin(th) * 0.88, zc + 1 + Math.cos(th) * 0.88]; }));
          B.push(U.resample([P(Xf, 4.6, zc + 0.7), P(Xf, 5.6, zc + 0.7), P(Xf, 5.85, zc + 1), P(Xf, 5.6, zc + 1.3), P(Xf, 4.6, zc + 1.3), P(Xf, 4.6, zc + 0.7)], st));
        }
      }
    }
    B.forEach((p, i) => pl.add(p, 10 + i * (9 / B.length), 0.9, sepia));
    // The tholos of the ideal city.
    const T = [], Zc = 24, r = 2.2;
    const ring = (Y, rr, a0, a1) => curve(k => { const th = a0 + (a1 - a0) * k; return [rr * Math.sin(th), Y, Zc - rr * Math.cos(th)]; });
    T.push(ring(0, 2.7, -Math.PI, Math.PI), ring(0.15, 2.45, -Math.PI, Math.PI), ring(0.3, r, -Math.PI, Math.PI));
    for (let k = -4; k <= 4; k++) { const th = k * Math.PI / 9; T.push(seg([r * Math.sin(th), 0.3, Zc - r * Math.cos(th)], [r * Math.sin(th), 3.8, Zc - r * Math.cos(th)], 20)); }
    T.push(ring(3.8, r, -Math.PI / 2, Math.PI / 2), ring(4.3, r + 0.1, -Math.PI / 2, Math.PI / 2), ring(5.2, 1.9, -Math.PI / 2, Math.PI / 2));
    T.push(seg([-1.9, 4.3, Zc], [-1.9, 5.2, Zc], 10), seg([1.9, 4.3, Zc], [1.9, 5.2, Zc], 10));
    T.push(curve(k => { const th = Math.PI * k; return [1.9 * Math.cos(th), 5.2 + 1.75 * Math.sin(th), Zc]; }));
    T.push(U.resample([P(-0.25, 6.85, Zc), P(-0.25, 7.5, Zc), P(0.25, 7.5, Zc), P(0.25, 6.85, Zc)], st));
    T.push(curve(k => { const th = Math.PI * k; return [0.3 * Math.cos(th), 7.5 + 0.3 * Math.sin(th), Zc]; }));
    T.push(U.resample([P(-0.45, 0.3, Zc - r), P(-0.45, 1.9, Zc - r)], st), U.resample([P(0.45, 0.3, Zc - r), P(0.45, 1.9, Zc - r)], st));
    T.push(curve(k => { const th = Math.PI * k; return [0.45 * Math.cos(th), 1.9 + 0.45 * Math.sin(th), Zc - r]; }));
    T.forEach((p, i) => pl.add(p, 18 + i * (6 / T.length), 1.0, sepia));
    S.tiles = [];
    for (let X = -4; X < 4; X++) for (let k = 0; k < 23; k++) if ((X + k + 8) % 2 === 0) { const Z = 2.2 + k; S.tiles.push({ t: 23 + (22 - k) * 0.22 + Math.abs(X + 0.5) * 0.05, p: [P(X, 0, Z), P(X + 1, 0, Z), P(X + 1, 0, Z + 1), P(X, 0, Z + 1)] }); }
  },
  frame(S, t, dt) {
    const { g, w, h, u } = S, bg = S.base.g;
    S.pl.update(t);
    // Floor tiles inked in a wave that rolls from the vanishing point toward the eye.
    for (const q of S.tiles) if (!q.done && t > q.t) {
      q.done = true;
      bg.fillStyle = 'rgba(120,80,45,0.2)'; bg.beginPath(); bg.moveTo(q.p[0][0], q.p[0][1]);
      for (let i = 1; i < 4; i++) bg.lineTo(q.p[i][0], q.p[i][1]);
      bg.closePath(); bg.fill();
    }
    if (t > 24.5 && !S.notes) {
      S.notes = true;
      bg.save(); bg.fillStyle = 'rgba(72,46,26,0.7)'; bg.font = `italic ${17 * u}px "Cormorant Garamond",Georgia,serif`;
      const mirror = (txt, x, y) => { bg.save(); bg.translate(x, y); bg.scale(-1, 1); bg.fillText(txt, 0, 0); bg.restore(); };
      mirror('la prospettiva è briglia', w * 0.06 + 210 * u, h * 0.12);
      mirror('e timone della pittura', w * 0.06 + 210 * u, h * 0.12 + 22 * u);
      bg.textAlign = 'right'; bg.fillText('Fiorenza · MCCCCXXXV', w * 0.94, h * 0.12);
      bg.font = `${13 * u}px "Cormorant Garamond",Georgia,serif`; bg.fillText('punto centrico', S.w / 2 + 64 * u, S.hy - 10 * u);
      bg.restore();
    }
    g.drawImage(S.base.c, 0, 0);
  },
});
