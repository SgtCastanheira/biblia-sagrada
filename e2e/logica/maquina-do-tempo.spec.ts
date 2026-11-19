import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { CHRONO_GROUPS } from '../../src/app/core/bible-chronological';
import { buildLives } from '../../src/app/core/contemporaries';
import type { Person } from '../../src/app/core/memorial';
import {
  aliveAt,
  booksOfPhase,
  clampPpy,
  clampYear,
  eraAt,
  ERA_RANGES,
  eventsNear,
  isInBible,
  packLanes,
  phaseAt,
  phaseMiddle,
  phaseShares,
  POINT_SPAN,
  rulerTicks,
  timelineEvents,
  TM_END,
  TM_MAX_PPY,
  TM_MIN_PPY,
  TM_START,
  yearText,
} from '../../src/app/core/time-machine';

const people: Person[] = JSON.parse(readFileSync('public/conteudo/memorial.json', 'utf8'));
const lives = buildLives(people);

test('máquina do tempo: o ano vira texto (a história não tem o ano zero) e fica dentro da faixa', () => {
  expect(yearText(-740)).toBe('740 a.C.');
  expect(yearText(28)).toBe('28 d.C.');
  expect(yearText(0)).toBe('1 d.C.');
  expect(yearText(-0.4)).toBe('1 d.C.');
  expect(clampYear(-5000)).toBe(TM_START);
  expect(clampYear(500)).toBe(TM_END);
  expect(clampYear(-740)).toBe(-740);
  expect(clampPpy(0.01)).toBe(TM_MIN_PPY);
  expect(clampPpy(99)).toBe(TM_MAX_PPY);
});

test('máquina do tempo: o mapa vem da época do Atlas, lida dos anos que o próprio Atlas escreve', () => {
  expect(ERA_RANGES).toHaveLength(14);
  for (const r of ERA_RANGES) expect(r.to, r.era.id).toBeGreaterThanOrEqual(r.from);
  const era = (y: number) => eraAt(y).id;
  expect(era(-1900)).toBe('patriarcas');
  expect(era(-1300)).toBe('exodo-conquista');
  expect(era(-1000)).toBe('reino-unido');
  expect(era(-800)).toBe('reino-dividido');
  expect(era(-740)).toBe('assiria'); // dentro das duas; vale a mais recente
  expect(era(-590)).toBe('babilonia');
  expect(era(-400)).toBe('persia');
  expect(era(-330)).toBe('alexandre');
  expect(era(-300)).toBe('sucessores');
  expect(era(-167)).toBe('macabeus');
  expect(era(-30)).toBe('herodes');
  expect(era(30)).toBe('roma');
  // entre duas épocas (1700 a 1500 a.C.), vale a mais perto
  expect(['patriarcas', 'exodo-conquista']).toContain(era(-1600));
  // toda ano da faixa tem um mapa
  for (let y = TM_START; y <= TM_END; y += 5) expect(eraAt(y), String(y)).toBeTruthy();
});

test('máquina do tempo: a fase de cada ano, com os 400 anos de silêncio no meio', () => {
  expect(phaseAt(-1900)).toBe('patriarcas');
  expect(phaseAt(-1500)).toBe('exodo');
  expect(phaseAt(-1200)).toBe('conquista');
  expect(phaseAt(-1000)).toBe('reino-unido');
  expect(phaseAt(-800)).toBe('reino-dividido');
  expect(phaseAt(-570)).toBe('exilio');
  expect(phaseAt(-500)).toBe('retorno');
  expect(phaseAt(-300)).toBeNull(); // entre Malaquias e Jesus
  expect(phaseAt(-431)).toBe('retorno'); // a fase acaba em 430 a.C.
  expect(phaseAt(-429)).toBeNull();
  expect(phaseAt(-5)).toBe('jesus');
  expect(phaseAt(10)).toBe('jesus');
  expect(phaseAt(50)).toBe('igreja');
  expect(phaseAt(90)).toBe('fim');
  // o vão entre Paulo e João vai para o mais perto
  expect(phaseAt(72)).toBe('igreja');
  expect(phaseAt(80)).toBe('fim');
  // escolher uma fase leva ao meio dela, e o meio é da fase
  for (const id of ['patriarcas', 'exodo', 'conquista', 'reino-unido', 'reino-dividido', 'exilio', 'retorno', 'jesus', 'igreja', 'fim']) {
    expect(phaseAt(phaseMiddle(id)), id).toBe(id);
  }
  expect(phaseMiddle('comeco')).toBe(TM_START); // a criação não tem data: vai ao começo
});

test('máquina do tempo: quem vivia em um ano (com começo e fim, com ano aproximado ou só com o século)', () => {
  const ids = (y: number) => aliveAt(lives, y).map((l) => l.id);
  expect(ids(-740)).toEqual(expect.arrayContaining(['isaias', 'uzias', 'oseias-profeta', 'jotao', 'peca']));
  expect(ids(-740)).not.toContain('davi');
  expect(ids(-990)).toEqual(expect.arrayContaining(['davi', 'salomao', 'nata', 'abigail'].filter((x) => x !== 'abigail')));
  expect(ids(-590)).toEqual(expect.arrayContaining(['jeremias', 'ezequiel', 'daniel', 'zedequias']));
  expect(ids(-585)).not.toContain('zedequias'); // deixou de reinar em 586 a.C.
  expect(ids(30)).toEqual(expect.arrayContaining(['jesus', 'pedro', 'paulo'])); // Pedro só tem o século; Paulo tem anos
  // um ano aproximado vale por perto (Sansão, c. 1070 a.C.), e não além disso
  expect(ids(-1070 + POINT_SPAN)).toContain('sansao');
  expect(ids(-1070 + POINT_SPAN + 1)).not.toContain('sansao');
  // em ordem de começo
  const vivos = aliveAt(lives, -740);
  for (let i = 1; i < vivos.length; i++) expect(vivos[i].from).toBeGreaterThanOrEqual(vivos[i - 1].from);
});

test('máquina do tempo: as vidas cabem em poucas fileiras sem se cobrirem, e quem só tem o século fica de fora', () => {
  const plan = packLanes(lives, 3);
  const dated = lives.filter((l) => l.precision !== 'seculo');
  expect(Object.keys(plan.lane)).toHaveLength(dated.length);
  expect(Object.keys(plan.lane)).not.toContain('pedro'); // só o século: vira uma faixa só na tela
  expect(plan.count, 'fileiras').toBeLessThanOrEqual(14);
  // ninguém cobre ninguém na mesma fileira
  const fim = (l: (typeof lives)[number]) => (l.precision === 'ponto' ? l.from + 4 : l.to);
  for (let i = 0; i < plan.count; i++) {
    const nela = dated.filter((l) => plan.lane[l.id] === i).sort((a, b) => a.from - b.from);
    for (let k = 1; k < nela.length; k++) expect(nela[k].from, `${nela[k - 1].id} e ${nela[k].id} na fileira ${i}`).toBeGreaterThan(fim(nela[k - 1]));
  }
});

test('máquina do tempo: os livros que contam cada fase, em ordem, com o primeiro capítulo dela', () => {
  const nomes = (f: string) => booksOfPhase(f).map((b) => b.name);
  expect(nomes('exodo')).toEqual(['Êxodo', 'Levítico', 'Números', 'Deuteronômio', 'Salmos']);
  expect(booksOfPhase('exodo').find((b) => b.id === 'PSA')).toMatchObject({ chapter: 90, chapters: 1 }); // só o Salmo 90 é desta fase
  expect(nomes('jesus')).toEqual(expect.arrayContaining(['Mateus', 'Marcos', 'Lucas', 'João']));
  expect(nomes('fim')).toEqual(['1 João', '2 João', '3 João', 'Apocalipse']);
  expect(nomes('reino-dividido')).toEqual(expect.arrayContaining(['1 Reis', '2 Reis', 'Isaías', 'Amós']));
  for (const f of CHRONO_GROUPS.map((g) => g.id)) {
    const livros = booksOfPhase(f);
    expect(livros.length, f).toBeGreaterThan(0);
    for (const b of livros) { expect(b.chapter).toBeGreaterThan(0); expect(b.chapters).toBeGreaterThan(0); }
  }
});

test('máquina do tempo: os fatos do mundo perto de um ano, do mais perto ao mais longe, com os que a Bíblia conta e os que ficaram fora dela', () => {
  expect(eventsNear(-722)[0].id).toBe('queda-samaria');
  const perto = eventsNear(-586, 60, 4).map((e) => e.id);
  expect(perto[0]).toBe('queda-jerusalem');
  expect(perto[1]).toBe('eclipse-tales'); // um ano depois, e fora da Bíblia
  expect(perto).toContain('moeda-creso');
  expect(eventsNear(-722, 5, 10).map((e) => e.id)).toContain('queda-samaria');
  expect(eventsNear(-722, 5, 10).length).toBeLessThanOrEqual(10);
  expect(timelineEvents().length).toBeGreaterThan(30);

  // os 400 anos de silêncio não têm livro, mas o mundo continuou: Alexandre, Roma e Cartago, a China
  const silencio = eventsNear(-300, 60, 10).map((e) => e.id);
  expect(silencio).toEqual(expect.arrayContaining(['alexandre', 'guerras-punicas']));
  expect(eventsNear(-300, 90, 10).map((e) => e.id)).toContain('qin-china'); // 221 a.C. fica a 79 anos
  expect(eventsNear(-300, 60, 1)[0].id).toBe('alexandre'); // 334–323 a.C.: o fim dele é o mais perto

  // o filtro: só os que a Bíblia conta, ou só os que ficaram fora dela
  const naBiblia = eventsNear(-300, 200, 20, isInBible);
  expect(naBiblia.every((e) => isInBible(e))).toBe(true);
  const fora = eventsNear(-586, 60, 10, (e) => !isInBible(e));
  expect(fora.every((e) => !e.ref)).toBe(true);
  expect(fora.map((e) => e.id)).toEqual(expect.arrayContaining(['eclipse-tales', 'moeda-creso']));
  expect(fora.map((e) => e.id)).not.toContain('queda-jerusalem');
  expect(eventsNear(-586, 60, 10, () => false)).toEqual([]);
});

test('máquina do tempo: os fatos do mundo de qualquer fé têm data conferida, e os que a Bíblia conta trazem o versículo', () => {
  const mundo = timelineEvents();
  const fora = mundo.filter((e) => !isInBible(e));
  const dentro = mundo.filter((e) => isInBible(e));
  expect(dentro.length).toBeGreaterThan(15);
  expect(fora.length).toBeGreaterThanOrEqual(12);
  const ids = (xs: typeof mundo) => xs.map((e) => e.id);
  // os fatos de antes de Cristo que o app ganhou em 19 de novembro, cada um com o ano que a fonte lida dá
  const esperado: Record<string, [number, number | undefined]> = {
    santorini: [-1600, undefined], 'colapso-bronze': [-1200, -1150], 'queda-nineve': [-612, undefined], 'eclipse-tales': [-585, undefined], 'moeda-creso': [-550, undefined],
    'peste-atenas': [-430, -426], alexandre: [-334, -323], 'guerras-punicas': [-264, -146], 'qin-china': [-221, undefined], 'calendario-juliano': [-46, undefined], augusto: [-27, undefined],
  };
  for (const [id, [from, to]] of Object.entries(esperado)) {
    const e = mundo.find((x) => x.id === id);
    expect(e, id).toBeTruthy();
    expect(e!.from, id).toBe(from);
    expect(e!.to, id).toBe(to);
  }
  // o que ficou fora da Bíblia: vulcão, colapso, eclipse, moeda, peste, Alexandre, Cartago, China, calendário
  for (const id of ['santorini', 'colapso-bronze', 'eclipse-tales', 'moeda-creso', 'peste-atenas', 'alexandre', 'guerras-punicas', 'qin-china', 'calendario-juliano']) expect(ids(fora), id).toContain(id);
  // o que tem versículo: Nínive (Naum) e Augusto (o recenseamento de Lucas)
  for (const id of ['queda-nineve', 'augusto']) expect(ids(dentro), id).toContain(id);
  // as datas aproximadas ou discutidas dizem isso no texto
  expect(mundo.find((e) => e.id === 'santorini')!.when).toContain('discutida');
  expect(mundo.find((e) => e.id === 'santorini')!.text).toContain('discutem');
  expect(mundo.find((e) => e.id === 'eclipse-tales')!.text).toContain('duvidam');
  expect(mundo.find((e) => e.id === 'colapso-bronze')!.text).toContain('discutidas');
  // nenhum fato repete o id de outro
  expect(new Set(ids(mundo)).size).toBe(mundo.length);
});

test('máquina do tempo: quanto do tempo e do texto cada fase ocupa, e a régua tem marcas redondas', () => {
  const jesus = phaseShares('jesus');
  expect(jesus.time).toBeCloseTo((36 / 2095) * 100, 6); // 36 anos de 2.095
  expect(jesus.text).toBeGreaterThan(6);
  expect(jesus.text).toBeLessThan(9);
  expect(phaseShares('comeco').time).toBeNull();
  expect(phaseShares('comeco').text).toBeGreaterThan(0);
  expect(rulerTicks(-810, -690, 3)).toEqual([-800, -750, -700]);
  expect(rulerTicks(-30, 30, 3)).not.toContain(0); // não existe o ano zero
  expect(rulerTicks(-2000, 95, 0.7).every((y) => y % 100 === 0 || y % 250 === 0 || y % 50 === 0)).toBe(true);
  for (const y of rulerTicks(-2000, 95, 1.2)) expect(Number.isInteger(y)).toBe(true);
});
