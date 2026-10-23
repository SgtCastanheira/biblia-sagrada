import { Book, BookCategory, Testament } from './models';

export const CATEGORIES = {
  // Tons terrosos e discretos, usados só em pequenos detalhes
  law: { id: 'law', name: 'Pentateuco', color: '#a8775c' },
  history: { id: 'history', name: 'Históricos', color: '#a38a5a' },
  poetry: { id: 'poetry', name: 'Poéticos', color: '#71907a' },
  major: { id: 'major', name: 'Profetas Maiores', color: '#6a8698' },
  minor: { id: 'minor', name: 'Profetas Menores', color: '#7b809c' },
  gospels: { id: 'gospels', name: 'Evangelhos', color: '#a86f6f' },
  acts: { id: 'acts', name: 'Histórico', color: '#a8775c' },
  pauline: { id: 'pauline', name: 'Cartas de Paulo', color: '#8a7a9c' },
  general: { id: 'general', name: 'Cartas Gerais', color: '#6a908c' },
  prophecy: { id: 'prophecy', name: 'Profecia', color: '#957060' },
} satisfies Record<string, BookCategory>;

// Índice do primeiro livro de cada categoria (na ordem da lista)
const CATEGORY_STARTS: [string, BookCategory][] = [
  ['GEN', CATEGORIES.law], ['JOS', CATEGORIES.history], ['JOB', CATEGORIES.poetry],
  ['ISA', CATEGORIES.major], ['HOS', CATEGORIES.minor], ['MAT', CATEGORIES.gospels],
  ['ACT', CATEGORIES.acts], ['ROM', CATEGORIES.pauline], ['HEB', CATEGORIES.general],
  ['REV', CATEGORIES.prophecy],
];

const at: [string, string, string, number][] = [
  ['GEN', 'Gênesis', 'Gn', 50], ['EXO', 'Êxodo', 'Êx', 40], ['LEV', 'Levítico', 'Lv', 27],
  ['NUM', 'Números', 'Nm', 36], ['DEU', 'Deuteronômio', 'Dt', 34], ['JOS', 'Josué', 'Js', 24],
  ['JDG', 'Juízes', 'Jz', 21], ['RUT', 'Rute', 'Rt', 4], ['1SA', '1 Samuel', '1Sm', 31],
  ['2SA', '2 Samuel', '2Sm', 24], ['1KI', '1 Reis', '1Rs', 22], ['2KI', '2 Reis', '2Rs', 25],
  ['1CH', '1 Crônicas', '1Cr', 29], ['2CH', '2 Crônicas', '2Cr', 36], ['EZR', 'Esdras', 'Ed', 10],
  ['NEH', 'Neemias', 'Ne', 13], ['EST', 'Ester', 'Et', 10], ['JOB', 'Jó', 'Jó', 42],
  ['PSA', 'Salmos', 'Sl', 150], ['PRO', 'Provérbios', 'Pv', 31], ['ECC', 'Eclesiastes', 'Ec', 12],
  ['SNG', 'Cânticos', 'Ct', 8], ['ISA', 'Isaías', 'Is', 66], ['JER', 'Jeremias', 'Jr', 52],
  ['LAM', 'Lamentações', 'Lm', 5], ['EZK', 'Ezequiel', 'Ez', 48], ['DAN', 'Daniel', 'Dn', 12],
  ['HOS', 'Oséias', 'Os', 14], ['JOL', 'Joel', 'Jl', 3], ['AMO', 'Amós', 'Am', 9],
  ['OBA', 'Obadias', 'Ob', 1], ['JON', 'Jonas', 'Jn', 4], ['MIC', 'Miquéias', 'Mq', 7],
  ['NAM', 'Naum', 'Na', 3], ['HAB', 'Habacuque', 'Hc', 3], ['ZEP', 'Sofonias', 'Sf', 3],
  ['HAG', 'Ageu', 'Ag', 2], ['ZEC', 'Zacarias', 'Zc', 14], ['MAL', 'Malaquias', 'Ml', 4],
];

const nt: [string, string, string, number][] = [
  ['MAT', 'Mateus', 'Mt', 28], ['MRK', 'Marcos', 'Mc', 16], ['LUK', 'Lucas', 'Lc', 24],
  ['JHN', 'João', 'Jo', 21], ['ACT', 'Atos', 'At', 28], ['ROM', 'Romanos', 'Rm', 16],
  ['1CO', '1 Coríntios', '1Co', 16], ['2CO', '2 Coríntios', '2Co', 13], ['GAL', 'Gálatas', 'Gl', 6],
  ['EPH', 'Efésios', 'Ef', 6], ['PHP', 'Filipenses', 'Fp', 4], ['COL', 'Colossenses', 'Cl', 4],
  ['1TH', '1 Tessalonicenses', '1Ts', 5], ['2TH', '2 Tessalonicenses', '2Ts', 3],
  ['1TI', '1 Timóteo', '1Tm', 6], ['2TI', '2 Timóteo', '2Tm', 4], ['TIT', 'Tito', 'Tt', 3],
  ['PHM', 'Filemom', 'Fm', 1], ['HEB', 'Hebreus', 'Hb', 13], ['JAS', 'Tiago', 'Tg', 5],
  ['1PE', '1 Pedro', '1Pe', 5], ['2PE', '2 Pedro', '2Pe', 3], ['1JN', '1 João', '1Jo', 5],
  ['2JN', '2 João', '2Jo', 1], ['3JN', '3 João', '3Jo', 1], ['JUD', 'Judas', 'Jd', 1],
  ['REV', 'Apocalipse', 'Ap', 22],
];

const toBooks = (list: [string, string, string, number][], testament: Testament) =>
  list.map(([id, name, abbrev, chapters]) => ({ id, name, abbrev, chapters, testament }));

let category = CATEGORIES.law as BookCategory;
export const BOOKS: Book[] = [...toBooks(at, 'AT'), ...toBooks(nt, 'NT')].map((book) => {
  category = CATEGORY_STARTS.find(([id]) => id === book.id)?.[1] ?? category;
  return { ...book, category };
});

export const BOOK_GROUPS = (testament: Testament) => {
  const groups: { category: BookCategory; books: Book[] }[] = [];
  for (const book of BOOKS.filter((b) => b.testament === testament)) {
    const last = groups.at(-1);
    if (last?.category === book.category) last.books.push(book);
    else groups.push({ category: book.category, books: [book] });
  }
  return groups;
};

export const findBook = (id: string): Book | undefined => BOOKS.find((b) => b.id === id);
