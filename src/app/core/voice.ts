/**
 * Voz da narração (Web Speech API, sem internet nem chave).
 * A preferida é a Francisca (pt-BR-FranciscaNeural), da Microsoft: vem no navegador Edge,
 * no Windows e no Android, com o nome "Microsoft Francisca Online (Natural)". Onde ela não
 * existe, usa a melhor voz brasileira do aparelho.
 */
const PREFERRED = [/francisca/i, /natural|neural|online/i, /google/i];

export function narrationVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null;
  const voices = speechSynthesis.getVoices();
  const brazilian = voices.filter((v) => v.lang.replace('_', '-').toLowerCase() === 'pt-br');
  for (const pattern of PREFERRED) {
    const found = brazilian.find((v) => pattern.test(v.name));
    if (found) return found;
  }
  return brazilian[0] ?? voices.find((v) => v.lang.toLowerCase().startsWith('pt')) ?? null;
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
  const score = (v: SpeechSynthesisVoice) => {
    const i = PREFERRED.findIndex((p) => p.test(v.name));
    return (v.lang.replace('_', '-').toLowerCase() === 'pt-br' ? 0 : 10) + (i < 0 ? PREFERRED.length : i);
  };
  return speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('pt')).sort((a, b) => score(a) - score(b));
}
