import { STORAGE_KEYS } from "../config.js";
import { readStorage, writeStorage } from "../lib/storage.js";

// Ascending C major arpeggio for open; reversed for close.
const CUES = {
  open: [523.25, 659.25, 783.99],
  close: [783.99, 659.25, 523.25],
};
const NOTE_SPACING_S = 0.055;
const NOTE_DURATION_S = 0.12;
const PEAK_GAIN = 0.084;

// Synthesized interface sounds plus the mute toggle that controls them.
// Returns { play(cueName) }; play is a no-op while muted.
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

  function playTone(context, frequency, start) {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(PEAK_GAIN, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + NOTE_DURATION_S);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + NOTE_DURATION_S + 0.02);
  }

  function play(cueName) {
    if (!enabled) return;

    const notes = CUES[cueName];
    const context = getAudioContext();
    if (!notes || !context) return;
    if (context.state === "suspended") context.resume();

    const start = context.currentTime + 0.01;
    notes.forEach((frequency, index) => {
      playTone(context, frequency, start + index * NOTE_SPACING_S);
    });
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

  return { play };
}
