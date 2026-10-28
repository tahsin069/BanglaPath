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

async function synthesizeElevenLabsMaleVoice(
  text: string,
  voiceId: string
): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey || !apiKey.startsWith('sk_')) return null;

  const targetVoiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || voiceId;

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
        targetVoiceId
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
            stability: 0.65,
            similarity_boost: 0.85,
            style: 0.25,
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

async function synthesizeGeminiMaleVoice(
  text: string,
  lang: 'bn' | 'en',
  geminiVoice: 'Charon' | 'Fenrir' | 'Puck'
): Promise<string | null> {
  if (!process.env.GEMINI_API_KEY) return null;

  try {
    const stylePrompt =
      lang === 'bn'
        ? 'Warm, natural, soothing Bengali male audiobook storyteller with clear standard Bangla pronunciation and calm literary pacing'
        : 'Warm, natural, soothing deep male audiobook storyteller with calm literary pacing';

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
                style: stylePrompt,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: geminiVoice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    const rawBuf = Buffer.from(base64Audio, 'base64');
    if (rawBuf.length < 256) return null;

    const wavBuf = ensureWavHeader(rawBuf, 24000);
    return wavBuf.toString('base64');
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, lang = 'bn', persona = 'deep-baritone' } = body;

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
    // PATH A: UNIVERSAL GENERIC BENGALI MALE VOICE PACK (lang === 'bn')
    // 1. Standard Generic Bengali Male Neural Voice Pack (`bn-BD-PradeepNeural` & `bn-IN-BashkarNeural`)
    // 2. Gemini 3.8 TTS Male Voice (`Charon`) over HTTPS REST
    // 3. ElevenLabs Multilingual v2 Male Voice (if sk_ key is configured)
    // =========================================================================
    if (targetLang === 'bn') {
      const bnCandidates: Array<{ voiceName: string; locale: string; label: string }> = [
        {
          voiceName: 'bn-BD-PradeepNeural',
          locale: 'bn-BD',
          label: 'বাংলা পুরুষ কণ্ঠ · Generic Bangla Male Voice (Pradeep)',
        },
        {
          voiceName: 'bn-IN-BashkarNeural',
          locale: 'bn-IN',
          label: 'বাংলা পুরুষ কণ্ঠ · Generic Bangla Male Voice (Bashkar)',
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
            voiceName: candidate.label,
            engine: 'generic-bangla-male-neural-96k',
          });
        } catch {
          // Try next Bengali male voice candidate
        }
      }

      const geminiBnWavBase64 = await synthesizeGeminiMaleVoice(text, 'bn', preset.geminiVoice);
      if (geminiBnWavBase64) {
        return NextResponse.json({
          audioBase64: geminiBnWavBase64,
          mimeType: 'audio/wav',
          lang: 'bn',
          voiceName: 'বাংলা পুরুষ কণ্ঠ · Universal Bangla Male Voice',
          engine: 'gemini-3.8-flash-lite-tts-male',
        });
      }

      const elevenLabsBnBase64 = await synthesizeElevenLabsMaleVoice(
        text,
        preset.elevenLabsVoiceId
      );
      if (elevenLabsBnBase64) {
        return NextResponse.json({
          audioBase64: elevenLabsBnBase64,
          mimeType: 'audio/mpeg',
          lang: 'bn',
          voiceName: 'বাংলা পুরুষ কণ্ঠ · Studio Bangla Male Voice',
          engine: 'elevenlabs-multilingual-v2-male',
        });
      }
    }

    // =========================================================================
    // PATH B: UNIVERSAL GENERIC ENGLISH MALE VOICE PACK (lang === 'en')
    // =========================================================================
    if (targetLang === 'en') {
      const enCandidates: Array<{ voiceName: string; locale: string }> = [
        { voiceName: 'en-US-BrianMultilingualNeural', locale: 'en-US' },
        { voiceName: 'en-GB-RyanNeural', locale: 'en-GB' },
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
            voiceName: 'Universal Male Storyteller (EN)',
            engine: 'generic-english-male-neural-96k',
          });
        } catch {
          // Try next English male candidate
        }
      }

      const geminiEnWavBase64 = await synthesizeGeminiMaleVoice(text, 'en', preset.geminiVoice);
      if (geminiEnWavBase64) {
        return NextResponse.json({
          audioBase64: geminiEnWavBase64,
          mimeType: 'audio/wav',
          lang: 'en',
          voiceName: 'Universal Male Storyteller (EN)',
          engine: 'gemini-3.8-flash-lite-tts-male',
        });
      }

      const elevenLabsEnBase64 = await synthesizeElevenLabsMaleVoice(
        text,
        preset.elevenLabsVoiceId
      );
      if (elevenLabsEnBase64) {
        return NextResponse.json({
          audioBase64: elevenLabsEnBase64,
          mimeType: 'audio/mpeg',
          lang: 'en',
          voiceName: preset.labelEn,
          engine: 'elevenlabs-multilingual-v2-male',
        });
      }
    }

    return NextResponse.json(
      {
        fallback: true,
        lang: targetLang,
        voiceName: preset.labelBn,
        reason: 'Using cross-platform client male speech synthesis.',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        fallback: true,
        reason:
          error instanceof Error
            ? error.message
            : 'Using cross-platform client male speech synthesis.',
      },
      { status: 200 }
    );
  }
}
