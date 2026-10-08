'use strict';
// Generative score: each chapter supplies a pad chord, a melodic voice, pulses and textures.
const AUDIO = (() => {
  let ac = null, master, dry, conv, noiseBuf, cur = null, muted = false;
  let nextNote = 0, nextDrum = 0, nextHit = 0, step = 0, walk = 0;
  const VOL = 0.8;

  function init() {
    if (ac) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ac = new AC();
    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 3.5; comp.attack.value = 0.01; comp.release.value = 0.4;
    master = ac.createGain(); master.gain.value = 0;
    master.gain.setTargetAtTime(VOL, ac.currentTime, 1.0);
    master.connect(comp); comp.connect(ac.destination);
    dry = ac.createGain(); dry.gain.value = 0.8; dry.connect(master);
    conv = ac.createConvolver(); conv.buffer = impulse(4.8, 2.6);
    const wet = ac.createGain(); wet.gain.value = 0.62; conv.connect(wet); wet.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  function impulse(sec, decay) {
    const len = Math.floor(ac.sampleRate * sec), b = ac.createBuffer(2, len, ac.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = b.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return b;
  }

  function out(node, wetAmt) {
    node.connect(dry);
    if (wetAmt > 0) { const s = ac.createGain(); s.gain.value = wetAmt; node.connect(s); s.connect(conv); }
  }

  function setScene(cfg) {
    if (!ac) return;
    const now = ac.currentTime;
    if (cur) {
      const old = cur;
      old.gain.gain.cancelScheduledValues(now);
      old.gain.gain.setTargetAtTime(0, now, 1.1);
      setTimeout(() => { old.nodes.forEach(n => { try { n.stop(); } catch (e) { /* already stopped */ } }); old.gain.disconnect(); }, 7000);
    }
    cur = null;
    if (!cfg) return;
    const level = cfg.level ?? 0.1, cutoff = cfg.cutoff ?? 800;
    const gain = ac.createGain(); gain.gain.value = 0;
    gain.gain.setTargetAtTime(level, now + 0.2, 1.6);
    const filt = ac.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = cutoff; filt.Q.value = 0.8;
    filt.connect(gain); out(gain, 0.75);
    const nodes = [];
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.05 + Math.random() * 0.05;
    const lg = ac.createGain(); lg.gain.value = cutoff * 0.4; lfo.connect(lg); lg.connect(filt.frequency); lfo.start(); nodes.push(lfo);
    const per = 1 / (cfg.chord.length * 2);
    for (const s of cfg.chord) for (const det of [-7, 7]) {
      const o = ac.createOscillator(); o.type = cfg.wave || 'sine';
      o.frequency.value = cfg.root * Math.pow(2, s / 12); o.detune.value = det + (Math.random() - 0.5) * 4;
      const og = ac.createGain(); og.gain.value = per; o.connect(og); og.connect(filt); o.start(); nodes.push(o);
    }
    if (cfg.noise) {
      const n = ac.createBufferSource(); n.buffer = noiseBuf; n.loop = true;
      const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = cfg.noiseFreq ?? 500; bp.Q.value = 0.6;
      const ng = ac.createGain(); ng.gain.value = cfg.noise / level;
      n.connect(bp); bp.connect(ng); ng.connect(gain); n.start(); nodes.push(n);
    }
    cur = { cfg, gain, nodes };
    nextNote = now + (cfg.notes?.delay ?? 1.2); nextDrum = now + (cfg.drum?.delay ?? 0.8); nextHit = now + 1; step = 0; walk = 0;
  }

  function tick() {
    if (!ac || !cur || ac.state !== 'running') return;
    const c = cur.cfg, now = ac.currentTime, n = c.notes;
    if (n && now > nextNote - 0.1) {
      const when = Math.max(now, nextNote), sc = n.scale, len = sc.length;
      const span = len * (n.oct[1] - n.oct[0] + 1);
      let idx;
      if (n.pattern === 'arp') { const k = step % Math.max(1, span * 2 - 2); idx = k < span ? k : span * 2 - 2 - k; }
      else if (n.pattern === 'walk') { walk = Math.max(0, Math.min(span - 1, walk + Math.round((Math.random() - 0.5) * 4))); idx = walk; }
      else idx = Math.floor(Math.random() * span);
      const f = c.root * Math.pow(2, n.oct[0] + Math.floor(idx / len) + sc[idx % len] / 12);
      play(f, when, n);
      if (n.fifth && Math.random() < n.fifth) play(f * 1.4983, when + 0.02, { ...n, gain: (n.gain ?? 0.1) * 0.6 });
      step++;
      nextNote = when + n.rate * (n.pattern === 'arp' ? 1 : 0.6 + Math.random() * 0.8);
    }
    const d = c.drum;
    if (d && now > nextDrum - 0.1) {
      const when = Math.max(now, nextDrum);
      drum(when, d);
      if (d.double) drum(when + 0.27, { ...d, gain: d.gain * 0.65 });
      nextDrum = when + d.every;
    }
    const h = c.hit;
    if (h && now > nextHit - 0.1) {
      const when = Math.max(now, nextHit);
      noiseHit(when, h);
      nextHit = when + h.every * (0.5 + Math.random());
    }
  }

  function play(freq, when, o) {
    const a = o.attack ?? 0.005, dcy = o.decay ?? 1, gn = o.gain ?? 0.1;
    const osc = ac.createOscillator(); osc.type = o.wave || 'sine';
    osc.frequency.setValueAtTime(freq, when);
    if (o.glide) osc.frequency.exponentialRampToValueAtTime(freq * o.glide, when + a + dcy);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gn, when + a);
    g.gain.exponentialRampToValueAtTime(0.0001, when + a + dcy);
    osc.connect(g);
    let node = g;
    if (o.cutoff) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.cutoff; g.connect(f); node = f; }
    out(node, o.wet ?? 0.5);
    osc.start(when); osc.stop(when + a + dcy + 0.05);
    osc.onended = () => g.disconnect();
    if (o.harm) {
      const o2 = ac.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * o.harm;
      const g2 = ac.createGain();
      g2.gain.setValueAtTime(0.0001, when);
      g2.gain.exponentialRampToValueAtTime(gn * 0.35, when + a);
      g2.gain.exponentialRampToValueAtTime(0.0001, when + a + dcy * 0.5);
      o2.connect(g2); out(g2, o.wet ?? 0.5); o2.start(when); o2.stop(when + a + dcy);
      o2.onended = () => g2.disconnect();
    }
  }

  function drum(when, d) {
    const dec = d.decay ?? 0.5;
    const o = ac.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(d.freq ?? 110, when);
    o.frequency.exponentialRampToValueAtTime(38, when + 0.25);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(d.gain, when + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dec);
    o.connect(g); out(g, d.wet ?? 0.3); o.start(when); o.stop(when + dec + 0.05);
    o.onended = () => g.disconnect();
  }

  function noiseHit(when, h) {
    const s = ac.createBufferSource(); s.buffer = noiseBuf;
    const f = ac.createBiquadFilter(); f.type = h.type || 'bandpass'; f.frequency.value = h.freq ?? 2000; f.Q.value = h.q ?? 1;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(h.gain ?? 0.1, when + (h.attack ?? 0.005));
    g.gain.exponentialRampToValueAtTime(0.0001, when + (h.attack ?? 0.005) + h.decay);
    s.connect(f); f.connect(g); out(g, h.wet ?? 0.4);
    s.start(when, Math.random() * 1.5); s.stop(when + h.decay + 0.1);
    s.onended = () => g.disconnect();
  }

  // Visual events can sound a note: semitones above the current chapter root.
  function note(semi, opts = {}) {
    if (!ac || !cur || ac.state !== 'running') return;
    play(cur.cfg.root * Math.pow(2, (opts.oct ?? 3) + semi / 12), ac.currentTime + 0.01, opts);
  }
  function hit(opts) { if (ac && ac.state === 'running') noiseHit(ac.currentTime + 0.01, opts); }

  function toggleMute() {
    muted = !muted;
    if (ac) master.gain.setTargetAtTime(muted ? 0 : VOL, ac.currentTime, 0.2);
    return muted;
  }
  const pause = () => ac && ac.suspend();
  const resume = () => ac && ac.resume();

  return { init, setScene, tick, note, hit, toggleMute, pause, resume, get on() { return !!ac; } };
})();
