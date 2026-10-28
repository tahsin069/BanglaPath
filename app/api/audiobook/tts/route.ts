import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
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

let cachedClonedAgniVoiceId: string | null = null;

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

/**
 * If ELEVENLABS_API_KEY is present, clones the exact reference voice of Agni from
 * `/public/assets/aistudio/Apadartho_Satyajit_Ray_Friday_Classics_Mirchi_Bangla_b9539b4c.mp3`
 * (extracting the clean solo speech window 00:32 - 02:14) or uses ELEVENLABS_VOICE_ID.
 */
async function getOrCloneAgniElevenLabsVoiceId(apiKey: string, fallbackVoiceId: string): Promise<string> {
  const customEnvId = process.env.ELEVENLABS_VOICE_ID?.trim();
  if (customEnvId) return customEnvId;
  if (cachedClonedAgniVoiceId) return cachedClonedAgniVoiceId;

  try {
    const mp3Path = path.join(
      process.cwd(),
      'public',
      'assets',
      'aistudio',
      'Apadartho_Satyajit_Ray_Friday_Classics_Mirchi_Bangla_b9539b4c.mp3'
    );
    if (fs.existsSync(mp3Path)) {
      const fd = fs.openSync(mp3Path, 'r');
      // 00:32 to 02:14 (~102 seconds at ~24KB/s = ~2.4MB clean solo speech slice of Agni)
      const startByte = 768000;
      const lengthBytes = 2400000;
      const sampleBuf = Buffer.alloc(lengthBytes);
      const bytesRead = fs.readSync(fd, sampleBuf, 0, lengthBytes, startByte);
      fs.closeSync(fd);

      if (bytesRead > 100000) {
        const formData = new FormData();
        formData.append('name', 'Agni - BanglaGrantha Storyteller');
        formData.append(
          'description',
          'Warm expressive Bengali male storyteller voice from Satyajit Ray Apadartho'
        );
        const blob = new Blob([sampleBuf.subarray(0, bytesRead)], { type: 'audio/mpeg' });
        formData.append('files', blob, 'agni_reference_sample.mp3');

        const cloneRes = await fetch('https://api.elevenlabs.io/v1/voices/add', {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
          },
          body: formData,
        });

        if (cloneRes.ok) {
          const cloneData = await cloneRes.json();
          if (cloneData?.voice_id) {
            cachedClonedAgniVoiceId = cloneData.voice_id;
            return cloneData.voice_id;
          }
        }
      }
    }
  } catch {
    // Fallback to preconfigured voice ID if instant voice cloning is not enabled on the key
  }

  return fallbackVoiceId;
}

async function synthesizeElevenLabsStoryteller(
  text: string,
  fallbackVoiceId: string
): Promise<string | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_ELEVENLABS_API_KEY') return null;

  try {
    const voiceId = await getOrCloneAgniElevenLabsVoiceId(apiKey, fallbackVoiceId);
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
            stability: 0.62,
            similarity_boost: 0.88,
            style: 0.34,
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
      style = 'Agni Friday Classics expressive Bengali male storyteller',
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
    // PATH A: BENGALI STORYTELLER NARRATION (lang === 'bn')
    // 1. If ELEVENLABS_API_KEY is configured, synthesizes using Agni's cloned voice
    //    from the uploaded Apadartho MP3.
    // 2. Otherwise, synthesizes using Native Calcutta Male Neural Voice (`bn-IN-BashkarNeural`)
    //    with Agni's exact Friday Classics dramatic storytelling SSML phrasing & dialogue shifts.
    // =========================================================================
    if (targetLang === 'bn') {
      const elevenLabsBnBase64 = await synthesizeElevenLabsStoryteller(
        text,
        preset.elevenLabsVoiceId
      );
      if (elevenLabsBnBase64) {
        return NextResponse.json({
          audioBase64: elevenLabsBnBase64,
          mimeType: 'audio/mpeg',
          lang: 'bn',
          voiceName: 'অগ্নি · শ্রুতি-গল্প কথক (Agni Reference Voice)',
          engine: 'agni-reference-elevenlabs-v2',
        });
      }

      const bnCandidates: Array<{ voiceName: string; locale: string }> = [
        { voiceName: 'bn-IN-BashkarNeural', locale: 'bn-IN' },
        { voiceName: 'bn-BD-PradeepNeural', locale: 'bn-BD' },
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
            voiceName: 'অগ্নি · শ্রুতি-গল্প কথক (Friday Classics Style)',
            engine: 'agni-storyteller-bangla-neural-96k',
          });
        } catch {
          // Try fallback Bengali male voice
        }
      }
    }

    // =========================================================================
    // PATH B: ENGLISH STORYTELLER NARRATION (lang === 'en')
    // =========================================================================
    if (targetLang === 'en') {
      const elevenLabsBase64 = await synthesizeElevenLabsStoryteller(
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
            voiceName: 'Agni · Classic Storyteller (EN)',
            engine: 'native-english-male-neural-96k',
          });
        } catch {
          // Try next English male candidate
        }
      }

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
