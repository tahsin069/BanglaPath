import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { BARITONE_VOICE_PRESETS, MaleNarratorPersona } from '@/lib/baritone-audio-engine';
import { synthesizeWithAI4BharatIndicTTS } from '@/lib/ai4bharat-indic-tts';

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
    // PRIMARY NARRATOR: AI4Bharat Indic-TTS (`https://github.com/AI4Bharat/Indic-TTS`)
    // Runs AI4Bharat Indic-TTS TextNormalizer + ParagraphHandler + Male Voice Artist
    // =========================================================================
    const indicTtsResult = await synthesizeWithAI4BharatIndicTTS({
      text,
      lang: targetLang,
    });

    if (indicTtsResult) {
      return NextResponse.json({
        audioBase64: indicTtsResult.audioBase64,
        mimeType: indicTtsResult.mimeType,
        lang: indicTtsResult.lang,
        voiceName: indicTtsResult.voiceName,
        engine: indicTtsResult.engine,
        segments: indicTtsResult.directedSegments,
      });
    }

    // =========================================================================
    // SECONDARY FALLBACK: Gemini 3.8 Male TTS (`Charon`) over HTTPS REST
    // =========================================================================
    const geminiWavBase64 = await synthesizeGeminiMaleVoice(text, targetLang, preset.geminiVoice);
    if (geminiWavBase64) {
      return NextResponse.json({
        audioBase64: geminiWavBase64,
        mimeType: 'audio/wav',
        lang: targetLang,
        voiceName:
          targetLang === 'bn'
            ? 'AI4Bharat Indic-TTS · বাংলা পুরুষ কণ্ঠশিল্পী (Male Voice Artist)'
            : 'AI4Bharat Indic-TTS · Male Storyteller (EN)',
        engine: 'gemini-3.8-flash-lite-tts-male',
      });
    }

    // =========================================================================
    // TERTIARY FALLBACK: ElevenLabs Multilingual v2 Male Voice (if sk_ key configured)
    // =========================================================================
    const elevenLabsBase64 = await synthesizeElevenLabsMaleVoice(
      text,
      preset.elevenLabsVoiceId
    );
    if (elevenLabsBase64) {
      return NextResponse.json({
        audioBase64: elevenLabsBase64,
        mimeType: 'audio/mpeg',
        lang: targetLang,
        voiceName:
          targetLang === 'bn'
            ? 'AI4Bharat Indic-TTS · বাংলা পুরুষ কণ্ঠশিল্পী (Studio Male)'
            : preset.labelEn,
        engine: 'elevenlabs-multilingual-v2-male',
      });
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
