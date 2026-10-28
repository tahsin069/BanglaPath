import crypto from 'crypto';
import WebSocket from 'ws';
import type { ClientRequest, IncomingMessage } from 'http';

const TRUSTED_CLIENT_TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const WSS_URL =
  'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';
const EDGE_COPYRIGHT = 'Copyright (C) Microsoft Corporation. All rights reserved.';

const SWAP_FIRST_WORD = {
  swappedWord: 0xef0569fb,
  swappedSum: 0x76f50f34,
  swappedProduct: 0xc3efea97,
};
const SWAP_SECOND_WORD = {
  swappedWord: 0xc31713db,
  swappedSum: 0x1881ce3c,
  swappedProduct: 0x35bd1ec9,
};
const MIX_FIRST_WORD = [0xcf98b111, 0x87085b9f, 0x12ceb96d, 0x257e1d83];
const MIX_SECOND_WORD = [0xa27416f5, 0xd38396ff, 0x7c932b89, 0xbfa49f69];

let cachedClockOffsetMs = 0;

function swapHalves(value: number): number {
  return ((value << 16) | (value >>> 16)) >>> 0;
}

function swapTerm(
  word: number,
  key: number,
  multipliers: { swappedWord: number; swappedSum: number; swappedProduct: number }
): number {
  const sum = Math.imul(word, key) + Math.imul(swapHalves(word), multipliers.swappedWord);
  const product = Math.imul(swapHalves(sum), multipliers.swappedSum) >>> 0;
  return (Math.imul(swapHalves(product), multipliers.swappedProduct) + product) >>> 0;
}

function swapAndMultiply(value: number, multipliers: number[]): number {
  let out = value;
  for (const multiplier of multipliers) {
    out = Math.imul(swapHalves(out), multiplier) >>> 0;
  }
  return out;
}

function toUpperHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function cs64(message: Uint8Array, digest: Uint8Array): Uint8Array {
  const digestView = new DataView(digest.buffer, digest.byteOffset, digest.byteLength);
  const firstKey = (digestView.getUint32(0, true) | 1) >>> 0;
  const secondKey = (digestView.getUint32(4, true) | 1) >>> 0;

  const padded = new Uint8Array(Math.ceil(message.length / 8) * 8);
  padded.set(message);
  const words = new DataView(padded.buffer);

  let swapSum = 0;
  let lastSwap = 0;
  let mix = 0;
  let mixSum = 0;

  for (let offset = 0; offset < padded.length; offset += 8) {
    const firstWord = words.getUint32(offset, true);
    const secondWord = words.getUint32(offset + 4, true);
    const firstSwap = swapTerm(firstWord, firstKey, SWAP_FIRST_WORD);
    lastSwap = swapTerm(secondWord, secondKey, SWAP_SECOND_WORD);
    swapSum = (swapSum + firstSwap + lastSwap) >>> 0;
    mix = swapAndMultiply(Math.imul(mix + firstWord, firstKey), MIX_FIRST_WORD);
    mixSum = (mixSum + mix) >>> 0;
    mix = swapAndMultiply(Math.imul(mix + secondWord, secondKey), MIX_SECOND_WORD);
    mixSum = (mixSum + mix) >>> 0;
  }

  const checksum = new Uint8Array(8);
  const checksumView = new DataView(checksum.buffer);
  checksumView.setUint32(0, lastSwap ^ mix, true);
  checksumView.setUint32(4, swapSum ^ mixSum, true);
  return checksum;
}

function generateSecMsGec(clockOffsetMs: number): string {
  const ticks = Math.floor((Date.now() + clockOffsetMs) / 1000) + 11644473600;
  const rounded = ticks - (ticks % 300);
  const windowsTicks = rounded * 10000000;
  const input = `${EDGE_COPYRIGHT}${windowsTicks}${TRUSTED_CLIENT_TOKEN}`;
  const message = new Uint8Array(Buffer.from(input, 'utf8'));
  const digest = new Uint8Array(crypto.createHash('sha256').update(message).digest());
  return `${toUpperHex(cs64(message, digest))}-${toUpperHex(digest)}`;
}

/**
 * Builds pure, un-resampled SSML at native model pitch (+0Hz) and rate (+0%)
 * for the Generic Bengali Male Voice Pack (`bn-BD-PradeepNeural` / `bn-IN-BashkarNeural`).
 */
export function buildLiteraryStorytellingSSML(options: {
  text: string;
  voiceName: string;
  locale: string;
}): string {
  const { text, voiceName, locale } = options;

  const cleanText = text
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*(—|--)\s*/g, ', ')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${locale}">
                <voice name="${voiceName}">
                    <prosody pitch="+0Hz" rate="+0%" volume="+0%">
                        ${cleanText}
                    </prosody>
                </voice>
            </speak>`;
}

async function openAndSynthesizeStream(
  options: {
    text: string;
    voiceName: string;
    locale: string;
  },
  retryOnClockSkew = true
): Promise<Buffer> {
  const connId = crypto.randomBytes(16).toString('hex');
  const reqId = crypto.randomBytes(16).toString('hex');
  const secMsGec = generateSecMsGec(cachedClockOffsetMs);
  const url = `${WSS_URL}?TrustedClientToken=${TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secMsGec}&Sec-MS-GEC-Version=2-143.0.3650.96&ConnectionId=${connId}`;

  const ssml = buildLiteraryStorytellingSSML(options);

  return new Promise<Buffer>((resolve, reject) => {
    const ws = new WebSocket(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0',
        Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
      },
    });

    const audioChunks: Buffer[] = [];
    let settled = false;

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        try {
          ws.terminate();
        } catch {
          // ignore
        }
        reject(new Error('Generic Bangla Male Neural TTS timed out'));
      }
    }, 15000);

    ws.once('unexpected-response', (request: ClientRequest, response: IncomingMessage) => {
      clearTimeout(timeout);
      const serverDateStr = response?.headers?.date;
      const statusCode = response?.statusCode;
      try {
        request.destroy();
        response.destroy();
      } catch {
        // ignore
      }

      if (retryOnClockSkew && statusCode === 403 && typeof serverDateStr === 'string') {
        const serverMs = Date.parse(serverDateStr);
        if (Number.isFinite(serverMs)) {
          cachedClockOffsetMs = serverMs - Date.now();
          settled = true;
          openAndSynthesizeStream(options, false).then(resolve).catch(reject);
          return;
        }
      }

      if (!settled) {
        settled = true;
        reject(new Error(`Unexpected speech server status: ${statusCode}`));
      }
    });

    ws.on('open', () => {
      const configMsg =
        `Content-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
        JSON.stringify({
          context: {
            synthesis: {
              audio: {
                metadataoptions: {
                  sentenceBoundaryEnabled: 'false',
                  wordBoundaryEnabled: 'false',
                },
                outputFormat: 'audio-24khz-96kbitrate-mono-mp3',
              },
            },
          },
        });

      ws.send(configMsg, (err?: Error) => {
        if (err) {
          clearTimeout(timeout);
          if (!settled) {
            settled = true;
            reject(err);
          }
          return;
        }

        const ssmlMsg =
          `X-RequestId:${reqId}\r\nContent-Type:application/ssml+xml\r\nPath:ssml\r\n\r\n` +
          ssml;
        ws.send(ssmlMsg);
      });
    });

    ws.on('message', (data: WebSocket.RawData, isBinary: boolean) => {
      const buf = Buffer.isBuffer(data)
        ? data
        : data instanceof ArrayBuffer
        ? Buffer.from(data)
        : Buffer.concat(data);

      if (isBinary) {
        const delim = Buffer.from('Path:audio\r\n');
        const idx = buf.indexOf(delim);
        if (idx !== -1) {
          const audioPayload = buf.subarray(idx + delim.length);
          if (audioPayload.length > 0) {
            audioChunks.push(audioPayload);
          }
        }
      } else {
        const textMsg = buf.toString('utf8');
        if (textMsg.includes('Path:turn.end')) {
          clearTimeout(timeout);
          if (!settled) {
            settled = true;
            try {
              ws.close();
            } catch {
              // ignore
            }
            const combined = Buffer.concat(audioChunks);
            if (combined.length > 256) {
              resolve(combined);
            } else {
              reject(new Error('Empty audio stream received'));
            }
          }
        }
      }
    });

    ws.on('error', (err: Error) => {
      if (!settled) {
        clearTimeout(timeout);
        settled = true;
        reject(err);
      }
    });

    ws.on('close', () => {
      if (!settled) {
        clearTimeout(timeout);
        settled = true;
        const combined = Buffer.concat(audioChunks);
        if (combined.length > 256) {
          resolve(combined);
        } else {
          reject(new Error('WebSocket closed before turn.end'));
        }
      }
    });
  });
}

/**
 * Synthesizes Bengali or English text using the Generic Male Voice Pack (`bn-BD-PradeepNeural` / `bn-IN-BashkarNeural`).
 * Uses a single continuous WebSocket stream per passage (or sequential 1200-char chunks) so cloud/serverless IPs
 * never hit parallel connection limits and MP3 frames play seamlessly across all platforms.
 */
export async function synthesizeNativeNeuralMp3(options: {
  text: string;
  voiceName: string;
  locale: string;
  rate?: string;
  pitch?: string;
  isPoetic?: boolean;
}): Promise<Buffer> {
  const { text, voiceName, locale } = options;
  const trimmed = text.replace(/\s+/g, ' ').trim();

  if (trimmed.length <= 1200) {
    return openAndSynthesizeStream({
      text: trimmed,
      voiceName,
      locale,
    });
  }

  // For extra-long passages (> 1200 chars), split into ~900-char sentence groups sequentially
  const rawSentences =
    locale.startsWith('bn')
      ? trimmed.match(/[^।?!]+[।?!]+|\S.+$/g) || [trimmed]
      : trimmed.match(/[^.?!]+[.?!]+|\S.+$/g) || [trimmed];

  const groups: string[] = [];
  let current = '';
  for (const s of rawSentences) {
    if ((current + ' ' + s).trim().length > 950 && current.length > 0) {
      groups.push(current.trim());
      current = s.trim();
    } else {
      current = (current + ' ' + s).trim();
    }
  }
  if (current.trim()) {
    groups.push(current.trim());
  }

  const buffers: Buffer[] = [];
  for (const group of groups.slice(0, 4)) {
    const buf = await openAndSynthesizeStream({
      text: group,
      voiceName,
      locale,
    });
    buffers.push(buf);
  }

  return Buffer.concat(buffers);
}
