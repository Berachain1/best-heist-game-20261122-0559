// The Midnight Vault — sound: tiny WebAudio bleeps, no audio files.
// One job: footsteps, coin, pickup, alert and lockdown, all synthesized.

export function makeAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (!ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        ctx = new AC();
      } catch {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, vol, slideTo) {
    if (muted) return;
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol || 0.08, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    step(sneaking) {
      tone(sneaking ? 140 : 190, 0.05, 'triangle', sneaking ? 0.015 : 0.03);
    },
    coin() {
      tone(1320, 0.09, 'sine', 0.09);
      setTimeout(() => tone(1760, 0.12, 'sine', 0.08), 70);
    },
    pickup() {
      tone(660, 0.1, 'sine', 0.09);
      setTimeout(() => tone(880, 0.1, 'sine', 0.09), 80);
      setTimeout(() => tone(1320, 0.16, 'sine', 0.09), 160);
    },
    spotted() {
      tone(440, 0.14, 'square', 0.05, 620);
    },
    smoke() {
      tone(300, 0.4, 'sawtooth', 0.03, 90);
    },
    emp() {
      tone(980, 0.25, 'square', 0.05, 120);
    },
    lockdown() {
      tone(220, 0.5, 'sawtooth', 0.09, 440);
      setTimeout(() => tone(220, 0.5, 'sawtooth', 0.09, 440), 450);
    },
    roomClear() {
      tone(523, 0.12, 'sine', 0.09);
      setTimeout(() => tone(659, 0.12, 'sine', 0.09), 110);
      setTimeout(() => tone(784, 0.22, 'sine', 0.09), 220);
    },
    win() {
      [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'sine', 0.09), i * 130));
    },
  };
}
