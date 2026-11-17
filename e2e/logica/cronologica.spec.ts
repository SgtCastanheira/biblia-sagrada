import { expect, test } from '@playwright/test';
import { BOOKS } from '../../src/app/core/books';
import {
  CHRONO_CHAPTERS,
  CHRONO_GROUPS,
  CHRONO_SECTIONS,
  chronoIndex,
  chronoNeighbour,
  chronoSectionOf,
  sectionRefs,
  sectionSize,
} from '../../src/app/core/bible-chronological';
import { titleCase } from '../../src/app/core/title-case';

const at = (book: string, chapter: number) => chronoIndex(book, chapter);

test('ordem cronológica: os 1.189 capítulos aparecem, cada um uma vez só', () => {
  const total = BOOKS.reduce((sum, b) => sum + b.chapters, 0);
  expect(total).toBe(1189);

  const seen = new Set<string>();
  const dup: string[] = [];
  for (const c of CHRONO_CHAPTERS) {
    const key = `${c.bookId} ${c.chapter}`;
    if (seen.has(key)) dup.push(key);
    seen.add(key);
  }
  expect(dup, 'capítulos repetidos').toEqual([]);

  const missing: string[] = [];
  for (const b of BOOKS) for (let c = 1; c <= b.chapters; c++) if (!seen.has(`${b.id} ${c}`)) missing.push(`${b.id} ${c}`);
  expect(missing, 'capítulos que faltam').toEqual([]);
  expect(CHRONO_CHAPTERS).toHaveLength(1189);

  // Nenhum trecho passa do último capítulo do livro, e o índice anda de 0 a 1.188 sem pular
  const bad: string[] = [];
  for (const s of CHRONO_SECTIONS) {
    for (const p of s.parts) {
      const book = BOOKS.find((b) => b.id === p.bookId);
      if (!book || p.from < 1 || p.to > book.chapters || p.from > p.to) bad.push(`${s.title}: ${p.bookId} ${p.from}-${p.to}`);
    }
  }
  expect(bad, 'trechos fora do livro').toEqual([]);
  CHRONO_CHAPTERS.forEach((c, i) => expect(c.index).toBe(i));
});

test('ordem cronológica: as seções estão em grupos que existem e na ordem dos grupos', () => {
  const ids = CHRONO_GROUPS.map((g) => g.id);
  expect(new Set(ids).size).toBe(ids.length);
  let last = -1;
  for (const s of CHRONO_SECTIONS) {
    const g = ids.indexOf(s.group);
    expect(g, `grupo de "${s.title}"`).toBeGreaterThanOrEqual(0);
    expect(g, `"${s.title}" fora da ordem dos grupos`).toBeGreaterThanOrEqual(last);
    last = g;
    expect(s.summary.length, `resumo de "${s.title}"`).toBeGreaterThan(20);
    expect(sectionSize(s)).toBeGreaterThan(0);
  }
  // todo grupo tem pelo menos uma seção
  for (const id of ids) expect(CHRONO_SECTIONS.some((s) => s.group === id), id).toBe(true);
  // numeração 1..N e uma seção só com uma pequena lista de trechos legível
  CHRONO_SECTIONS.forEach((s, i) => expect(s.n).toBe(i + 1));
  expect(sectionRefs(CHRONO_SECTIONS[0])).toBe('Gn 1–11');
});

test('ordem cronológica: a história vem antes do que depende dela', () => {
  const before = (a: [string, number], b: [string, number], why: string) =>
    expect(at(...a), why).toBeLessThan(at(...b));

  // O começo e a Lei
  before(['GEN', 11], ['GEN', 12], 'Babel antes de Abraão');
  before(['JOB', 1], ['GEN', 12], 'Jó no tempo dos patriarcas, antes de Abraão (escolha anotada)');
  before(['GEN', 50], ['EXO', 1], 'José antes de Moisés');
  before(['EXO', 20], ['LEV', 1], 'os Dez Mandamentos antes do Levítico');
  before(['NUM', 36], ['DEU', 1], 'Números antes de Deuteronômio');
  before(['DEU', 34], ['JOS', 1], 'a morte de Moisés antes de Josué');
  before(['JDG', 21], ['1SA', 1], 'Juízes antes de Samuel');

  // Os reis: Samuel, Reis e Crônicas contam a mesma história
  before(['1SA', 17], ['2SA', 11], 'Golias antes de Bate-Seba');
  before(['1SA', 31], ['1CH', 10], 'a morte de Saul em Samuel antes da de Crônicas');
  before(['2SA', 12], ['PSA', 51], 'o Salmo 51 depois de Natã (2Sm 12)');
  before(['PSA', 51], ['2SA', 13], 'o Salmo 51 logo depois de 2Sm 12, antes de Amnom');
  before(['1SA', 22], ['PSA', 52], 'o Salmo 52 depois de Doegue (1Sm 22)');
  before(['1KI', 8], ['PRO', 1], 'o Templo antes de Provérbios (escolha anotada)');
  before(['1KI', 11], ['1KI', 12], 'a morte de Salomão antes da divisão');
  before(['2CH', 9], ['2CH', 10], 'Salomão antes da divisão, em Crônicas');
  before(['PSA', 150], ['1KI', 3], 'os salmos ficam juntos antes de Salomão reinar');

  // Os profetas entram no reinado em que o livro os põe
  before(['1KI', 17], ['2KI', 2], 'Elias antes de Eliseu');
  before(['2KI', 14], ['JON', 1], 'Jonas no reinado de Jeroboão II (2Rs 14.25)');
  before(['JON', 4], ['AMO', 1], 'Jonas, depois Amós');
  before(['AMO', 9], ['ISA', 1], 'Amós antes de Isaías');
  before(['ISA', 6], ['ISA', 7], 'o chamado de Isaías antes do sinal ao rei Acaz');
  before(['2KI', 16], ['2KI', 17], 'Acaz antes da queda de Samaria');
  before(['2KI', 17], ['2KI', 18], 'a queda de Samaria antes de Ezequias');
  before(['2CH', 29], ['2KI', 18], 'a reforma de Ezequias antes do cerco');
  before(['ISA', 35], ['ISA', 36], 'Isaías 13–35 antes do cerco de Senaqueribe');
  before(['2KI', 19], ['PRO', 25], 'os provérbios de Ezequias depois do cerco');
  before(['2KI', 21], ['2KI', 22], 'Manassés antes de Josias');
  before(['2KI', 21], ['ZEP', 1], 'Sofonias no reinado de Josias');
  before(['ZEP', 3], ['2KI', 22], 'Sofonias antes da reforma de Josias');
  before(['2KI', 23], ['JER', 1], 'Jeremias depois de Josias');
  before(['JER', 20], ['HAB', 1], 'Habacuque depois do primeiro Jeremias');

  // O exílio: 605, 597, 593, 586, 573, 539, 536
  before(['DAN', 1], ['EZK', 1], 'Daniel em 605, Ezequiel em 593');
  before(['EZK', 24], ['2KI', 25], 'Ezequiel anuncia a queda, que acontece em 2Rs 25');
  before(['2KI', 25], ['LAM', 1], 'a queda de Jerusalém antes das Lamentações');
  before(['LAM', 5], ['EZK', 25], 'depois da queda, Ezequiel 25–39');
  before(['EZK', 39], ['EZK', 40], 'Ezequiel 40–48 (573) por último');
  before(['DAN', 7], ['DAN', 5], 'Daniel 7 e 8 são de antes da noite de Daniel 5');
  before(['DAN', 5], ['DAN', 9], 'Daniel 9 é do primeiro ano de Dario');
  before(['PSA', 137], ['EZR', 1], 'o salmo do exílio antes da volta');
  before(['DAN', 12], ['EZR', 1], 'o exílio termina com o decreto de Ciro');

  // A volta: Zorobabel (538, 520), Ester (483–473), Esdras (458), Neemias (445), Malaquias
  before(['EZR', 3], ['HAG', 1], 'o alicerce antes de Ageu');
  before(['ZEC', 14], ['EZR', 4], 'Ageu e Zacarias antes de Esdras 4–6');
  before(['EZR', 6], ['EST', 1], 'o Templo (516) antes de Ester');
  before(['EST', 10], ['EZR', 7], 'Ester antes da volta de Esdras (458)');
  before(['EZR', 10], ['NEH', 1], 'Esdras antes de Neemias');
  before(['NEH', 13], ['MAL', 1], 'Malaquias por último no Antigo Testamento');
  before(['MAL', 4], ['LUK', 1], 'o Antigo Testamento antes do Novo');

  // Jesus
  before(['LUK', 1], ['JHN', 1], 'o nascimento antes do ministério');
  before(['MAT', 4], ['MAT', 5], 'a tentação antes do Sermão do Monte');
  before(['MAT', 5], ['MAT', 10], 'o Sermão do Monte antes do envio dos Doze');
  before(['MAT', 16], ['MAT', 18], 'a confissão de Pedro antes de Mateus 18');
  before(['JHN', 11], ['JHN', 12], 'Lázaro antes da entrada em Jerusalém');
  before(['JHN', 12], ['MAT', 21], 'a unção em Betânia antes do templo');
  before(['MAT', 26], ['MAT', 27], 'a ceia antes da cruz');
  before(['JHN', 13], ['JHN', 18], 'a última ceia antes da prisão');
  before(['MAT', 27], ['MAT', 28], 'a cruz antes da ressurreição');
  before(['LUK', 24], ['ACT', 1], 'a ressurreição antes de Atos');

  // A Igreja
  before(['ACT', 7], ['ACT', 8], 'Estêvão antes de Samaria');
  before(['ACT', 13], ['GAL', 1], 'Gálatas depois da primeira viagem (escolha anotada)');
  before(['GAL', 6], ['ACT', 15], 'Gálatas antes do concílio (escolha anotada)');
  before(['ACT', 18], ['1TH', 1], 'as cartas aos tessalonicenses são de Corinto (At 18)');
  before(['ACT', 19], ['1CO', 1], '1 Coríntios é de Éfeso (At 19)');
  before(['1CO', 16], ['2CO', 1], '1 Coríntios antes de 2 Coríntios');
  before(['2CO', 13], ['ACT', 20], '2 Coríntios, da Macedônia, antes da Grécia de At 20');
  before(['ACT', 20], ['ROM', 1], 'Romanos é de Corinto, no fim da terceira viagem');
  before(['ACT', 28], ['EPH', 1], 'as cartas da prisão, de Roma, depois de At 28');
  before(['TIT', 3], ['2TI', 1], 'Tito antes da última carta de Paulo');
  before(['1JN', 5], ['REV', 1], 'as cartas de João antes do Apocalipse');
  expect(at('REV', 22), 'o Apocalipse fecha a leitura').toBe(1188);
  expect(at('GEN', 1), 'Gênesis 1 abre a leitura').toBe(0);
});

test('ordem cronológica: vizinhos, seção de um capítulo e pontas', () => {
  expect(chronoNeighbour('GEN', 1, -1)).toBeNull();
  expect(chronoNeighbour('REV', 22, 1)).toBeNull();
  expect(chronoNeighbour('GEN', 11, 1)).toMatchObject({ bookId: 'JOB', chapter: 1 });
  expect(chronoNeighbour('JOB', 42, 1)).toMatchObject({ bookId: 'GEN', chapter: 12 });
  expect(chronoNeighbour('GEN', 12, -1)).toMatchObject({ bookId: 'JOB', chapter: 42 });
  expect(chronoNeighbour('XXX', 1, 1)).toBeNull();
  expect(chronoSectionOf('PSA', 51)?.title).toBe('Bate-Seba, Natã e o Arrependimento');
  expect(chronoSectionOf('PSA', 1)?.title).toBe('Os Salmos');
  expect(chronoSectionOf('XXX', 1)).toBeNull();
});

test('ordem cronológica: “Os Salmos” junta só o que nenhuma seção pediu', () => {
  const placed = new Set([3, 18, 34, 51, 52, 54, 56, 57, 59, 60, 63, 90, 126, 137, 142]);
  const psalms = CHRONO_SECTIONS.find((s) => s.title === 'Os Salmos')!;
  const inBlock = psalms.parts.flatMap((p) => Array.from({ length: p.to - p.from + 1 }, (_, i) => p.from + i));
  expect(inBlock).toHaveLength(150 - placed.size);
  for (const n of placed) expect(inBlock, `Sl ${n}`).not.toContain(n);
  // os salmos postos fora ficam dentro da história, e não no bloco
  expect(chronoSectionOf('PSA', 137)?.group).toBe('exilio');
  expect(chronoSectionOf('PSA', 126)?.group).toBe('retorno');
  expect(chronoSectionOf('PSA', 90)?.group).toBe('exodo');
});

test('ordem cronológica: títulos de seção e de grupo seguem o padrão dos títulos', () => {
  const wrong: string[] = [];
  for (const s of CHRONO_SECTIONS) if (titleCase(s.title) !== s.title) wrong.push(`${s.title} → ${titleCase(s.title)}`);
  for (const g of CHRONO_GROUPS) {
    if (titleCase(g.name) !== g.name) wrong.push(`${g.name} → ${titleCase(g.name)}`);
    if (g.before && titleCase(g.before.title) !== g.before.title) wrong.push(`${g.before.title} → ${titleCase(g.before.title)}`);
  }
  expect(wrong).toEqual([]);
});
