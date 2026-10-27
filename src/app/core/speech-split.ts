/** Divide o texto em frases curtas para a leitura em voz alta (código puro, testado em e2e/logica). */
const MAX_CHUNK = 220;
/** O Chrome corta falas longas, e frases dão pausas naturais. */
export function splitForSpeech(text: string): string[] {
  const sentences = text.replace(/\s+/g, ' ').trim().match(/[^.!?…;:]+[.!?…;:]*\s*/g) ?? [];
  const chunks: string[] = [];
  for (const s of sentences) {
    let rest = s.trim();
    while (rest.length > MAX_CHUNK) {
      const cut = rest.lastIndexOf(',', MAX_CHUNK) > 60 ? rest.lastIndexOf(',', MAX_CHUNK) + 1 : rest.lastIndexOf(' ', MAX_CHUNK);
      chunks.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    if (rest) chunks.push(rest);
  }
  return chunks;
}

