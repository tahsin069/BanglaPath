import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { BARITONE_VOICE_PRESETS, MaleNarratorPersona } from '@/lib/baritone-audio-engine';
import { synthesizeNativeNeuralMp3 } from '@/lib/bangla-neural-tts';

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

function ensureWavHeader(audioBuffer: Buffer, sampleRate = 24000): Buffer {
  if (
    audioBuffer.length >= 4 &&
    audioBuffer[0] === 0x52 &&
    audioBuffer[1] === 0x49 &&
    audioBuffer[2] === 0x46 &&
    audioBuffer[3] === 0x46
  ) {
    return audioBuffer;
  }

  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = audioBuffer.length;
  const header = Buffer.alloc(44);

  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, audioBuffer]);
}

async function synthesizeElevenLabsMaleNarrator(
  text: string,
  voiceId: string
): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_ELEVENLABS_API_KEY') return null;

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
        voiceId
      )}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: text.slice(0, 4500),
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.68,
            similarity_boost: 0.84,
            style: 0.22,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!res.ok) return null;
    const arrBuf = await res.arrayBuffer();
    const buf = Buffer.from(arrBuf);
    if (buf.length < 256) return null;
    return buf.toString('base64');
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      lang = 'bn',
      persona = 'deep-baritone',
      style = 'Soothing, natural male audiobook narrator',
    } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required for audiobook narration.' },
        { status: 400 }
      );
    }

    const targetLang: 'bn' | 'en' = lang === 'en' ? 'en' : 'bn';
    const validPersona: MaleNarratorPersona =
      persona in BARITONE_VOICE_PRESETS ? (persona as MaleNarratorPersona) : 'deep-baritone';
    const preset = BARITONE_VOICE_PRESETS[validPersona];

    // =========================================================================
    // PATH A: BENGALI NARRATION (lang === 'bn')
    // Exclusively uses 100% Native Bengali Male Voices (bn-IN-BashkarNeural & bn-BD-PradeepNeural)
    // with authentic Bengali literary SSML phrasing so there is NEVER a foreign accent!
    // =========================================================================
    if (targetLang === 'bn') {
      const bnCandidates: Array<{ voiceName: string; locale: string }> = [
        { voiceName: preset.neuralVoiceBn, locale: preset.localeBn },
        {
          voiceName:
            preset.neuralVoiceBn === 'bn-IN-BashkarNeural'
              ? 'bn-BD-PradeepNeural'
              : 'bn-IN-BashkarNeural',
          locale: preset.localeBn === 'bn-IN' ? 'bn-BD' : 'bn-IN',
        },
      ];

      for (const candidate of bnCandidates) {
        try {
          const mp3Buffer = await synthesizeNativeNeuralMp3({
            text: text.slice(0, 3800),
            voiceName: candidate.voiceName,
            locale: candidate.locale,
            rate: preset.neuralRate,
            pitch: preset.neuralPitch,
            isPoetic: preset.isPoetic,
          });

          return NextResponse.json({
            audioBase64: mp3Buffer.toString('base64'),
            mimeType: 'audio/mpeg',
            lang: 'bn',
            voiceName: `${preset.labelBn} (${candidate.voiceName})`,
            engine: 'native-bangla-male-neural-96k',
          });
        } catch {
          // Try next native Bengali male candidate
        }
      }
    }

    // =========================================================================
    // PATH B: ENGLISH NARRATION (lang === 'en')
    // Uses ElevenLabs (if key configured) -> Native Neural Male (Brian / Andrew / Ryan) -> Gemini TTS
    // =========================================================================
    if (targetLang === 'en') {
      const elevenLabsBase64 = await synthesizeElevenLabsMaleNarrator(
        text,
        preset.elevenLabsVoiceId
      );
      if (elevenLabsBase64) {
        return NextResponse.json({
          audioBase64: elevenLabsBase64,
          mimeType: 'audio/mpeg',
          lang: 'en',
          voiceName: preset.labelEn,
          engine: 'elevenlabs-multilingual-v2',
        });
      }

      const enCandidates: Array<{ voiceName: string; locale: string }> = [
        { voiceName: preset.neuralVoiceEn, locale: preset.localeEn },
        { voiceName: 'en-US-BrianMultilingualNeural', locale: 'en-US' },
      ];

      for (const candidate of enCandidates) {
        try {
          const mp3Buffer = await synthesizeNativeNeuralMp3({
            text: text.slice(0, 3800),
            voiceName: candidate.voiceName,
            locale: candidate.locale,
            rate: preset.neuralRate,
            pitch: preset.neuralPitch,
            isPoetic: preset.isPoetic,
          });

          return NextResponse.json({
            audioBase64: mp3Buffer.toString('base64'),
            mimeType: 'audio/mpeg',
            lang: 'en',
            voiceName: `${preset.labelEn} (${candidate.voiceName})`,
            engine: 'native-english-male-neural-96k',
          });
        } catch {
          // Try next English male candidate
        }
      }

      // Secondary English fallback: Gemini 3.8 TTS Male Voice
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: text.slice(0, 4000),
                  // @ts-ignore - speechMetadata supported by Gemini 3.8 TTS
                  speechMetadata: {
                    style: `${preset.descriptionEn} ${style}`,
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: preset.geminiVoice },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          const rawBuf = Buffer.from(base64Audio, 'base64');
          const wavBuf = ensureWavHeader(rawBuf, 24000);
          return NextResponse.json({
            audioBase64: wavBuf.toString('base64'),
            mimeType: 'audio/wav',
            lang: 'en',
            voiceName: preset.labelEn,
            engine: 'gemini-3.8-flash-lite-tts',
          });
        }
      } catch {
        // Fall through
      }
    }

    return NextResponse.json(
      {
        fallback: true,
        lang: targetLang,
        voiceName: preset.labelBn,
        reason: 'Using client male speech synthesis.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        fallback: true,
        reason: error?.message || 'Using client male speech synthesis.',
      },
      { status: 200 }
    );
  }
}
