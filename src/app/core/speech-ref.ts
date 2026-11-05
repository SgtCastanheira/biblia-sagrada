/** Como uma referência bíblica soa em voz alta: "Provérbios 30:15-16" vira "Provérbios capítulo 30, versículos 15 a 16" (código puro, testado em e2e/logica). */

const WORDS: Record<string, { chapter: string; verse: string; verses: string; to: string }> = {
  pt: { chapter: 'capítulo', verse: 'versículo', verses: 'versículos', to: 'a' },
  es: { chapter: 'capítulo', verse: 'versículo', verses: 'versículos', to: 'a' },
  en: { chapter: 'chapter', verse: 'verse', verses: 'verses', to: 'to' },
  fr: { chapter: 'chapitre', verse: 'verset', verses: 'versets', to: 'à' },
  de: { chapter: 'Kapitel', verse: 'Vers', verses: 'Verse', to: 'bis' },
  ru: { chapter: 'глава', verse: 'стих', verses: 'стихи', to: 'по' },
};

// capítulo e versículo separados por ponto, dois-pontos ou vírgula, com um fim opcional ("30.15-16", "30:15", "30,15-16")
const CHAPTER_VERSE = /(\d+)\s*[.:,]\s*(\d+)(?:\s*[-–]\s*(\d+))?/;

export function spokenReference(label: string, lang: string): string {
  const w = WORDS[lang] ?? WORDS['pt'];
  return label.replace(CHAPTER_VERSE, (_, chapter: string, from: string, to?: string) =>
    to ? `${w.chapter} ${chapter}, ${w.verses} ${from} ${w.to} ${to}` : `${w.chapter} ${chapter}, ${w.verse} ${from}`,
  );
}
