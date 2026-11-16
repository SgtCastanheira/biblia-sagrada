import { spawn } from 'node:child_process';

export const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';
export const GEMINI_TTS_VOICE = 'Kore';
export const GEMINI_TTS_STYLE = 'Leia em português do Brasil, com voz natural, acolhedora e clara, em ritmo calmo de narração. Preserve exatamente as palavras, os nomes e os números do texto. Não resuma nem acrescente saudações, comentários, instruções ou nomes de personagens que não estejam escritos. Narre somente o texto indicado a seguir.';
const MAX_AUDIO_BYTES = 100 * 1024 * 1024;
const MP3_SAMPLE_RATES = new Set([8000, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000]);

/** Corpo REST da API legada generateContent, ainda usada pelos modelos TTS 2.5. */
export function geminiSpeechRequest(text, { voice = GEMINI_TTS_VOICE, style = GEMINI_TTS_STYLE } = {}) {
  if (typeof text !== 'string' || !text.trim()) throw new Error('Informe um texto para a narração Gemini.');
  if (typeof voice !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(voice)) throw new Error('Nome de voz Gemini inválido.');
  return {
    contents: [{ role: 'user', parts: [{ text: `${style}\n\nTEXTO:\n${text}` }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
    },
  };
}

/** PCM do Gemini é signed little-endian de 16 bits, apesar do nome MIME audio/L16. */
export function parseGeminiAudio(result) {
  if (result?.promptFeedback?.blockReason) throw new Error('O Gemini bloqueou a narração deste trecho.');
  const candidate = result?.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
    const error = new Error(candidate.finishReason === 'MAX_TOKENS' ? 'A narração Gemini foi interrompida pelo limite de saída; reduza o trecho.' : 'O Gemini não concluiu a narração deste trecho.');
    error.code = 'GEMINI_INCOMPLETE_AUDIO';
    throw error;
  }
  const parts = candidate?.content?.parts ?? [];
  const audioParts = parts.map(part => part.inlineData ?? part.inline_data).filter(part => /^audio\//i.test(part?.mimeType ?? part?.mime_type ?? ''));
  if (!audioParts.length) throw new Error('O Gemini não retornou áudio para este trecho.');
  const mimeType = audioParts[0].mimeType ?? audioParts[0].mime_type;
  if (!/^(audio\/l16|audio\/pcm|audio\/wav|audio\/x-wav)(;|$)/i.test(mimeType)) throw new Error('O Gemini retornou um formato de áudio não suportado.');
  const wav = /^audio\/(x-)?wav/i.test(mimeType);
  if (wav && audioParts.length > 1) throw new Error('O Gemini retornou vários contêineres WAV; reduza o trecho.');
  if (audioParts.some(part => (part.mimeType ?? part.mime_type) !== mimeType)) throw new Error('O Gemini retornou formatos de áudio diferentes no mesmo trecho.');
  const chunks = audioParts.map(part => {
    if (typeof part.data !== 'string' || !part.data.length || !/^[a-zA-Z0-9+/]*={0,2}$/.test(part.data) || part.data.length % 4 === 1) throw new Error('O áudio Gemini contém dados base64 inválidos.');
    return Buffer.from(part.data, 'base64');
  });
  const data = Buffer.concat(chunks);
  if (!data.length || data.length > MAX_AUDIO_BYTES) throw new Error('O áudio Gemini está vazio ou ultrapassa o tamanho permitido.');
  const sampleRate = Number(mimeType.match(/(?:^|;)\s*rate\s*=\s*(\d+)/i)?.[1] ?? 24000);
  const channels = Number(mimeType.match(/(?:^|;)\s*channels\s*=\s*(\d+)/i)?.[1] ?? 1);
  const audio = { data, mimeType, sampleRate, channels, format: wav ? 'wav' : 's16le' };
  const layout = pcmLayout(audio);
  return { ...audio, sampleRate: layout.sampleRate, channels: layout.channels };
}

/** Extrai PCM16 de RIFF/WAV ou de bytes crus; metadados desconhecidos e compressão são recusados. */
function pcmLayout(audio) {
  const data = audio?.data;
  if (!Buffer.isBuffer(data) || !data.length || data.length > MAX_AUDIO_BYTES) throw new Error('O áudio está vazio ou ultrapassa o tamanho permitido.');
  if (!['s16le', 'wav'].includes(audio.format)) throw new Error('Formato de áudio inválido para converter em MP3.');
  let pcm = data;
  let sampleRate = audio.sampleRate;
  let channels = audio.channels;
  if (audio.format === 'wav') {
    if (data.length < 12 || data.toString('ascii', 0, 4) !== 'RIFF' || data.toString('ascii', 8, 12) !== 'WAVE') throw new Error('O áudio WAV não possui um cabeçalho RIFF válido.');
    const end = data.readUInt32LE(4) + 8;
    if (end > data.length || end < 12) throw new Error('O contêiner WAV está truncado.');
    let format;
    const chunks = [];
    let position = 12;
    while (position + 8 <= end) {
      const kind = data.toString('ascii', position, position + 4);
      const size = data.readUInt32LE(position + 4);
      const start = position + 8;
      const next = start + size + (size % 2);
      if (next > end) throw new Error('O WAV contém um bloco truncado.');
      if (kind === 'fmt ') {
        if (format || size < 16) throw new Error('O WAV contém um bloco de formato inválido.');
        format = { codec: data.readUInt16LE(start), channels: data.readUInt16LE(start + 2), rate: data.readUInt32LE(start + 4), byteRate: data.readUInt32LE(start + 8), align: data.readUInt16LE(start + 12), bits: data.readUInt16LE(start + 14) };
      } else if (kind === 'data') chunks.push(data.subarray(start, start + size));
      position = next;
    }
    if (position !== end || !format || !chunks.length) throw new Error('O WAV está incompleto: faltam blocos de formato ou áudio.');
    if (format.codec !== 1 || format.bits !== 16) throw new Error('Somente WAV PCM de 16 bits é suportado.');
    sampleRate = format.rate;
    channels = format.channels;
    if (format.align !== channels * 2 || format.byteRate !== sampleRate * channels * 2 || chunks.some(chunk => chunk.length % format.align)) throw new Error('O WAV contém parâmetros de amostragem inconsistentes.');
    pcm = chunks.length === 1 ? chunks[0] : Buffer.concat(chunks);
  }
  if (![1, 2].includes(channels) || !MP3_SAMPLE_RATES.has(sampleRate)) throw new Error('A taxa de amostragem ou o número de canais do áudio não é suportado.');
  if (!pcm.length || pcm.length % (channels * 2)) throw new Error('O áudio PCM terminou com uma amostra incompleta.');
  return { pcm, sampleRate, channels };
}

/** Converte PCM little-endian em amostras mono, preservando a taxa e acrescentando silêncio opcional. */
export function decodePcm16(audio, { pauseMs = 0 } = {}) {
  if (!Number.isFinite(pauseMs) || pauseMs < 0 || pauseMs > 5000) throw new Error('A pausa da narração deve estar entre zero e cinco segundos.');
  const { pcm, sampleRate, channels } = pcmLayout(audio);
  const length = pcm.length / (channels * 2);
  const samples = new Int16Array(length + Math.round(sampleRate * pauseMs / 1000));
  for (let i = 0; i < length; i++) {
    const offset = i * channels * 2;
    samples[i] = channels === 1 ? pcm.readInt16LE(offset) : Math.round((pcm.readInt16LE(offset) + pcm.readInt16LE(offset + 2)) / 2);
  }
  return { samples, sampleRate, channels: 1 };
}

/** MP3 mono de 48 kbit/s em JavaScript; FFmpeg só é usado quando configurado explicitamente. */
export async function pcmToMp3(audio, options = {}) {
  const { pauseMs = 500, encoderFactory, ffmpegPath = process.env.FFMPEG_PATH } = options;
  const decoded = decodePcm16(audio, { pauseMs });
  if (ffmpegPath) return pcmWithFfmpeg(audio, { ...options, ffmpegPath, pauseMs });
  let encoder;
  if (encoderFactory) encoder = encoderFactory(1, decoded.sampleRate, 48);
  else {
    let Mp3Encoder;
    try { ({ Mp3Encoder } = await import('@breezystack/lamejs')); }
    catch { throw new Error('O codificador MP3 não está instalado. Rode npm install antes de gerar a narração.'); }
    encoder = new Mp3Encoder(1, decoded.sampleRate, 48);
  }
  const output = [];
  let bytes = 0;
  const append = chunk => {
    if (!chunk.length) return;
    bytes += chunk.length;
    if (bytes > 30 * 1024 * 1024) throw new Error('O MP3 ultrapassa o tamanho permitido por trecho.');
    output.push(Buffer.from(chunk));
  };
  for (let i = 0; i < decoded.samples.length; i += 1152) append(encoder.encodeBuffer(decoded.samples.subarray(i, i + 1152)));
  append(encoder.flush());
  if (!bytes) throw new Error('O codificador retornou um arquivo MP3 vazio.');
  return Buffer.concat(output);
}

function pcmWithFfmpeg(audio, { ffmpegPath, spawnImpl = spawn, timeoutMs = 60000, pauseMs = 500 }) {
  const raw = audio.format === 's16le';
  const args = ['-hide_banner', '-loglevel', 'error', ...(raw ? ['-f', 's16le', '-ar', String(audio.sampleRate), '-ac', String(audio.channels)] : []), '-i', 'pipe:0', '-vn', '-ac', '1', '-ar', '24000', '-codec:a', 'libmp3lame', '-b:a', '48k'];
  if (pauseMs > 0) args.push('-af', `apad=pad_dur=${Math.min(5000, pauseMs) / 1000}`);
  args.push('-map_metadata', '-1', '-write_xing', '0', '-id3v2_version', '0', '-f', 'mp3', 'pipe:1');
  return new Promise((resolve, reject) => {
    let child;
    let timer;
    let settled = false;
    let bytes = 0;
    let stderr = '';
    const output = [];
    const finish = (error, data) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (error) reject(error); else resolve(data);
    };
    try { child = spawnImpl(ffmpegPath, args, { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true }); }
    catch { finish(new Error('Não foi possível iniciar o FFmpeg para converter a narração.')); return; }
    child.on('error', error => {
      const message = error.code === 'ENOENT' ? 'FFmpeg não encontrado. Instale-o ou configure o caminho do conversor.' : 'Não foi possível executar o FFmpeg para converter a narração.';
      finish(new Error(message));
    });
    child.stdout.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > 30 * 1024 * 1024) { child.kill('SIGKILL'); finish(new Error('O MP3 ultrapassa o tamanho permitido por trecho.')); return; }
      output.push(chunk);
    });
    child.stderr.on('data', chunk => { if (stderr.length < 500) stderr += chunk.toString('utf8').slice(0, 500 - stderr.length); });
    child.stdin.on('error', () => { /* Um pipe fechado é tratado pelo código de saída do conversor. */ });
    child.on('close', code => {
      if (code !== 0) finish(new Error(`FFmpeg não conseguiu converter a narração${stderr.trim() ? ': ' + stderr.trim() : '.'}`));
      else if (!bytes) finish(new Error('FFmpeg retornou um arquivo MP3 vazio.'));
      else finish(null, Buffer.concat(output));
    });
    timer = setTimeout(() => { child.kill('SIGKILL'); finish(new Error('FFmpeg excedeu o tempo para converter a narração.')); }, timeoutMs);
    timer.unref?.();
    child.stdin.end(audio.data);
  });
}

/** Uma única requisição; quem chama decide as tentativas e a cota. A chave nunca integra URL nem mensagens de erro. */
export async function synthesizeGemini(text, { apiKey, model = GEMINI_TTS_MODEL, voice = GEMINI_TTS_VOICE, style = GEMINI_TTS_STYLE, fetchImpl = fetch, timeoutMs = 120000, ...conversion } = {}) {
  if (typeof apiKey !== 'string' || !apiKey.trim()) throw new Error('Defina GEMINI_API_KEY para gerar a narração.');
  if (typeof model !== 'string' || !/^[a-zA-Z0-9._-]{1,120}$/.test(model)) throw new Error('Nome de modelo Gemini inválido.');
  const body = JSON.stringify(geminiSpeechRequest(text, { voice, style }));
  let response;
  try {
    response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    const error = new Error(cause?.name === 'TimeoutError' ? 'A API Gemini excedeu o tempo para gerar a narração.' : 'Não foi possível conectar à API Gemini para gerar a narração.');
    error.code = 'GEMINI_CONNECTION';
    throw error;
  }
  let result;
  try { result = await response.json(); }
  catch {
    const error = new Error(`A API Gemini retornou uma resposta inválida (${response.status}).`);
    error.status = response.status;
    error.retryable = response.status === 429 || response.status >= 500;
    throw error;
  }
  if (!response.ok) {
    const detail = String(result?.error?.message ?? '').replaceAll(apiKey, '[chave ocultada]').slice(0, 300);
    const error = new Error(`A API Gemini respondeu ${response.status}${detail ? ': ' + detail : '.'}`);
    error.status = response.status;
    error.retryable = response.status === 429 || response.status >= 500;
    const after = response.headers?.get('retry-after');
    error.retryAfterMs = after && /^\d+$/.test(after) ? Number(after) * 1000 : undefined;
    throw error;
  }
  return pcmToMp3(parseGeminiAudio(result), conversion);
}
