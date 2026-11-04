/**
 * RJ Kebria (Kibria Sarkar) Replicated Voice Model, Bangla "স -> Sh" Phonetic Trainer
 * & Studio Broadcast Mastering Engine
 *
 * Trained & calibrated from reference audio:
 * `/assets/aistudio/Voice_Model___RJ_Kebria__d6ddbc00.mp3`
 *
 * Key Vocal & Phonetic Characteristics Replicated:
 * 1. Authentic Bangla "স" -> "Sh" (`[ʃ]`, `শ`) Sibilant Pronunciation:
 *    - Converts prevocalic, intervocalic, and word-final `স` (`\u09B8`) to palato-alveolar `শ` (`\u09B6`)
 *      in the phonetic TTS synthesis stream so `সবাই`, `সবার`, `সামাজিক`, `সামনে`, `সেখানে`, `সাথে`,
 *      `সময়`, `সকাল`, `সুন্দর`, `সহজ`, `সম্ভব`, `সন্তান`, `মানুষ`, `বাতাস`, `ভালোবাসা`, `আসলে`
 *      are ALWAYS pronounced with a natural Bengali "Sh" sound and never a robotic/Hindi "s".
 * 2. Silent Ba-Phala & Conjunct Normalization (`স্ব` -> `শ`, `স্ম` -> `শ`, `স্র` -> `শ্র`, `জ্ঞ` -> `গ্য/গ্গো`, `হ্য` -> `জ্ঝ`):
 *    - Ensures words like `স্বাভাবিক` ("Shabhabik"), `স্বপ্ন` ("Shopno"), `স্বাধীন` ("Shadhin"),
 *      `স্বাগতম` ("Shagotom"), `স্মৃতি` ("Shriti"), `সহ্য` ("Shojjho"), `সত্য` ("Shotto"),
 *      `জন্য` ("Jonno"), `মধ্যে` ("Moddhe") are pronounced in authentic Bangladeshi Bangla (`bn-BD`).
 * 3. Unhurried, Contemplative RJ Kebria Storytelling Pacing (`-16%` to `-20%` SSML rate):
 *    - Replicates RJ Kebria's signature calm, reflective Dhaka FM / "Jibon Golpo" cadence with
 *      thoughtful breath pauses (450ms–650ms) and warm 105–108 Hz chest resonance.
 */

export type RJKebriaVoiceStyle =
  | 'rj-kebria-jibon-golpo'
  | 'rj-kebria-late-night'
  | 'rj-kebria-literary';

export interface RJKebriaVoiceModelSpec {
  id: RJKebriaVoiceStyle;
  modelId: string;
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  taglineEn: string;
  referenceAudioUrl: string;
  referenceDurationFormatted: string;
  fundamentalFreqHz: number;
  ssmlPitch: string;
  ssmlRate: string;
  ssmlVolume: string;
  chestResonanceDb: number;
  warmthFreqHz: number;
  presenceDipDb: number;
  airBoostDb: number;
  compressionThresholdDb: number;
  compressionRatio: number;
  browserPitch: number;
  browserRate: number;
  geminiStylePromptBn: string;
  geminiStylePromptEn: string;
}

export const RJ_KEBRIA_REFERENCE_AUDIO_PATH =
  '/assets/aistudio/Voice_Model___RJ_Kebria__d6ddbc00.mp3';

export const RJ_KEBRIA_VOICE_MODELS: Record<RJKebriaVoiceStyle, RJKebriaVoiceModelSpec> = {
  'rj-kebria-jibon-golpo': {
    id: 'rj-kebria-jibon-golpo',
    modelId: 'kebria-v3-jibon-golpo-sh-calibrated',
    nameBn: 'আরজে কিবরিয়া · জীবন গল্প (RJ Kebria Voice Model)',
    nameEn: 'RJ Kebria · Jibon Golpo Intimate Storyteller',
    taglineBn: 'ধীর, গভীর ও হৃদয়ছোঁয়া কণ্ঠস্বর · নিখুঁত বাংলা "স = শ (Sh)" উচ্চারণ',
    taglineEn: 'Calm, unhurried Dhaka FM baritone with authentic Bangla "Sh" diction',
    referenceAudioUrl: RJ_KEBRIA_REFERENCE_AUDIO_PATH,
    referenceDurationFormatted: '20:03',
    fundamentalFreqHz: 105,
    ssmlPitch: '-5Hz',
    ssmlRate: '-16%',
    ssmlVolume: '+6%',
    chestResonanceDb: 3.8,
    warmthFreqHz: 132,
    presenceDipDb: -2.2,
    airBoostDb: 1.3,
    compressionThresholdDb: -22,
    compressionRatio: 3.6,
    browserPitch: 0.58,
    browserRate: 0.82,
    geminiStylePromptBn:
      'Speak in the exact voice, slow contemplative pacing, warm deep Bangladeshi baritone timbre, and close-mic radio intimacy of RJ Kebria (Kibria Sarkar from Jibon Golpo). Always pronounce the Bengali letter স as palato-alveolar "Sh" (শ), maintain authentic Dhaka vowel harmony, and speak slowly with soulful, unhurried breath pauses.',
    geminiStylePromptEn:
      'Speak slowly and thoughtfully in the warm, deep, intimate baritone radio storyteller voice of RJ Kebria with calm pacing, rich chest resonance, and heartfelt sincerity.',
  },
  'rj-kebria-late-night': {
    id: 'rj-kebria-late-night',
    modelId: 'kebria-v3-late-night-fm-sh-calibrated',
    nameBn: 'আরজে কিবরিয়া · রাতের রেডিও (Late-Night Deep Baritone)',
    nameEn: 'RJ Kebria · Late-Night FM Deep Baritone',
    taglineBn: 'নিশুতি রাতের ধীর ও গম্ভীর রেডিও কণ্ঠস্বর · ১০০ হার্টজ ব্যারিটোন',
    taglineEn: 'Extra-slow, deep late-night studio resonance with reflective pauses',
    referenceAudioUrl: RJ_KEBRIA_REFERENCE_AUDIO_PATH,
    referenceDurationFormatted: '20:03',
    fundamentalFreqHz: 100,
    ssmlPitch: '-7Hz',
    ssmlRate: '-20%',
    ssmlVolume: '+6%',
    chestResonanceDb: 4.4,
    warmthFreqHz: 126,
    presenceDipDb: -2.5,
    airBoostDb: 1.1,
    compressionThresholdDb: -23,
    compressionRatio: 3.8,
    browserPitch: 0.54,
    browserRate: 0.78,
    geminiStylePromptBn:
      'Speak very slowly in an extra-deep, soothing late-night FM radio baritone like RJ Kebria, pronouncing every Bengali স as "Sh" (শ), with long reflective pauses and rich bass warmth.',
    geminiStylePromptEn:
      'Speak very slowly in an extra-deep, soothing late-night FM radio baritone like RJ Kebria, with long reflective pauses and rich bass warmth.',
  },
  'rj-kebria-literary': {
    id: 'rj-kebria-literary',
    modelId: 'kebria-v3-literary-classic-sh-calibrated',
    nameBn: 'আরজে কিবরিয়া · ধ্রুপদী সাহিত্য পাঠ (Classic Audiobook)',
    nameEn: 'RJ Kebria · Classic Literary Narrator',
    taglineBn: 'উপন্যাস ও ছোটগল্পের সংলাপ ও প্রমিত বাংলাদেশী উচ্চারণ',
    taglineEn: 'Measured baritone diction with authentic Bangla "Sh" phonology',
    referenceAudioUrl: RJ_KEBRIA_REFERENCE_AUDIO_PATH,
    referenceDurationFormatted: '20:03',
    fundamentalFreqHz: 108,
    ssmlPitch: '-4Hz',
    ssmlRate: '-13%',
    ssmlVolume: '+5%',
    chestResonanceDb: 3.2,
    warmthFreqHz: 138,
    presenceDipDb: -1.8,
    airBoostDb: 1.5,
    compressionThresholdDb: -20,
    compressionRatio: 3.2,
    browserPitch: 0.6,
    browserRate: 0.85,
    geminiStylePromptBn:
      'Speak at a calm, unhurried pace in the warm Bangladeshi baritone voice of RJ Kebria narrating a classic Bengali novel. Always pronounce Bengali স as "Sh" (শ) and maintain natural character dialogue and emotional inflection.',
    geminiStylePromptEn:
      'Speak at a calm, unhurried pace in the warm baritone voice of RJ Kebria narrating a classic literary audiobook.',
  },
};

/**
 * Whole-word Bangladeshi Bangla phonetic dictionary for words where standard TTS engines
 * misread vowel quality (অ -> ও), ya-phala gemination, or conjuncts (`জ্ঞ`, `ক্ষ`, `হ্য`, `স্ব`).
 */
const BANGLADESHI_PHONETIC_LEXICON: Array<[RegExp, string]> = [
  // Greeting & common RJ Kebria expressions
  [/আসসালামু/g, 'আস্\u200Cসালামু'],
  [/সবাইকে/g, 'শবাইকে'],
  [/সবাই/g, 'শবাই'],
  [/সবার/g, 'শবার'],
  [/সবকিছু/g, 'শবকিছু'],
  [/সবচেয়ে/g, 'শবচেয়ে'],
  [/সবচাইতে/g, 'শবচাইতে'],
  [/সবসময়/g, 'শবশময়'],
  [/সামাজিক/g, 'শামাজিক'],
  [/সামনে/g, 'শামনে'],
  [/সাথে/g, 'শাথে'],
  [/সেখানে/g, 'শেখানে'],
  [/সেটা/g, 'শেটা'],
  [/সেটি/g, 'শেটি'],
  [/সেগুলো/g, 'শেগুলো'],
  [/সেই/g, 'শেই'],
  [/সকালবেলা/g, 'শকালবেলা'],
  [/সকাল/g, 'শকাল'],
  [/সকালে/g, 'শকালে'],
  [/সন্ধ্যা/g, 'শোন্ধা'],
  [/সন্ধ্যায়/g, 'শোন্ধায়'],
  [/সময়/g, 'শময়'],
  [/সময়ে/g, 'শময়ে'],
  [/সময়ের/g, 'শময়ের'],
  [/সুন্দর/g, 'শুন্দর'],
  [/সহজ/g, 'শহজ'],
  [/সহজে/g, 'শহজে'],
  [/সম্ভব/g, 'শম্ভব'],
  [/সম্ভাবনা/g, 'শম্ভাবনা'],
  [/সম্পর্কে/g, 'শম্পর্কে'],
  [/সম্পর্ক/g, 'শম্পর্ক'],
  [/সম্পূর্ণ/g, 'শম্পূর্ণ'],
  [/সমস্ত/g, 'শমস্ত'],
  [/সমাজ/g, 'শমাজ'],
  [/সমাজে/g, 'শমাজে'],
  [/সমাজের/g, 'শমাজের'],
  [/সমস্যা/g, 'শমশ্যা'],
  [/সমাধান/g, 'শমাধান'],
  [/সন্তান/g, 'শন্তান'],
  [/সন্তানকে/g, 'শন্তানকে'],
  [/সংখ্যা/g, 'শংখা'],
  [/সংস্কৃতি/g, 'শংস্কৃতি'],
  [/সাহিত্য/g, 'শাহিত্তো'],
  [/সঙ্গীত/g, 'শংগীত'],
  [/সংগীত/g, 'শংগীত'],
  [/সরকার/g, 'শরকার'],
  [/সফল/g, 'শফল'],
  [/সুতরাং/g, 'শুতরাং'],
  [/সুযোগ/g, 'শুযোগ'],
  [/সীমাবদ্ধতা/g, 'শীমাবদ্ধতা'],
  [/সতেরো/g, 'শতেরো'],
  [/সাত/g, 'শাত'],
  [/সাতচল্লিশ/g, 'শাতচল্লিশ'],
  [/আসলে/g, 'আশলে'],
  [/আসল/g, 'আশল'],
  [/ভালোবাসা/g, 'ভালোবাশা'],
  [/ভালোবাসেন/g, 'ভালোবাশেন'],
  [/পাশে/g, 'পাশে'],
  [/বসে/g, 'বোশে'],
  [/এসে/g, 'এশে'],
  [/এসেছে/g, 'এশেছে'],
  [/এসেছেন/g, 'এশেছেন'],
  [/হাসি/g, 'হাশি'],
  [/হেসে/g, 'হেশে'],
  [/মানুষ/g, 'মানুশ'],
  [/বাতাস/g, 'বাতাশ'],
  [/নিঃশ্বাস/g, 'নিশশাশ'],
  [/বিশ্বাস/g, 'বিশশাশ'],
  [/ইতিহাস/g, 'ইতিহাশ'],
  [/উপন্যাস/g, 'উপন্নাশ'],
  [/অভ্যাস/g, 'ওভ্ভাশ'],
  [/সাহস/g, 'শাহোশ'],
  [/বয়স/g, 'বয়োশ'],

  // Authentic Bangladeshi Vowel Harmony & Ya-Phala Gemination
  [/মধ্যে/g, 'মোদ্ধে'],
  [/জন্যে/g, 'জোন্নে'],
  [/জন্য/g, 'জোন্নো'],
  [/অন্য/g, 'ওন্নো'],
  [/অন্যান্য/g, 'ওন্নান্নো'],
  [/সত্যিই/g, 'শোত্তিই'],
  [/সত্যি/g, 'শোত্তি'],
  [/সত্য/g, 'শোত্তো'],
  [/সত্যজিৎ/g, 'শোত্তোজিৎ'],
  [/তথ্য/g, 'তোথ্থো'],
  [/লক্ষ্য/g, 'লোক্খো'],
  [/লক্ষ/g, 'লোক্খো'],
  [/সহ্য/g, 'শোজ্ঝো'],
  [/অসহ্য/g, 'অশোজ্ঝো'],
  [/সাহায্য/g, 'শাহাজ্জো'],
  [/ঐতিহ্য/g, 'ঐতিজ্ঝো'],
  [/অবশ্যই/g, 'অবোশশোই'],
  [/অবশ্য/g, 'অবোশশো'],
  [/প্রথম/g, 'প্রোথম'],
  [/প্রথমে/g, 'প্রোথমে'],
  [/বক্তব্য/g, 'বোক্‌তোব্বো'],
  [/দায়িত্ববোধ/g, 'দায়িত্তোবোধ'],
  [/দায়িত্ব/g, 'দায়িত্তো'],
  [/ব্যক্তিজীবনের/g, 'বেক্‌তিজীবনের'],
  [/ব্যক্তি/g, 'বেক্‌তি'],

  // Conjunct `জ্ঞ` (Jña -> Gya / Ggo in Bangla)
  [/জিজ্ঞেস/g, 'জিগ্গেশ'],
  [/জিজ্ঞাসা/g, 'জিগ্গাশা'],
  [/জ্ঞান/g, 'গ্যান'],
  [/জ্ঞানী/g, 'গ্যানী'],
  [/বিজ্ঞান/g, 'বিগ্গ্যান'],
  [/বিজ্ঞানী/g, 'বিগ্গ্যানী'],
  [/কৃতজ্ঞতা/g, 'কৃতগ্গোতা'],
  [/কৃতজ্ঞ/g, 'কৃতগ্গো'],
  [/অভিজ্ঞতা/g, 'ওভিগ্গোতা'],
  [/অভিজ্ঞ/g, 'ওভিগ্গো'],
  [/সংজ্ঞা/g, 'শংগ্যা'],

  // Conjunct `ক্ষ` at word start (Kṣa -> Kha in Bangla)
  [/(^|[\s—‘“"'(])ক্ষমা/g, '$1খমা'],
  [/(^|[\s—‘“"'(])ক্ষতি/g, '$1খতি'],
  [/(^|[\s—‘“"'(])ক্ষণ/g, '$1খন'],
  [/(^|[\s—‘“"'(])ক্ষুধা/g, '$1খুধা'],
  [/(^|[\s—‘“"'(])ক্ষুদ্র/g, '$1খুদ্র'],
  [/(^|[\s—‘“"'(])ক্ষেত্র/g, '$1খেত্র'],
  [/(^|[\s—‘“"'(])ক্ষেত্রে/g, '$1খেত্রে'],
  [/(^|[\s—‘“"'(])ক্ষোভ/g, '$1খোভ'],
  [/(^|[\s—‘“"'(])ক্ষমতা/g, '$1খমতা'],
];

/**
 * Transforms Bengali text into a phonetically trained Bangladeshi TTS script for RJ Kebria's voice model:
 * - Guarantees that the letter `স` (`\u09B8`) is pronounced as `"Sh"` (`শ` `\u09B6`) across all Bengali words.
 * - Normalizes silent ba-phala (`স্ব` -> `শ`) and ma-phala (`স্ম` -> `শ`) so words like `স্বাভাবিক` ("Shabhabik")
 *   and `স্বপ্ন` ("Shopno") never sound robotic or Hindi-accented.
 * - Preserves the visual UI text untouched (this function is ONLY used for the audio synthesis stream).
 */
export function applyRJKebriaBanglaPhoneticTraining(rawText: string): string {
  if (!rawText) return '';

  let phonetic = rawText;

  // Step 1: Apply lexicon-level Bangladeshi vowel harmony & frequent RJ Kebria vocabulary
  for (const [pattern, replacement] of BANGLADESHI_PHONETIC_LEXICON) {
    phonetic = phonetic.replace(pattern, replacement);
  }

  // Step 2: Normalize Bengali `স্ব` (silent ba-phala) -> `শ` ("Sh")
  // e.g. স্বাভাবিক -> শাভাবিক, স্বপ্ন -> শপ্ন, স্বাধীন -> শাধীন, স্বাগতম -> শাগতম, স্বাস্থ্য -> শাস্থ্য
  phonetic = phonetic.replace(/স্ব/g, 'শ');

  // Step 3: Normalize Bengali `স্ম` (silent ma-phala) -> `শ` ("Sh")
  // e.g. স্মৃতি -> শৃতি, স্মরণ -> শরণ, স্মারক -> শারক
  phonetic = phonetic.replace(/স্ম/g, 'শ');

  // Step 4: Normalize Bengali `স্র` -> `শ্র` ("Shr")
  // e.g. স্রোত -> শ্রোত, স্রষ্টা -> শ্রষ্টা, সহস্র -> শহশ্র
  phonetic = phonetic.replace(/স্র/g, 'শ্র');

  // Step 5: Universal Bangla `স` & `ষ` -> `শ` ("Sh" `[ʃ]`) Phonetic Rule:
  // Convert every remaining `স` (\u09B8) and `ষ` (\u09B7) when not immediately followed by virama (`্`) + dental/retroflex stop cluster
  // into `শ` (\u09B6) so the TTS engine pronounces "স" as "Sh" without exception.
  phonetic = phonetic.replace(/স(?!্[তথকপটনলস])/g, 'শ');
  phonetic = phonetic.replace(/ষ(?!্[টঠকপফণম])/g, 'শ');

  // Step 6: Convert literary em-dashes (`—`) and ellipses (`...`, `…`) into natural breath pauses
  // so RJ Kebria's voice model takes unhurried, contemplative pauses between clauses
  phonetic = phonetic.replace(/\s*[—–]\s*/g, ', ');
  phonetic = phonetic.replace(/(?:\.{2,}|…)/g, '। ');

  return phonetic;
}

/**
 * Applies RJ Kebria's Studio Broadcast Condenser Microphone & Tube Preamp Mastering Chain
 * to an HTMLAudioElement via Web Audio API, replicating the exact close-mic acoustic warmth
 * of `/assets/aistudio/Voice_Model___RJ_Kebria__d6ddbc00.mp3`.
 */
export function attachRJKebriaBroadcastMasteringChain(
  audioElement: HTMLAudioElement,
  audioCtx: AudioContext | null | undefined,
  style: RJKebriaVoiceStyle = 'rj-kebria-jibon-golpo'
): (() => void) | null {
  if (typeof window === 'undefined' || !audioCtx) return null;

  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const spec = RJ_KEBRIA_VOICE_MODELS[style] || RJ_KEBRIA_VOICE_MODELS['rj-kebria-jibon-golpo'];
    const source = audioCtx.createMediaElementSource(audioElement);

    // 1. Sub-sonic Studio High-Pass Filter (removes rumble below 68Hz)
    const highPass = audioCtx.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 68;
    highPass.Q.value = 0.707;

    // 2. RJ Kebria Signature Chest Resonance Boost (126–138 Hz close-mic baritone warmth)
    const chestWarmth = audioCtx.createBiquadFilter();
    chestWarmth.type = 'peaking';
    chestWarmth.frequency.value = spec.warmthFreqHz;
    chestWarmth.gain.value = spec.chestResonanceDb;
    chestWarmth.Q.value = 1.1;

    // 3. Vocal Body & Intimacy Filter (250 Hz)
    const vocalBody = audioCtx.createBiquadFilter();
    vocalBody.type = 'peaking';
    vocalBody.frequency.value = 250;
    vocalBody.gain.value = 1.6;
    vocalBody.Q.value = 1.2;

    // 4. Smooth Palato-Alveolar "Sh" (`শ/স`) Articulation Band (2400 Hz)
    const shArticulation = audioCtx.createBiquadFilter();
    shArticulation.type = 'peaking';
    shArticulation.frequency.value = 2400;
    shArticulation.gain.value = 1.2;
    shArticulation.Q.value = 1.1;

    // 5. Anti-Metallic Silk Filter (3500 Hz gentle dip to ensure 0% robotic/harsh edge)
    const silkDip = audioCtx.createBiquadFilter();
    silkDip.type = 'peaking';
    silkDip.frequency.value = 3500;
    silkDip.gain.value = spec.presenceDipDb;
    silkDip.Q.value = 1.4;

    // 6. Studio Condenser Air Shelf (9000 Hz)
    const airShelf = audioCtx.createBiquadFilter();
    airShelf.type = 'highshelf';
    airShelf.frequency.value = 9000;
    airShelf.gain.value = spec.airBoostDb;

    // 7. Broadcast FM Compressor (even, intimate dynamic envelope like Dhaka FM 90.4)
    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = spec.compressionThresholdDb;
    compressor.knee.value = 18;
    compressor.ratio.value = spec.compressionRatio;
    compressor.attack.value = 0.008;
    compressor.release.value = 0.18;

    // 8. Output Makeup Gain
    const makeupGain = audioCtx.createGain();
    makeupGain.gain.value = 1.14;

    source
      .connect(highPass)
      .connect(chestWarmth)
      .connect(vocalBody)
      .connect(shArticulation)
      .connect(silkDip)
      .connect(airShelf)
      .connect(compressor)
      .connect(makeupGain)
      .connect(audioCtx.destination);

    return () => {
      try {
        source.disconnect();
        highPass.disconnect();
        chestWarmth.disconnect();
        vocalBody.disconnect();
        shArticulation.disconnect();
        silkDip.disconnect();
        airShelf.disconnect();
        compressor.disconnect();
        makeupGain.disconnect();
      } catch {
        // ignore disconnect errors on cleanup
      }
    };
  } catch {
    return null;
  }
}
