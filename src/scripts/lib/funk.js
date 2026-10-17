// A short synthesized funk groove (drums, bass, chord stabs) scheduled on a
// Web Audio context. No audio files: everything is oscillators and noise.

const BPM = 108;
const STEP_S = 60 / BPM / 4;
const STEPS_PER_BAR = 16;
const MASTER_GAIN = 0.28;

// Semitone offsets: bass from E1, chords from E3. null is a rest.
const BASS_A = [
  0,
  null,
  12,
  null,
  null,
  3,
  null,
  5,
  0,
  null,
  null,
  10,
  0,
  null,
  7,
  null,
];
const BASS_B = [
  5,
  null,
  17,
  null,
  null,
  5,
  null,
  3,
  0,
  null,
  0,
  null,
  7,
  10,
  12,
  null,
];
const BARS = [
  { bass: BASS_A, chord: [0, 3, 7, 10], stabs: [2, 5, 10] },
  { bass: BASS_A, chord: [0, 3, 7, 10], stabs: [2, 5, 10, 13] },
  { bass: BASS_A, chord: [0, 3, 7, 10], stabs: [2, 5, 10] },
  { bass: BASS_B, chord: [5, 9, 12, 15], stabs: [2, 5, 7, 10, 13] },
];
const KICKS = [0, 3, 8, 10];
const SNARES = [4, 12];
const BASS_ROOT_HZ = 41.2;
const CHORD_ROOT_HZ = 164.81;

export const FUNK_DURATION_S = BARS.length * STEPS_PER_BAR * STEP_S;

function semitones(root, offset) {
  return root * 2 ** (offset / 12);
}

function noiseBuffer(context) {
  const length = Math.floor(context.sampleRate * 0.5);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// Schedules the groove starting at `start`. Returns { sources, master } so the
// caller can stop it early; `sources` are every started node.
export function scheduleFunk(context, destination, start) {
  const master = context.createGain();
  master.gain.value = MASTER_GAIN;
  master.connect(destination);

  const sources = [];
  const noise = noiseBuffer(context);

  function envelope(time, peak, duration) {
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    gain.connect(master);
    return gain;
  }

  function tone(type, frequency, time, duration, peak, cutoff) {
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, time);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, time);
    oscillator.connect(filter);
    filter.connect(envelope(time, peak, duration));
    oscillator.start(time);
    oscillator.stop(time + duration + 0.02);
    sources.push(oscillator);
  }

  function kick(time) {
    const oscillator = context.createOscillator();
    oscillator.frequency.setValueAtTime(140, time);
    oscillator.frequency.exponentialRampToValueAtTime(45, time + 0.12);
    oscillator.connect(envelope(time, 1, 0.22));
    oscillator.start(time);
    oscillator.stop(time + 0.25);
    sources.push(oscillator);
  }

  function hit(time, filterType, frequency, peak, duration) {
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    source.buffer = noise;
    filter.type = filterType;
    filter.frequency.setValueAtTime(frequency, time);
    source.connect(filter);
    filter.connect(envelope(time, peak, duration));
    source.start(time);
    source.stop(time + duration + 0.02);
    sources.push(source);
  }

  BARS.forEach((bar, barIndex) => {
    for (let step = 0; step < STEPS_PER_BAR; step += 1) {
      const time = start + (barIndex * STEPS_PER_BAR + step) * STEP_S;

      if (KICKS.includes(step)) kick(time);
      if (SNARES.includes(step)) hit(time, "bandpass", 1800, 0.7, 0.14);
      // Hats on every other 16th, louder on the off-beats, open at the end.
      if (step % 2 === 0) {
        hit(time, "highpass", 7000, step % 4 === 2 ? 0.3 : 0.18, 0.05);
      }
      if (step === 14) hit(time, "highpass", 6000, 0.22, 0.16);

      const note = bar.bass[step];
      if (note !== null) {
        tone(
          "sawtooth",
          semitones(BASS_ROOT_HZ, note),
          time,
          STEP_S * 1.6,
          0.55,
          420,
        );
      }

      if (bar.stabs.includes(step)) {
        bar.chord.forEach((offset) => {
          tone(
            "square",
            semitones(CHORD_ROOT_HZ, offset),
            time,
            STEP_S * 0.9,
            0.07,
            1800,
          );
        });
      }
    }
  });

  return { sources, master };
}
