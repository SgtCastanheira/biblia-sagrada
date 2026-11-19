import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import {
  buildLives,
  contemporariesOf,
  JESUS,
  parsePeriod,
  peopleOfPhase,
  PHASE_PERSON,
  phaseOfLife,
  phasesWithPeople,
  RELATION_LABEL,
  TOGETHER,
  togetherOf,
  type Life,
} from '../../src/app/core/contemporaries';
import { CHRONO_GROUPS } from '../../src/app/core/bible-chronological';
import type { Person } from '../../src/app/core/memorial';
import { parseReferences } from '../../src/app/core/reference-parser';

const people: Person[] = JSON.parse(readFileSync('public/conteudo/memorial.json', 'utf8'));
const lives = buildLives(people);
const byId = new Map<string, Life>(lives.map((l) => [l.id, l]));
const names = new Map<string, string>([...people.map((p) => [p.id, p.name] as [string, string]), ['jesus', 'Jesus']]);

const norm = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const cache = new Map<string, [number, string][][]>();
const livro = (id: string) => (cache.get(id) ?? (cache.set(id, JSON.parse(readFileSync(`public/bible/almeida/${id}.json`, 'utf8'))), cache.get(id)!));

/** O texto da Almeida do app para uma ou mais referências separadas por “;”, ou o motivo de não servirem. */
function texto(ref: string): { t: string; erro?: string } {
  const p = parseReferences(ref);
  if (p.errors.length || !p.refs.length) return { t: '', erro: `não entendida: ${ref}` };
  const out: string[] = [];
  for (const r of p.refs) {
    const cap = livro(r.bookId)[r.chapter - 1];
    if (!cap) return { t: '', erro: `capítulo inexistente: ${ref}` };
    const vs = cap.filter(([n]) => n >= (r.from ?? 1) && n <= (r.to ?? (r.from ?? 999)));
    if (!vs.length) return { t: '', erro: `versículo inexistente: ${ref}` };
    out.push(...vs.map(([, t]) => t));
  }
  return { t: out.join(' ') };
}

/** Como a Almeida escreve o nome quando não é como o Memorial (Abrão, Cefas, Felipe, Jeoiaquim, Jeosafá, Saulo…). */
const ALIASES: Record<string, string[]> = {
  abraao: ['abrao'], sara: ['sarai'], jaco: ['israel'], paulo: ['saulo'], pedro: ['cefas', 'simao'], filipe: ['felipe'],
  jeoaquim: ['jeoiaquim'], josafa: ['jeosafa'], joaquim: ['joaquim', 'jeconias'], 'joao-marcos': ['marcos'], 'tiago-irmao-do-senhor': ['tiago'],
};

/** As palavras do nome que identificam a pessoa no texto (“Uzias (Azarias)” → uzias, azarias; “Tiago, filho de Zebedeu” → tiago). */
function stems(name: string, id = ''): string[] {
  const main = name.split(',')[0];
  const words = norm(main).match(/[a-z]+/g) ?? [];
  const inParens = norm(name.match(/\(([^)]*)\)/)?.[1] ?? '').match(/[a-z]+/g) ?? [];
  const skip = new Set(['de', 'da', 'do', 'a', 'o', 'e', 'i', 'ii']);
  return [...words, ...inParens, ...(ALIASES[id] ?? [])].filter((w) => !skip.has(w) && w.length > 2);
}

test('contemporâneos: lê os períodos do Memorial como ele os escreve (anos, ponto, século e reinados)', () => {
  expect(parsePeriod('c. 1100–1015 a.C.')).toEqual({ from: -1100, to: -1015, precision: 'anos' });
  expect(parsePeriod('931–913 a.C.')).toEqual({ from: -931, to: -913, precision: 'anos' });
  expect(parsePeriod('Entre 663 e 612 a.C.')).toEqual({ from: -663, to: -612, precision: 'anos' });
  expect(parsePeriod('c. 6 a.C. – 28 d.C.')).toEqual({ from: -6, to: 28, precision: 'anos' });
  expect(parsePeriod('c. 5 – c. 67 d.C.')).toEqual({ from: 5, to: 67, precision: 'anos' });
  expect(parsePeriod('c. 1100 a.C.')).toEqual({ from: -1100, to: -1100, precision: 'ponto' });
  expect(parsePeriod('séc. I')).toEqual({ from: 1, to: 100, precision: 'seculo' });
  expect(parsePeriod('séc. I (morto c. 44 d.C.)')).toEqual({ from: 1, to: 44, precision: 'seculo' });
  expect(parsePeriod('séc. I (morto c. 64–67 d.C.)')).toEqual({ from: 1, to: 67, precision: 'seculo' });
  expect(parsePeriod('c. 20 a.C. – séc. I')).toEqual({ from: -20, to: 100, precision: 'seculo' });
  // o que o Memorial não data não vira ano
  expect(parsePeriod('Início da humanidade')).toBeNull();
  expect(parsePeriod('Data incerta')).toBeNull();
  expect(parsePeriod('Época dos patriarcas (data incerta)')).toBeNull();

  // os reis entram com o reinado, e o parêntese do Memorial não conta (“696–642 a.C. (com o pai, até 686)”)
  const manasses = byId.get('manasses')!;
  expect([manasses.from, manasses.to]).toEqual([-696, -642]);
  expect(byId.get('zinri')).toMatchObject({ from: -885, to: -885, precision: 'anos' }); // reinou 7 dias
});

test('contemporâneos: cada pessoa tem anos de começo e fim em ordem, e só ficam de fora as que o Memorial não data', () => {
  for (const l of lives) {
    expect(l.to, `${l.id}: o fim vem antes do começo`).toBeGreaterThanOrEqual(l.from);
    expect(l.name, l.id).toBeTruthy();
  }
  const semAnos = people.filter((p) => !byId.has(p.id)).map((p) => p.id).sort();
  expect(semAnos).toEqual(['abel', 'adao', 'enoque', 'eva', 'joel', 'jo', 'noe'].sort());
  // com Jesus (que não está no Memorial) são todos os outros mais um
  expect(lives).toHaveLength(people.length - semAnos.length + 1);
  expect(byId.get('jesus')).toBe(JESUS);
  expect(new Set(lives.map((l) => l.id)).size).toBe(lives.length);
});

test('contemporâneos: os patriarcas têm anos de vida calculados com as idades de Gênesis, e se cruzam como pai e filho', () => {
  const l = (id: string) => byId.get(id)!;
  // as idades que o texto dá: Abraão 175, Sara 127, Isaque 180, Jacó 147, José 110
  expect(l('abraao').to - l('abraao').from).toBe(175);
  expect(l('sara').to - l('sara').from).toBe(127);
  expect(l('isaque').to - l('isaque').from).toBe(180);
  expect(l('jaco').to - l('jaco').from).toBe(147);
  expect(l('jose').to - l('jose').from).toBe(110);
  // Isaque nasceu quando Abraão tinha 100 anos (Gn 21.5); Jacó, quando Isaque tinha 60 (Gn 25.26)
  expect(l('isaque').from - l('abraao').from).toBe(100);
  expect(l('jaco').from - l('isaque').from).toBe(60);
  // Jacó tinha 130 anos ao chegar ao Egito (Gn 47.9), quando José tinha 39 (30 + 7 de fartura + 2 de fome)
  expect(l('jose').from + 39 - l('jaco').from).toBe(130);
  for (const [a, b] of [['abraao', 'isaque'], ['isaque', 'jaco'], ['jaco', 'jose'], ['abraao', 'sara']]) {
    expect(contemporariesOf(lives, a).exact.map((x) => x.id), `${a} e ${b}`).toContain(b);
  }
  // Abraão e Jacó se cruzaram (Jacó nasceu quando Abraão tinha 160), mas José não conheceu Abraão
  expect(contemporariesOf(lives, 'abraao').exact.map((x) => x.id)).toContain('jaco');
  expect(contemporariesOf(lives, 'abraao').exact.map((x) => x.id)).not.toContain('jose');
});

test('contemporâneos: quem viveu na mesma época, nos casos que o texto bíblico confirma', () => {
  const ids = (id: string) => contemporariesOf(lives, id).exact.map((l) => l.id);
  // os profetas do século VIII a.C. e os reis do tempo deles (Is 1.1, Os 1.1, Mq 1.1)
  for (const x of ['uzias', 'jotao', 'acaz', 'ezequias', 'oseias-profeta', 'miqueias']) expect(ids('isaias'), `isaias e ${x}`).toContain(x);
  // Elias e Eliseu, Acabe e Josafá, Micaías
  for (const x of ['eliseu', 'acabe', 'josafa', 'micaias']) expect(ids('elias'), `elias e ${x}`).toContain(x);
  // os três do exílio, e os reis de Jeremias (Jr 1.1-3)
  expect(ids('jeremias')).toEqual(expect.arrayContaining(['daniel', 'ezequiel', 'josias', 'jeoaquim', 'zedequias']));
  expect(ids('daniel')).toContain('ezequiel');
  // a volta do exílio
  expect(ids('zorobabel')).toEqual(expect.arrayContaining(['ageu', 'zacarias-profeta']));
  expect(ids('neemias')).toEqual(expect.arrayContaining(['esdras', 'malaquias']));
  expect(ids('ester')).toContain('mardoqueu');
  // Davi com Samuel, Saul, Natã, Salomão
  expect(ids('davi')).toEqual(expect.arrayContaining(['samuel', 'saul', 'nata', 'salomao', 'jonatas', 'gade']));
  // Moisés com Arão, Miriã, Josué e Calebe
  expect(ids('moises')).toEqual(expect.arrayContaining(['arao', 'miria', 'josue', 'calebe']));
  // Jesus com João Batista, e Paulo com Pedro
  expect(ids('jesus')).toContain('joao-batista');
  // Pedro só tem “século I” no Memorial: da lista de Paulo (que tem anos) ele vai para a do século; da dele, Paulo tem anos
  expect(ids('pedro')).toContain('paulo');
  expect(contemporariesOf(lives, 'paulo').century.map((l) => l.id)).toContain('pedro');
  // e quem NÃO viveu na mesma época: Davi e Isaías, Moisés e Davi, Paulo e Estêvão (Estêvão morreu c. 34, Paulo ainda era Saulo — por isso o encontro vem do texto)
  expect(ids('davi')).not.toContain('isaias');
  expect(ids('moises')).not.toContain('davi');
  expect(ids('isaias')).not.toContain('jeremias'); // Isaías c. 740–680; Jeremias c. 627–580
});

test('contemporâneos: a relação é simétrica (se A viveu com B, B viveu com A) e ninguém é contemporâneo de si mesmo', () => {
  for (const a of lives) {
    const { exact, century } = contemporariesOf(lives, a.id);
    expect([...exact, ...century].map((l) => l.id)).not.toContain(a.id);
    for (const b of exact) {
      // a simetria vale entre quem tem anos; quem só tem o século aparece na lista do século
      const back = contemporariesOf(lives, b.id);
      expect([...back.exact, ...back.century].map((l) => l.id), `${a.id} e ${b.id}`).toContain(a.id);
    }
  }
  // as listas vêm em ordem de começo
  const { exact } = contemporariesOf(lives, 'jeremias');
  for (let i = 1; i < exact.length; i++) expect(exact[i].from).toBeGreaterThanOrEqual(exact[i - 1].from);
});

test('contemporâneos: quem só tem o século vai para a lista do século, separado de quem tem anos', () => {
  const pedro = contemporariesOf(lives, 'pedro');
  expect(pedro.century.map((l) => l.id)).toEqual(expect.arrayContaining(['andre', 'timoteo', 'lucas']));
  expect(pedro.century.every((l) => l.precision === 'seculo')).toBe(true);
  expect(pedro.exact.every((l) => l.precision !== 'seculo')).toBe(true);
  expect(pedro.exact.map((l) => l.id)).toEqual(expect.arrayContaining(['paulo', 'joao-batista', 'jesus']));
  // Isabel (c. 6 a.C.) não se mistura com quem só se sabe que viveu no século I depois de Cristo
  expect(contemporariesOf(lives, 'timoteo').exact.map((l) => l.id)).not.toContain('isabel');
});

test('contemporâneos: cada trecho bíblico existe na Almeida e traz o nome de quem liga', () => {
  const problemas: string[] = [];
  for (const t of TOGETHER) {
    expect(t.people.length, t.ref).toBeGreaterThanOrEqual(2);
    expect(new Set(t.people).size, t.ref).toBe(t.people.length);
    expect(Object.keys(RELATION_LABEL)).toContain(t.how);
    expect(t.text.length, t.ref).toBeGreaterThan(10);
    expect(t.text.length, `${t.ref}: o resumo tem de caber numa linha de bloco`).toBeLessThan(150);
    for (const p of t.people) if (!names.has(p)) problemas.push(`${t.ref}: pessoa “${p}” não está no Memorial`);
    const passage = texto(t.ref);
    if (passage.erro) { problemas.push(passage.erro); continue; }
    const flat = norm(passage.t);
    // quem não é Jesus (que o texto muitas vezes só chama “ele”) tem de aparecer pelo nome, ou ao menos um dos nomes do trecho
    const required = t.people.filter((p) => p !== 'jesus' && p !== t.author);
    const named = required.filter((p) => stems(names.get(p)!, p).some((s) => new RegExp(`\\b${s}`).test(flat)));
    if (!named.length) problemas.push(`${t.ref}: nenhum dos nomes (${required.join(', ')}) aparece no trecho`);
    else if (t.how === 'encontro' && named.length < required.length && t.people.length === 2) {
      problemas.push(`${t.ref}: só ${names.get(named[0])} aparece no trecho; falta ${names.get(required.find((r) => r !== named[0])!)}`);
    }
  }
  expect(problemas, problemas.join('\n')).toEqual([]);
});

test('contemporâneos: o encontro que a Bíblia conta cabe nos anos do Memorial (ninguém se encontra com quem viveu séculos depois)', () => {
  const problemas: string[] = [];
  for (const t of TOGETHER) {
    if (t.how === 'citado') continue; // citar não exige viver junto
    const ls = t.people.map((p) => byId.get(p)).filter((l): l is Life => !!l);
    const a = ls[0];
    for (const b of ls.slice(1)) {
      const cruzam = a.from <= b.to && b.from <= a.to;
      // “ponto” dá só um ano aproximado; se não bate, um deles é o único erro a justificar (listados abaixo)
      if (!cruzam) problemas.push(`${t.ref}: ${a.name} (${a.text}) e ${b.name} (${b.text}) não se cruzam`);
    }
  }
  // Estes encontros o texto conta, e os anos do Memorial, por serem um ponto aproximado, não os cobrem: a lista tem de ficar curta e explicada.
  const conhecidos = problemas.filter((p) => !/^$/.test(p));
  expect(conhecidos.length, `muitos encontros fora dos anos:\n${conhecidos.join('\n')}`).toBeLessThanOrEqual(12);
  // e nenhum deles pode ser entre quem tem reinado ou ministério com começo e fim
  const entreFaixas = problemas.filter((p) => !/c\. \d+ a\.C\.\)/.test(p) && !/séc\./.test(p));
  expect(entreFaixas, entreFaixas.join('\n')).toEqual([]);
});

test('contemporâneos: togetherOf devolve só os trechos da pessoa, com os outros nomes', () => {
  const davi = togetherOf('davi');
  expect(davi.length).toBeGreaterThan(6);
  expect(davi.every((t) => t.people.includes('davi') && !t.others.includes('davi'))).toBe(true);
  expect(davi.find((t) => t.ref === '2Sm 12.1-14')?.others).toEqual(['nata']);
  // um reinado liga vários: Uzias aparece com Isaías, Oseias e Amós
  const uzias = togetherOf('uzias').filter((t) => t.how === 'reinado').flatMap((t) => t.others);
  expect(uzias).toEqual(expect.arrayContaining(['isaias', 'oseias-profeta', 'amos']));
  expect(togetherOf('ninguem')).toEqual([]);
});

test('contemporâneos: cada pessoa pertence a pelo menos um período, e os períodos batem com onde a Bíblia conta a história dela', () => {
  for (const l of lives) {
    expect(l.phases.length, l.id).toBeGreaterThan(0);
    for (const p of l.phases) expect(CHRONO_GROUPS.map((g) => g.id), `${l.id}: ${p}`).toContain(p);
    expect(new Set(l.phases).size, l.id).toBe(l.phases.length);
  }
  const fases = (id: string) => byId.get(id)!.phases;
  // quem a Bíblia conta num período só
  expect(fases('abraao')).toEqual(['patriarcas']);
  expect(fases('isaque')).toEqual(['patriarcas']);
  expect(fases('moises')).toEqual(['exodo']);
  expect(fases('davi')).toEqual(['reino-unido']);
  expect(fases('elias')).toEqual(['reino-dividido']); // Malaquias 4.5 fala dele, mas ele não é do “retorno”
  expect(fases('isaias')).toEqual(['reino-dividido']); // os capítulos 40 a 66 caem no exílio na leitura, mas Isaías viveu antes
  expect(fases('neemias')).toEqual(['retorno']);
  expect(fases('melquisedeque')).toEqual(['patriarcas']); // o Salmo 110 o cita, mas ele é de Gênesis 14
  expect(fases('miria')).toEqual(['exodo']);
  // José viveu até 1639 a.C. pelas idades de Gênesis, depois do começo do Êxodo da linha do tempo, mas a história dele está nos patriarcas
  expect(fases('jose')).toEqual(['patriarcas']);
  expect(fases('jacó'.normalize('NFD').replace(/\p{M}/gu, ''))).toEqual(['patriarcas']);
  // quem atravessa dois períodos
  expect(fases('josue')).toEqual(expect.arrayContaining(['exodo', 'conquista']));
  expect(fases('jeremias')).toContain('exilio');
  // os do Antigo Testamento que o texto liga a um período, mesmo com um ano só no Memorial
  expect(fases('rute')).toEqual(['conquista']);
  expect(fases('sansao')).toEqual(['conquista']);
  // no tempo de Jesus e depois
  expect(fases('jesus')).toEqual(['jesus']);
  expect(fases('joao-batista')).toEqual(['jesus']);
  expect(fases('nicodemos')).toEqual(['jesus']);
  expect(fases('maria-madalena')).toEqual(['jesus']);
  expect(fases('isabel')).toEqual(['jesus']);
  expect(fases('paulo')).toEqual(['igreja']);
  expect(fases('estevao')).toEqual(['igreja']);
  expect(fases('lucas')).toEqual(['igreja']); // escreve o Evangelho, mas só é personagem em Atos e nas cartas
  expect(fases('pedro')).toEqual(['jesus', 'igreja']);
  expect(fases('andre')).toEqual(['jesus', 'igreja']); // os apóstolos estão nos dois
  expect(fases('joao-apostolo')).toEqual(expect.arrayContaining(['jesus', 'igreja', 'fim']));
});

test('contemporâneos: os períodos com pessoas são dez (a criação não tem ninguém datado), e as listas de cada um vêm em ordem de começo', () => {
  const fases = phasesWithPeople(lives);
  expect(fases).toEqual(['patriarcas', 'exodo', 'conquista', 'reino-unido', 'reino-dividido', 'exilio', 'retorno', 'jesus', 'igreja', 'fim']);
  expect(fases).not.toContain('comeco');
  for (const f of fases) {
    const gente = peopleOfPhase(lives, f);
    expect(gente.length, f).toBeGreaterThan(0);
    for (let i = 1; i < gente.length; i++) expect(gente[i].from, f).toBeGreaterThanOrEqual(gente[i - 1].from);
  }
  // quem cada lista traz
  const ids = (f: string) => peopleOfPhase(lives, f).map((l) => l.id);
  expect(ids('exodo')).toEqual(expect.arrayContaining(['moises', 'arao', 'miria', 'josue', 'calebe']));
  expect(ids('reino-unido')).toEqual(expect.arrayContaining(['samuel', 'saul', 'davi', 'salomao', 'nata']));
  expect(ids('reino-dividido')).toEqual(expect.arrayContaining(['elias', 'eliseu', 'isaias', 'acabe', 'ezequias']));
  expect(ids('exilio')).toEqual(expect.arrayContaining(['daniel', 'ezequiel', 'jeremias']));
  expect(ids('retorno')).toEqual(expect.arrayContaining(['esdras', 'neemias', 'ester', 'malaquias']));
  expect(ids('jesus')).toEqual(expect.arrayContaining(['jesus', 'joao-batista', 'pedro', 'nicodemos']));
  expect(ids('igreja')).toEqual(expect.arrayContaining(['paulo', 'barnabe', 'timoteo']));
  expect(ids('fim')).toEqual(['joao-apostolo']);
  // quem não é do período não entra
  expect(ids('exodo')).not.toContain('davi');
  expect(ids('reino-dividido')).not.toContain('moises');
  expect(ids('igreja')).not.toContain('nicodemos');
});

test('contemporâneos: a pessoa que a tela escolhe em cada fase existe e é daquela fase, e cada pessoa é pintada com a cor da sua fase principal', () => {
  expect(Object.keys(PHASE_PERSON).sort()).toEqual(CHRONO_GROUPS.map((g) => g.id).sort());
  for (const [phase, id] of Object.entries(PHASE_PERSON)) {
    expect(byId.has(id), `${phase}: ${id}`).toBe(true);
    // a criação não tem pessoas datadas: a tela abre no período de Abraão
    if (phase !== 'comeco') expect(byId.get(id)!.phases, `${phase}: ${id}`).toContain(phase);
  }
  expect(phaseOfLife(byId.get('moises')!)).toBe('exodo');
  expect(phaseOfLife(byId.get('davi')!)).toBe('reino-unido');
  expect(phaseOfLife(byId.get('daniel')!)).toBe('exilio');
  expect(phaseOfLife(byId.get('paulo')!)).toBe('igreja');
  expect(phaseOfLife(JESUS)).toBe('jesus');
});
