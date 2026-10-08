'use strict';
(() => {
  const OV = 3.2; // crossfade between chapters, seconds
  const $ = s => document.querySelector(s);
  const stage = $('#stage'), G = stage.getContext('2d');
  const qs = new URLSearchParams(location.search);
  const CH = SCENES;
  const starts = [];
  let TOTAL = 0;
  CH.forEach((c, i) => { starts.push(TOTAL); TOTAL += c.dur - (i < CH.length - 1 ? OV : 0); });
  TOTAL += 0.5;

  let W = 0, H = 0, T = 0, playing = false, last = performance.now(), floor = 0, primary = -1, dirty = true;
  const live = new Map();

  const nameOf = c => c.name || { zh: c.meta.zh, en: c.meta.en };
  const numOf = c => (c.meta && c.meta.num) || '';

  function makeS(i) {
    const c = U.canvas(W, H), seed = 1009 + i * 7919;
    const S = { c, g: c.getContext('2d'), w: W, h: H, u: Math.min(W, H) / 1000, cx: W / 2, cy: H / 2, dur: CH[i].dur, rnd: U.mulberry32(seed), N: U.makeNoise(seed) };
    S.layer = () => { const c2 = U.canvas(W, H); return { c: c2, g: c2.getContext('2d') }; };
    return S;
  }
  function create(i) { const S = makeS(i); CH[i].init(S); return { S, captured: false }; }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    W = Math.round(innerWidth * dpr); H = Math.round(innerHeight * dpr);
    stage.width = W; stage.height = H;
    for (const i of [...live.keys()]) live.set(i, create(i));
    dirty = true;
  }
  let rt = 0;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 250); });

  /* ── Captions ── */
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const chars = (s, cls, d0 = 0) => `<span class="${cls}">` + [...s].map((ch, i) => `<i style="transition-delay:${(d0 + i * 0.045).toFixed(3)}s">${esc(ch)}</i>`).join('') + '</span>';
  const words = (s, cls, d0 = 0.5) => `<span class="${cls}">` + s.split(' ').map((w, i) => `<i style="transition-delay:${(d0 + i * 0.055).toFixed(3)}s">${esc(w)}</i>`).join(' ') + '</span>';
  function capHTML(c) {
    switch (c.kind) {
      case 'title': return `<div class="k-title"><div class="num">${esc(c.num)}</div><div class="era">${esc(c.eraZh)}<br>${esc(c.eraEn)}</div>${chars(c.zh, 'zh', 0.2)}${words(c.en, 'en', 0.7)}</div>`;
      case 'quote': return `<div class="k-quote">${chars(c.zh, 'zh')}${words(c.en, 'en', 0.9)}${c.by ? `<span class="by">— ${esc(c.by)}</span>` : ''}</div>`;
      case 'line': return `<div class="k-line">${chars(c.zh, 'zh')}${words(c.en, 'en', 0.9)}</div>`;
      case 'hero': return `<div class="k-hero">${chars(c.zh, 'zh', 0.2)}${chars(c.en, 'en', 0.9)}<span class="sub">${esc(c.subZh)}<br><em>${esc(c.subEn)}</em></span></div>`;
    }
    return '';
  }
  function capsFor(i) {
    const c = CH[i];
    if (c._caps) return c._caps;
    let caps = c.captions;
    if (!caps) {
      const m = c.meta, d = c.dur;
      caps = [
        { slot: 'a', at: 1.2, to: 11, kind: 'title', num: m.num, eraZh: m.eraZh, eraEn: m.eraEn, zh: m.zh, en: m.en },
        { slot: 'a', at: 12, to: d * 0.7, kind: 'quote', zh: m.qZh, en: m.qEn, by: m.by },
        { slot: 'b', at: d * 0.7 + 0.5, to: d - 3.6, kind: 'line', zh: m.lZh, en: m.lEn },
      ];
    }
    return (c._caps = caps);
  }
  const slots = { a: { el: $('#cap-a'), cur: null, shown: false, hideAt: 0 }, b: { el: $('#cap-b'), cur: null, shown: false, hideAt: 0 } };
  function updateCaptions(i, t) {
    const caps = capsFor(i), now = performance.now();
    for (const k of ['a', 'b']) {
      const s = slots[k];
      let want = null;
      for (const cp of caps) if (cp.slot === k && t >= cp.at && t < cp.to) want = cp;
      if (want !== s.cur) {
        if (s.shown) { s.el.classList.remove('on'); s.hideAt = now; }
        s.cur = want; s.shown = false;
      }
      if (s.cur && !s.shown && now >= s.hideAt + 800) {
        s.el.innerHTML = capHTML(s.cur); void s.el.offsetWidth; s.el.classList.add('on'); s.shown = true;
      }
    }
    document.body.classList.toggle('has-cap', slots.a.shown || slots.b.shown);
  }
  function clearCaptions() { for (const s of Object.values(slots)) { s.el.classList.remove('on'); s.cur = null; s.shown = false; s.hideAt = performance.now(); } }

  /* ── HUD ── */
  const tl = $('#timeline'), fill = $('#tl-fill');
  CH.forEach((c, i) => {
    const seg = document.createElement('button');
    seg.className = 'seg'; seg.style.flexGrow = c.dur - (i < CH.length - 1 ? OV : 0);
    const n = nameOf(c);
    seg.innerHTML = `<span class="tip">${numOf(c) ? numOf(c) + ' · ' : ''}${esc(n.zh)}<em>${esc(n.en)}</em></span>`;
    seg.addEventListener('click', e => { e.stopPropagation(); go(i); });
    tl.appendChild(seg);
  });
  function setPrimary(i) {
    if (i === primary) return;
    primary = i;
    const c = CH[i], n = nameOf(c);
    $('#chapter').innerHTML = `<b>${numOf(c) || '·'}</b> ${esc(n.zh)} <em>${esc(n.en)}</em>`;
    document.body.classList.toggle('ink-dark', c.ink === 'dark');
    [...tl.children].forEach((s, k) => s.classList.toggle('cur', k === i));
    AUDIO.setScene(c.audio);
  }

  /* ── Timeline control ── */
  function go(i, ff = 0) {
    i = Math.max(0, Math.min(CH.length - 1, i));
    T = starts[i] + 0.001; floor = i; live.clear(); clearCaptions(); primary = -1; dirty = true;
    if (ff > 0) { // fast-forward (used for previews and testing)
      live.set(i, create(i));
      const L = live.get(i), step = 1 / 30;
      for (let t = 0; t < ff; t += step) CH[i].frame(L.S, t, step);
      T = starts[i] + ff;
    }
    $('#end').classList.remove('show');
  }
  function togglePlay(force) {
    playing = force ?? !playing;
    document.body.classList.toggle('paused', !playing);
    playing ? AUDIO.resume() : AUDIO.pause();
    last = performance.now();
  }

  function activeAt(T) {
    const a = [];
    CH.forEach((c, i) => { if (i >= floor && T >= starts[i] && T < starts[i] + c.dur) a.push(i); });
    if (!a.length) a.push(CH.length - 1);
    return a;
  }

  function capture(i, L) {
    const c = CH[i];
    if (L.captured || !c.handle) return;
    L.captured = true;
    const th = U.canvas(240, 135), tg = th.getContext('2d'), S = L.S, sh = S.w * 135 / 240;
    tg.drawImage(S.c, 0, Math.max(0, (S.h - sh) / 2), S.w, Math.min(S.h, sh), 0, 0, 240, 135);
    ARCHIVE[c.key] = th;
  }

  function render(dt) {
    const act = activeAt(T);
    for (const i of [...live.keys()]) if (!act.includes(i) && !(i === act[act.length - 1] + 1)) live.delete(i);
    for (const i of act) {
      if (!live.has(i)) live.set(i, create(i));
      const L = live.get(i), t = T - starts[i];
      if (dt > 0 || dirty) CH[i].frame(L.S, Math.max(0, t), dt);
      if (t > CH[i].dur - OV - 0.4) capture(i, L);
    }
    // Prepare the next chapter shortly before it is needed, so its setup cost lands outside the crossfade.
    const nx = act[act.length - 1] + 1;
    if (nx < CH.length && !live.has(nx) && T > starts[nx] - 1.4) live.set(nx, create(nx));

    G.setTransform(1, 0, 0, 1, 0, 0); G.globalAlpha = 1; G.globalCompositeOperation = 'source-over';
    G.fillStyle = '#000'; G.fillRect(0, 0, W, H);
    act.forEach((i, k) => {
      const c = CH[i], t = Math.max(0, T - starts[i]);
      const a = k === 0 && i === floor ? U.smooth(0, i === 0 ? 0.01 : 1.2, t) : U.ease(U.clamp(t / OV));
      const z = 1 + (c.zoom ?? 0.035) * (t / c.dur);
      G.globalAlpha = a;
      G.setTransform(z, 0, 0, z, W / 2 * (1 - z), H / 2 * (1 - z));
      G.drawImage(live.get(i).S.c, 0, 0);
    });
    G.setTransform(1, 0, 0, 1, 0, 0); G.globalAlpha = 1;
    const top = act[act.length - 1];
    const p = act.length > 1 && T - starts[top] < OV * 0.5 ? act[act.length - 2] : top;
    setPrimary(p);
    updateCaptions(p, T - starts[p]);
    fill.style.width = (100 * T / TOTAL).toFixed(3) + '%';
    dirty = false;
  }

  const grain = $('#grain');
  function loop(now) {
    requestAnimationFrame(loop);
    const dt = U.clamp((now - last) / 1000, 0, 0.05); last = Math.max(last, now);
    if (playing) {
      T += dt;
      if (T >= TOTAL) { T = TOTAL; togglePlay(false); $('#end').classList.add('show'); }
      render(dt);
      AUDIO.tick();
      grain.style.backgroundPosition = `${(Math.random() * 200) | 0}px ${(Math.random() * 200) | 0}px`;
    } else if (dirty) render(0);
  }

  /* ── Film grain ── */
  (() => {
    const c = U.canvas(200, 200), g = c.getContext('2d'), id = g.createImageData(200, 200);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    g.putImageData(id, 0, 0);
    grain.style.backgroundImage = `url(${c.toDataURL()})`;
  })();

  /* ── Input ── */
  let idle = 0;
  const wake = () => { document.body.classList.remove('idle'); clearTimeout(idle); idle = setTimeout(() => document.body.classList.add('idle'), 2600); };
  addEventListener('mousemove', wake);
  addEventListener('keydown', e => {
    if (!started) return;
    wake();
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    else if (e.code === 'ArrowRight') go(primary + 1);
    else if (e.code === 'ArrowLeft') go(T - starts[primary] > 4 ? primary : primary - 1);
    else if (e.code === 'KeyM') document.body.classList.toggle('muted', AUDIO.toggleMute());
    else if (e.code === 'KeyF') fullscreen();
    else if (e.code === 'KeyH') document.body.classList.toggle('bare');
  });
  stage.addEventListener('click', () => { if (started) togglePlay(); });
  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }
  $('#btn-fs').addEventListener('click', e => { e.stopPropagation(); fullscreen(); });
  $('#btn-mute').addEventListener('click', e => { e.stopPropagation(); document.body.classList.toggle('muted', AUDIO.toggleMute()); });
  $('#btn-play').addEventListener('click', e => { e.stopPropagation(); togglePlay(); });
  $('#replay').addEventListener('click', () => { go(0); togglePlay(true); });

  let started = false;
  function start(withSound) {
    if (started) return;
    started = true;
    if (withSound) AUDIO.init();
    $('#intro').classList.add('gone');
    document.body.classList.add('running');
    const ch = parseInt(qs.get('ch') || '0', 10), ff = parseFloat(qs.get('ff') || '0');
    go(ch, ff);
    togglePlay(true);
    wake();
  }
  $('#enter').addEventListener('click', () => start(true));
  $('#enter-silent').addEventListener('click', () => start(false));

  resize();
  requestAnimationFrame(loop);
  if (qs.get('shot')) document.body.classList.add('notrans');
  if (qs.get('auto')) { $('#intro').style.transition = 'none'; start(!!qs.get('sound')); }
  if (qs.get('tour')) { // QA: step through every chapter, report progress and errors in the title
    const errs = [];
    addEventListener('error', e => errs.push(e.message));
    setInterval(() => { go(floor + 1, 1.5); render(1 / 30); document.title = `tour ch=${floor} audio=${AUDIO.on} errors=${errs.length} ${errs.slice(0, 3).join(' | ')}`; }, parseFloat(qs.get('tour')) * 1000);
  }
  if (qs.get('freeze')) setTimeout(() => {
    togglePlay(false);
    if (qs.get('dump')) { const pre = document.createElement('pre'); pre.id = 'dump'; pre.textContent = stage.toDataURL('image/png'); document.body.appendChild(pre); }
  }, parseFloat(qs.get('freeze')) * 1000);
})();
