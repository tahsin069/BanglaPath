/**
 * BanglaGrantha Storyteller Voice Engine — Modeled on Agni (Mirchi Bangla Friday Classics)
 * Reference Recording: `/assets/aistudio/Apadartho_Satyajit_Ray_Friday_Classics_Mirchi_Bangla_b9539b4c.mp3`
 *
 * Uses a single unified Storyteller Voice ("অগ্নি · শ্রুতি-গল্প কথক / Agni · Classic Bangla Storyteller")
 * across the entire website:
 * 1. Direct Studio Master Segment Playback for Satyajit Ray's "Apadartho" (exact uploaded MP3).
 * 2. Native Kolkata Storyteller Neural Voice (`bn-IN-BashkarNeural`) with Agni's Friday Classics
 *    dramatic phrasing, dialogue inflection, and broadcast studio microphone EQ chain for all books.
 */

export type MaleNarratorPersona = 'deep-baritone' | 'warm-storyteller' | 'resonant-bass';

export const REFERENCE_STORYTELLER_MP3_URL =
  '/assets/aistudio/Apadartho_Satyajit_Ray_Friday_Classics_Mirchi_Bangla_b9539b4c.mp3';

export interface BaritoneVoicePreset {
  id: MaleNarratorPersona;
  labelEn: string;
  labelBn: string;
  /** Native Calcutta Bengali Male Storyteller Voice */
  neuralVoiceBn: 'bn-IN-BashkarNeural' | 'bn-BD-PradeepNeural';
  localeBn: 'bn-IN' | 'bn-BD';
  /** Native English Studio Neural Male Voice */
  neuralVoiceEn:
    | 'en-US-BrianMultilingualNeural'
    | 'en-US-AndrewMultilingualNeural'
    | 'en-GB-RyanNeural';
  localeEn: 'en-US' | 'en-GB';
  /** Agni's natural Friday Classics conversational storytelling tempo */
  neuralRate: string;
  /** Agni's warm mid-baritone pitch */
  neuralPitch: string;
  isPoetic: boolean;
  elevenLabsVoiceId: string;
  geminiVoice: 'Charon' | 'Fenrir' | 'Puck';
  descriptionEn: string;
  browserPitch: number;
  baseTempoMultiplier: number;
}

const AGNI_STORYTELLER_PRESET: BaritoneVoicePreset = {
  id: 'deep-baritone',
  labelEn: 'Agni · Classic Bangla Storyteller',
  labelBn: 'অগ্নি · শ্রুতি-গল্প কথক (Friday Classics Style)',
  neuralVoiceBn: 'bn-IN-BashkarNeural',
  localeBn: 'bn-IN',
  neuralVoiceEn: 'en-US-BrianMultilingualNeural',
  localeEn: 'en-US',
  neuralRate: '-3%',
  neuralPitch: '-2Hz',
  isPoetic: false,
  elevenLabsVoiceId: 'nPczCjzI2devNBz1zQrb',
  geminiVoice: 'Charon',
  descriptionEn:
    'Warm, expressive Calcutta male storyteller voice modeled on Agni (Mirchi Bangla Friday Classics — Apadartho).',
  browserPitch: 0.96,
  baseTempoMultiplier: 0.98,
};

export const BARITONE_VOICE_PRESETS: Record<MaleNarratorPersona, BaritoneVoicePreset> = {
  'deep-baritone': AGNI_STORYTELLER_PRESET,
  'warm-storyteller': {
    ...AGNI_STORYTELLER_PRESET,
    id: 'warm-storyteller',
  },
  'resonant-bass': {
    ...AGNI_STORYTELLER_PRESET,
    id: 'resonant-bass',
    isPoetic: true,
  },
};

/**
 * Plays an exact timecode segment `[startTimeSec, endTimeSec]` from the uploaded
 * reference storyteller MP3 (`/assets/aistudio/Apadartho_Satyajit_Ray_Friday_Classics_Mirchi_Bangla_b9539b4c.mp3`).
 */
export async function playStudioMp3Segment(options: {
  audioUrl: string;
  startTimeSec: number;
  endTimeSec: number;
  playbackSpeed: number;
  isMuted: boolean;
  onEnded: () => void;
  onError: () => void;
}): Promise<{ stop: () => void }> {
  const { audioUrl, startTimeSec, endTimeSec, playbackSpeed, isMuted, onEnded, onError } = options;

  const audio = new Audio(audioUrl);
  audio.preload = 'auto';
  (audio as any).preservesPitch = true;
  (audio as any).mozPreservesPitch = true;
  (audio as any).webkitPreservesPitch = true;
  audio.playbackRate = playbackSpeed;
  audio.muted = isMuted;

  let stoppedManually = false;
  let rafId: number | null = null;

  const cleanup = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    audio.onended = null;
    audio.onerror = null;
    audio.ontimeupdate = null;
  };

  const checkProgress = () => {
    if (stoppedManually) return;
    if (audio.currentTime >= endTimeSec) {
      stoppedManually = true;
      audio.pause();
      cleanup();
      onEnded();
      return;
    }
    rafId = requestAnimationFrame(checkProgress);
  };

  audio.onended = () => {
    cleanup();
    if (!stoppedManually) {
      onEnded();
    }
  };

  audio.onerror = () => {
    cleanup();
    if (!stoppedManually) {
      onError();
    }
  };

  try {
    audio.currentTime = startTimeSec;
    await audio.play();
    rafId = requestAnimationFrame(checkProgress);
  } catch {
    cleanup();
    onError();
  }

  return {
    stop: () => {
      stoppedManually = true;
      cleanup();
      try {
        audio.pause();
      } catch {
        // ignore
      }
    },
  };
}

/**
 * Plays synthesized neural audio through a clean Broadcast Studio Microphone EQ chain
 * matched to Agni's Mirchi Friday Classics recording (zero pitch-slicing or phase distortion):
 * - 80 Hz High-pass filter (removes low-end rumble)
 * - 145 Hz Peaking filter (+2.2 dB warm chest resonance)
 * - 2850 Hz Peaking filter (+1.5 dB intimate close-mic diction clarity)
 */
export async function playBaritoneMasteredAudio(options: {
  audioCtx?: AudioContext | null;
  audioBase64: string;
  mimeType?: string;
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
    mimeType = 'audio/mpeg',
    playbackSpeed,
    isMuted,
    onEnded,
    onError,
  } = options;

  const binaryString = window.atob(audioBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const blob = new Blob([bytes], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);

  const audio = new Audio(blobUrl);
  (audio as any).preservesPitch = true;
  (audio as any).mozPreservesPitch = true;
  (audio as any).webkitPreservesPitch = true;
  audio.playbackRate = playbackSpeed;
  audio.muted = isMuted;

  // Connect clean Web Audio Broadcast EQ chain if AudioContext is available
  let sourceNode: MediaElementAudioSourceNode | null = null;
  if (audioCtx && audioCtx.state !== 'closed') {
    try {
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      sourceNode = audioCtx.createMediaElementSource(audio);

      const highpass = audioCtx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 80;

      const chestWarmth = audioCtx.createBiquadFilter();
      chestWarmth.type = 'peaking';
      chestWarmth.frequency.value = 145;
      chestWarmth.Q.value = 1.1;
      chestWarmth.gain.value = 2.2;

      const micPresence = audioCtx.createBiquadFilter();
      micPresence.type = 'peaking';
      micPresence.frequency.value = 2850;
      micPresence.Q.value = 1.2;
      micPresence.gain.value = 1.5;

      sourceNode.connect(highpass);
      highpass.connect(chestWarmth);
      chestWarmth.connect(micPresence);
      micPresence.connect(audioCtx.destination);
    } catch {
      // Fallback to direct HTMLAudioElement output if MediaElementSource fails
    }
  }

  let stoppedManually = false;

  const cleanup = () => {
    try {
      sourceNode?.disconnect();
    } catch {
      // ignore
    }
    URL.revokeObjectURL(blobUrl);
  };

  audio.onended = () => {
    cleanup();
    if (!stoppedManually) {
      onEnded();
    }
  };

  audio.onerror = () => {
    cleanup();
    if (!stoppedManually) {
      onError();
    }
  };

  try {
    await audio.play();
  } catch {
    cleanup();
    onError();
  }

  return {
    stop: () => {
      stoppedManually = true;
      try {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
        audio.currentTime = 0;
        cleanup();
      } catch {
        // ignore
      }
    },
  };
}
