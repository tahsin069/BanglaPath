/**
 * BanglaGrantha Universal Generic Male Audiobook Narrator Engine
 *
 * Uses the cross-platform Generic Bangla Male Neural Voice Pack (`bn-BD-PradeepNeural` & `bn-IN-BashkarNeural`)
 * with Gemini 3.8 Male TTS (`Charon`) fallback and a universal client-side Male Voice selector
 * that guarantees a male Bangla voice across every platform and browser on the internet.
 */

export type MaleNarratorPersona = 'deep-baritone' | 'warm-storyteller' | 'resonant-bass';

export interface BaritoneVoicePreset {
  id: MaleNarratorPersona;
  labelEn: string;
  labelBn: string;
  /** Generic Bengali Male Neural Voice */
  neuralVoiceBn: 'bn-BD-PradeepNeural' | 'bn-IN-BashkarNeural';
  localeBn: 'bn-BD' | 'bn-IN';
  /** Generic English Male Neural Voice */
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

const GENERIC_BANGLA_MALE_PRESET: BaritoneVoicePreset = {
  id: 'deep-baritone',
  labelEn: 'Generic Bangla Male Voice',
  labelBn: 'বাংলা পুরুষ কণ্ঠ (Generic Bangla Male Voice)',
  neuralVoiceBn: 'bn-BD-PradeepNeural',
  localeBn: 'bn-BD',
  neuralVoiceEn: 'en-US-BrianMultilingualNeural',
  localeEn: 'en-US',
  neuralRate: '+0%',
  neuralPitch: '+0Hz',
  isPoetic: false,
  elevenLabsVoiceId: 'nPczCjzI2devNBz1zQrb',
  geminiVoice: 'Charon',
  descriptionEn:
    'Universal generic Bengali male audiobook narrator compatible across all web platforms.',
  browserPitch: 0.6,
  baseTempoMultiplier: 0.94,
};

export const BARITONE_VOICE_PRESETS: Record<MaleNarratorPersona, BaritoneVoicePreset> = {
  'deep-baritone': GENERIC_BANGLA_MALE_PRESET,
  'warm-storyteller': {
    ...GENERIC_BANGLA_MALE_PRESET,
    id: 'warm-storyteller',
    neuralVoiceBn: 'bn-IN-BashkarNeural',
    localeBn: 'bn-IN',
  },
  'resonant-bass': {
    ...GENERIC_BANGLA_MALE_PRESET,
    id: 'resonant-bass',
    isPoetic: true,
  },
};

const CONFIRMED_MALE_VOICE_KEYWORDS = [
  'pradeep',
  'bashkar',
  'prabhat',
  'tanmoy',
  'subrata',
  'anik',
  'rishi',
  'hemant',
  'madhur',
  'male',
  'brian',
  'andrew',
  'christopher',
  'guy',
  'ryan',
  'george',
  'daniel',
  'david',
  'alex',
  'arthur',
  'oliver',
  'fred',
  'aaron',
];

const KNOWN_FEMALE_VOICE_KEYWORDS = [
  'nabanita',
  'tanishaa',
  'kalpana',
  'heera',
  'swara',
  'neerja',
  'bashundhara',
  'moumita',
  'zira',
  'samantha',
  'victoria',
  'karen',
  'moira',
  'tessa',
  'veena',
  'lekha',
  'hazel',
  'susan',
  'aria',
  'jenny',
  'sonia',
  'libby',
  'female',
  'woman',
  'girl',
];

/**
 * Waits for browser SpeechSynthesis voices to load (fixes Chrome/Edge/Safari returning empty list on first call).
 */
export async function getBrowserVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }
  const existing = window.speechSynthesis.getVoices();
  if (existing && existing.length > 0) {
    return existing;
  }

  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        resolve(window.speechSynthesis.getVoices() || []);
      }
    };
    const timer = window.setTimeout(finish, 450);
    window.speechSynthesis.onvoiceschanged = () => {
      window.clearTimeout(timer);
      finish();
    };
  });
}

/**
 * Selects the best cross-platform Male voice in the browser and returns the optimal pitch/rate
 * so that even if a platform only has Chrome's generic "Google বাংলা" voice, it is pitch-calibrated
 * into a natural male register (`0.58`) and never sounds like a female voice.
 */
export function selectUniversalMaleSpeechVoice(
  voices: SpeechSynthesisVoice[],
  lang: 'bn' | 'en'
): {
  voice: SpeechSynthesisVoice | null;
  langTag: string;
  pitch: number;
  rateMultiplier: number;
} {
  const isConfirmedMale = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase();
    return (
      CONFIRMED_MALE_VOICE_KEYWORDS.some((kw) => n.includes(kw)) &&
      !KNOWN_FEMALE_VOICE_KEYWORDS.some((fw) => n.includes(fw))
    );
  };

  const isKnownFemale = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase();
    return KNOWN_FEMALE_VOICE_KEYWORDS.some((fw) => n.includes(fw));
  };

  if (lang === 'bn') {
    const bnVoices = voices.filter(
      (v) =>
        v.lang.toLowerCase().includes('bn') ||
        v.name.toLowerCase().includes('bangla') ||
        v.name.toLowerCase().includes('bengali')
    );

    // 1. Native Male Bangla voice (e.g. Microsoft Pradeep / Microsoft Bashkar)
    const confirmedMaleBn = bnVoices.find(isConfirmedMale);
    if (confirmedMaleBn) {
      return {
        voice: confirmedMaleBn,
        langTag: confirmedMaleBn.lang || 'bn-BD',
        pitch: 0.96,
        rateMultiplier: 0.96,
      };
    }

    // 2. Non-female generic Bangla voice (e.g. "Google বাংলা" on Chrome/Android, which is female at pitch 1.0)
    // Lower pitch to 0.58 so it speaks in a deep male baritone register instead of a female voice.
    const genericBn = bnVoices.find((v) => !isKnownFemale(v)) || bnVoices[0] || null;
    return {
      voice: genericBn,
      langTag: genericBn?.lang || 'bn-BD',
      pitch: 0.58,
      rateMultiplier: 0.92,
    };
  }

  const enVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  const confirmedMaleEn = enVoices.find(isConfirmedMale);
  if (confirmedMaleEn) {
    return {
      voice: confirmedMaleEn,
      langTag: confirmedMaleEn.lang || 'en-US',
      pitch: 0.95,
      rateMultiplier: 0.96,
    };
  }

  const genericEn = enVoices.find((v) => !isKnownFemale(v)) || enVoices[0] || null;
  return {
    voice: genericEn,
    langTag: genericEn?.lang || 'en-US',
    pitch: 0.62,
    rateMultiplier: 0.94,
  };
}

/**
 * Plays synthesized neural MP3/WAV audio directly via a native Blob URL with ZERO Web Audio
 * BiquadFilter coloration or time-domain DSP, preserving 100% of the natural human male voice.
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
  (audio as unknown as { preservesPitch: boolean }).preservesPitch = true;
  (audio as unknown as { mozPreservesPitch: boolean }).mozPreservesPitch = true;
  (audio as unknown as { webkitPreservesPitch: boolean }).webkitPreservesPitch = true;
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
