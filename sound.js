// sound.js - tiny WebAudio bleeps for the kitchen: a pop when an
// ingredient lands, a happy two-note ding on a good serve, a low buzz
// when something goes wrong. No audio files: every sound is synthesized,
// so the game stays a handful of static files with no network request.

let ctx = null;

function tone(freq, at, dur, type = 'sine', gain = 0.08) {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, ctx.currentTime + at);
  amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + at + dur);
  osc.connect(amp).connect(ctx.destination);
  osc.start(ctx.currentTime + at);
  osc.stop(ctx.currentTime + at + dur);
}

export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx?.state === 'suspended') ctx.resume();
}

export function popSound() {
  tone(520, 0, 0.07, 'triangle', 0.06);
}

export function serveSound() {
  tone(660, 0, 0.1, 'sine', 0.08);
  tone(880, 0.09, 0.16, 'sine', 0.08);
}

export function badSound() {
  tone(160, 0, 0.2, 'sawtooth', 0.05);
}
