/** Texto de um trecho para casar o áudio gravado com a tela (código puro: usado também por tools/gerar-audio.mjs). */

/** Tira acentos, pontuação e maiúsculas: o mesmo trecho dá o mesmo resultado na ferramenta e no app. */
export function normalizeForMatch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Identificador curto (FNV-1a, 32 bits) do texto normalizado, guardado no índice de áudios. */
export function textKey(text: string): string {
  let h = 0x811c9dc5;
  for (const ch of normalizeForMatch(text)) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** Um áudio gravado de uma história: de que segundo começa cada trecho. */
export interface AudioEntry {
  /** Resumo do texto lido; muda quando o texto muda (o áudio fica desatualizado). */
  source: string;
  seconds: number;
  /** `t`: início em segundos; `k`: textKey() do trecho. */
  items: { t: number; k: string }[];
}

export interface AudioIndex {
  voice: string;
  files: Record<string, AudioEntry>;
}
