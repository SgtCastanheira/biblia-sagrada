/** Dicionário bíblico: termos em português com a palavra original (hebraico, aramaico, grego ou latim). */

export type DictionaryLang = 'he' | 'ar' | 'gr' | 'la';

export type DictionaryKind = 'termo' | 'verbo' | 'nome' | 'lugar' | 'medida' | 'festa' | 'expressao';

export interface OriginalWord {
  lang: DictionaryLang;
  word: string;
  translit: string;
  /** Número de Strong (H = hebraico/aramaico, G = grego). */
  strong?: string;
  meaning: string;
}

/** Um sentido da palavra, conforme o contexto (com os versículos em que aparece assim). */
export interface Sense {
  sense: string;
  refs: string[];
  note?: string;
}

/** Uma forma da palavra como aparece num versículo (conjugação ou declinação), com a análise. */
export interface Inflection {
  lang: DictionaryLang;
  word: string;
  translit: string;
  /** Análise gramatical: "aoristo, indicativo, ativo, 3ª pessoa do singular". */
  parsing: string;
  /** Como a Almeida traduz. */
  gloss: string;
  ref: string;
  /** O que a forma acrescenta ao sentido. */
  note?: string;
}

export interface DictionaryEntry {
  id: string;
  term: string;
  kind: DictionaryKind;
  /**
   * Palavras como aparecem na Almeida, marcadas no texto do leitor. Em minúsculas, valem também
   * com a inicial maiúscula; com maiúscula ("Senhor"), só como estão escritas.
   */
  forms?: string[];
  original?: OriginalWord[];
  definition: string;
  refs?: string[];
  see?: string[];
  senses?: Sense[];
  inflections?: Inflection[];
  /** Domínio semântico (assunto). */
  domain?: string;
}

/** Assuntos (domínios semânticos) do dicionário, na ordem em que aparecem. */
export const DOMAINS: { id: string; name: string }[] = [
  { id: 'deus', name: 'Deus e os seus nomes' },
  { id: 'cristo', name: 'Cristo e o Espírito Santo' },
  { id: 'salvacao', name: 'Salvação e graça' },
  { id: 'virtudes', name: 'Fé, amor e esperança' },
  { id: 'humano', name: 'O ser humano' },
  { id: 'pecado', name: 'Pecado, juízo e fim dos tempos' },
  { id: 'culto', name: 'Culto, aliança e vida com Deus' },
  { id: 'festas', name: 'Festas e calendário' },
  { id: 'pessoas', name: 'Pessoas, grupos e ofícios' },
  { id: 'espirituais', name: 'Anjos, demônios e deuses dos povos' },
  { id: 'lugares', name: 'Lugares' },
  { id: 'medidas', name: 'Medidas e moedas' },
  { id: 'expressoes', name: 'Palavras em aramaico e hebraico' },
  { id: 'latim', name: 'Latim e a história da Igreja' },
];

export const LANGS: Record<DictionaryLang, { name: string; dir: 'rtl' | 'ltr' }> = {
  he: { name: 'Hebraico', dir: 'rtl' },
  ar: { name: 'Aramaico', dir: 'rtl' },
  gr: { name: 'Grego', dir: 'ltr' },
  la: { name: 'Latim', dir: 'ltr' },
};

export const KINDS: Record<DictionaryKind, string> = {
  termo: 'Termo bíblico',
  verbo: 'Verbo',
  nome: 'Nome',
  lugar: 'Lugar',
  medida: 'Medida e moeda',
  festa: 'Festa e calendário',
  expressao: 'Expressão',
};

/** Trecho de texto: palavra comum ou palavra do dicionário. */
export interface TextPart {
  text: string;
  entry?: string;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Localiza as palavras do dicionário num texto. */
export class DictionaryMatcher {
  private readonly ids = new Map<string, string>();
  private readonly pattern: RegExp | null;

  constructor(entries: DictionaryEntry[]) {
    for (const entry of entries) {
      for (const form of entry.forms ?? []) {
        this.ids.set(form, entry.id);
        if (form === form.toLowerCase()) this.ids.set(capitalize(form), entry.id);
      }
    }
    // As formas mais longas primeiro ("Espírito Santo" antes de "Espírito")
    const forms = [...this.ids.keys()].sort((a, b) => b.length - a.length).map(escape);
    this.pattern = forms.length ? new RegExp(`(?<![\\p{L}\\p{M}])(?:${forms.join('|')})(?![\\p{L}\\p{M}])`, 'gu') : null;
  }

  /**
   * Divide o texto em partes. Cada termo é marcado uma vez só (`seen`), para não poluir a leitura.
   */
  split(text: string, seen = new Set<string>()): TextPart[] {
    if (!this.pattern) return [{ text }];
    const parts: TextPart[] = [];
    let last = 0;
    for (const match of text.matchAll(this.pattern)) {
      const id = this.ids.get(match[0]);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      if (match.index > last) parts.push({ text: text.slice(last, match.index) });
      parts.push({ text: match[0], entry: id });
      last = match.index + match[0].length;
    }
    if (last < text.length) parts.push({ text: text.slice(last) });
    return parts;
  }
}

/** Remove acentos e caixa, para a busca no dicionário. */
export const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** O versículo está dentro de alguma das referências? (para destacar o sentido “neste versículo”) */
export function refsCover(refs: string[], parse: (r: string) => { bookId: string; chapter: number; from?: number; to?: number }[], at: { bookId: string; chapter: number; verse: number }): boolean {
  return refs.some((text) =>
    parse(text).some((r) => r.bookId === at.bookId && r.chapter === at.chapter && (r.from === undefined || (at.verse >= r.from && at.verse <= (r.to ?? r.from)))),
  );
}
