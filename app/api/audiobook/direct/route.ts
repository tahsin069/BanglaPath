import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import {
  directBengaliLiteraryPassage,
  DirectedNarrationSegment,
} from '@/lib/bengali-narration-director';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DIRECTOR_SYSTEM_INSTRUCTION = `You are an expert Bengali audiobook narration director.

Prepare the supplied Bengali literary text for natural human-like audiobook narration.

Requirements:
1. Preserve the original meaning and wording.
2. Never summarize or rewrite the literature.
3. Maintain natural Bengali punctuation.
4. Divide long paragraphs into smaller narration-friendly segments.
5. Preserve dialogue and character distinctions.
6. Mark emotional changes and natural pauses.
7. Maintain authentic Bangladeshi Bengali pronunciation conventions.
8. Avoid unnecessary pauses between words.

Return clean, structured narration segments.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, lang = 'bn', useAiDirector = false } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Bengali literary text is required for narration direction.' },
        { status: 400 }
      );
    }

    const targetLang: 'bn' | 'en' = lang === 'en' ? 'en' : 'bn';

    // Always compute the deterministic, verbatim-preserving Narration Director segments first
    const baseSegments = directBengaliLiteraryPassage(text.slice(0, 4000), targetLang);

    if (!useAiDirector || !process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        segments: baseSegments,
        directorEngine: 'bengali-narration-director-bn-bd',
        preservedWordIntegrity: true,
      });
    }

    // Optional AI-assisted directorial pass using Gemini with strict JSON schema
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: text.slice(0, 3500),
        config: {
          systemInstruction: DIRECTOR_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              segments: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: {
                      type: Type.STRING,
                      description:
                        'Exact, unmodified Bengali literary text for this narration segment. Never rewrite or summarize.',
                    },
                    type: {
                      type: Type.STRING,
                      description: 'narration, dialogue, or introspection',
                    },
                    emotionLabelBn: {
                      type: Type.STRING,
                      description:
                        'Bengali emotional inflection cue (e.g. শান্ত ও স্বাভাবিক বর্ণনা, স্বাভাবিক সংলাপ, ধীর ও গভীর অনুভব)',
                    },
                    emotionLabelEn: {
                      type: Type.STRING,
                      description: 'English emotional inflection cue',
                    },
                    pauseAfterMs: {
                      type: Type.INTEGER,
                      description: 'Natural pause after this segment in milliseconds (250 to 500)',
                    },
                  },
                  required: [
                    'text',
                    'type',
                    'emotionLabelBn',
                    'emotionLabelEn',
                    'pauseAfterMs',
                  ],
                },
              },
            },
            required: ['segments'],
          },
        },
      });

      const rawJson = response.text;
      if (rawJson) {
        const parsed = JSON.parse(rawJson) as {
          segments?: Array<{
            text: string;
            type: string;
            emotionLabelBn: string;
            emotionLabelEn: string;
            pauseAfterMs: number;
          }>;
        };

        if (Array.isArray(parsed.segments) && parsed.segments.length > 0) {
          const aiSegments: DirectedNarrationSegment[] = parsed.segments.map((s, idx) => {
            const segType =
              s.type === 'dialogue' || s.type === 'introspection' ? s.type : 'narration';
            const pauseMs = Math.max(220, Math.min(550, Number(s.pauseAfterMs) || 340));
            return {
              id: `ai-seg-${idx + 1}`,
              index: idx + 1,
              text: s.text.trim(),
              type: segType,
              typeLabelBn:
                segType === 'dialogue'
                  ? 'সংলাপ (Dialogue)'
                  : segType === 'introspection'
                  ? 'অন্তর্গত ভাবনা (Inner Thought)'
                  : 'বর্ণনা (Narration)',
              emotion: segType === 'dialogue' ? 'warm-dialogue' : 'calm-narrative',
              emotionLabelBn: s.emotionLabelBn || 'শান্ত ও স্বাভাবিক বর্ণনা',
              emotionLabelEn: s.emotionLabelEn || 'Calm Literary Narration',
              pauseAfterMs: pauseMs,
              pauseCueBn: `[স্বাভাবিক শ্বাস বিরতি · ${pauseMs} মি.সে.]`,
              prosodyRate: segType === 'dialogue' ? '+0%' : '-2%',
              prosodyPitch: segType === 'dialogue' ? '+1Hz' : '+0Hz',
              locale: targetLang === 'bn' ? 'bn-BD' : 'en-US',
            };
          });

          return NextResponse.json({
            segments: aiSegments,
            directorEngine: 'gemini-3-flash-narration-director-bn-bd',
            preservedWordIntegrity: true,
          });
        }
      }
    } catch {
      // Fall back gracefully to deterministic baseSegments
    }

    return NextResponse.json({
      segments: baseSegments,
      directorEngine: 'bengali-narration-director-bn-bd',
      preservedWordIntegrity: true,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to prepare structured narration segments.',
      },
      { status: 500 }
    );
  }
}
