import { CHRONO_CHAPTERS, CHRONO_GROUPS, CHRONO_SECTIONS, chronoIndex, timelineSegments } from './bible-chronological';
import { findBook } from './books';
import type { MemorialGroup, Person } from './memorial';
import { parseReferences } from './reference-parser';

/**
 * Quem viveu na mesma época de quem. Código puro (sem Angular), para os testes.
 *
 * Os anos vêm do próprio Memorial da Fé (o campo `period` e, nos reis, `reign`), sem inventar nenhum: o que o Memorial não
 * data (Adão, Noé, Jó…) não entra no desenho. Há três graus de certeza, e a tela mostra a diferença:
 * - `anos`: um começo e um fim (um reinado, um ministério, uma vida);
 * - `ponto`: só um ano aproximado (“c. 1100 a.C.”), que cobre só aquele ano; não se supõe uma vida em volta dele;
 * - `seculo`: só se sabe que viveu no século I; o desenho mostra o século todo, e a lista os separa dos demais.
 * Viver na mesma época não quer dizer que se conheceram. Quando o texto bíblico conta que se encontraram, ou que o próprio
 * livro situa o profeta no reinado de um rei, isso vem à parte, com o versículo (`TOGETHER`).
 */

export type Precision = 'anos' | 'ponto' | 'seculo';

export interface Life {
  id: string;
  name: string;
  /** Epíteto do Memorial (“O profeta de Belém”). */
  title: string;
  /** O que a pessoa foi, em uma ou duas palavras (“Profeta”, “Rei de Judá”). */
  role: string;
  /** Anos (negativo = a.C.); no `ponto`, `from` e `to` são o mesmo ano. */
  from: number;
  to: number;
  precision: Precision;
  /** As fases da linha do tempo (ids de `CHRONO_GROUPS`) em que a pessoa aparece, a primeira é a principal; ver `phasesOf`. */
  phases: string[];
  /** O texto como o Memorial o escreve, para mostrar ao lado do nome. */
  text: string;
  /** Como o ano foi calculado, quando não é o do Memorial. */
  basis?: string;
}

const numbers = (text: string): number[] => [...text.matchAll(/\d+/g)].map((m) => Number(m[0]));

/** Lê um período escrito à mão (“c. 1100–1015 a.C.”, “c. 5 – c. 67 d.C.”, “séc. I (morto c. 44 d.C.)”). */
export function parsePeriod(text: string): { from: number; to: number; precision: Precision } | null {
  const t = text.toLowerCase();
  if (/s[ée]c\.\s*i\b/.test(t)) {
    const before = t.match(/(\d+)\s*a\.c\.\s*[–-]\s*s[ée]c/); // “c. 20 a.C. – séc. I”
    const death = t.match(/morto\s*c?\.?\s*(\d+)(?:\s*[–-]\s*(\d+))?/);
    return {
      from: before ? -Number(before[1]) : 1,
      to: death ? Number(death[2] ?? death[1]) : 100,
      precision: 'seculo',
    };
  }
  const bc = t.includes('a.c.');
  const ad = t.includes('d.c.');
  const n = numbers(t);
  if (!n.length) return null;
  if (bc && ad && n.length >= 2) return { from: -n[0], to: n[1], precision: 'anos' }; // 6 a.C. – 28 d.C.
  if (ad && n.length >= 2) return { from: n[0], to: n[1], precision: 'anos' }; // 5 – 67 d.C.
  if (bc && n.length >= 2) return { from: -Math.max(n[0], n[1]), to: -Math.min(n[0], n[1]), precision: 'anos' };
  if (bc) return { from: -n[0], to: -n[0], precision: 'ponto' };
  return null;
}

/**
 * Anos que o Memorial dá como UM ponto (“c. 2000 a.C.”) para os patriarcas, que viveram mais de um século, e que a própria
 * Bíblia permite calcular. Parte-se do ano do Memorial para Abraão e somam-se as idades de Gênesis.
 */
const LIVES_FROM_GENESIS: Record<string, { from: number; to: number; text: string; basis: string }> = {
  abraao: { from: -2000, to: -1825, text: 'c. 2000–1825 a.C.', basis: 'Viveu 175 anos (Gn 25.7), a partir do ano do Memorial.' },
  sara: { from: -1990, to: -1863, text: 'c. 1990–1863 a.C.', basis: '10 anos mais nova que Abraão (Gn 17.17) e morreu aos 127 (Gn 23.1).' },
  isaque: { from: -1900, to: -1720, text: 'c. 1900–1720 a.C.', basis: 'Nasceu quando Abraão tinha 100 anos (Gn 21.5) e viveu 180 (Gn 35.28).' },
  jaco: { from: -1840, to: -1693, text: 'c. 1840–1693 a.C.', basis: 'Nasceu quando Isaque tinha 60 anos (Gn 25.26) e viveu 147 (Gn 47.28).' },
  jose: { from: -1749, to: -1639, text: 'c. 1749–1639 a.C.', basis: 'Tinha 30 anos ao ser posto sobre o Egito (Gn 41.46), mais 7 de fartura e 2 de fome: 39 anos quando Jacó, de 130 (Gn 47.9), chegou; viveu 110 (Gn 50.26).' },
};

/** Quem o Memorial data só pelo reinado, mas a Bíblia mostra vivo bem depois dele. */
const LIVES_EXTENDED: Record<string, { to: number; text: string; basis: string }> = {
  joaquim: { to: -561, text: 'c. 598–561 a.C.', basis: 'Reinou em 598 a.C. e, no ano 37 do exílio, foi solto da prisão (2Rs 25.27).' },
};

/** O que cada pessoa foi, pelo primeiro grupo do Memorial que a descreve (a ordem é a da importância para a pergunta). */
const ROLES: [MemorialGroup, string][] = [
  ['reis-juda', 'Rei de Judá'],
  ['reis-israel', 'Rei de Israel'],
  ['reis-unido', 'Rei de Israel'],
  ['juizes', 'Juiz'],
  ['profetas-maiores', 'Profeta'],
  ['profetas-menores', 'Profeta'],
  ['profetas', 'Profeta'],
  ['apostolos', 'Apóstolo'],
  ['patriarcas', 'Patriarca'],
  ['mulheres', 'Mulher da Bíblia'],
  ['herois', 'Herói da fé'],
  ['personagens', ''],
];
export function roleOf(groups: MemorialGroup[]): string {
  const role = ROLES.find(([g]) => groups.includes(g))?.[1] ?? '';
  if (!groups.includes('mulheres')) return role;
  return role === 'Profeta' ? 'Profetisa' : role === 'Juiz' ? 'Juíza' : role;
}

/** Jesus não tem página no Memorial; entra aqui com os anos que o app dá à vida dele (“A Vida de Jesus”). */
export const JESUS: Life = {
  id: 'jesus', name: 'Jesus', title: 'O Filho de Deus', role: '', from: -6, to: 30, precision: 'anos', phases: ['jesus'], text: 'c. 6 a.C. – 30 d.C.',
};

const GOSPELS = ['MAT', 'MRK', 'LUK', 'JHN'];
/** Os escritos da fase “Os Últimos Escritos”: as três cartas de João e o Apocalipse. */
const LAST_WRITINGS = ['1JN', '2JN', '3JN', 'REV'];

/** Quem aparece num livro do Novo Testamento mas não é personagem dele: Lucas escreve o Evangelho, mas só entra na história em Atos e nas cartas. */
const PHASE_OVERRIDES: Record<string, string[]> = { lucas: ['igreja'] };

/**
 * Em que fases da linha do tempo uma pessoa aparece. Para quem viveu antes de Jesus: as fases em que a Bíblia conta a história dela (as
 * referências do Memorial, só as do Antigo Testamento, ligadas às seções da leitura cronológica) que também cabem nos anos dela, mais a fase da
 * primeira referência. Assim, Elias não aparece no “retorno” só porque Malaquias fala dele, e José fica nos patriarcas, e não no Êxodo.
 * Para quem viveu no tempo de Jesus ou depois: os Evangelhos levam à fase de Jesus, Atos e as cartas (e todo apóstolo, que Atos 1.13 reúne) à da Igreja,
 * e as cartas de João e o Apocalipse, à dos Últimos Escritos.
 */
function phasesOf(life: Omit<Life, 'phases'>, groups: MemorialGroup[], refs: string[]): string[] {
  if (PHASE_OVERRIDES[life.id]) return PHASE_OVERRIDES[life.id];
  const parsed = refs.map((r) => parseReferences(r).refs[0]).filter((r) => !!r);
  const segments = timelineSegments();
  const jesusStart = segments.find((x) => x.id === 'jesus')!.from;
  if (life.to >= jesusStart) {
    const books = new Set(parsed.map((r) => r.bookId));
    const apostle = groups.includes('apostolos');
    const out: string[] = [];
    if (GOSPELS.some((b) => books.has(b))) out.push('jesus');
    if (apostle || [...books].some((b) => !GOSPELS.includes(b) && !LAST_WRITINGS.includes(b))) out.push('igreja');
    if (LAST_WRITINGS.some((b) => books.has(b))) out.push('fim');
    return out.length ? out : ['igreja'];
  }
  const inLife = (seg: { from: number; to: number }): boolean =>
    life.from === life.to ? life.from >= seg.from && life.from < seg.to : life.from < seg.to && life.to > seg.from;
  const fromRefs: string[] = [];
  for (const r of parsed) {
    if (findBook(r.bookId)?.testament === 'NT') continue; // o Antigo Testamento é onde a história dele é contada
    const index = chronoIndex(r.bookId, r.chapter);
    if (index < 0) continue;
    const phase = CHRONO_SECTIONS[CHRONO_CHAPTERS[index].section - 1].group;
    if (!fromRefs.includes(phase)) fromRefs.push(phase);
  }
  const byYears = segments.filter(inLife).map((x) => x.id);
  const both = fromRefs.filter((p) => byYears.includes(p));
  const primary = fromRefs[0];
  const out = [...new Set([...(primary ? [primary] : []), ...both])];
  // se a ordem das referências não ajuda, vale a fase pelos anos
  return out.length ? out : byYears.length ? byYears : [segments[0].id];
}

/** Os anos de cada pessoa do Memorial que tem anos (as demais ficam de fora). */
export function buildLives(people: Pick<Person, 'id' | 'name' | 'title' | 'period' | 'groups' | 'reign' | 'refs'>[]): Life[] {
  const lives: Life[] = [];
  for (const p of people) {
    const base = { id: p.id, name: p.name, title: p.title, role: roleOf(p.groups) };
    const fromGenesis = LIVES_FROM_GENESIS[p.id];
    if (fromGenesis) {
      const life = { ...base, from: fromGenesis.from, to: fromGenesis.to, precision: 'anos' as Precision, text: fromGenesis.text, basis: fromGenesis.basis };
      lives.push({ ...life, phases: phasesOf(life, p.groups, p.refs) });
      continue;
    }
    // reis: a vida e o reinado juntos (Davi foi ungido por Samuel muito antes de reinar); o texto antes do parêntese
    // (“696–642 a.C. (com o pai, até 686)”) é o que vale
    const reign = p.reign ? parsePeriod(p.reign.years.split('(')[0]) : null;
    const period = parsePeriod(p.period);
    const parsed =
      reign && period && period.precision === 'anos'
        ? { from: Math.min(reign.from, period.from), to: Math.max(reign.to, period.to), precision: 'anos' as Precision }
        : (reign ?? period);
    if (!parsed) continue;
    const text = p.reign && !(period && period.precision === 'anos' && (period.from !== reign?.from || period.to !== reign?.to)) ? p.reign.years.split('(')[0].trim() : p.period;
    const extended = LIVES_EXTENDED[p.id];
    const life = {
      ...base,
      ...parsed,
      precision: p.reign ? ('anos' as Precision) : parsed.precision,
      ...(extended ? { to: extended.to, text: extended.text, basis: extended.basis } : { text }),
    };
    lives.push({ ...life, phases: phasesOf(life, p.groups, p.refs) });
  }
  lives.push(JESUS);
  return lives;
}

const overlap = (a: Life, b: Life): boolean => a.from <= b.to && b.from <= a.to;

export interface Contemporaries {
  /** Têm anos (ou um ano) que se cruzam com os da pessoa. */
  exact: Life[];
  /** Só se sabe que viveram no século I (quando a pessoa ou o outro é desse tipo). */
  century: Life[];
}

/** Quem viveu na mesma época que a pessoa `id`, em ordem de começo. */
export function contemporariesOf(lives: Life[], id: string): Contemporaries {
  const me = lives.find((l) => l.id === id);
  if (!me) return { exact: [], century: [] };
  const exact: Life[] = [];
  const century: Life[] = [];
  for (const other of lives) {
    if (other.id === id || !overlap(me, other)) continue;
    (other.precision === 'seculo' ? century : exact).push(other);
  }
  const byStart = (a: Life, b: Life) => a.from - b.from || a.name.localeCompare(b.name, 'pt-BR');
  return { exact: exact.sort(byStart), century: century.sort(byStart) };
}

/** Cor da pessoa no desenho: a da fase principal dela na linha do tempo (a mesma cor de lá). */
export const phaseOfLife = (life: Life): string => life.phases[0];

/** As pessoas de uma fase da linha do tempo, em ordem de começo. */
export const peopleOfPhase = (lives: Life[], phase: string): Life[] =>
  lives.filter((l) => l.phases.includes(phase)).sort((a, b) => a.from - b.from || a.name.localeCompare(b.name, 'pt-BR'));

/** As fases que têm pessoas, na ordem da história (a criação, sem nenhuma pessoa datada, não entra). */
export const phasesWithPeople = (lives: Life[]): string[] => CHRONO_GROUPS.map((g) => g.id).filter((id) => lives.some((l) => l.phases.includes(id)));

export type Relation = 'encontro' | 'reinado' | 'citado';

export interface Together {
  /** As pessoas ligadas por este trecho (duas ou mais). */
  people: string[];
  ref: string;
  how: Relation;
  text: string;
  /** Quem escreve o trecho em primeira pessoa e, por isso, não é chamado pelo nome nele (Paulo em Gálatas, Pedro na primeira carta). */
  author?: string;
}

export const RELATION_LABEL: Record<Relation, string> = {
  encontro: 'Se encontraram',
  reinado: 'O livro os situa na mesma época',
  citado: 'Um cita o outro',
};

/** O que a Bíblia diz sobre quem se encontrou com quem. Cada trecho tem de conter o nome de quem ele liga (`contemporaneos.spec.ts`). */
export const TOGETHER: Together[] = [
  // os patriarcas
  { people: ['abraao', 'sara'], ref: 'Gn 21.1-3', how: 'encontro', text: 'Casados. Sara deu à luz Isaque, o filho da promessa.' },
  { people: ['abraao', 'isaque'], ref: 'Gn 22.1-14', how: 'encontro', text: 'Pai e filho. Na terra de Moriá, Deus providenciou o cordeiro no lugar de Isaque.' },
  { people: ['abraao', 'melquisedeque'], ref: 'Gn 14.18-20', how: 'encontro', text: 'O rei de Salém abençoou Abraão, que lhe deu o dízimo de tudo.' },
  { people: ['isaque', 'jaco'], ref: 'Gn 27.18-29', how: 'encontro', text: 'Pai e filho. Isaque, já velho, abençoou Jacó.' },
  { people: ['jaco', 'jose'], ref: 'Gn 46.28-30', how: 'encontro', text: 'Pai e filho. Reencontraram-se no Egito depois de anos de separação.' },
  { people: ['jaco', 'juda'], ref: 'Gn 49.1-12', how: 'encontro', text: 'Pai e filho. Jacó abençoou Judá e disse que o cetro não se afastaria dele.' },
  { people: ['juda', 'tamar'], ref: 'Gn 38.11-26', how: 'encontro', text: 'Sogro e nora. Judá reconheceu que Tamar era mais justa do que ele.' },
  { people: ['juda', 'jose'], ref: 'Gn 44.14-34', how: 'encontro', text: 'Judá intercedeu diante de José pelo irmão Benjamim.' },
  // de Moisés a Josué
  { people: ['moises', 'arao'], ref: 'Êx 4.14-16', how: 'encontro', text: 'Irmãos. Arão seria a boca de Moisés diante do povo e do Faraó.' },
  { people: ['moises', 'miria'], ref: 'Nm 12.1-15', how: 'encontro', text: 'Irmãos. Miriã e Arão falaram contra Moisés, e Deus o defendeu.' },
  { people: ['moises', 'josue'], ref: 'Nm 27.18-23', how: 'encontro', text: 'Moisés impôs as mãos sobre Josué, que lhe sucedeu na liderança.' },
  { people: ['moises', 'calebe'], ref: 'Nm 13.1-30', how: 'encontro', text: 'Calebe foi um dos doze espias que Moisés enviou a Canaã.' },
  { people: ['josue', 'calebe'], ref: 'Nm 14.6-9', how: 'encontro', text: 'Os dois espias fiéis pediram ao povo que confiasse em Deus e entrasse na terra.' },
  { people: ['josue', 'raabe'], ref: 'Js 6.22-25', how: 'encontro', text: 'Josué mandou poupar Raabe e a família dela na queda de Jericó.' },
  // os juízes
  { people: ['debora', 'baraque'], ref: 'Jz 4.4-16', how: 'encontro', text: 'Débora mandou chamar Baraque, e os dois foram juntos contra Sísera.' },
  { people: ['eli', 'samuel'], ref: '1Sm 3.1-18', how: 'encontro', text: 'O menino Samuel servia a Eli no santuário e lhe contou o que Deus dissera.' },
  { people: ['ana-mae-de-samuel', 'eli'], ref: '1Sm 1.12-18', how: 'encontro', text: 'Eli viu Ana orar no santuário e a despediu em paz.' },
  { people: ['ana-mae-de-samuel', 'samuel'], ref: '1Sm 1.19-28', how: 'encontro', text: 'Mãe e filho. Ana entregou Samuel ao Senhor, para servir no santuário.' },
  { people: ['rute', 'boaz'], ref: 'Rt 4.9-13', how: 'encontro', text: 'Boaz tomou Rute por esposa.' },
  // Samuel, Saul, Davi e Salomão
  { people: ['samuel', 'saul'], ref: '1Sm 10.1', how: 'encontro', text: 'Samuel ungiu Saul, o primeiro rei de Israel.' },
  { people: ['samuel', 'davi'], ref: '1Sm 16.1-13', how: 'encontro', text: 'Samuel ungiu Davi, o filho mais novo de Jessé, no meio dos irmãos.' },
  { people: ['saul', 'davi'], ref: '1Sm 16.21-23', how: 'encontro', text: 'Davi entrou ao serviço de Saul e o aliviava tocando harpa.' },
  { people: ['saul', 'jonatas'], ref: '1Sm 14.1-14', how: 'encontro', text: 'Pai e filho. Jônatas atacou, com o seu escudeiro, um posto dos filisteus.' },
  { people: ['davi', 'jonatas'], ref: '1Sm 18.1-4', how: 'encontro', text: 'Jônatas amou Davi como a si mesmo e fez aliança com ele.' },
  { people: ['davi', 'jesse'], ref: '1Sm 16.11-13', how: 'encontro', text: 'Pai e filho. Jessé apresentou os filhos a Samuel, e Davi estava com o rebanho.' },
  { people: ['davi', 'abigail'], ref: '1Sm 25.14-42', how: 'encontro', text: 'Abigail impediu a vingança de Davi contra Nabal e, depois, casou-se com ele.' },
  { people: ['davi', 'bate-seba'], ref: '2Sm 12.24', how: 'encontro', text: 'Davi e Bate-Seba tiveram Salomão.' },
  { people: ['davi', 'nata'], ref: '2Sm 12.1-14', how: 'encontro', text: 'O profeta Natã repreendeu Davi com a parábola da ovelha.' },
  { people: ['davi', 'gade'], ref: '2Sm 24.11-14', how: 'encontro', text: 'O profeta Gade levou a Davi a palavra de Deus e a escolha do castigo.' },
  { people: ['davi', 'salomao'], ref: '1Rs 1.28-40', how: 'encontro', text: 'Pai e filho. Davi mandou ungir Salomão rei em seu lugar.' },
  { people: ['salomao', 'bate-seba'], ref: '1Rs 2.19-20', how: 'encontro', text: 'Mãe e filho. Salomão se levantou ao encontro da mãe e a fez sentar à sua direita.' },
  { people: ['salomao', 'nata'], ref: '1Rs 1.32-34', how: 'encontro', text: 'Natã, com o sacerdote Zadoque, ungiu Salomão rei.' },
  // o reino dividido
  { people: ['roboao', 'jeroboao-i'], ref: '1Rs 12.1-20', how: 'encontro', text: 'Em Siquém, o povo pediu a Roboão que aliviasse o jugo; ele recusou, e as dez tribos se separaram.' },
  { people: ['jeroboao-i', 'aias'], ref: '1Rs 11.29-39', how: 'encontro', text: 'O profeta Aías, de Siló, anunciou a Jeroboão que reinaria sobre dez tribos.' },
  { people: ['acabe', 'elias'], ref: '1Rs 18.17-18', how: 'encontro', text: 'Elias e Acabe se encontraram, e Acabe o chamou de perturbador de Israel.' },
  { people: ['elias', 'eliseu'], ref: '2Rs 2.9-15', how: 'encontro', text: 'Eliseu acompanhou Elias até ser arrebatado e recebeu o manto dele.' },
  { people: ['josafa', 'acabe'], ref: '2Cr 18.1-3', how: 'encontro', text: 'Josafá, rei de Judá, aliou-se a Acabe para a guerra em Ramote-Gileade.' },
  { people: ['acabe', 'micaias'], ref: '1Rs 22.8-28', how: 'encontro', text: 'Micaías disse a Acabe o que Deus lhe mostrara, e foi preso por isso.' },
  { people: ['josafa', 'eliseu'], ref: '2Rs 3.11-12', how: 'encontro', text: 'Josafá perguntou por um profeta do Senhor e foi levado a Eliseu.' },
  { people: ['jorao-de-israel', 'eliseu'], ref: '2Rs 3.9-14', how: 'encontro', text: 'Na campanha contra Moabe, Eliseu respondeu a Jorão de Israel e disse que só o atendia por causa de Josafá.' },
  { people: ['atalia', 'joas-de-juda'], ref: '2Rs 11.1-3', how: 'encontro', text: 'Atalia mandou matar a família real; Joás, ainda bebê, foi escondido no templo por seis anos.' },
  { people: ['amazias', 'jeoas-de-israel'], ref: '2Rs 14.8-14', how: 'encontro', text: 'Amazias desafiou Jeoás de Israel e foi vencido e preso em Bete-Semes.' },
  { people: ['jeroboao-ii', 'jonas'], ref: '2Rs 14.23-25', how: 'encontro', text: 'Jeroboão II recuperou os limites de Israel, segundo a palavra dita por meio de Jonas.' },
  { people: ['isaias', 'acaz'], ref: 'Is 7.1-14', how: 'encontro', text: 'Isaías foi ao encontro de Acaz e lhe ofereceu um sinal da parte de Deus.' },
  { people: ['isaias', 'ezequias'], ref: '2Rs 20.1-11', how: 'encontro', text: 'Isaías anunciou a doença de Ezequias e, depois, a cura dele.' },
  // o exílio e a volta
  { people: ['jeremias', 'jeoaquim'], ref: 'Jr 36.1-32', how: 'encontro', text: 'Jeremias ditou o rolo a Baruque, e o rei Jeoaquim o queimou.' },
  { people: ['jeremias', 'zedequias'], ref: 'Jr 38.14-28', how: 'encontro', text: 'Zedequias consultou Jeremias em segredo, e o profeta o aconselhou a se render.' },
  { people: ['hulda', 'josias'], ref: '2Rs 22.3-20', how: 'encontro', text: 'A profetisa Hulda confirmou a Josias a palavra do livro da Lei achado no templo.' },
  { people: ['zorobabel', 'ageu'], ref: 'Ag 1.1', how: 'encontro', text: 'A palavra do Senhor veio por Ageu a Zorobabel, governador de Judá.' },
  { people: ['ageu', 'zacarias-profeta', 'zorobabel'], ref: 'Ed 5.1-2', how: 'encontro', text: 'Ageu e Zacarias profetizaram aos judeus, e Zorobabel se levantou com eles para recomeçar a obra do templo.' },
  { people: ['esdras', 'neemias'], ref: 'Ne 8.9', how: 'encontro', text: 'Neemias, o governador, e Esdras, o escriba, estavam à frente quando o povo ouviu a Lei.' },
  { people: ['ester', 'mardoqueu'], ref: 'Et 2.7', how: 'encontro', text: 'Primos. Mardoqueu criou Ester, que ficara órfã.' },
  // o livro situa o profeta no reinado
  { people: ['isaias', 'uzias', 'jotao', 'acaz', 'ezequias'], ref: 'Is 1.1', how: 'reinado', text: 'A visão de Isaías é situada nos dias destes quatro reis de Judá.' },
  { people: ['isaias', 'uzias'], ref: 'Is 6.1', how: 'reinado', text: 'Isaías viu o Senhor no ano em que morreu o rei Uzias.' },
  { people: ['oseias-profeta', 'uzias', 'jotao', 'acaz', 'ezequias', 'jeroboao-ii'], ref: 'Os 1.1', how: 'reinado', text: 'O livro situa Oseias nos dias dos reis de Judá e de Jeroboão, rei de Israel.' },
  { people: ['miqueias', 'jotao', 'acaz', 'ezequias'], ref: 'Mq 1.1', how: 'reinado', text: 'O livro situa Miqueias nos dias de Jotão, Acaz e Ezequias.' },
  { people: ['amos', 'uzias', 'jeroboao-ii'], ref: 'Am 1.1', how: 'reinado', text: 'As palavras de Amós vêm nos dias de Uzias, rei de Judá, e de Jeroboão, rei de Israel.' },
  { people: ['sofonias', 'josias'], ref: 'Sf 1.1', how: 'reinado', text: 'A palavra de Sofonias veio nos dias de Josias.' },
  { people: ['jeremias', 'josias', 'jeoaquim', 'zedequias'], ref: 'Jr 1.1-3', how: 'reinado', text: 'O livro situa Jeremias nos dias de Josias, de Jeoaquim e de Zedequias.' },
  { people: ['ezequiel', 'joaquim'], ref: 'Ez 1.1-2', how: 'reinado', text: 'O livro data a visão no quinto ano do exílio do rei Joaquim.' },
  { people: ['daniel', 'jeoaquim'], ref: 'Dn 1.1-6', how: 'reinado', text: 'Daniel foi levado para a Babilônia no tempo do rei Jeoaquim.' },
  { people: ['ezequiel', 'daniel'], ref: 'Ez 14.14,20', how: 'citado', text: 'Ezequiel cita Daniel, com Noé e Jó, como exemplo de justiça.' },
  // o tempo de Jesus
  { people: ['isabel', 'maria-mae-de-jesus'], ref: 'Lc 1.39-45', how: 'encontro', text: 'Parentas. Maria visitou Isabel, que a saudou como a mãe do seu Senhor.' },
  { people: ['isabel', 'joao-batista'], ref: 'Lc 1.57-60', how: 'encontro', text: 'Mãe e filho. Isabel deu à luz João e insistiu no nome dele.' },
  { people: ['maria-mae-de-jesus', 'jose-de-nazare'], ref: 'Mt 1.18-25', how: 'encontro', text: 'José recebeu Maria em sua casa e deu o nome de Jesus ao menino.' },
  { people: ['jesus', 'joao-batista'], ref: 'Mt 3.13-17', how: 'encontro', text: 'João batizou Jesus no Jordão.' },
  { people: ['jesus', 'maria-mae-de-jesus'], ref: 'Jo 19.25-27', how: 'encontro', text: 'Mãe e filho. Da cruz, Jesus confiou Maria ao discípulo amado.' },
  { people: ['jesus', 'jose-de-nazare'], ref: 'Lc 2.41-51', how: 'encontro', text: 'Aos doze anos, Jesus ficou no templo e depois voltou a Nazaré, sujeito a José e a Maria.' },
  { people: ['jesus', 'ana-profetisa'], ref: 'Lc 2.36-38', how: 'encontro', text: 'Ana, a profetisa, viu o menino no templo e falou dele a todos os que esperavam a redenção.' },
  { people: ['jesus', 'pedro'], ref: 'Mt 16.13-19', how: 'encontro', text: 'Pedro confessou que Jesus é o Cristo, o Filho do Deus vivo.' },
  { people: ['jesus', 'andre'], ref: 'Jo 1.35-42', how: 'encontro', text: 'André seguiu Jesus e levou o irmão Simão a ele.' },
  { people: ['jesus', 'tiago-zebedeu'], ref: 'Mc 1.19-20', how: 'encontro', text: 'Jesus chamou Tiago e o irmão João, filhos de Zebedeu, que deixaram o pai e o barco.' },
  { people: ['jesus', 'joao-apostolo'], ref: 'Mc 1.19-20', how: 'encontro', text: 'Jesus chamou João e o irmão Tiago, filhos de Zebedeu, à beira do mar.' },
  { people: ['jesus', 'filipe'], ref: 'Jo 1.43-46', how: 'encontro', text: 'Jesus chamou Filipe, que levou Natanael a ele.' },
  { people: ['jesus', 'bartolomeu'], ref: 'Jo 1.47-49', how: 'encontro', text: 'Jesus viu Natanael vir a ele, e Natanael o reconheceu como Filho de Deus e Rei de Israel.' },
  { people: ['jesus', 'tome'], ref: 'Jo 20.24-29', how: 'encontro', text: 'Tomé creu ao ver o Ressuscitado e confessou que Jesus é o seu Senhor e o seu Deus.' },
  { people: ['jesus', 'mateus'], ref: 'Mt 9.9', how: 'encontro', text: 'Jesus chamou Mateus, que estava na coletoria, e ele o seguiu.' },
  { people: ['jesus', 'tiago-alfeu', 'tadeu', 'simao-zelote'], ref: 'Mt 10.2-4', how: 'encontro', text: 'Estes três estão entre os doze apóstolos que Jesus escolheu.' },
  { people: ['jesus', 'matias'], ref: 'At 1.21-26', how: 'encontro', text: 'Matias esteve com os discípulos desde o batismo de João e foi escolhido para o lugar de Judas.' },
  { people: ['jesus', 'nicodemos'], ref: 'Jo 3.1-21', how: 'encontro', text: 'Nicodemos foi a Jesus de noite e ouviu dele sobre nascer de novo.' },
  { people: ['jesus', 'lazaro'], ref: 'Jo 11.38-44', how: 'encontro', text: 'Jesus chamou Lázaro para fora do sepulcro.' },
  { people: ['jesus', 'maria-de-betania'], ref: 'Lc 10.38-42', how: 'encontro', text: 'Maria, em Betânia, sentou-se aos pés de Jesus para ouvir a sua palavra.' },
  { people: ['jesus', 'maria-madalena'], ref: 'Jo 20.11-18', how: 'encontro', text: 'Maria Madalena viu o Ressuscitado junto ao sepulcro e o anunciou aos discípulos.' },
  { people: ['jesus', 'tiago-irmao-do-senhor'], ref: '1Co 15.7', how: 'encontro', text: 'Depois de ressuscitar, Jesus apareceu a Tiago.' },
  { people: ['jesus', 'paulo'], ref: 'At 9.3-6', how: 'encontro', text: 'O Senhor ressuscitado falou a Saulo no caminho de Damasco.' },
  // a igreja nasce
  { people: ['pedro', 'andre'], ref: 'Jo 1.40-42', how: 'encontro', text: 'Irmãos. André levou Simão a Jesus.' },
  { people: ['tiago-zebedeu', 'joao-apostolo'], ref: 'Mc 1.19-20', how: 'encontro', text: 'Irmãos, filhos de Zebedeu, chamados juntos por Jesus.' },
  { people: ['pedro', 'joao-apostolo'], ref: 'At 3.1-11', how: 'encontro', text: 'Subiram juntos ao templo, e Pedro curou o coxo na porta chamada Formosa.' },
  { people: ['pedro', 'matias'], ref: 'At 1.15-26', how: 'encontro', text: 'Pedro se levantou entre os irmãos, e a sorte caiu sobre Matias.' },
  { people: ['pedro', 'dorcas'], ref: 'At 9.36-41', how: 'encontro', text: 'Pedro orou junto à cama de Dorcas, em Jope, e ela voltou à vida.' },
  { people: ['pedro', 'paulo'], ref: 'Gl 1.18; 2.11-14', how: 'encontro', author: 'paulo', text: 'Paulo foi a Jerusalém para conhecer Pedro e, mais tarde, o repreendeu em Antioquia.' },
  { people: ['pedro', 'tiago-irmao-do-senhor', 'joao-apostolo'], ref: 'Gl 2.9', how: 'encontro', author: 'paulo', text: 'Paulo os chama colunas da igreja de Jerusalém.' },
  { people: ['pedro', 'joao-marcos'], ref: '1Pe 5.13', how: 'encontro', author: 'pedro', text: 'Pedro chama Marcos de filho, na carta que escreveu da Babilônia.' },
  { people: ['paulo', 'estevao'], ref: 'At 7.58-8.1', how: 'encontro', text: 'Saulo guardou as vestes dos que apedrejaram Estêvão e consentiu na morte dele.' },
  { people: ['paulo', 'barnabe'], ref: 'At 11.25-26', how: 'encontro', text: 'Barnabé foi buscar Saulo em Tarso e o levou a Antioquia, onde ensinaram juntos durante um ano.' },
  { people: ['paulo', 'joao-marcos'], ref: 'At 15.37-40', how: 'encontro', text: 'Paulo e Barnabé discordaram sobre levar Marcos na segunda viagem.' },
  { people: ['barnabe', 'joao-marcos'], ref: 'At 15.37-39', how: 'encontro', text: 'Barnabé quis levar Marcos e, na discussão com Paulo, seguiu com ele para Chipre.' },
  { people: ['paulo', 'timoteo'], ref: 'At 16.1-3', how: 'encontro', text: 'Paulo escolheu Timóteo, em Listra, para viajar com ele.' },
  { people: ['paulo', 'lucas'], ref: 'Cl 4.14; 2Tm 4.11', how: 'encontro', author: 'paulo', text: 'Paulo chama Lucas de médico amado e, na última prisão, diz que só Lucas estava com ele.' },
  { people: ['paulo', 'priscila'], ref: 'At 18.1-3', how: 'encontro', text: 'Em Corinto, Paulo morou e trabalhou com Priscila e Áquila, que também faziam tendas.' },
  { people: ['paulo', 'lidia'], ref: 'At 16.14-15', how: 'encontro', text: 'Lídia, em Filipos, abriu o coração à mensagem de Paulo e o hospedou.' },
  { people: ['paulo', 'agabo'], ref: 'At 21.10-11', how: 'encontro', text: 'Ágabo amarrou os próprios pés e mãos com o cinto de Paulo e anunciou a prisão dele em Jerusalém.' },
  { people: ['paulo', 'tiago-irmao-do-senhor'], ref: 'At 21.17-19', how: 'encontro', text: 'Em Jerusalém, Paulo foi a Tiago e contou o que Deus fizera entre os gentios.' },
];

/** O que a Bíblia diz sobre a pessoa `id` e quem esteve com ela (cada trecho traz os outros nomes). */
export function togetherOf(id: string): (Together & { others: string[] })[] {
  return TOGETHER.filter((t) => t.people.includes(id)).map((t) => ({ ...t, others: t.people.filter((p) => p !== id) }));
}

/** Quem a tela escolhe primeiro em cada período (e quando a pessoa está lendo uma fase da linha do tempo). */
export const PHASE_PERSON: Record<string, string> = {
  comeco: 'abraao', patriarcas: 'jaco', exodo: 'moises', conquista: 'josue', 'reino-unido': 'davi', 'reino-dividido': 'elias',
  exilio: 'daniel', retorno: 'neemias', jesus: 'jesus', igreja: 'paulo', fim: 'joao-apostolo',
};
