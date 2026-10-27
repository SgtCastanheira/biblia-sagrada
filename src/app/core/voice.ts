/**
 * Voz da narração (Web Speech API, sem internet nem chave).
 * A preferida é uma voz neural da Microsoft (Francisca, Antônio, Thalita): vem no navegador Edge, no Windows
 * e no Android, com nomes como "Microsoft Francisca Online (Natural)". Depois vêm as vozes Premium da Apple,
 * as vozes locais da Microsoft e, por último, a do Google, que é a mais mecânica (ver voiceQuality).
 */
/** Nota de naturalidade de uma voz pelo nome: quanto maior, mais natural. Pura, para os testes. */
export function voiceQuality(name: string, lang: string): number {
  const n = name.toLowerCase();
  let score = lang.replace('_', '-').toLowerCase() === 'pt-br' ? 100 : 0;
  // Vozes neurais da Microsoft (Edge, Windows 11, Android): as mais naturais
  if (/natural|neural/.test(n)) score += 60;
  else if (/online/.test(n)) score += 40;
  if (/francisca|antonio|antônio|thalita/.test(n)) score += 10;
  // Apple: as vozes "Premium"/"Aprimorada" baixadas em Ajustes > Acessibilidade são boas
  if (/premium|enhanced|aprimorad|melhorad/.test(n)) score += 45;
  if (/luciana|fernanda|felipe/.test(n)) score += 15;
  // Vozes locais da Microsoft (Maria, Daniel) são boas
  if (/microsoft/.test(n)) score += 20;
  // A "Google português do Brasil" é a mais mecânica: só se não houver outra
  if (/google/.test(n)) score += 8;
  if (/espeak|compact|compacta/.test(n)) score -= 40;
  return score;
}

/** A voz serve como "natural" (neural, premium) ou é só a voz comum do aparelho? */
export const isNaturalVoice = (name: string) => /natural|neural|premium|enhanced|aprimorad|melhorad/i.test(name);

/** Vozes em português ordenadas da mais para a menos natural. */
export function rankVoices<T extends { name: string; lang: string }>(voices: T[]): T[] {
  return voices
    .filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('pt'))
    .sort((a, b) => voiceQuality(b.name, b.lang) - voiceQuality(a.name, a.lang));
}

export function narrationVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null;
  return rankVoices(speechSynthesis.getVoices())[0] ?? null;
}

/** No Chrome e no Edge a lista de vozes chega depois; chame cedo para ela já estar pronta na hora de falar. */
export function warmUpVoices(): void {
  if (typeof speechSynthesis === 'undefined') return;
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener?.('voiceschanged', () => speechSynthesis.getVoices(), { once: true });
}

/** Vozes em português do aparelho, as mais naturais primeiro (para a pessoa escolher). */
export function portugueseVoices(): SpeechSynthesisVoice[] {
  if (typeof speechSynthesis === 'undefined') return [];
  return rankVoices(speechSynthesis.getVoices());
}
