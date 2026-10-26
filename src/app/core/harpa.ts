/**
 * Harpa Cristã: a história de cada hino — quem escreveu ou traduziu, de onde veio e por quê.
 * As letras não ficam no app (direitos da CPAD e dos autores): só os fatos, sempre com a fonte.
 * Os dados ficam em public/conteudo/harpa.json: só os hinos já confirmados em fontes públicas
 * (número, título, quem escreveu ou traduziu e, quando documentada, a origem). Os demais entram aos poucos.
 */

export interface HymnOrigin {
  /** Título original e idioma ("There Shall Be Showers of Blessing", "inglês"). */
  title: string;
  language: string;
  author: string;
  composer?: string;
  /** Ano em que foi escrito (ou publicado pela primeira vez). */
  year?: string;
  /** Como e por que nasceu (texto com [[referências]]). */
  story: string;
  /** Texto bíblico em que se baseia. */
  bible?: string;
  /** Fontes desta história (texto + endereço). */
  sources: { label: string; url?: string }[];
}

export interface Hymn {
  n: number;
  title: string;
  /** Quem escreveu ou traduziu em português, como a Harpa indica. */
  author?: string;
  /** Id do autor/tradutor (chave de `people`). */
  person?: string;
  origin?: HymnOrigin;
  /** Onde se confirmam o número, o título e o autor deste hino. */
  sources: { label: string; url?: string }[];
}

export interface HarpaData {
  hymns: Hymn[];
  /** Nomes completos dos autores e tradutores, pelo id. */
  people: Record<string, { name: string; bio?: string; sources?: { label: string; url?: string }[] }>;
}


/** Busca por número ("328") ou por título, sem acentos. */
export function searchHymns(hymns: Hymn[], query: string, fold: (s: string) => string): Hymn[] {
  const q = query.trim();
  if (!q) return hymns;
  if (/^\d+$/.test(q)) return hymns.filter((h) => String(h.n).startsWith(q));
  const f = fold(q);
  return hymns.filter((h) => fold(h.title).includes(f));
}
