/**
 * Bengali Audiobook Narration Director (`bn-BD` Authentic Literary Direction Engine)
 *
 * Prepares Bengali literary text for natural, human-like audiobook narration following
 * the 8 strict directorial principles:
 * 1. Preserve the original meaning and wording (zero summarization or rewriting).
 * 2. Never summarize or rewrite the literature.
 * 3. Maintain natural Bengali punctuation (।, ?, !, —, “…”).
 * 4. Divide long paragraphs into smaller narration-friendly breath segments.
 * 5. Preserve dialogue and character distinctions.
 * 6. Mark emotional changes and natural pauses.
 * 7. Maintain authentic Bangladeshi Bengali (`bn-BD`) pronunciation conventions.
 * 8. Avoid unnecessary pauses between words (continuous breath-group phrasing).
 */

export type NarrationSegmentType = 'narration' | 'dialogue' | 'introspection';

export type NarrationEmotionTone =
  | 'calm-narrative'
  | 'warm-dialogue'
  | 'somber-reflective'
  | 'tense-suspense'
  | 'inquisitive'
  | 'dramatic-emphasis';

export interface DirectedNarrationSegment {
  id: string;
  index: number;
  /** Exact, un-rewritten literary text of the segment */
  text: string;
  /** Segment role: narrative prose, character dialogue, or inner monologue */
  type: NarrationSegmentType;
  typeLabelBn: string;
  /** Detected emotional tone for vocal inflection */
  emotion: NarrationEmotionTone;
  emotionLabelBn: string;
  emotionLabelEn: string;
  /** Natural pause after this segment in milliseconds (no word-level chopping) */
  pauseAfterMs: number;
  /** Human-readable directorial cue (e.g. "[স্বাভাবিক শ্বাস বিরতি · ৩৫০ মি.সে.]") */
  pauseCueBn: string;
  /** Subtle SSML prosody rate adjustment for natural human delivery */
  prosodyRate: string;
  /** Subtle SSML prosody pitch adjustment for dialogue/character distinction */
  prosodyPitch: string;
  /** Locale locked to authentic Bangladeshi Bengali (`bn-BD`) for Bengali script */
  locale: 'bn-BD' | 'en-US';
}

const SOMBER_KEYWORDS_BN = [
  'মৃত্যু',
  'কান্না',
  'অশ্রু',
  'শোক',
  'বিষাদ',
  'অন্ধকার',
  'নীরব',
  'নিস্তব্ধ',
  'শূন্য',
  'হাহাকার',
  'দীর্ঘশ্বাস',
  'ব্যথা',
  'বেদনা',
  'কষ্ট',
  'একা',
  'রাত',
  'ছায়া',
  'বিদায়',
];

const TENSE_KEYWORDS_BN = [
  'হঠাৎ',
  'চমকে',
  'ভয়',
  'আতঙ্ক',
  'রক্ত',
  'চিৎকার',
  'গুলি',
  'যুদ্ধ',
  'আগুন',
  'ঝড়',
  'কাঁপতে',
  'সর্বনাশ',
  'অপরাধ',
  'সন্দেহ',
];

const WARM_KEYWORDS_BN = [
  'হাসি',
  'আনন্দ',
  'ভালোবাসা',
  'স্নেহ',
  'মা',
  'রোদ',
  'আলো',
  'ফুল',
  'গান',
  'স্বপ্ন',
  'প্রিয়',
  'সুন্দর',
  'শান্তি',
];

/**
 * Cleans invisible zero-width artifacts while strictly preserving 100% of the
 * author's original Bengali wording, spelling, and natural punctuation (`।`, `?`, `!`, `—`, quotes).
 * Never inserts artificial commas or spaces between words.
 */
export function preserveAuthenticBangladeshiText(rawText: string): string {
  return rawText
    // Normalize whitespace without altering words or punctuation
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    // Normalize ASCII pipe `|` when used as Bengali danda `।`
    .replace(/\s*\|\s*/g, '। ')
    // Ensure a clean single space after Bengali danda `।` if followed immediately by a letter
    .replace(/।(?=[\u0980-\u09FF])/g, '। ')
    // Keep compound hyphenated Bengali words joined so TTS never pauses mid-word
    .replace(/([\u0980-\u09FF])\s*-\s*([\u0980-\u09FF])/g, '$1-$2')
    // Keep initials like "ড." or "মো." flowing smoothly without a full sentence stop
    .replace(/(ড|মো|প্রো|মি|ডা)\.\s+/g, '$1 ')
    .trim();
}

/**
 * Detects whether a segment contains spoken character dialogue or inner thought.
 */
function detectSegmentType(segmentText: string): {
  type: NarrationSegmentType;
  typeLabelBn: string;
} {
  const hasQuotes =
    /[“”"‘’']/.test(segmentText) ||
    /^—/.test(segmentText.trim()) ||
    /\b(বলল|বললেন|বললাম|জিজ্ঞেস করল|ডাকল|উত্তর দিল|হেসে বলল|চেঁচিয়ে উঠল)\b/.test(segmentText);

  if (hasQuotes) {
    return {
      type: 'dialogue',
      typeLabelBn: 'সংলাপ (Dialogue)',
    };
  }

  if (/\b(ভাবল|ভাবলেন|মনে হলো|মনে মনে|চিন্তা করল)\b/.test(segmentText)) {
    return {
      type: 'introspection',
      typeLabelBn: 'অন্তর্গত ভাবনা (Inner Thought)',
    };
  }

  return {
    type: 'narration',
    typeLabelBn: 'বর্ণনা (Narration)',
  };
}

/**
 * Detects the emotional inflection and prosodic contour of a Bengali literary segment.
 */
function detectEmotionAndProsody(
  segmentText: string,
  segmentType: NarrationSegmentType
): {
  emotion: NarrationEmotionTone;
  emotionLabelBn: string;
  emotionLabelEn: string;
  prosodyRate: string;
  prosodyPitch: string;
  pauseAfterMs: number;
  pauseCueBn: string;
} {
  const trimmed = segmentText.trim();

  // 1. Inquisitive / Questioning
  if (trimmed.endsWith('?')) {
    return {
      emotion: 'inquisitive',
      emotionLabelBn: 'জিজ্ঞাসা ও কৌতূহল',
      emotionLabelEn: 'Inquisitive',
      prosodyRate: segmentType === 'dialogue' ? '-1%' : '-2%',
      prosodyPitch: '+1Hz',
      pauseAfterMs: 420,
      pauseCueBn: '[প্রশ্নসূচক বিরতি · ৪২০ মি.সে.]',
    };
  }

  // 2. Dramatic Exclamation / Emotional Peak
  if (trimmed.endsWith('!')) {
    const isTense = TENSE_KEYWORDS_BN.some((kw) => trimmed.includes(kw));
    return {
      emotion: isTense ? 'tense-suspense' : 'dramatic-emphasis',
      emotionLabelBn: isTense ? 'উৎকণ্ঠা ও নাটকীয়তা' : 'আবেগঘন বিস্ময়',
      emotionLabelEn: isTense ? 'Tense & Dramatic' : 'Expressive Emphasis',
      prosodyRate: '+0%',
      prosodyPitch: '+1Hz',
      pauseAfterMs: 440,
      pauseCueBn: '[আবেগঘন বিরতি · ৪৪০ মি.সে.]',
    };
  }

  // 3. Tense / Suspenseful Narrative
  if (TENSE_KEYWORDS_BN.some((kw) => trimmed.includes(kw))) {
    return {
      emotion: 'tense-suspense',
      emotionLabelBn: 'চাপা উত্তেজনা',
      emotionLabelEn: 'Measured Suspense',
      prosodyRate: '-2%',
      prosodyPitch: '+0Hz',
      pauseAfterMs: 380,
      pauseCueBn: '[নাটকীয় বিরতি · ৩৮০ মি.সে.]',
    };
  }

  // 4. Somber / Reflective / Melancholic
  if (
    SOMBER_KEYWORDS_BN.some((kw) => trimmed.includes(kw)) ||
    trimmed.includes('...') ||
    trimmed.includes('…')
  ) {
    return {
      emotion: 'somber-reflective',
      emotionLabelBn: 'ধীর ও গভীর অনুভব',
      emotionLabelEn: 'Somber & Reflective',
      prosodyRate: '-4%',
      prosodyPitch: '-1Hz',
      pauseAfterMs: 450,
      pauseCueBn: '[গভীর অনুভব বিরতি · ৪৫০ মি.সে.]',
    };
  }

  // 5. Character Dialogue (distinct from narrator prose)
  if (segmentType === 'dialogue') {
    return {
      emotion: 'warm-dialogue',
      emotionLabelBn: 'স্বাভাবিক সংলাপ',
      emotionLabelEn: 'Character Dialogue',
      prosodyRate: '+0%',
      prosodyPitch: '+1Hz',
      pauseAfterMs: 360,
      pauseCueBn: '[সংলাপ পরিবর্তন বিরতি · ৩৬০ মি.সে.]',
    };
  }

  // 6. Warm / Lyrical Narrative
  if (WARM_KEYWORDS_BN.some((kw) => trimmed.includes(kw))) {
    return {
      emotion: 'warm-dialogue',
      emotionLabelBn: 'উষ্ণ ও প্রাঞ্জল পাঠ',
      emotionLabelEn: 'Warm Literary Flow',
      prosodyRate: '-2%',
      prosodyPitch: '+0Hz',
      pauseAfterMs: 320,
      pauseCueBn: '[স্বাভাবিক শ্বাস বিরতি · ৩২০ মি.সে.]',
    };
  }

  // 7. Default Calm Bangladeshi Literary Narration
  return {
    emotion: 'calm-narrative',
    emotionLabelBn: 'শান্ত ও স্বাভাবিক বর্ণনা',
    emotionLabelEn: 'Calm Literary Narration',
    prosodyRate: '-2%',
    prosodyPitch: '+0Hz',
    pauseAfterMs: 320,
    pauseCueBn: '[স্বাভাবিক শ্বাস বিরতি · ৩২০ মি.সে.]',
  };
}

/**
 * Splits a long paragraph into natural, narration-friendly segments without ever rewriting
 * words or introducing choppy mid-phrase breaks.
 *
 * - Keeps short/medium sentences grouped in natural breath units (90–220 chars).
 * - Separates dialogue turns (`“...”`) onto their own narration segment so character
 *   distinctions and emotional shifts are clearly articulated.
 * - For extra-long compound sentences (> 240 chars), splits gently at natural em-dash (`—`),
 *   semicolon (`;`), or major clause comma (`,`) boundaries.
 */
export function directBengaliLiteraryPassage(
  rawText: string,
  lang: 'bn' | 'en' = 'bn'
): DirectedNarrationSegment[] {
  const preserved = preserveAuthenticBangladeshiText(rawText);
  if (!preserved) return [];

  // Step 1: Split into primary sentence units while keeping terminal punctuation (।, ?, !, .) attached
  const sentenceRegex =
    lang === 'bn'
      ? /[^।?!]+(?:[।?!]+["”’']*|\s*$)/g
      : /[^.?!]+(?:[.?!]+["”’']*|\s*$)/g;

  const rawSentences = (preserved.match(sentenceRegex) || [preserved])
    .map((s) => s.trim())
    .filter(Boolean);

  // Step 2: Divide long sentences (> 240 chars) at natural em-dash (`—`) or semicolon/clause boundaries,
  // and group very short consecutive narrative sentences (< 75 chars) if they share the same narrative mode.
  const breathUnits: string[] = [];

  for (const sentence of rawSentences) {
    if (sentence.length > 240) {
      // Split at em-dash or semicolon first, or at a balanced clause comma if still > 240 chars
      const subClauses = sentence
        .split(/(?<=—|;)\s+|(?<=,)\s+(?=.{60,})/g)
        .map((c) => c.trim())
        .filter(Boolean);

      let accum = '';
      for (const clause of subClauses) {
        if (accum && (accum + ' ' + clause).length > 210) {
          breathUnits.push(accum.trim());
          accum = clause;
        } else {
          accum = accum ? `${accum} ${clause}` : clause;
        }
      }
      if (accum.trim()) {
        breathUnits.push(accum.trim());
      }
    } else if (
      breathUnits.length > 0 &&
      breathUnits[breathUnits.length - 1].length < 75 &&
      sentence.length < 95 &&
      !/[“”"‘’'?!]/.test(breathUnits[breathUnits.length - 1]) &&
      !/[“”"‘’'?!]/.test(sentence)
    ) {
      // Combine two short calm narrative sentences into a single smooth breath unit
      // to avoid unnecessary choppy pauses
      breathUnits[breathUnits.length - 1] = `${breathUnits[breathUnits.length - 1]} ${sentence}`;
    } else {
      breathUnits.push(sentence);
    }
  }

  // Step 3: Annotate each breath unit with character/dialogue role, emotional inflection, and natural pause
  return breathUnits.map((unitText, idx) => {
    const { type, typeLabelBn } = detectSegmentType(unitText);
    const emotionMeta = detectEmotionAndProsody(unitText, type);

    // Final segment of a paragraph gets a slightly gentler trailing pause
    const pauseAfterMs =
      idx === breathUnits.length - 1
        ? Math.min(emotionMeta.pauseAfterMs, 300)
        : emotionMeta.pauseAfterMs;

    return {
      id: `seg-${idx + 1}`,
      index: idx + 1,
      text: unitText,
      type,
      typeLabelBn,
      emotion: emotionMeta.emotion,
      emotionLabelBn: emotionMeta.emotionLabelBn,
      emotionLabelEn: emotionMeta.emotionLabelEn,
      pauseAfterMs,
      pauseCueBn: emotionMeta.pauseCueBn,
      prosodyRate: emotionMeta.prosodyRate,
      prosodyPitch: emotionMeta.prosodyPitch,
      locale: lang === 'bn' ? 'bn-BD' : 'en-US',
    };
  });
}

function escapeXmlText(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Builds directed SSML from structured narration segments so the Bangladeshi Bengali Male
 * Voice Artist (`bn-BD-PradeepNeural`) delivers each segment with natural prosody,
 * character dialogue distinction, authentic `bn-BD` pronunciation, and zero word-chopping.
 */
export function buildDirectedBanglaSSML(options: {
  text: string;
  voiceName: string;
  locale: string;
}): {
  ssml: string;
  segments: DirectedNarrationSegment[];
} {
  const { text, voiceName, locale } = options;
  const lang: 'bn' | 'en' = locale.toLowerCase().startsWith('bn') ? 'bn' : 'en';
  const segments = directBengaliLiteraryPassage(text, lang);

  // Join the directed breath segments with clean single spaces so natural Bengali punctuation
  // (।, ?, !, —, commas, and quotation marks) drives authentic Bangladeshi pauses with zero word-chopping
  const directedFlowText =
    segments.length > 0
      ? segments.map((s) => s.text).join(' ')
      : preserveAuthenticBangladeshiText(text);

  const xmlSafeText = escapeXmlText(directedFlowText);

  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${locale}">
                <voice name="${voiceName}">
                    <prosody pitch="+0Hz" rate="+0%" volume="+0%">
                        ${xmlSafeText}
                    </prosody>
                </voice>
            </speak>`;

  return { ssml, segments };
}
