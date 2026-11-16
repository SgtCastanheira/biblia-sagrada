import { expect, test } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// O helper é ESM do Node; a importação por URL evita convertê-lo em require no Playwright.
const helperUrl = pathToFileURL(resolve('tools/gemini-tts.mjs')).href;
const loadGemini = () => import(helperUrl);
const text = 'No princípio, criou Deus os céus e a terra. Gênesis 1:1.';
const fakeKey = 'chave-ficticia-do-teste-nao-usar';

function pcm16(samples: number[]): Buffer {
  const bytes = Buffer.alloc(samples.length * 2);
  samples.forEach((sample, index) => bytes.writeInt16LE(sample, index * 2));
  return bytes;
}

function audioResponse(data: Buffer, mimeType = 'audio/L16;codec=pcm;rate=24000', finishReason = 'STOP') {
  return {
    candidates: [{ finishReason, content: { parts: [{ inlineData: { mimeType, data: data.toString('base64') } }] } }],
  };
}

function riffChunk(name: string, bytes: Buffer): Buffer {
  const header = Buffer.alloc(8);
  header.write(name, 0, 'ascii');
  header.writeUInt32LE(bytes.length, 4);
  return Buffer.concat([header, bytes, Buffer.alloc(bytes.length % 2)]);
}

/** WAV PCM16 estéreo com um chunk auxiliar ímpar e fmt estendido, como arquivos reais. */
function stereoWav(samples: number[], sampleRate = 22050): Buffer {
  const format = Buffer.alloc(18);
  format.writeUInt16LE(1, 0); // PCM linear
  format.writeUInt16LE(2, 2);
  format.writeUInt32LE(sampleRate, 4);
  format.writeUInt32LE(sampleRate * 4, 8);
  format.writeUInt16LE(4, 12);
  format.writeUInt16LE(16, 14);
  const chunks = Buffer.concat([
    riffChunk('JUNK', Buffer.from([1, 2, 3])),
    riffChunk('fmt ', format),
    riffChunk('data', pcm16(samples)),
  ]);
  const header = Buffer.alloc(12);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(chunks.length + 4, 4);
  header.write('WAVE', 8, 'ascii');
  return Buffer.concat([header, chunks]);
}

interface Mp3Frame { bitrate: number; sampleRate: number; channels: number; seconds: number }

/** Lê todos os quadros Layer III: bytes soltos ou um quadro cortado não contam como MP3 válido. */
function mp3Frames(bytes: Buffer): Mp3Frame[] {
  const frames: Mp3Frame[] = [];
  for (let offset = 0; offset < bytes.length;) {
    expect(bytes.length - offset, 'cabeçalho de quadro completo').toBeGreaterThanOrEqual(4);
    const header = bytes.readUInt32BE(offset);
    expect(header >>> 21, `sincronismo do quadro em ${offset}`).toBe(0x7ff);
    const version = (header >>> 19) & 3;
    expect(version).not.toBe(1);
    expect((header >>> 17) & 3, 'Layer III').toBe(1);
    const rateIndex = (header >>> 10) & 3;
    expect(rateIndex).toBeLessThan(3);
    const sampleRate = [44100, 48000, 32000][rateIndex] / (version === 3 ? 1 : version === 2 ? 2 : 4);
    const bitrateIndex = (header >>> 12) & 15;
    expect(bitrateIndex).toBeGreaterThan(0);
    expect(bitrateIndex).toBeLessThan(15);
    const bitrate = (version === 3
      ? [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
      : [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160])[bitrateIndex];
    const length = Math.floor((version === 3 ? 144000 : 72000) * bitrate / sampleRate) + ((header >>> 9) & 1);
    expect(offset + length, 'o último quadro está completo').toBeLessThanOrEqual(bytes.length);
    frames.push({ bitrate, sampleRate, channels: ((header >>> 6) & 3) === 3 ? 1 : 2, seconds: (version === 3 ? 1152 : 576) / sampleRate });
    offset += length;
  }
  return frames;
}

test('Gemini TTS: pede áudio, voz natural e leitura fiel em português, sem relaxar filtros', async () => {
  const { geminiSpeechRequest, GEMINI_TTS_STYLE, GEMINI_TTS_VOICE, GEMINI_TTS_MODEL } = await loadGemini();
  const request = geminiSpeechRequest(text);
  expect(GEMINI_TTS_MODEL).toMatch(/^gemini-.*tts$/);
  expect(request.generationConfig).toEqual({
    responseModalities: ['AUDIO'],
    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_TTS_VOICE } } },
  });
  expect(request.contents).toHaveLength(1);
  expect(request.contents[0].role).toBe('user');
  expect(request.contents[0].parts).toEqual([{ text: `${GEMINI_TTS_STYLE}\n\nTEXTO:\n${text}` }]);
  expect(GEMINI_TTS_STYLE).toMatch(/português do Brasil/i);
  expect(GEMINI_TTS_STYLE).toMatch(/natural/i);
  expect(GEMINI_TTS_STYLE).toMatch(/preserve exatamente/i);
  expect(request).not.toHaveProperty('safetySettings');
  expect(request).not.toHaveProperty('tools');
  expect(geminiSpeechRequest(text, { voice: 'Puck' }).generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName).toBe('Puck');
});

test('Gemini TTS: HTTP 401 faz uma única chamada, oculta a chave e não aciona encoder ou fallback', async () => {
  const { synthesizeGemini, GEMINI_TTS_MODEL } = await loadGemini();
  const requests: { url: string; init: RequestInit }[] = [];
  let conversions = 0;
  const outcome = await synthesizeGemini(text, {
    apiKey: fakeKey,
    fetchImpl: async (url: string, init: RequestInit) => {
      requests.push({ url, init });
      return new Response(JSON.stringify({ error: { message: `Credencial recusada: ${fakeKey}` } }), { status: 401 });
    },
    encoderFactory: () => { conversions++; throw new Error('Não deve converter um erro HTTP.'); },
  }).catch((error: Error & { status: number; retryable: boolean }) => error);
  expect(outcome).toBeInstanceOf(Error);
  expect(outcome.status).toBe(401);
  expect(outcome.retryable).toBe(false);
  expect(outcome.message).toContain('401');
  expect(outcome.message).not.toContain(fakeKey);
  expect(outcome.stack).not.toContain(fakeKey);
  expect(requests).toHaveLength(1);
  expect(conversions).toBe(0);
  const request = requests[0];
  expect(request.url).toBe(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent`);
  expect(request.url).not.toContain(fakeKey);
  expect(request.init.method).toBe('POST');
  expect(new Headers(request.init.headers).get('x-goog-api-key')).toBe(fakeKey);
  expect(new Headers(request.init.headers).get('content-type')).toBe('application/json');
  const body = JSON.parse(String(request.init.body));
  expect(body.generationConfig.responseModalities).toEqual(['AUDIO']);
  expect(body.contents[0].parts[0].text).toContain(text);
  expect(String(request.init.body)).not.toContain(fakeKey);
});

test('Gemini TTS: HTTP 429 informa cota e Retry-After sem repetir ou trocar de provedor', async () => {
  const { synthesizeGemini } = await loadGemini();
  let calls = 0;
  let conversions = 0;
  const outcome = await synthesizeGemini(text, {
    apiKey: fakeKey,
    fetchImpl: async () => {
      calls++;
      return new Response(JSON.stringify({ error: { message: 'Quota exceeded' } }), { status: 429, headers: { 'Retry-After': '7' } });
    },
    encoderFactory: () => { conversions++; throw new Error('Não deve converter um erro de cota.'); },
  }).catch((error: Error & { status: number; retryable: boolean; retryAfterMs: number }) => error);
  expect(outcome).toBeInstanceOf(Error);
  expect(outcome.status).toBe(429);
  expect(outcome.retryable).toBe(true);
  expect(outcome.retryAfterMs).toBe(7000);
  expect(outcome.message).toMatch(/429.*Quota exceeded/);
  expect(calls).toBe(1);
  expect(conversions).toBe(0);
});

test('Gemini TTS: junta partes PCM24k e decodifica signed little endian sem perder os extremos', async () => {
  const { parseGeminiAudio, decodePcm16 } = await loadGemini();
  const bytes = pcm16([-32768, -1000, 0, 1000, 32767]);
  const response = audioResponse(bytes);
  response.candidates[0].content.parts = [
    { inlineData: { mimeType: 'audio/L16;codec=pcm;rate=24000', data: bytes.subarray(0, 3).toString('base64') } },
    { inlineData: { mimeType: 'audio/L16;codec=pcm;rate=24000', data: bytes.subarray(3).toString('base64') } },
  ];
  const audio = parseGeminiAudio(response);
  expect(audio).toMatchObject({ format: 's16le', sampleRate: 24000, channels: 1 });
  expect(audio.data.equals(bytes)).toBe(true);
  const decoded = decodePcm16(audio);
  expect(decoded.samples).toBeInstanceOf(Int16Array);
  expect([...decoded.samples]).toEqual([-32768, -1000, 0, 1000, 32767]);
  expect(decoded.sampleRate).toBe(24000);
  expect(decoded.channels).toBe(1);
});

test('Gemini TTS: WAV PCM16 lê chunks com padding e usa os canais e a taxa do cabeçalho', async () => {
  const { parseGeminiAudio, decodePcm16 } = await loadGemini();
  const wav = stereoWav([-30000, 10000, 32767, 32767, -32768, -32768, -1000, 1000]);
  const decoded = decodePcm16(parseGeminiAudio(audioResponse(wav, 'audio/wav')));
  expect(decoded.sampleRate).toBe(22050);
  expect(decoded.channels).toBe(1);
  expect([...decoded.samples]).toEqual([-10000, 32767, -32768, 0]);
});

for (const [name, response] of [
  ['bloqueio do prompt', { promptFeedback: { blockReason: 'SAFETY' } }],
  ['bloqueio do candidato', audioResponse(pcm16([0, 1]), undefined, 'SAFETY')],
  ['limite de saída', audioResponse(pcm16([0, 1]), undefined, 'MAX_TOKENS')],
  ['PCM cortado no meio da amostra', audioResponse(Buffer.from([1, 2, 3]))],
  ['WAV com chunk de dados cortado', audioResponse(stereoWav([1, 2, 3, 4]).subarray(0, -2), 'audio/wav')],
] as const) {
  test(`Gemini TTS: ${name} impede gerar MP3`, async () => {
    const { synthesizeGemini } = await loadGemini();
    let conversions = 0;
    let calls = 0;
    await expect(synthesizeGemini(text, {
      apiKey: fakeKey,
      fetchImpl: async () => { calls++; return new Response(JSON.stringify(response)); },
      encoderFactory: () => { conversions++; throw new Error('O encoder não deve receber áudio inválido.'); },
    })).rejects.toThrow();
    expect(calls).toBe(1);
    expect(conversions).toBe(0);
  });
}

test('Gemini TTS: encoder JavaScript real gera MP3 mono de 48 kbit/s e duração de um segundo', async () => {
  const { parseGeminiAudio, pcmToMp3 } = await loadGemini();
  const samples = Array.from({ length: 24000 }, (_, index) => Math.round(12000 * Math.sin(2 * Math.PI * 440 * index / 24000)));
  const mp3 = await pcmToMp3(parseGeminiAudio(audioResponse(pcm16(samples))), { pauseMs: 0, ffmpegPath: null });
  expect(Buffer.isBuffer(mp3)).toBe(true);
  expect(mp3.length).toBeGreaterThan(5500);
  expect(mp3.length).toBeLessThan(8000);
  const frames = mp3Frames(mp3);
  expect(frames.length).toBeGreaterThan(40);
  expect(frames.every((frame) => frame.bitrate === 48 && frame.sampleRate === 24000 && frame.channels === 1)).toBe(true);
  const seconds = frames.reduce((sum, frame) => sum + frame.seconds, 0);
  expect(seconds).toBeGreaterThanOrEqual(1);
  expect(seconds).toBeLessThan(1.2); // Inclui o atraso e o preenchimento de quadros do encoder.
});
