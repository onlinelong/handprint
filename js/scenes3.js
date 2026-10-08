'use strict';
// Act III — from the body's gesture to the glowing wall.

/* ───────────────────────── XI. Action Painting ───────────────────────── */
SCENES.push({
  key: 'pollock', dur: 30, ink: 'dark', zoom: 0.02, handle: '@jack_the_dripper',
  meta: { num: 'XI', eraZh: '1947 — 1950 · 纽约', eraEn: '1947 – 1950 · New York', zh: '行动', en: 'Action',
    qZh: '“当我在画中时，我并不知道自己在做什么。”', qEn: '“When I am in my painting, I’m not aware of what I’m doing.”', by: '杰克逊·波洛克 · Jackson Pollock, 1947',
    lZh: '画布成为竞技场——美，是身体留下的轨迹。', lEn: 'The canvas becomes an arena; beauty is the trace of a body in motion.' },
  swatch: [[206, 190, 160], [22, 20, 18], [238, 232, 220], [190, 140, 62]],
  audio: { root: 55, chord: [0, 6, 10, 15], wave: 'sawtooth', cutoff: 500, level: 0.05,
    notes: { scale: [0, 3, 5, 6, 7, 10], oct: [2, 4], rate: 0.16, wave: 'triangle', decay: 0.35, gain: 0.05, cutoff: 2600, wet: 0.35 },
    drum: { every: 0.75, gain: 0.12, freq: 140, decay: 0.15, wet: 0.2 },
    hit: { every: 0.5, freq: 5000, q: 0.8, gain: 0.05, decay: 0.08, wet: 0.2 } },
  init(S) {
    const { w, h, u, N } = S;
    const cv = U.texture(w, h, u, (X, Y, o) => {
      const weave = 0.03 * Math.sin(X * 1.3) * Math.sin(Y * 1.3), s = N.fbm2(X * 0.003, Y * 0.003, 4);
      const v = 0.93 + weave + 0.05 * s + 0.02 * N.n2(X * 0.08, Y * 0.08);
      o[0] = 210 * v; o[1] = 194 * v; o[2] = 162 * v;
    }, 1000);
    S.g.drawImage(cv, 0, 0, w, h);
    S.pal = [[22, 20, 18], [240, 234, 222], [168, 168, 174], [192, 140, 60], [40, 78, 88], [22, 20, 18], [128, 42, 30]];
    S.br = [0, 1, 2, 3].map(k => ({ seed: k * 31 + 7, ci: k, last: null, sp: 2.4 + k * 0.45, w: [7.5, 5, 5, 4][k] }));
  },
  frame(S, t, dt) {
    const { g, w, h, u, N, rnd } = S, sub = 10;
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (const b of S.br) {
      const ci = (b.ci + Math.floor((t + b.seed * 0.1) / 6.5)) % S.pal.length, col = S.pal[ci], silver = ci === 2;
      for (let s = 0; s < sub; s++) {
        const tau = (t + s * dt / sub) * b.sp;
        const x = w * (0.5 + 0.62 * N.n2(tau * 0.32, b.seed)) + 70 * u * N.n2(tau * 2.2, b.seed + 9);
        const y = h * (0.5 + 0.62 * N.n2(tau * 0.32, b.seed + 40)) + 70 * u * N.n2(tau * 2.2, b.seed + 19);
        if (b.last) {
          const dx = x - b.last[0], dy = y - b.last[1], sp = Math.hypot(dx, dy) / u;
          const flow = U.smooth(-0.15, 0.3, N.n2(tau * 0.9, b.seed + 70)) * U.smooth(0, 1.5, t);
          if (flow > 0.02) {
            const lw = b.w * u * flow * U.clamp(1.7 - sp / 9, 0.18, 1.6);
            g.strokeStyle = U.rgb(col, 0.92); g.lineWidth = lw;
            g.beginPath(); g.moveTo(b.last[0], b.last[1]); g.lineTo(x, y); g.stroke();
            if (silver) { g.strokeStyle = 'rgba(235,235,240,0.7)'; g.lineWidth = lw * 0.35; g.stroke(); }
            if (rnd() < 0.025 * flow && sp > 0.5) {
              const nx = dx / (sp * u), ny = dy / (sp * u);
              g.fillStyle = U.rgb(col, 0.9);
              for (let k = 0, n = 5 + rnd() * 10; k < n; k++) {
                const dd = (10 + Math.abs(U.gauss(rnd)) * 34) * u, pj = U.gauss(rnd) * 8 * u;
                g.beginPath(); g.arc(x + nx * dd - ny * pj, y + ny * dd + nx * pj, (0.6 + rnd() * 2.8) * u, 0, 7); g.fill();
              }
            }
            if (rnd() < 0.0025) {
              g.fillStyle = U.rgb(col, 0.95);
              for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(x + U.gauss(rnd) * 5 * u, y + U.gauss(rnd) * 5 * u, (3 + rnd() * 7) * u, 0, 7); g.fill(); }
            }
          }
        }
        b.last = [x, y];
      }
    }
  },
});

/* ───────────────────────── XII. Colour Field ───────────────────────── */
const ROTHKO = [
  { bg: [128, 32, 26], A: [236, 122, 42], B: [204, 48, 40], C: [250, 192, 92] },
  { bg: [96, 26, 38], A: [184, 56, 46], B: [44, 12, 28], C: [214, 98, 64] },
  { bg: [40, 16, 20], A: [86, 28, 32], B: [14, 8, 10], C: [120, 44, 36] },
];
SCENES.push({
  key: 'rothko', dur: 32, zoom: 0.025, handle: '@rothko',
  meta: { num: 'XII', eraZh: '1950 — 1970 · 纽约', eraEn: '1950 – 1970 · New York', zh: '色域', en: 'Colour Field',
    qZh: '“我只关心表达人类最基本的情感——悲剧、狂喜、毁灭。”', qEn: '“I’m interested only in expressing basic human emotions — tragedy, ecstasy, doom.”', by: '马克·罗斯科 · Mark Rothko',
    lZh: '在喧嚣到来之前，最后一次长久的沉默。', lEn: 'One last long silence before the noise.' },
  swatch: [[236, 122, 42], [204, 48, 40], [72, 20, 46], [30, 14, 18]],
  audio: { root: 41.2, chord: [0, 7, 12, 15, 19], wave: 'sine', cutoff: 420, level: 0.14,
    notes: { scale: [0, 3, 7], oct: [2, 3], rate: 7, wave: 'sine', attack: 1.5, decay: 6, gain: 0.05, delay: 4, wet: 0.95 } },
  init(S) {
    S.bw = 220; S.bh = Math.round(220 * S.h / S.w);
    S.low = U.canvas(S.bw, S.bh); S.lg = S.low.getContext('2d'); S.img = S.lg.createImageData(S.bw, S.bh);
  },
  frame(S, t) {
    const { g, w, h, N, bw, bh } = S, asp = w / h, d = S.img.data;
    const k = t / S.dur, seg = k < 0.5 ? 0 : 1, f = U.smooth(0, 1, k < 0.5 ? k * 2 : (k - 0.5) * 2);
    const P = {}; for (const key of ['bg', 'A', 'B', 'C']) P[key] = U.mix(ROTHKO[seg][key], ROTHKO[seg + 1][key], f);
    const breath = 0.94 + 0.06 * Math.sin(t * 0.7), RW = Math.min(0.78, 1.25 / asp), x0 = 0.5 - RW / 2, x1 = 0.5 + RW / 2;
    const rects = [{ y0: 0.08, y1: 0.5, c: P.A }, { y0: 0.565, y1: 0.92, c: P.B }, { y0: 0.515, y1: 0.548, c: P.C }];
    const soft = 0.03 + 0.012 * Math.sin(t * 0.5);
    let o = 0;
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const nx = x / bw, ny = y / bh;
      const n1 = N.n3(nx * 6, ny * 6, t * 0.03), n2 = N.n3(nx * 2.2 + 7, ny * 2.2, t * 0.02);
      let c = P.bg.map(v => v * (0.9 + 0.08 * n2));
      for (const r of rects) {
        const de = Math.min((nx - x0) * asp, (x1 - nx) * asp, ny - r.y0, r.y1 - ny) + n1 * 0.005 + N.n2(nx * 40, ny * 40) * 0.004;
        const a = U.smooth(-soft * 0.4, soft, de);
        if (a > 0) c = U.mix(c, r.c.map(v => v * (0.88 + 0.14 * n2 + 0.05 * n1)), a * 0.94);
      }
      d[o] = c[0] * breath; d[o + 1] = c[1] * breath; d[o + 2] = c[2] * breath; d[o + 3] = 255; o += 4;
    }
    S.lg.putImageData(S.img, 0, 0);
    g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(S.low, 0, 0, w, h);
  },
});

/* ───────────────────────── XIII. Pop ───────────────────────── */
const POP_PALS = [
  { bg: [236, 92, 142], skin: [250, 200, 170], hair: [250, 222, 60], lips: [222, 30, 40], eye: [60, 190, 200] },
  { bg: [40, 162, 192], skin: [242, 152, 172], hair: [250, 240, 100], lips: [200, 20, 60], eye: [250, 182, 40] },
  { bg: [250, 202, 40], skin: [250, 122, 92], hair: [30, 30, 30], lips: [222, 40, 40], eye: [80, 150, 222] },
  { bg: [122, 72, 182], skin: [250, 192, 142], hair: [250, 122, 40], lips: [250, 40, 92], eye: [60, 222, 142] },
  { bg: [240, 240, 235], skin: [250, 172, 172], hair: [40, 40, 40], lips: [222, 20, 30], eye: [40, 90, 200] },
  { bg: [250, 112, 40], skin: [250, 222, 192], hair: [250, 250, 122], lips: [232, 30, 92], eye: [40, 200, 222] },
  { bg: [60, 60, 72], skin: [222, 202, 202], hair: [250, 92, 162], lips: [250, 250, 250], eye: [122, 222, 250] },
  { bg: [30, 182, 112], skin: [250, 212, 182], hair: [250, 212, 40], lips: [200, 30, 30], eye: [250, 122, 182] },
];
function popMasks() {
  const M = 200, mk = () => { const c = U.canvas(M, M), g = c.getContext('2d'); g.fillStyle = '#fff'; g.strokeStyle = '#fff'; return { c, g }; };
  const hair = mk(), skin = mk(), lips = mk(), eye = mk(), key = mk();
  for (let a = -3.6; a <= 0.5; a += 0.32) { hair.g.beginPath(); hair.g.arc(100 + 60 * Math.cos(a), 92 + 58 * Math.sin(a), 30, 0, 7); hair.g.fill(); }
  hair.g.beginPath(); hair.g.ellipse(100, 88, 64, 60, 0, 0, 7); hair.g.fill();
  skin.g.beginPath(); skin.g.ellipse(100, 108, 44, 56, 0, 0, 7); skin.g.fill(); skin.g.fillRect(82, 140, 36, 60);
  skin.g.beginPath(); skin.g.ellipse(100, 205, 90, 30, 0, 0, 7); skin.g.fill();
  lips.g.beginPath(); lips.g.moveTo(84, 138); lips.g.quadraticCurveTo(92, 130, 100, 134); lips.g.quadraticCurveTo(108, 130, 116, 138);
  lips.g.quadraticCurveTo(100, 152, 84, 138); lips.g.fill();
  for (const x of [82, 118]) { eye.g.beginPath(); eye.g.ellipse(x, 98, 14, 8, 0, 0, 7); eye.g.fill(); }
  // Key plate: the black screen of shadows and lines.
  const k = key.g; k.fillStyle = '#fff'; k.fillRect(0, 0, M, M);
  k.strokeStyle = '#333'; k.lineWidth = 3;
  for (let a = -3.5; a <= 0.4; a += 0.32) { k.beginPath(); k.arc(100 + 60 * Math.cos(a), 92 + 58 * Math.sin(a), 18, a, a + 2.4); k.stroke(); }
  const sh = k.createLinearGradient(70, 0, 145, 0); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.55)');
  k.fillStyle = sh; k.beginPath(); k.ellipse(100, 108, 44, 56, 0, 0, 7); k.fill();
  k.fillStyle = 'rgba(0,0,0,0.5)'; k.fillRect(82, 150, 36, 18);
  k.fillStyle = '#111';
  for (const x of [82, 118]) { k.beginPath(); k.ellipse(x, 100, 9, 4, 0, 0, 7); k.fill(); k.beginPath(); k.arc(x, 100, 3.5, 0, 7); k.fill(); }
  k.lineWidth = 2.5; k.strokeStyle = '#111';
  for (const x of [82, 118]) { k.beginPath(); k.arc(x, 92, 15, 3.6, 5.8); k.stroke(); k.beginPath(); k.arc(x, 82, 16, 3.8, 5.6); k.stroke(); }
  k.beginPath(); k.moveTo(100, 104); k.lineTo(95, 122); k.lineTo(103, 124); k.stroke();
  k.beginPath(); k.moveTo(86, 139); k.quadraticCurveTo(100, 144, 114, 139); k.stroke();
  k.beginPath(); k.arc(122, 128, 2.2, 0, 7); k.fill();
  const lum = new Float32Array(M * M), d = k.getImageData(0, 0, M, M).data;
  for (let i = 0; i < M * M; i++) lum[i] = d[i * 4] / 255;
  return { M, layers: { hair: hair.c, skin: skin.c, lips: lips.c, eye: eye.c }, lum };
}
function tinted(mask, col) {
  const c = U.canvas(mask.width, mask.height), g = c.getContext('2d');
  g.drawImage(mask, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = U.rgb(col); g.fillRect(0, 0, c.width, c.height);
  return c;
}

SCENES.push({
  key: 'pop', dur: 30, zoom: 0, handle: '@warhol',
  meta: { num: 'XIII', eraZh: '1962 · 纽约', eraEn: '1962 · New York', zh: '十五分钟', en: 'Fifteen Minutes',
    qZh: '“在未来，每个人都能成名十五分钟。”', qEn: '“In the future, everyone will be world-famous for fifteen minutes.”', by: '安迪·沃霍尔 · Andy Warhol, 1968',
    lZh: '复制取代了灵光，图像开始比现实更真实。', lEn: 'Reproduction replaced the aura; images became more real than the real.' },
  swatch: [[236, 92, 142], [250, 222, 60], [40, 162, 192], [222, 30, 40]],
  audio: { root: 98, chord: [0, 4, 7], wave: 'square', cutoff: 1400, level: 0.035,
    notes: { scale: [0, 4, 7, 9], oct: [2, 3], rate: 0.125, wave: 'square', decay: 0.12, gain: 0.03, pattern: 'arp', cutoff: 3000, wet: 0.25 },
    drum: { every: 0.5, gain: 0.18, freq: 120, decay: 0.2, wet: 0.1 } },
  init(S) {
    const { w, h, rnd } = S;
    S.pm = popMasks();
    const rows = 3, s = Math.ceil(h / rows), cols = Math.ceil(w / s);
    S.s = s; S.ox = (w - cols * s) / 2;
    S.tint = new Map();
    S.cells = [];
    const order = Array.from({ length: rows * cols }, (_, i) => i).sort(() => rnd() - 0.5);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const idx = j * cols + i;
      S.cells.push({ i, j, pal: (i + j * 3) % POP_PALS.length, t0: 0.4 + order.indexOf(idx) * (6.5 / (rows * cols)), img: null, key: '', mono: false, monoT: 19 + (cols - 1 - i) * 1.0 + rnd() * 0.6 });
    }
    S.cols = cols; S.nextSwap = 8;
  },
  render(S, cell) {
    const { s, rnd, pm } = S, c = U.canvas(s, s), g = c.getContext('2d'), P = POP_PALS[cell.pal], off = () => (rnd() - 0.5) * s * 0.05;
    if (cell.mono) {
      g.fillStyle = 'rgb(214,212,206)'; g.fillRect(0, 0, s, s);
    } else {
      g.fillStyle = U.rgb(P.bg); g.fillRect(0, 0, s, s);
      for (const name of ['hair', 'skin', 'eye', 'lips']) {
        const k = name + P[name].join(','); if (!S.tint.has(k)) S.tint.set(k, tinted(pm.layers[name], P[name]));
        g.drawImage(S.tint.get(k), off(), off(), s, s);
      }
    }
    const n = 46, sp = s / n, ox = off() * 0.5, oy = off() * 0.5;
    g.fillStyle = cell.mono ? 'rgba(30,30,30,0.85)' : '#151515';
    g.beginPath();
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const lum = pm.lum[Math.floor((j + 0.5) / n * pm.M) * pm.M + Math.floor((i + 0.5) / n * pm.M)];
      let r = sp * 0.62 * Math.pow(1 - lum, 0.9);
      if (cell.mono) r *= S.N.n2(i * 0.12 + cell.i * 7, j * 0.12) > -0.1 ? 0.75 : 0.15;
      if (r < sp * 0.08) continue;
      const x = i * sp + sp / 2 + ox, y = j * sp + sp / 2 + oy;
      g.moveTo(x + r, y); g.arc(x, y, r, 0, 6.2832);
    }
    g.fill();
    return c;
  },
  frame(S, t) {
    const { g, w, h, s } = S;
    if (t > S.nextSwap && t < 19) {
      const c = S.cells[Math.floor(S.rnd() * S.cells.length)];
      c.pal = (c.pal + 1 + Math.floor(S.rnd() * 5)) % POP_PALS.length; S.nextSwap = t + 0.55;
      AUDIO.hit({ freq: 3000, q: 2, gain: 0.04, decay: 0.05, wet: 0.1 });
    }
    g.globalCompositeOperation = 'source-over'; g.fillStyle = '#111'; g.fillRect(0, 0, w, h);
    for (const c of S.cells) {
      if (!c.mono && t > c.monoT) c.mono = true;
      const key = c.pal + (c.mono ? 'm' : '');
      if (c.key !== key) { c.img = this.render(S, c); c.key = key; }
      const k = U.smooth(c.t0, c.t0 + 0.45, t);
      if (k <= 0) continue;
      const x = S.ox + c.i * s, y = c.j * s;
      g.save(); g.beginPath(); g.rect(x, y, s * k, s); g.clip();
      g.globalAlpha = c.mono ? 1 - 0.55 * U.smooth(c.monoT, c.monoT + 6, t) : 1;
      g.drawImage(c.img, x, y); g.restore();
      if (k < 1) { g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(x + s * k - 3, y, 6, s); }
    }
  },
});

/* ───────────────────────── XIV. The Digital ───────────────────────── */
function archiveThumbs(S) {
  const list = [];
  for (const sc of SCENES) {
    if (!sc.swatch || sc.key === 'prologue' || sc.key === 'digital' || sc.key === 'now' || sc.key === 'epilogue') continue;
    if (ARCHIVE[sc.key]) { list.push({ c: ARCHIVE[sc.key], handle: sc.handle, key: sc.key }); continue; }
    const c = U.canvas(240, 135), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 240, 135);
    sc.swatch.forEach((col, i) => gr.addColorStop(i / (sc.swatch.length - 1), U.rgb(col)));
    g.fillStyle = gr; g.fillRect(0, 0, 240, 135);
    for (let k = 0; k < 40; k++) { g.fillStyle = U.rgb(sc.swatch[k % sc.swatch.length], 0.5); g.fillRect(S.rnd() * 240, S.rnd() * 135, 4 + S.rnd() * 40, 4 + S.rnd() * 30); }
    list.push({ c, handle: sc.handle, key: sc.key });
  }
  return list;
}
const GLYPHS = '01美光手♥▓░01AESTHETIC0101看见';

SCENES.push({
  key: 'digital', dur: 32, zoom: 0, name: { zh: '信号与噪声', en: 'Signal & Noise' },
  meta: { num: 'XIV', eraZh: '1990 — 2010 · 互联网', eraEn: '1990 – 2010 · The Network', zh: '信号与噪声', en: 'Signal & Noise',
    qZh: '“媒介即讯息。”', qEn: '“The medium is the message.”', by: '马歇尔·麦克卢汉 · Marshall McLuhan, 1964',
    lZh: '美被压缩、复制、点赞——在无尽的屏幕之间流动。', lEn: 'Beauty compressed, copied, liked — flowing across endless screens.' },
  swatch: [[0, 0, 0], [80, 220, 255], [255, 60, 120], [240, 240, 240]],
  audio: { root: 55, chord: [0, 12, 19], wave: 'square', cutoff: 600, level: 0.04,
    notes: { scale: [0, 3, 7, 10, 12], oct: [3, 4], rate: 0.09, wave: 'square', decay: 0.09, gain: 0.025, pattern: 'arp', cutoff: 4000, wet: 0.2 },
    hit: { every: 0.6, freq: 7000, q: 3, gain: 0.05, decay: 0.04, wet: 0.1 },
    drum: { every: 0.5, gain: 0.14, freq: 160, decay: 0.12, wet: 0.1 } },
  init(S) {
    const { w, h, u } = S;
    S.thumbs = archiveThumbs(S);
    S.tiny = U.canvas(8, 8);
    S.snow = U.canvas(160, 90);
    S.cols = Array.from({ length: Math.ceil(w / (16 * u)) }, () => ({ y: -S.rnd() * h, v: (4 + S.rnd() * 10) * u }));
    S.scroll = 0;
    const sl = U.canvas(4, Math.max(3, Math.round(3 * u))), sg = sl.getContext('2d');
    sg.fillStyle = 'rgba(0,0,0,0.35)'; sg.fillRect(0, 0, 4, 1);
    S.scan = S.g.createPattern(sl, 'repeat');
  },
  frame(S, t, dt) {
    const { g, w, h, u, rnd } = S, th = S.thumbs;
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    if (t < 10) {
      // Art history, rasterised and channel-surfed.
      const pick = (t < 6 ? th.find(x => x.key === 'starry') : th[Math.floor(t * 2.2) % th.length]) || th[0];
      const res = t < 6 ? Math.round(Math.pow(2, 2 + t * 0.85)) : 240;
      g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
      if (res < 240) {
        S.tiny.width = res; S.tiny.height = Math.max(1, Math.round(res * 9 / 16));
        const tg = S.tiny.getContext('2d'); tg.imageSmoothingEnabled = true; tg.drawImage(pick.c, 0, 0, S.tiny.width, S.tiny.height);
        g.imageSmoothingEnabled = false; g.drawImage(S.tiny, 0, 0, w, h); g.imageSmoothingEnabled = true;
      } else g.drawImage(pick.c, 0, 0, w, h);
      if (t > 6) this.glitch(S, 6 + (t - 6) * 4);
    } else if (t < 22) {
      // The feed: endless, accelerating.
      const speed = 60 * u * Math.exp((t - 10) * 0.32);
      S.scroll += speed * dt;
      g.fillStyle = t > 18 ? 'rgba(6,6,9,0.45)' : '#060609'; g.fillRect(0, 0, w, h);
      const ncol = Math.max(3, Math.round(w / h * 2.6)), cw = w / ncol, pad = 10 * u, tw = cw - 2 * pad, ih = tw * 9 / 16, chh = ih + 52 * u;
      g.font = `${12 * u}px "SF Mono",Menlo,monospace`; g.textBaseline = 'middle';
      for (let c = 0; c < ncol; c++) {
        const off = S.scroll * (1 + (c % 2) * 0.18) + c * 97 * u, first = Math.floor(off / chh);
        for (let r = first; r * chh - off < h; r++) {
          const y = r * chh - off, x = c * cw + pad, hsh = Math.abs((r * 73856093) ^ (c * 19349663)) % 9973, item = th[hsh % th.length];
          g.fillStyle = '#121218'; g.fillRect(x, y, tw, chh - pad);
          g.drawImage(item.c, x, y, tw, ih);
          g.fillStyle = 'rgba(230,230,240,0.9)'; g.fillText(item.handle, x + 8 * u, y + ih + 16 * u);
          const likes = Math.floor((hsh % 500 + 20) * Math.exp((t - 10) * 0.45));
          g.fillStyle = 'rgb(255,70,110)'; g.fillText('♥ ' + (likes > 999 ? (likes / 1000).toFixed(1) + 'k' : likes), x + 8 * u, y + ih + 34 * u);
        }
      }
      if (t > 17) this.glitch(S, (t - 17) * 6);
    } else {
      // Collapse into compression blocks, data and snow.
      g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(0, 0, w, h);
      const bs = 24 * u, n = Math.max(0, Math.round(40 * (1 - U.smooth(22, 29, t))));
      g.imageSmoothingEnabled = false;
      for (let k = 0; k < n; k++) {
        const it = th[Math.floor(rnd() * th.length)];
        g.drawImage(it.c, Math.floor(rnd() * 30) * 8, Math.floor(rnd() * 16) * 8, 8, 8, Math.floor(rnd() * w / bs) * bs, Math.floor(rnd() * h / bs) * bs, bs, bs);
      }
      g.imageSmoothingEnabled = true;
      g.font = `${15 * u}px "SF Mono",Menlo,monospace`; g.textBaseline = 'top';
      const ra = 1 - U.smooth(29, 31, t);
      S.cols.forEach((c, i) => {
        c.y += c.v * dt * 60; if (c.y > h) c.y = -rnd() * h * 0.3;
        g.fillStyle = `rgba(200,240,255,${0.9 * ra})`; g.fillText(GLYPHS[Math.floor(rnd() * GLYPHS.length)], i * 16 * u, c.y);
      });
      const sn = U.smooth(27.5, 29.5, t) * (1 - U.smooth(30.6, 31.4, t));
      if (sn > 0) {
        const sg = S.snow.getContext('2d'), id = sg.createImageData(160, 90);
        for (let i = 0; i < id.data.length; i += 4) { const v = rnd() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
        sg.putImageData(id, 0, 0);
        g.globalAlpha = sn; g.imageSmoothingEnabled = false; g.drawImage(S.snow, 0, 0, w, h); g.imageSmoothingEnabled = true; g.globalAlpha = 1;
      }
      if (t > 31.2) { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); }
    }
    g.fillStyle = S.scan; g.fillRect(0, 0, w, h);
  },
  glitch(S, amt) {
    const { g, w, h, u, rnd } = S, n = Math.min(40, Math.floor(amt));
    for (let k = 0; k < n; k++) {
      const sy = rnd() * h, sh = (2 + rnd() * 40) * u, dx = (rnd() - 0.5) * 120 * u * Math.min(1, amt / 10);
      g.drawImage(S.c, 0, sy, w, sh, dx, sy, w, sh);
    }
    if (amt > 3) {
      g.globalCompositeOperation = 'difference'; g.globalAlpha = Math.min(0.5, amt * 0.03);
      g.drawImage(S.c, (rnd() - 0.5) * 16 * u, 0);
      g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    }
  },
});

/* ───────────────────────── XV. Now ───────────────────────── */
SCENES.push({
  key: 'now', dur: 42, zoom: 0.02, name: { zh: '镜中人', en: 'The Mirror' },
  meta: { num: 'XV', eraZh: '2020年代 · 此刻', eraEn: 'The 2020s · Now', zh: '镜中人', en: 'The Mirror' },
  swatch: [[6, 8, 14], [160, 190, 255], [255, 255, 255], [176, 96, 44]],
  captions: [
    { slot: 'a', at: 1.2, to: 9, kind: 'title', num: 'XV', eraZh: '2020年代 · 此刻', eraEn: 'The 2020s · Now', zh: '镜中人', en: 'The Mirror' },
    { slot: 'a', at: 10, to: 19.5, kind: 'quote', zh: '“我们塑造了工具，此后，工具塑造了我们。”', en: '“We shape our tools, and thereafter our tools shape us.”', by: '约翰·卡尔金 · John M. Culkin, 1967' },
    { slot: 'b', at: 20.5, to: 27.5, kind: 'line', zh: '我们从未如此相连，也从未如此孤独。', en: 'Never so connected. Never so alone.' },
    { slot: 'b', at: 29, to: 38.5, kind: 'line', zh: '在算法与噪声之间，我们仍在寻找同一样东西：被看见。', en: 'Between algorithms and noise, we are still searching for the same thing: to be seen.' },
  ],
  audio: { root: 49, chord: [0, 7, 12, 14, 19], wave: 'sine', cutoff: 800, level: 0.11,
    notes: { scale: [0, 2, 3, 7, 8, 10], oct: [2, 3], rate: 1.8, wave: 'sine', decay: 3.2, gain: 0.07, harm: 2.0, wet: 0.85 },
    drum: { every: 1.0, gain: 0.3, freq: 75, decay: 0.35, double: true, wet: 0.2 } },
  init(S) {
    const { rnd } = S, n = S.n = 1700;
    S.p = new Float32Array(n * 3); S.v = new Float32Array(n * 3);
    S.cloud = new Float32Array(n * 3); S.face = new Float32Array(n * 3); S.hand = new Float32Array(n * 3);
    const pm = U.profileMask(), hm = U.handMask(), ne = Math.round(n * 0.36);
    const face = [...pm.edge(ne, rnd), ...pm.sample(n - ne, rnd)], hand = [...hm.edge(ne, rnd), ...hm.sample(n - ne, rnd)];
    for (let i = 0; i < n; i++) {
      const th = rnd() * 6.283, ph = Math.acos(2 * rnd() - 1), r = 0.4 + 0.9 * Math.cbrt(rnd());
      S.cloud[i * 3] = Math.sin(ph) * Math.cos(th) * r * 1.4; S.cloud[i * 3 + 1] = Math.cos(ph) * r * 0.9; S.cloud[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * r;
      const f = face[i % face.length], hd = hand[i % hand.length];
      S.face[i * 3] = f[0] * 1.9 - 0.05; S.face[i * 3 + 1] = f[1] * 1.9; S.face[i * 3 + 2] = (rnd() - 0.5) * 0.12 + 0.2 * Math.sqrt(Math.max(0, 1 - 4 * f[1] * f[1]));
      S.hand[i * 3] = hd[0] * 1.8; S.hand[i * 3 + 1] = hd[1] * 1.8 + 0.05; S.hand[i * 3 + 2] = (rnd() - 0.5) * 0.08;
      for (let k = 0; k < 3; k++) S.p[i * 3 + k] = S.cloud[i * 3 + k] * 2.2;
    }
    // Colours carry the whole history: sampled from the chapters already seen.
    const pool = [];
    for (const it of archiveThumbs(S)) {
      const d = it.c.getContext('2d').getImageData(0, 0, it.c.width, it.c.height).data;
      for (let k = 0; k < 30; k++) { const o = Math.floor(rnd() * (d.length / 4)) * 4; pool.push([d[o], d[o + 1], d[o + 2]]); }
    }
    S.hist = Array.from({ length: n }, () => { const c = pool[Math.floor(rnd() * pool.length)]; const l = Math.max(c[0], c[1], c[2]); return l < 60 ? U.mix(c, [160, 190, 255], 0.6) : c; });
    S.delay = Float32Array.from({ length: n }, () => rnd() * 1.6);
    S.sx = new Float32Array(n); S.sy = new Float32Array(n); S.sz = new Float32Array(n);
  },
  frame(S, t, dt) {
    const { g, w, h, u, N, n, p, v } = S;
    const phases = [0, 9, 20, 28], dtc = Math.min(dt, 0.05);
    for (let i = 0; i < n; i++) {
      const tt = t - S.delay[i], ph = tt < phases[1] ? 0 : tt < phases[2] ? 1 : tt < phases[3] ? 2 : 3, o = i * 3;
      let tx, ty, tz;
      if (ph === 0) { tx = S.cloud[o]; ty = S.cloud[o + 1]; tz = S.cloud[o + 2]; }
      else if (ph === 1) { tx = S.face[o]; ty = S.face[o + 1]; tz = S.face[o + 2]; }
      else if (ph === 2) {
        const lane = i % 11, hsh = (i * 0.7548776) % 1;
        ty = -0.95 + lane * 0.19 + (hsh - 0.5) * 0.05 + 0.03 * Math.sin(t * 2 + i); tz = (lane % 3 - 1) * 0.3;
        tx = (((i * 0.6180339) % 1) * 3.4 + t * 0.32 * (1 + (lane % 3) * 0.6) * (0.7 + 0.6 * hsh)) % 3.4 - 1.7;
        if (Math.abs(tx - p[o]) > 1.6) { p[o] = tx; v[o] = 0; }
      } else { tx = S.hand[o]; ty = S.hand[o + 1]; tz = S.hand[o + 2]; }
      const jit = ph === 0 ? 0.6 : ph === 3 ? 0.05 : 0.15;
      v[o] += ((tx - p[o]) * 3.2 + N.n3(p[o] * 1.5, p[o + 1] * 1.5, t * 0.2) * jit) * dtc;
      v[o + 1] += ((ty - p[o + 1]) * 3.2 + N.n3(p[o + 1] * 1.5 + 9, p[o + 2] * 1.5, t * 0.2) * jit) * dtc;
      v[o + 2] += ((tz - p[o + 2]) * 3.2) * dtc;
      const damp = Math.pow(0.9, dtc * 60);
      for (let k = 0; k < 3; k++) { v[o + k] *= damp; p[o + k] += v[o + k] * dtc * 6; }
    }
    // Heartbeat and slow turning gaze.
    const bt = t % 1, beat = Math.exp(-Math.pow(bt / 0.07, 2)) + 0.6 * Math.exp(-Math.pow((bt - 0.27) / 0.07, 2));
    const scale = Math.min(w, h) * 0.42 * (1 + 0.012 * beat), ry = (t < 9 ? t * 0.08 : 0.72 * (1 - U.smooth(8.5, 13, t))) + 0.22 * Math.sin(t * 0.21) * U.smooth(10, 15, t), cr = Math.cos(ry), sr = Math.sin(ry);
    const ccx = w / 2, ccy = h * 0.47;
    for (let i = 0; i < n; i++) {
      const o = i * 3, x = p[o] * cr + p[o + 2] * sr, z = -p[o] * sr + p[o + 2] * cr, ps = 3 / (3 + z);
      S.sx[i] = ccx + x * scale * ps; S.sy[i] = ccy + p[o + 1] * scale * ps; S.sz[i] = ps;
    }
    g.globalCompositeOperation = 'source-over';
    g.fillStyle = 'rgba(5,6,12,0.38)'; g.fillRect(0, 0, w, h);
    // Network threads between near neighbours.
    const linkW = t < 9 ? 1 : t < 20 ? 0.75 : t < 28 ? 0.25 : Math.max(0, 0.4 - (t - 28) * 0.08);
    if (linkW > 0.01) {
      const L = 28 * u, cell = new Map(), key = (a, b) => a * 73856093 ^ b * 19349663;
      for (let i = 0; i < n; i++) { const k = key(Math.floor(S.sx[i] / L), Math.floor(S.sy[i] / L)); let a = cell.get(k); if (!a) cell.set(k, a = []); a.push(i); }
      const bins = [new Path2D(), new Path2D(), new Path2D()];
      for (let i = 0; i < n; i++) {
        const cx = Math.floor(S.sx[i] / L), cy = Math.floor(S.sy[i] / L);
        let links = 0;
        for (let ox = 0; ox <= 1 && links < 3; ox++) for (let oy = -1; oy <= 1 && links < 3; oy++) {
          const a = cell.get(key(cx + ox, cy + oy)); if (!a) continue;
          for (const j of a) {
            if (j <= i) continue;
            const d = Math.hypot(S.sx[i] - S.sx[j], S.sy[i] - S.sy[j]);
            if (d < L) { const b = d < L * 0.33 ? 0 : d < L * 0.66 ? 1 : 2; bins[b].moveTo(S.sx[i], S.sy[i]); bins[b].lineTo(S.sx[j], S.sy[j]); if (++links >= 3) break; }
          }
        }
      }
      g.lineWidth = 0.7 * u;
      bins.forEach((b, k) => { g.strokeStyle = `rgba(150,185,255,${(0.32 - k * 0.09) * linkW})`; g.stroke(b); });
    }
    g.globalCompositeOperation = 'lighter';
    const warm = U.smooth(27, 33, t), cool = U.smooth(8, 12, t) * (1 - warm), fade = 1 - U.smooth(38.5, 41.5, t);
    for (let i = 0; i < n; i++) {
      let c = S.hist[i];
      if (cool > 0) c = U.mix(c, [175, 205, 255], cool * 0.7);
      if (warm > 0) c = U.mix(c, i % 5 ? [214, 112, 52] : [255, 210, 150], warm);
      const s = (1.4 + S.sz[i] * 1.4) * u;
      g.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${0.75 * fade})`;
      g.fillRect(S.sx[i] - s / 2, S.sy[i] - s / 2, s, s);
    }
    if (warm > 0) {
      const gr = g.createRadialGradient(ccx, ccy, 0, ccx, ccy, scale * 1.2);
      gr.addColorStop(0, `rgba(255,150,80,${0.12 * warm * fade * (0.8 + 0.2 * beat)})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }
    g.globalCompositeOperation = 'source-over';
  },
});

/* ───────────────────────── Epilogue ───────────────────────── */
SCENES.push({
  key: 'epilogue', dur: 34, zoom: 0.04, name: { zh: '尾声', en: 'Epilogue' },
  swatch: [[150, 52, 28], [180, 210, 255]],
  captions: [
    { slot: 'b', at: 3, to: 11.5, kind: 'line', zh: '四万年后，我们依然把手按在发光的墙上。', en: 'Forty thousand years later, we still press our hands against a glowing wall.' },
    { slot: 'b', at: 12.5, to: 20, kind: 'line', zh: '每一种美，都是人类在说：我在这里。', en: 'Every kind of beauty is a human voice saying: I am here.' },
    { slot: 'b', at: 21, to: 32.5, kind: 'hero', zh: '手印', en: 'HANDPRINT', subZh: '全部影像与声音由代码实时生成', subEn: 'Every image and every sound generated in real time by code' },
  ],
  audio: { root: 55, chord: [0, 7, 12, 16], wave: 'sine', cutoff: 650, level: 0.12, noise: 0.012, noiseFreq: 400,
    notes: { scale: [0, 4, 7, 9, 12], oct: [2, 3], rate: 2.2, wave: 'sine', decay: 4, gain: 0.07, harm: 3, wet: 0.9, delay: 2 },
    drum: { every: 4.8, gain: 0.25, freq: 70, decay: 1.2, wet: 0.6 } },
  init(S) {
    const { w, h, u } = S;
    S.rock = rockTexture(S);
    S.art = S.layer();
    S.mask = U.handMask();
    S.H = { x: w * 0.5, y: h * 0.42, rot: -0.1, s: 135 * u, col: [158, 50, 26], flip: 1 };
    const sil = U.canvas(w / 8, h / 8), sg = sil.getContext('2d');
    sg.fillStyle = 'rgb(110,160,255)'; sg.translate(S.H.x / 8, S.H.y / 8); sg.rotate(S.H.rot); sg.scale(S.H.s / 8 * 1.12, S.H.s / 8 * 1.12); sg.strokeStyle = sg.fillStyle;
    U.drawHand(sg);
    S.glow = U.blurred(sil, 2); S.glow2 = U.blurred(sil, 6);
    S.px = [];
  },
  frame(S, t, dt) {
    const { g, w, h, u, N } = S, H = S.H;
    if (t > 0.8 && t < 6) sprayHand(S, S.art.g, H, S.mask, Math.min(2600, Math.round(80000 * dt)), 1.6);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    g.drawImage(S.rock, 0, 0, w, h);
    g.globalCompositeOperation = 'multiply'; g.drawImage(S.art.c, 0, 0); g.globalCompositeOperation = 'source-over';
    const k = U.smooth(4, 12, t), fl = 0.92 + 0.05 * N.n2(t * 4, 1);
    g.globalCompositeOperation = 'multiply';
    const R = Math.max(w, h) * (0.45 + 0.25 * U.smooth(0, 4, t)) * fl;
    const gr = g.createRadialGradient(H.x, H.y, 0, H.x, H.y, R);
    gr.addColorStop(0, U.rgb(U.mix([255, 222, 180], [236, 232, 250], k))); gr.addColorStop(0.45, U.rgb(U.mix([200, 130, 80], [150, 120, 120], k)));
    gr.addColorStop(1, 'rgb(6,5,6)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'lighter';
    const pulse = 0.85 + 0.15 * Math.sin(t * 1.6);
    g.globalAlpha = 0.22 * k * pulse; g.drawImage(S.glow, 0, 0, w, h);
    g.globalAlpha = 0.45 * k * pulse; g.drawImage(S.glow2, 0, 0, w, h);
    g.globalAlpha = 1;
    // Embers and pixels rising together: fire and screen.
    if (S.rnd() < 0.6 * k) S.px.push({ x: H.x + (S.rnd() - 0.5) * 260 * u, y: H.y + 140 * u, v: (0.5 + S.rnd()) * u, life: 1, cool: S.rnd() < 0.5 });
    for (const q of S.px) {
      q.y -= q.v * dt * 60; q.x += N.n2(q.y * 0.01 / u, q.v) * 0.8 * u; q.life -= dt * 0.2;
      g.fillStyle = q.cool ? `rgba(150,200,255,${q.life * 0.7})` : `rgba(255,170,90,${q.life * 0.7})`;
      g.fillRect(q.x, q.y, 2 * u, 2 * u);
    }
    S.px = S.px.filter(q => q.life > 0);
    g.globalCompositeOperation = 'source-over';
    const out = U.smooth(29, 33.5, t);
    if (out > 0) { g.fillStyle = `rgba(0,0,0,${out})`; g.fillRect(0, 0, w, h); }
  },
});
