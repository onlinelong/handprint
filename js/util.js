'use strict';
// Shared toolkit: seeded randomness, simplex noise, geometry, textures, plotting.
const U = (() => {
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Simplex noise (after Stefan Gustavson), seeded.
  function makeNoise(seed) {
    const rnd = mulberry32(seed);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; }
    const perm = new Uint8Array(512), pm = new Uint8Array(512);
    for (let i = 0; i < 512; i++) { perm[i] = p[i & 255]; pm[i] = perm[i] % 12; }
    const gr = new Float32Array([1,1,0,-1,1,0,1,-1,0,-1,-1,0,1,0,1,-1,0,1,1,0,-1,-1,0,-1,0,1,1,0,-1,1,0,1,-1,0,-1,-1]);
    const F2 = 0.5 * (Math.sqrt(3) - 1), G2 = (3 - Math.sqrt(3)) / 6, F3 = 1 / 3, G3 = 1 / 6;

    function n2(xin, yin) {
      let n0 = 0, n1 = 0, n2v = 0;
      const s = (xin + yin) * F2, i = Math.floor(xin + s), j = Math.floor(yin + s);
      const t = (i + j) * G2, x0 = xin - (i - t), y0 = yin - (j - t);
      const i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
      const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2, x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
      const ii = i & 255, jj = j & 255;
      let t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 > 0) { const g = pm[ii + perm[jj]] * 3; t0 *= t0; n0 = t0 * t0 * (gr[g] * x0 + gr[g + 1] * y0); }
      let t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 > 0) { const g = pm[ii + i1 + perm[jj + j1]] * 3; t1 *= t1; n1 = t1 * t1 * (gr[g] * x1 + gr[g + 1] * y1); }
      let t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 > 0) { const g = pm[ii + 1 + perm[jj + 1]] * 3; t2 *= t2; n2v = t2 * t2 * (gr[g] * x2 + gr[g + 1] * y2); }
      return 70 * (n0 + n1 + n2v);
    }

    function n3(xin, yin, zin) {
      let n0 = 0, n1 = 0, n2v = 0, n3v = 0;
      const s = (xin + yin + zin) * F3;
      const i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
      const t = (i + j + k) * G3;
      const x0 = xin - (i - t), y0 = yin - (j - t), z0 = zin - (k - t);
      let i1, j1, k1, i2, j2, k2;
      if (x0 >= y0) {
        if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
        else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
      } else {
        if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
        else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
        else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      }
      const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
      const x2 = x0 - i2 + 2 * G3, y2 = y0 - j2 + 2 * G3, z2 = z0 - k2 + 2 * G3;
      const x3 = x0 - 1 + 3 * G3, y3 = y0 - 1 + 3 * G3, z3 = z0 - 1 + 3 * G3;
      const ii = i & 255, jj = j & 255, kk = k & 255;
      let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 > 0) { const g = pm[ii + perm[jj + perm[kk]]] * 3; t0 *= t0; n0 = t0 * t0 * (gr[g] * x0 + gr[g + 1] * y0 + gr[g + 2] * z0); }
      let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 > 0) { const g = pm[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3; t1 *= t1; n1 = t1 * t1 * (gr[g] * x1 + gr[g + 1] * y1 + gr[g + 2] * z1); }
      let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 > 0) { const g = pm[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3; t2 *= t2; n2v = t2 * t2 * (gr[g] * x2 + gr[g + 1] * y2 + gr[g + 2] * z2); }
      let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 > 0) { const g = pm[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3; t3 *= t3; n3v = t3 * t3 * (gr[g] * x3 + gr[g + 1] * y3 + gr[g + 2] * z3); }
      return 32 * (n0 + n1 + n2v + n3v);
    }

    function fbm2(x, y, o = 4) {
      let s = 0, a = 0.5, f = 1, n = 0;
      for (let i = 0; i < o; i++) { s += a * n2(x * f, y * f); n += a; a *= 0.5; f *= 2.03; }
      return s / n;
    }
    function fbm3(x, y, z, o = 3) {
      let s = 0, a = 0.5, f = 1, n = 0;
      for (let i = 0; i < o; i++) { s += a * n3(x * f, y * f, z * f); n += a; a *= 0.5; f *= 2.03; }
      return s / n;
    }
    return { n2, n3, fbm2, fbm3 };
  }

  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  function gauss(rnd) {
    let u = 0, v = 0;
    while (u === 0) u = rnd();
    while (v === 0) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185 * v);
  }

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
    return c;
  }

  // Procedural texture at reduced resolution; fn(X, Y, out) gets design-unit coords.
  function texture(w, h, u, fn, maxW = 760) {
    const s = Math.min(1, maxW / w);
    const tw = Math.max(2, Math.round(w * s)), th = Math.max(2, Math.round(h * s));
    const c = canvas(tw, th), g = c.getContext('2d');
    const id = g.createImageData(tw, th), d = id.data, k = (w / tw) / u, o = [0, 0, 0, 255];
    let p = 0;
    for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
      o[3] = 255; fn(x * k, y * k, o);
      d[p] = o[0]; d[p + 1] = o[1]; d[p + 2] = o[2]; d[p + 3] = o[3]; p += 4;
    }
    g.putImageData(id, 0, 0);
    return c;
  }

  // Cheap blur: downscale then upscale.
  function blurred(src, factor) {
    const c = canvas(src.width / factor, src.height / factor), g = c.getContext('2d');
    g.imageSmoothingQuality = 'high';
    g.drawImage(src, 0, 0, c.width, c.height);
    return c;
  }

  function catmull(p, seg = 10) {
    const out = [];
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      for (let s = 0; s < seg; s++) {
        const t = s / seg, t2 = t * t, t3 = t2 * t;
        const f = k => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3);
        out.push([f(0), f(1)]);
      }
    }
    out.push(p[p.length - 1]);
    return out;
  }

  function resample(pts, spacing) {
    if (pts.length < 2) return pts.slice();
    const out = [pts[0]];
    let carry = 0;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
      const L = Math.hypot(x1 - x0, y1 - y0);
      let d = spacing - carry;
      while (d <= L) { const t = d / L; out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]); d += spacing; }
      carry = L - (d - spacing);
    }
    out.push(pts[pts.length - 1]);
    return out;
  }
  const linePts = (x0, y0, x1, y1, step) => resample([[x0, y0], [x1, y1]], step);
  function arcPts(cx, cy, r, a0, a1, step) {
    const n = Math.max(2, Math.ceil(Math.abs(a1 - a0) * r / step));
    const out = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return out;
  }

  // Progressive line drawing onto a persistent context.
  class Plotter {
    constructor(g) { this.g = g; this.items = []; }
    add(pts, t0, dur, st) { this.items.push({ pts, t0, dur, st, last: 0, done: false }); return this; }
    update(t) {
      const g = this.g;
      for (const it of this.items) {
        if (it.done || t < it.t0) continue;
        const k = clamp((t - it.t0) / it.dur), n = Math.floor(k * (it.pts.length - 1));
        if (n > it.last) {
          g.save();
          g.strokeStyle = it.st.color; g.lineWidth = it.st.width; g.globalAlpha = it.st.alpha ?? 1;
          g.lineCap = it.last ? 'butt' : 'round'; g.lineJoin = 'round';
          g.beginPath(); g.moveTo(it.pts[it.last][0], it.pts[it.last][1]);
          for (let i = it.last + 1; i <= n; i++) g.lineTo(it.pts[i][0], it.pts[i][1]);
          g.stroke(); g.restore();
          it.last = n;
        }
        if (k >= 1) it.done = true;
      }
    }
  }

  // A human hand at unit scale, palm centred at the origin (fingers point to -y).
  function drawHand(g) {
    g.beginPath(); g.ellipse(0, 0.05, 0.42, 0.5, 0, 0, Math.PI * 2); g.fill();
    g.lineCap = 'round';
    const F = [[-0.30, -0.30, -0.28, 0.66, 0.19], [-0.10, -0.40, -0.09, 0.84, 0.2], [0.11, -0.40, 0.06, 0.80, 0.2], [0.30, -0.30, 0.24, 0.62, 0.18]];
    for (const f of F) {
      g.lineWidth = f[4]; g.beginPath(); g.moveTo(f[0], f[1]);
      g.lineTo(f[0] + Math.sin(f[2]) * f[3], f[1] - Math.cos(f[2]) * f[3]); g.stroke();
    }
    g.lineWidth = 0.23; g.beginPath(); g.moveTo(-0.30, 0.12);
    g.lineTo(-0.30 + Math.sin(-1.0) * 0.55, 0.12 - Math.cos(-1.0) * 0.55); g.stroke();
    g.beginPath(); g.moveTo(-0.28, 0.35); g.lineTo(-0.26, 1.05); g.lineTo(0.28, 1.05); g.lineTo(0.30, 0.35); g.closePath(); g.fill();
  }

  // Human profile facing right, in a unit box.
  const PROFILE = [[0.30,0.12],[0.40,0.06],[0.52,0.05],[0.62,0.09],[0.68,0.16],[0.71,0.25],[0.72,0.32],[0.74,0.36],[0.72,0.40],[0.73,0.43],
    [0.78,0.50],[0.80,0.54],[0.77,0.56],[0.74,0.57],[0.745,0.60],[0.755,0.62],[0.74,0.64],[0.75,0.66],[0.73,0.68],[0.73,0.72],
    [0.70,0.76],[0.64,0.78],[0.58,0.78],[0.58,0.86],[0.60,1.0],[0.30,1.0],[0.32,0.86],[0.28,0.75],[0.22,0.60],[0.20,0.45],[0.22,0.28]];

  function maskSampler(size, draw) {
    const c = canvas(size, size), g = c.getContext('2d');
    g.fillStyle = '#fff'; g.strokeStyle = '#fff';
    draw(g, size);
    const d = g.getImageData(0, 0, size, size).data;
    const inside = (x, y) => {
      x |= 0; y |= 0;
      if (x < 0 || y < 0 || x >= size || y >= size) return false;
      return d[(y * size + x) * 4 + 3] > 127;
    };
    const sample = (n, rnd) => {
      const out = []; let guard = 0;
      while (out.length < n && guard++ < n * 400) {
        const x = rnd() * size, y = rnd() * size;
        if (inside(x, y)) out.push([x / size - 0.5, y / size - 0.5]);
      }
      return out;
    };
    // Points on the silhouette edge: inside, with an outside neighbour.
    const edge = (n, rnd) => {
      const out = []; let guard = 0;
      while (out.length < n && guard++ < n * 4000) {
        const x = rnd() * size, y = rnd() * size;
        if (inside(x, y) && (!inside(x + 2, y) || !inside(x - 2, y) || !inside(x, y + 2) || !inside(x, y - 2))) out.push([x / size - 0.5, y / size - 0.5]);
      }
      return out;
    };
    return { size, canvas: c, inside, sample, edge };
  }

  const HAND = { size: 256, o: 143, k: 102.4 };
  function handMask() {
    const m = maskSampler(HAND.size, g => { g.translate(HAND.o, HAND.o); g.scale(HAND.k, HAND.k); drawHand(g); });
    m.insideU = (lx, ly) => m.inside(HAND.o + lx * HAND.k, HAND.o + ly * HAND.k);
    return m;
  }
  function profileMask() {
    return maskSampler(256, (g, S) => {
      g.beginPath();
      PROFILE.forEach((p, i) => { const x = (0.05 + p[0] * 0.9) * S, y = (0.03 + p[1] * 0.94) * S; i ? g.lineTo(x, y) : g.moveTo(x, y); });
      g.closePath(); g.fill();
    });
  }

  return { mulberry32, makeNoise, clamp, lerp, smooth, ease, mix, rgb, gauss, canvas, texture, blurred,
    catmull, resample, linePts, arcPts, Plotter, drawHand, PROFILE, maskSampler, handMask, profileMask, HAND };
})();
