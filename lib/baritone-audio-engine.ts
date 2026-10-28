/**
 * BanglaGrantha Authentic Native Bangla & English Male Audiobook Narrator Engine
 * Exclusively uses Native Bengali Male Neural Voices (`bn-IN-BashkarNeural` & `bn-BD-PradeepNeural`)
 * for Bengali narration so pronunciation, vowel harmony, and cadence are 100% native Bengali.
 */

export type MaleNarratorPersona = 'deep-baritone' | 'warm-storyteller' | 'resonant-bass';

export interface BaritoneVoicePreset {
  id: MaleNarratorPersona;
  labelEn: string;
  labelBn: string;
  /** 100% Native Bengali Male Neural Voice (never an English-accented voice!) */
  neuralVoiceBn: 'bn-IN-BashkarNeural' | 'bn-BD-PradeepNeural';
  localeBn: 'bn-IN' | 'bn-BD';
  /** Native English Studio Neural Male Voice */
  neuralVoiceEn:
    | 'en-US-BrianMultilingualNeural'
    | 'en-US-AndrewMultilingualNeural'
    | 'en-GB-RyanNeural';
  localeEn: 'en-US' | 'en-GB';
  /** Prosody rate for soothing unhurried storytelling */
  neuralRate: string;
  /** Gentle natural pitch tuning */
  neuralPitch: string;
  /** Whether to insert extended poetic stanza pauses at dandas (।) */
  isPoetic: boolean;
  /** ElevenLabs Reference Voice ID (used only for English if ELEVENLABS_API_KEY is set) */
  elevenLabsVoiceId: string;
  /** Gemini 3.8 TTS Prebuilt Male Voice */
  geminiVoice: 'Charon' | 'Fenrir' | 'Puck';
  descriptionEn: string;
  browserPitch: number;
  baseTempoMultiplier: number;
}

export const BARITONE_VOICE_PRESETS: Record<MaleNarratorPersona, BaritoneVoicePreset> = {
  'deep-baritone': {
    id: 'deep-baritone',
    labelEn: 'Bashkar · Calcutta Classical Male',
    labelBn: 'ভাস্কর · কলকাতা ধ্রুপদী পুরুষ কণ্ঠ',
    neuralVoiceBn: 'bn-IN-BashkarNeural',
    localeBn: 'bn-IN',
    neuralVoiceEn: 'en-US-BrianMultilingualNeural',
    localeEn: 'en-US',
    neuralRate: '-5%',
    neuralPitch: '-2Hz',
    isPoetic: false,
    elevenLabsVoiceId: 'nPczCjzI2devNBz1zQrb',
    geminiVoice: 'Charon',
    descriptionEn:
      'Native Calcutta Bengali male narrator (bn-IN-BashkarNeural) & Deep Soothing English Baritone (Brian).',
    browserPitch: 0.95,
    baseTempoMultiplier: 0.96,
  },
  'warm-storyteller': {
    id: 'warm-storyteller',
    labelEn: 'Pradeep · Dhaka Warm Male',
    labelBn: 'প্রদীপ · প্রমিত বাংলাদেশী পুরুষ কণ্ঠ',
    neuralVoiceBn: 'bn-BD-PradeepNeural',
    localeBn: 'bn-BD',
    neuralVoiceEn: 'en-US-AndrewMultilingualNeural',
    localeEn: 'en-US',
    neuralRate: '-4%',
    neuralPitch: '-1Hz',
    isPoetic: false,
    elevenLabsVoiceId: 'pNInz6obpgDQGcFmaJgB',
    geminiVoice: 'Puck',
    descriptionEn:
      'Native Bangladeshi Promito Bangla male narrator (bn-BD-PradeepNeural) & Warm Intimate English Male (Andrew/Adam).',
    browserPitch: 0.98,
    baseTempoMultiplier: 0.98,
  },
  'resonant-bass': {
    id: 'resonant-bass',
    labelEn: 'Santiniketan Poetic Male',
    labelBn: 'ধীরস্থির কাব্যিক পুরুষ কণ্ঠ',
    neuralVoiceBn: 'bn-IN-BashkarNeural',
    localeBn: 'bn-IN',
    neuralVoiceEn: 'en-GB-RyanNeural',
    localeEn: 'en-GB',
    neuralRate: '-9%',
    neuralPitch: '-3Hz',
    isPoetic: true,
    elevenLabsVoiceId: 'JBFqnCBsd6RMkjVDRZzb',
    geminiVoice: 'Fenrir',
    descriptionEn:
      'Unhurried, contemplative Santiniketan poetic Bengali male recitation with extended pauses.',
    browserPitch: 0.92,
    baseTempoMultiplier: 0.94,
  },
};

/**
 * Plays base64 neural audio cleanly via a native Blob URL without any robotic DSP slicing,
 * preserving 100% of the native Bengali/English human vocal breath, prosody, and warmth.
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
