/**
 * Utilitários de MP3 (camada III) para tools/gerar-audio.mjs: medir a duração e limpar as etiquetas.
 * Sem dependências: só Buffer do Node.
 */

const RATES = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
const KBPS_1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const KBPS_2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];

/** Tamanho do cabeçalho ID3v2 no começo (0 se não houver). */
function id3Size(buf) {
  if (buf.length > 10 && buf.toString('latin1', 0, 3) === 'ID3') {
    const footer = buf[5] & 0x10 ? 10 : 0;
    return 10 + ((buf[6] & 0x7f) << 21 | (buf[7] & 0x7f) << 14 | (buf[8] & 0x7f) << 7 | (buf[9] & 0x7f)) + footer;
  }
  return 0;
}

/** Lê o cabeçalho de um quadro em `pos`: { version, kbps, rate, length, mono, samples } ou null se não for um quadro válido. */
function frameAt(buf, pos) {
  if (pos + 4 > buf.length || buf[pos] !== 0xff || (buf[pos + 1] & 0xe0) !== 0xe0) return null;
  const version = (buf[pos + 1] >> 3) & 3; // 3 = MPEG 1, 2 = MPEG 2, 0 = MPEG 2.5
  const layer = (buf[pos + 1] >> 1) & 3; // 1 = camada III
  const bitrateIndex = buf[pos + 2] >> 4;
  const rateIndex = (buf[pos + 2] >> 2) & 3;
  if (version === 1 || layer !== 1 || bitrateIndex === 0 || bitrateIndex === 15 || rateIndex === 3) return null;
  const rate = RATES[version][rateIndex];
  const kbps = (version === 3 ? KBPS_1 : KBPS_2)[bitrateIndex];
  const padding = (buf[pos + 2] >> 1) & 1;
  const samples = version === 3 ? 1152 : 576;
  const length = Math.floor(((version === 3 ? 144 : 72) * kbps * 1000) / rate) + padding;
  return { version, kbps, rate, length, samples, mono: ((buf[pos + 3] >> 6) & 3) === 3 };
}

/**
 * Duração exata de um MP3, somando os quadros (MPEG 1, 2 e 2.5, camada III). Assim o "segundo em que cada
 * trecho começa" não depende de a taxa de bits ser constante nem de haver cabeçalhos.
 */
export function mp3Seconds(buf) {
  let pos = id3Size(buf);
  let seconds = 0;
  while (pos + 4 <= buf.length) {
    const frame = frameAt(buf, pos);
    if (!frame) { pos++; continue; }
    seconds += frame.samples / frame.rate;
    pos += frame.length;
  }
  return seconds;
}

/**
 * Tira o que não é som do começo e do fim de um MP3: a etiqueta ID3v2 (a da ElevenLabs tem ~17 KB), a ID3v1 do fim e o
 * primeiro quadro quando ele é só o cabeçalho "Xing"/"Info" (silêncio com metadados). Ao colar centenas de trechos num
 * arquivo só, isso evita desperdiçar espaço e uma duração errada nos navegadores, que leem só o primeiro cabeçalho.
 * Idempotente: um MP3 já limpo volta igual.
 */
export function stripMp3Tags(buf) {
  let start = id3Size(buf);
  let end = buf.length;
  if (end - start > 128 && buf.toString('latin1', end - 128, end - 125) === 'TAG') end -= 128;
  const first = frameAt(buf, start);
  if (first) {
    // Os metadados ficam logo depois das informações laterais do quadro: 4 bytes de cabeçalho + 17 (MPEG 1 mono), 32, 9 ou 17
    const side = first.version === 3 ? (first.mono ? 17 : 32) : first.mono ? 9 : 17;
    const tag = buf.toString('latin1', start + 4 + side, start + 8 + side);
    if (tag === 'Xing' || tag === 'Info') start += first.length;
  }
  return buf.subarray(start, end);
}
