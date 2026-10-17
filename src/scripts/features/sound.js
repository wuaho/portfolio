import { STORAGE_KEYS } from "../config.js";
import { FUNK_DURATION_S, scheduleFunk } from "../lib/funk.js";
import { readStorage, writeStorage } from "../lib/storage.js";

// Ascending C major arpeggio for open; reversed for close; a high, glassy
// three-note sparkle for the penguin hover.
const CUES = {
  open: { notes: [523.25, 659.25, 783.99] },
  close: { notes: [783.99, 659.25, 523.25] },
  hover: {
    notes: [1567.98, 2093, 2637.02],
    spacing: 0.045,
    duration: 0.24,
    peak: 0.05,
    // A quiet inharmonic partial makes the tone sound like ice or glass.
    partial: 2.76,
  },
};
const NOTE_SPACING_S = 0.055;
const NOTE_DURATION_S = 0.12;
const PEAK_GAIN = 0.084;

// Synthesized interface sounds plus the mute toggle that controls them.
// Returns { play(cueName), playMusic(onEnd) }; both are no-ops while muted.
export function initSound({ toggle }) {
  let enabled = readStorage(STORAGE_KEYS.sound) !== "off";
  let audioContext = null;

  function getAudioContext() {
    const AudioContextConstructor =
      window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return null;
    if (!audioContext) audioContext = new AudioContextConstructor();
    return audioContext;
  }

  function playTone(context, frequency, start, duration, peak) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function play(cueName) {
    if (!enabled) return;

    const cue = CUES[cueName];
    const context = getAudioContext();
    if (!cue || !context) return;
    if (context.state === "suspended") context.resume();

    const spacing = cue.spacing ?? NOTE_SPACING_S;
    const duration = cue.duration ?? NOTE_DURATION_S;
    const peak = cue.peak ?? PEAK_GAIN;
    const start = context.currentTime + 0.01;
    cue.notes.forEach((frequency, index) => {
      const time = start + index * spacing;
      playTone(context, frequency, time, duration, peak);
      if (cue.partial) {
        playTone(
          context,
          frequency * cue.partial,
          time,
          duration * 0.6,
          peak * 0.35,
        );
      }
    });
  }

  // Plays the funk groove once. Returns a stop function, or null while muted
  // (or without Web Audio). `onEnd` runs when it finishes or is stopped.
  function playMusic(onEnd) {
    if (!enabled) return null;

    const context = getAudioContext();
    if (!context) return null;
    if (context.state === "suspended") context.resume();

    const start = context.currentTime + 0.02;
    const { sources, master } = scheduleFunk(
      context,
      context.destination,
      start,
    );
    let finished = false;
    let timer = 0;

    function finish(stopSources) {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      if (stopSources) {
        const now = context.currentTime;
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(0, now + 0.05);
        sources.forEach((source) => {
          try {
            source.stop(now + 0.06);
          } catch {
            // Already stopped.
          }
        });
      }
      onEnd?.();
    }

    timer = window.setTimeout(() => finish(false), FUNK_DURATION_S * 1000);
    return () => finish(true);
  }

  function render() {
    if (!toggle) return;
    toggle.setAttribute("aria-pressed", String(enabled));
    toggle.setAttribute(
      "aria-label",
      enabled ? "Mute interface sounds" : "Enable interface sounds",
    );
  }

  toggle?.addEventListener("click", () => {
    enabled = !enabled;
    writeStorage(STORAGE_KEYS.sound, enabled ? "on" : "off");
    render();
    if (enabled) play("open");
  });

  render();

  return { play, playMusic };
}
