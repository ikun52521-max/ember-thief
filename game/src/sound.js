// sound.js — tiny synthesised sounds, one job: make noise with WebAudio.
// No audio files: every sound is a few oscillators, so the game needs no
// network and no assets. Silent until the first user gesture starts audio.

export function createSound() {
  let ctx = null;

  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        ctx = null;
      }
    }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain) {
    const ac = ensure();
    if (!ac) return;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain || 0.08, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(g);
    g.connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  }

  return {
    // A soft footstep tick, alternating pitch so walking has rhythm.
    step(alt) {
      tone(alt ? 190 : 160, 0.06, 'triangle', 0.035);
    },
    // Guard close by: a low warning thump.
    thump() {
      tone(90, 0.12, 'sine', 0.07);
    },
    // Lantern picked up: two rising notes.
    pickup() {
      tone(660, 0.12, 'sine', 0.09);
      setTimeout(() => tone(990, 0.18, 'sine', 0.09), 90);
    },
    // Spotted: a short alarm sting.
    alarm() {
      tone(440, 0.16, 'sawtooth', 0.06);
      setTimeout(() => tone(587, 0.22, 'sawtooth', 0.06), 140);
    },
    // Escaped: a small rising arpeggio.
    win() {
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'sine', 0.09), i * 120));
    },
  };
}
