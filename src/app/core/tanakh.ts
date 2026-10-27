import { BOOKS } from './books';

/** As três partes da Bíblia hebraica: Torá, Neviim e Ketuvim (T-N-K, de onde vem "Tanakh"). */
export type TanakhGroup = 'lei' | 'profetas' | 'escritos';

export const TANAKH_GROUPS: Record<TanakhGroup, { name: string; hebrew: string; note: string }> = {
  lei: { name: 'A Lei', hebrew: 'תורה', note: 'Torá: os cinco livros de Moisés.' },
  profetas: { name: 'Os Profetas', hebrew: 'נביאים', note: 'Neviim: os profetas anteriores (a história de Israel) e os posteriores (os livros proféticos).' },
  escritos: { name: 'Os Escritos', hebrew: 'כתובים', note: 'Ketuvim: os Salmos, a sabedoria, os cinco rolos e os livros do pós-exílio.' },
};

export interface TanakhBook {
  /** Nome em hebraico. */
  he: string;
  /** Nome transliterado. */
  name: string;
  /** Nome em português (como na nossa Bíblia). */
  pt: string;
  group: TanakhGroup;
  /** Livros da nossa Bíblia (ids de books.ts) que formam este rolo. */
  ids: string[];
}

/** Os 24 livros (rolos) da Bíblia hebraica, na ordem em que são impressos hoje. */
export const TANAKH: TanakhBook[] = [
  { he: 'בראשית', name: 'Bereshit', pt: 'Gênesis', group: 'lei', ids: ['GEN'] },
  { he: 'שמות', name: 'Shemot', pt: 'Êxodo', group: 'lei', ids: ['EXO'] },
  { he: 'ויקרא', name: 'Vaikrá', pt: 'Levítico', group: 'lei', ids: ['LEV'] },
  { he: 'במדבר', name: 'Bamidbar', pt: 'Números', group: 'lei', ids: ['NUM'] },
  { he: 'דברים', name: 'Devarim', pt: 'Deuteronômio', group: 'lei', ids: ['DEU'] },
  { he: 'יהושע', name: 'Yehoshúa', pt: 'Josué', group: 'profetas', ids: ['JOS'] },
  { he: 'שופטים', name: 'Shoftim', pt: 'Juízes', group: 'profetas', ids: ['JDG'] },
  { he: 'שמואל', name: 'Shmuel', pt: '1 e 2 Samuel', group: 'profetas', ids: ['1SA', '2SA'] },
  { he: 'מלכים', name: 'Melakhim', pt: '1 e 2 Reis', group: 'profetas', ids: ['1KI', '2KI'] },
  { he: 'ישעיהו', name: 'Yeshayáhu', pt: 'Isaías', group: 'profetas', ids: ['ISA'] },
  { he: 'ירמיהו', name: 'Yirmeyáhu', pt: 'Jeremias', group: 'profetas', ids: ['JER'] },
  { he: 'יחזקאל', name: 'Yehezkel', pt: 'Ezequiel', group: 'profetas', ids: ['EZK'] },
  { he: 'תרי עשר', name: 'Trei Asar', pt: 'Os Doze (Oseias a Malaquias)', group: 'profetas', ids: ['HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'] },
  { he: 'תהילים', name: 'Tehilim', pt: 'Salmos', group: 'escritos', ids: ['PSA'] },
  { he: 'משלי', name: 'Mishlei', pt: 'Provérbios', group: 'escritos', ids: ['PRO'] },
  { he: 'איוב', name: 'Iyov', pt: 'Jó', group: 'escritos', ids: ['JOB'] },
  { he: 'שיר השירים', name: 'Shir HaShirim', pt: 'Cânticos', group: 'escritos', ids: ['SNG'] },
  { he: 'רות', name: 'Rut', pt: 'Rute', group: 'escritos', ids: ['RUT'] },
  { he: 'איכה', name: 'Eikhá', pt: 'Lamentações', group: 'escritos', ids: ['LAM'] },
  { he: 'קהלת', name: 'Kohelet', pt: 'Eclesiastes', group: 'escritos', ids: ['ECC'] },
  { he: 'אסתר', name: 'Ester', pt: 'Ester', group: 'escritos', ids: ['EST'] },
  { he: 'דניאל', name: 'Daniel', pt: 'Daniel', group: 'escritos', ids: ['DAN'] },
  { he: 'עזרא נחמיה', name: 'Ezra-Nehemyá', pt: 'Esdras e Neemias', group: 'escritos', ids: ['EZR', 'NEH'] },
  { he: 'דברי הימים', name: 'Divrei HaYamim', pt: '1 e 2 Crônicas', group: 'escritos', ids: ['1CH', '2CH'] },
];

/** O Antigo Testamento na ordem da nossa Bíblia (39 livros), cada um com a parte da Bíblia hebraica a que pertence. */
export function christianOrder(): { id: string; name: string; group: TanakhGroup }[] {
  const groupOf = new Map<string, TanakhGroup>();
  for (const b of TANAKH) for (const id of b.ids) groupOf.set(id, b.group);
  return BOOKS.filter((b) => b.testament === 'AT').map((b) => ({ id: b.id, name: b.name, group: groupOf.get(b.id)! }));
}
