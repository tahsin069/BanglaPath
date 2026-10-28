/**
 * BanglaGrantha Baritone Studio Audio Engine
 * Transforms and masters narration audio into a soothing, deep, resonant male baritone
 * using Phase-Coherent WSOLA (Waveform Similarity Overlap-Add) + 3-Stage Acoustic EQ.
 */

export type MaleNarratorPersona = 'deep-baritone' | 'warm-storyteller' | 'resonant-bass';

export interface BaritoneVoicePreset {
  id: MaleNarratorPersona;
  labelEn: string;
  labelBn: string;
  geminiVoice: 'Charon' | 'Orus' | 'Fenrir';
  descriptionEn: string;
  /** Semitone shift applied when transforming standard cloud speech into a deep male baritone */
  cloudSemitoneShift: number;
  /** Subtle semitone polish applied to Gemini male voices */
  geminiSemitoneShift: number;
  /** Base pacing multiplier for a soothing, unhurried storytelling cadence */
  baseTempoMultiplier: number;
  /** Low-shelf boost (dB) at 150 Hz for chest warmth */
  chestBoostDb: number;
  /** Mid-high attenuation (dB) at 2.8 kHz to remove harsh sibilance */
  velvetCutDb: number;
  /** Low-pass cutoff (Hz) for warm studio broadcast intimacy */
  lowpassHz: number;
  /** Browser SpeechSynthesis pitch fallback */
  browserPitch: number;
}

export const BARITONE_VOICE_PRESETS: Record<MaleNarratorPersona, BaritoneVoicePreset> = {
  'deep-baritone': {
    id: 'deep-baritone',
    labelEn: 'Deep Soothing Baritone',
    labelBn: 'গভীর প্রশান্ত ব্যারিটোন',
    geminiVoice: 'Charon',
    descriptionEn: 'Soothing, deep manly baritone with warm chest resonance and calm storytelling pace.',
    cloudSemitoneShift: -4.6,
    geminiSemitoneShift: -0.8,
    baseTempoMultiplier: 0.94,
    chestBoostDb: 5.5,
    velvetCutDb: -4.2,
    lowpassHz: 4600,
    browserPitch: 0.68,
  },
  'warm-storyteller': {
    id: 'warm-storyteller',
    labelEn: 'Warm Classic Male',
    labelBn: 'স্নিগ্ধ ধ্রুপদী পুরুষ কণ্ঠ',
    geminiVoice: 'Orus',
    descriptionEn: 'Gentle, intimate fireside male narrator with smooth acoustic warmth.',
    cloudSemitoneShift: -3.8,
    geminiSemitoneShift: -0.4,
    baseTempoMultiplier: 0.96,
    chestBoostDb: 4.5,
    velvetCutDb: -3.5,
    lowpassHz: 5200,
    browserPitch: 0.74,
  },
  'resonant-bass': {
    id: 'resonant-bass',
    labelEn: 'Resonant Theatre Bass',
    labelBn: 'গম্ভীর নাটকীয় ব্যারিটোন',
    geminiVoice: 'Fenrir',
    descriptionEn: 'Rich, extra-deep bass-baritone voice for epic novels, mysteries, and poetry.',
    cloudSemitoneShift: -5.4,
    geminiSemitoneShift: -1.4,
    baseTempoMultiplier: 0.92,
    chestBoostDb: 6.5,
    velvetCutDb: -4.8,
    lowpassHz: 4200,
    browserPitch: 0.62,
  },
};

/**
 * Converts a base64 audio string into an ArrayBuffer.
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Phase-Coherent WSOLA (Waveform Similarity Overlap-Add) time-stretcher + cubic resampler.
 * Shifts vocal pitch by `semitones` while preserving natural speaking speed (`tempoRatio`),
 * turning any higher-pitched synthesis stream into a natural, soothing deep male baritone.
 */
export function pitchShiftAndStretchMono(
  input: Float32Array,
  sampleRate: number,
  semitones: number,
  tempoRatio: number
): Float32Array {
  const pitchFactor = Math.pow(2, semitones / 12); // < 1.0 lowers pitch
  const safeTempo = Math.max(0.65, Math.min(1.6, tempoRatio));

  // If virtually no pitch or tempo change is needed, return a copy
  if (Math.abs(pitchFactor - 1) < 0.02 && Math.abs(safeTempo - 1) < 0.02) {
    return new Float32Array(input);
  }

  // Step 1: Time-stretch by stretchFactor = pitchFactor / safeTempo
  // So that after resampling by (1 / pitchFactor), the final duration is input.length / safeTempo
  const stretchFactor = pitchFactor / safeTempo; // ratio of stretchedLength / inputLength

  const winSize = Math.max(256, Math.round(sampleRate * 0.032)); // ~32ms window for male fundamental
  const halfWin = Math.floor(winSize / 2);
  const synHop = halfWin; // 50% overlap synthesis hop
  const anaHop = Math.max(16, Math.round(synHop / stretchFactor));
  const maxSeek = Math.max(16, Math.round(sampleRate * 0.01)); // 10ms phase-lock search tolerance

  // Precompute Hann window
  const hann = new Float32Array(winSize);
  for (let i = 0; i < winSize; i++) {
    hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (winSize - 1)));
  }

  const stretchedLength = Math.max(winSize + 1, Math.round(input.length * stretchFactor));
  const stretched = new Float32Array(stretchedLength + winSize);
  const norm = new Float32Array(stretchedLength + winSize);

  let anaPos = 0;
  let synPos = 0;

  // Copy first window directly
  for (let i = 0; i < winSize && i < input.length; i++) {
    stretched[i] = input[i] * hann[i];
    norm[i] = hann[i] * hann[i];
  }

  synPos += synHop;
  anaPos += anaHop;

  while (synPos + winSize < stretchedLength && anaPos + winSize < input.length) {
    // Search around `anaPos` for highest cross-correlation with the tail already in `stretched`
    let bestOffset = 0;
    let bestCorr = -Infinity;

    const searchStart = Math.max(0, anaPos - maxSeek);
    const searchEnd = Math.min(input.length - winSize - 1, anaPos + maxSeek);

    // Step by 2 samples for fast correlation search
    for (let cand = searchStart; cand <= searchEnd; cand += 2) {
      let corr = 0;
      // Compare first quarter of window where overlap is strongest
      const compareLen = Math.min(halfWin, 256);
      for (let k = 0; k < compareLen; k += 2) {
        corr += stretched[synPos + k] * input[cand + k];
      }
      if (corr > bestCorr) {
        bestCorr = corr;
        bestOffset = cand - anaPos;
      }
    }

    const chosenAna = anaPos + bestOffset;
    for (let i = 0; i < winSize; i++) {
      const w = hann[i];
      stretched[synPos + i] += input[chosenAna + i] * w;
      norm[synPos + i] += w * w;
    }

    // Advance analysis position from chosen offset to preserve phase continuity
    anaPos = chosenAna + anaHop;
    synPos += synHop;
  }

  // Normalize overlap-added samples
  for (let i = 0; i < stretchedLength; i++) {
    if (norm[i] > 1e-4) {
      stretched[i] /= norm[i];
    }
  }

  // Step 2: Resample `stretched` by pitchFactor to shift pitch while landing at target duration
  const finalLength = Math.max(1, Math.floor(stretchedLength / pitchFactor));
  const output = new Float32Array(finalLength);

  for (let i = 0; i < finalLength; i++) {
    const srcIdx = i * pitchFactor;
    const idx0 = Math.floor(srcIdx);
    const frac = srcIdx - idx0;

    const s0 = stretched[Math.max(0, idx0 - 1)] || 0;
    const s1 = stretched[idx0] || 0;
    const s2 = stretched[Math.min(stretchedLength - 1, idx0 + 1)] || 0;
    const s3 = stretched[Math.min(stretchedLength - 1, idx0 + 2)] || 0;

    // Catmull-Rom cubic interpolation for warm, alias-free vocal timbre
    const c0 = s1;
    const c1 = 0.5 * (s2 - s0);
    const c2 = s0 - 2.5 * s1 + 2 * s2 - 0.5 * s3;
    const c3 = 0.5 * (s3 - s0) + 1.5 * (s1 - s2);

    const sample = ((c3 * frac + c2) * frac + c1) * frac + c0;
    // Soft warmth saturation limiter
    output[i] = Math.max(-0.98, Math.min(0.98, sample));
  }

  return output;
}

/**
 * Decodes base64 narration audio and plays it through a soothing deep baritone Web Audio studio chain.
 * Returns a controller handle with a `stop()` method.
 */
export async function playBaritoneMasteredAudio(options: {
  audioCtx: AudioContext;
  audioBase64: string;
  engine: string;
  persona: MaleNarratorPersona;
  playbackSpeed: number;
  isMuted: boolean;
  onEnded: () => void;
  onError: () => void;
}): Promise<{ stop: () => void }> {
  const {
    audioCtx,
    audioBase64,
    engine,
    persona,
    playbackSpeed,
    isMuted,
    onEnded,
    onError,
  } = options;

  if (audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  const preset = BARITONE_VOICE_PRESETS[persona] || BARITONE_VOICE_PRESETS['deep-baritone'];
  const rawBuffer = base64ToArrayBuffer(audioBase64);
  const decodedBuffer = await audioCtx.decodeAudioData(rawBuffer.slice(0));

  const isCloudFallback = engine === 'cloud-bilingual-tts';
  const semitoneShift = isCloudFallback ? preset.cloudSemitoneShift : preset.geminiSemitoneShift;
  const targetTempo = playbackSpeed * preset.baseTempoMultiplier;

  const inputChannel = decodedBuffer.getChannelData(0);
  const processedSamples = pitchShiftAndStretchMono(
    inputChannel,
    decodedBuffer.sampleRate,
    semitoneShift,
    targetTempo
  );

  const outputBuffer = audioCtx.createBuffer(
    1,
    processedSamples.length,
    decodedBuffer.sampleRate
  );
  outputBuffer.getChannelData(0).set(processedSamples);

  const sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = outputBuffer;

  // Stage 1: Sub-rumble High-Pass Filter at 70 Hz (keeps bass clean, not muddy)
  const highpass = audioCtx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.setValueAtTime(70, audioCtx.currentTime);
  highpass.Q.setValueAtTime(0.7, audioCtx.currentTime);

  // Stage 2: Deep Manly Chest Resonance Low-Shelf Boost at 148 Hz
  const chestShelf = audioCtx.createBiquadFilter();
  chestShelf.type = 'lowshelf';
  chestShelf.frequency.setValueAtTime(148, audioCtx.currentTime);
  chestShelf.gain.setValueAtTime(preset.chestBoostDb, audioCtx.currentTime);

  // Stage 3: Warm Lower-Mid Body Presence at 340 Hz
  const bodyWarmth = audioCtx.createBiquadFilter();
  bodyWarmth.type = 'peaking';
  bodyWarmth.frequency.setValueAtTime(340, audioCtx.currentTime);
  bodyWarmth.Q.setValueAtTime(1.0, audioCtx.currentTime);
  bodyWarmth.gain.setValueAtTime(2.4, audioCtx.currentTime);

  // Stage 4: Soothing Velvet De-Harshing Filter at 2850 Hz
  const velvetCut = audioCtx.createBiquadFilter();
  velvetCut.type = 'peaking';
  velvetCut.frequency.setValueAtTime(2850, audioCtx.currentTime);
  velvetCut.Q.setValueAtTime(1.2, audioCtx.currentTime);
  velvetCut.gain.setValueAtTime(preset.velvetCutDb, audioCtx.currentTime);

  // Stage 5: Intimate Studio Broadcast Low-Pass Roll-off
  const studioLowpass = audioCtx.createBiquadFilter();
  studioLowpass.type = 'lowpass';
  studioLowpass.frequency.setValueAtTime(preset.lowpassHz, audioCtx.currentTime);
  studioLowpass.Q.setValueAtTime(0.65, audioCtx.currentTime);

  // Stage 6: Master Output Gain
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(isMuted ? 0.0001 : 1.05, audioCtx.currentTime);

  sourceNode.connect(highpass);
  highpass.connect(chestShelf);
  chestShelf.connect(bodyWarmth);
  bodyWarmth.connect(velvetCut);
  velvetCut.connect(studioLowpass);
  studioLowpass.connect(masterGain);
  masterGain.connect(audioCtx.destination);

  let stoppedManually = false;

  sourceNode.onended = () => {
    if (!stoppedManually) {
      onEnded();
    }
  };

  try {
    sourceNode.start(0);
  } catch {
    onError();
  }

  return {
    stop: () => {
      stoppedManually = true;
      try {
        sourceNode.onended = null;
        sourceNode.stop();
        sourceNode.disconnect();
        masterGain.disconnect();
      } catch {
        // ignore if already stopped
      }
    },
  };
}
