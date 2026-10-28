/**
 * BanglaGrantha Natural Male Audiobook Narrator Engine
 *
 * Uses 100% pure, un-resampled Native Bangla Male Neural TTS (`bn-IN-BashkarNeural` & `bn-BD-PradeepNeural`)
 * at native `+0Hz / +0%` model output with ZERO Web Audio BiquadFilter coloration or vocoder pitch-shifting,
 * so the voice sounds completely natural and human.
 */

export type MaleNarratorPersona = 'deep-baritone' | 'warm-storyteller' | 'resonant-bass';

export interface BaritoneVoicePreset {
  id: MaleNarratorPersona;
  labelEn: string;
  labelBn: string;
  /** Native Bengali Male Neural Voice */
  neuralVoiceBn: 'bn-IN-BashkarNeural' | 'bn-BD-PradeepNeural';
  localeBn: 'bn-IN' | 'bn-BD';
  /** Native English Studio Neural Male Voice */
  neuralVoiceEn:
    | 'en-US-BrianMultilingualNeural'
    | 'en-US-AndrewMultilingualNeural'
    | 'en-GB-RyanNeural';
  localeEn: 'en-US' | 'en-GB';
  neuralRate: string;
  neuralPitch: string;
  isPoetic: boolean;
  elevenLabsVoiceId: string;
  geminiVoice: 'Charon' | 'Fenrir' | 'Puck';
  descriptionEn: string;
  browserPitch: number;
  baseTempoMultiplier: number;
}

const NATURAL_MALE_STORYTELLER_PRESET: BaritoneVoicePreset = {
  id: 'deep-baritone',
  labelEn: 'Natural Bangla Male Storyteller',
  labelBn: 'স্বাভাবিক বাংলা পুরুষ কথক (Natural Male TTS)',
  neuralVoiceBn: 'bn-IN-BashkarNeural',
  localeBn: 'bn-IN',
  neuralVoiceEn: 'en-US-BrianMultilingualNeural',
  localeEn: 'en-US',
  neuralRate: '+0%',
  neuralPitch: '+0Hz',
  isPoetic: false,
  elevenLabsVoiceId: 'nPczCjzI2devNBz1zQrb',
  geminiVoice: 'Charon',
  descriptionEn:
    'Pure, un-resampled native Bengali male storyteller voice with natural sentence breathing and zero robotic DSP.',
  browserPitch: 1.0,
  baseTempoMultiplier: 1.0,
};

export const BARITONE_VOICE_PRESETS: Record<MaleNarratorPersona, BaritoneVoicePreset> = {
  'deep-baritone': NATURAL_MALE_STORYTELLER_PRESET,
  'warm-storyteller': {
    ...NATURAL_MALE_STORYTELLER_PRESET,
    id: 'warm-storyteller',
    neuralVoiceBn: 'bn-BD-PradeepNeural',
    localeBn: 'bn-BD',
  },
  'resonant-bass': {
    ...NATURAL_MALE_STORYTELLER_PRESET,
    id: 'resonant-bass',
    isPoetic: true,
  },
};

/**
 * Plays synthesized neural MP3 audio directly via a native Blob URL with ZERO Web Audio
 * BiquadFilter coloration or time-domain DSP, preserving 100% of the natural human voice.
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

  let stoppedManually = false;

  const cleanup = () => {
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
