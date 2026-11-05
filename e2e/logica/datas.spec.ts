import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { AD_STATES } from '../../src/app/core/ad-states';
import { ANNIVERSARIES, byMonth, dateLabel, dayDelta, dayLabel, featured, groupByDay, toneOf, whenText, yearsLabel } from '../../src/app/core/anniversaries';
import { findArticle } from '../../src/app/core/library';
import { anniversaryCard, CARD_CREAM, CARD_GOLD, dayCard } from '../../src/app/core/share-card';
import { titleCase } from '../../src/app/core/title-case';

/**
 * Datas da história: cada fato tem dia e mês que existem no calendário, leva a uma história que existe, tem foto com
 * crédito quando há foto, e todo dia do ano tem destaques para a tela inicial.
 */
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('datas: dia e mês existem, o ano já passou e os ids não se repetem', () => {
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const a of ANNIVERSARIES) {
    const d = new Date(a.year, a.month - 1, a.day);
    if (d.getMonth() !== a.month - 1 || d.getDate() !== a.day) problems.push(`${a.id}: ${a.day}/${a.month} não existe`);
    if (a.year > 2026) problems.push(`${a.id}: ano ${a.year} no futuro`);
    if (ids.has(a.id)) problems.push(`${a.id}: repetido`);
    ids.add(a.id);
    if (!a.title.trim() || !a.text.trim()) problems.push(`${a.id}: sem título ou texto`);
    if (a.text.length > 200) problems.push(`${a.id}: texto com ${a.text.length} letras (máximo 200)`);
    const mask = (t: string) => t.replace(/\b(Chu Ki-chol|Park Chung-hee|Chun Doo-hwan|Lee Han-yeol)\b/g, 'Nome'); // nomes coreanos levam hífen e minúscula
    if (titleCase(mask(a.title)) !== mask(a.title)) problems.push(`${a.id}: título deveria ser “${titleCase(mask(a.title))}”`);
  }
  expect(problems).toEqual([]);
});

test('datas: cada fato tem um gancho (pergunta ou frase curta que a história responde), e a explicação é simples', () => {
  const problems: string[] = [];
  for (const a of ANNIVERSARIES) {
    if (!a.hook) problems.push(`${a.id}: sem gancho`);
    else {
      if (a.hook.length > 90) problems.push(`${a.id}: gancho com ${a.hook.length} letras (máximo 90)`);
      if (!/[?.]$/.test(a.hook)) problems.push(`${a.id}: o gancho termina sem ? nem .`);
      if (a.text.includes(a.hook)) problems.push(`${a.id}: o gancho repete o texto`);
    }
    if (a.text.split(/[.!?]/).some((frase) => frase.trim().split(/\s+/).length > 45)) problems.push(`${a.id}: frase longa demais no texto`);
  }
  expect(problems).toEqual([]);
  // a lei marcial explica o que é, e o gancho puxa para a história
  const lei = ANNIVERSARIES.find((a) => a.id === 'lei-marcial-2024')!;
  expect(lei.text).toMatch(/Lei marcial é quando/);
  expect(lei.hook).toBe('E de que lado ficou a igreja?');
  const card = anniversaryCard(lei, new Date(2026, 11, 3));
  expect(card.hook).toBe(lei.hook);
  expect(card.subtitle).toBe(lei.text);
  expect(card.photo?.label).toBe('Foto ilustrativa');
});

test('datas: cada fato leva a uma história que existe, e a foto existe e vem com crédito', () => {
  const problems: string[] = [];
  const states = new Set(AD_STATES.map((s) => s.id));
  for (const a of ANNIVERSARIES) {
    const article = /^\/artigo\/([\w-]+)$/.exec(a.link)?.[1];
    const state = /^\/assembleia-de-deus\/([\w-]+)$/.exec(a.link)?.[1];
    if (article ? !findArticle(article) : !state || !states.has(state)) problems.push(`${a.id}: o link ${a.link} não leva a lugar nenhum`);
    if (!!a.image !== !!a.credit) problems.push(`${a.id}: foto e crédito vão juntos`);
    if (a.image && !existsSync(`public/conteudo/${a.image}`)) problems.push(`${a.id}: a foto ${a.image} não existe`);
    if (a.credit && !/domínio público|CC BY|CC0|KOGL/i.test(a.credit)) problems.push(`${a.id}: o crédito não diz a licença`);
    if (!a.image) problems.push(`${a.id}: sem foto (use uma ilustrativa, com illustrative: true, se não houver a do fato)`);
    if (a.illustrative && !a.image) problems.push(`${a.id}: ilustrativa sem foto`);
  }
  expect(problems).toEqual([]);
});

test('datas: toda foto de um fato está nos créditos do app', () => {
  const credits = readFileSync('CREDITOS.md', 'utf8');
  const missing = [...new Set(ANNIVERSARIES.flatMap((a) => (a.image ? [a.image.replace('imagens/', '')] : [])))].filter((f) => !credits.includes(f));
  expect(missing, 'fotos sem linha em CREDITOS.md').toEqual([]);
});

test('datas: o fato do dia vem primeiro, e a chegada de Berg e Vingren faz 116 anos em 19 de novembro de 2026', () => {
  const day = new Date(2026, 10, 19, 10);
  const [first] = featured(day);
  expect(first.events.map((e) => e.id)).toEqual(['berg-vingren-belem']);
  expect(first.delta).toBe(0);
  expect(yearsLabel(first.events[0], day)).toBe('116 anos');
  expect(whenText(0)).toBe('Hoje');
  expect(dateLabel(first.events[0])).toBe('19 de novembro de 1910');
  // quatro dias antes ainda é o aniversário que vem, e dois dias depois ainda é lembrado
  const before = new Date(2026, 10, 15);
  expect(dayDelta(first.events[0], before)).toBe(4);
  expect(featured(before).some((f) => f.events.some((e) => e.id === 'berg-vingren-belem'))).toBe(true);
  expect(featured(new Date(2026, 10, 21)).some((f) => f.events.some((e) => e.id === 'berg-vingren-belem'))).toBe(true);
  expect(dateLabel(ANNIVERSARIES.find((a) => a.id === 'gardiner-terra-do-fogo')!)).toMatch(/^por volta de 6 de setembro/);
});

test('datas: o aniversário atravessa a virada do ano e o dia 1º vem escrito 1º', () => {
  const a = ANNIVERSARIES.find((x) => x.id === 'agnes-ozman')!; // 1º de janeiro
  expect(dayDelta(a, new Date(2026, 11, 30))).toBe(2);
  expect(dayDelta(a, new Date(2027, 0, 3))).toBe(-2);
  expect(yearsLabel(a, new Date(2026, 11, 30))).toBe('126 anos');
  expect(dateLabel(a, false)).toBe('1º de janeiro');
});

test('datas: a tela inicial mostra só os fatos do mês de hoje, um cartão por dia, o do dia primeiro, e a lista muda quando o mês vira', () => {
  const problems: string[] = [];
  for (let d = new Date(2026, 0, 1); d.getFullYear() === 2026; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const list = featured(d);
    const month = d.getMonth() + 1;
    const ofMonth = ANNIVERSARIES.filter((a) => a.month === month);
    if (list.length < 4 || list.length > 12) problems.push(`${d.toDateString()}: ${list.length} destaques`);
    if (list.flatMap((f) => f.events).length !== ofMonth.length || list.some((f) => f.month !== month || f.events.some((e) => e.month !== month))) problems.push(`${d.toDateString()}: tem fato de outro mês ou falta um do mês`);
    if (new Set(list.map((f) => f.day)).size !== list.length) problems.push(`${d.toDateString()}: o mesmo dia aparece em dois cartões`);
    if (ofMonth.some((a) => a.day === d.getDate()) && list[0].delta !== 0) problems.push(`${d.toDateString()}: o dia de hoje não vem primeiro`);
    // depois do dia: os que vêm, do mais perto ao mais longe; por fim os que já passaram, do mais recente ao mais antigo
    const upcoming = list.filter((f) => f.delta > 0).map((f) => f.delta);
    const past = list.filter((f) => f.delta < 0).map((f) => -f.delta);
    if (upcoming.some((x, i) => i && x < upcoming[i - 1]) || past.some((x, i) => i && x < past[i - 1])) problems.push(`${d.toDateString()}: fora de ordem`);
    if (list.findIndex((f) => f.delta < 0) !== -1 && list.findIndex((f) => f.delta > 0) > list.findIndex((f) => f.delta < 0)) problems.push(`${d.toDateString()}: passado antes do que vem`);
  }
  expect(problems).toEqual([]);
  // a virada do mês: em 31 de outubro só os de outubro, em 1º de novembro só os de novembro
  expect(featured(new Date(2026, 9, 31)).every((f) => f.month === 10)).toBe(true);
  expect(featured(new Date(2026, 10, 1)).every((f) => f.month === 11)).toBe(true);
});

test('datas: os fatos do mesmo dia viram um compilado (15 de novembro: São Paulo em 1927 e Madureira em 1929), do mais antigo ao mais novo', () => {
  const dia = featured(new Date(2026, 10, 15, 9))[0];
  expect(dia.delta).toBe(0);
  expect(dia.events.map((e) => e.id)).toEqual(['sao-paulo-1927', 'madureira-comeca']);
  expect(dayLabel(dia.month, dia.day)).toBe('15 de novembro');
  expect(dayLabel(1, 1)).toBe('1º de janeiro');
  // todo dia com mais de um fato tem o compilado, e os dias sem repetição ficam com um só
  const grupos = groupByDay(ANNIVERSARIES);
  expect(grupos.flatMap((g) => g.events).length).toBe(ANNIVERSARIES.length);
  expect(grupos.filter((g) => g.events.length > 1).length).toBeGreaterThanOrEqual(9);
  for (const g of grupos) {
    expect(g.events.map((e) => e.year), `${g.day}/${g.month}`).toEqual([...g.events.map((e) => e.year)].sort((a, b) => a - b));
    expect(new Set(g.events.map((e) => `${e.month}-${e.day}`)).size).toBe(1);
  }
  // a página das datas traz os mesmos grupos, por mês
  for (const m of byMonth()) expect(m.days.flatMap((g) => g.events)).toEqual(m.events);
});

test('datas: a imagem do compilado lista os fatos do dia, com a data, o selo e o convite para ver as datas', () => {
  const dia = featured(new Date(2026, 10, 15))[0];
  const card = dayCard(dia);
  expect(card).toMatchObject({ path: '/datas', badge: '2 fatos', meta: '15 de novembro', title: 'O que aconteceu em 15 de novembro', topicsLabel: '', hideTitle: true });
  expect(card.topics.map((x) => x.title)).toEqual(['1927: A Primeira Assembleia de Deus de São Paulo', '1929: Começa o Trabalho de Madureira']);
  expect(card.subtitle).toBeUndefined(); // a data e os fatos já dizem tudo
  // uma foto por fato, lado a lado, cada uma com o ano no canto e o seu crédito (1º de janeiro tem três fatos)
  const janeiro = featured(new Date(2026, 0, 1))[0];
  const tres = dayCard(janeiro);
  expect(janeiro.events).toHaveLength(3);
  expect(tres.photos?.map((p) => p.tag)).toEqual(['1519', '1901', '1918']);
  expect(tres.photos?.every((p) => p.src.startsWith('conteudo/imagens/') && p.credit && p.label)).toBe(true);
  expect(tres.photos?.[1].label).toBe('Foto ilustrativa'); // Agnes Ozman: a foto é de Parham, o diretor da escola
});

test('datas: o mês tem os fatos em ordem de dia, e a imagem de comemoração leva o selo, a foto e o link da história', () => {
  for (const m of byMonth()) {
    const days = m.events.map((e) => e.day);
    expect(days, `mês ${m.month}`).toEqual([...days].sort((x, y) => x - y));
  }
  const berg = ANNIVERSARIES.find((a) => a.id === 'berg-vingren-belem')!;
  const card = anniversaryCard(berg, new Date(2026, 10, 19));
  expect(card).toMatchObject({ path: '/artigo/daniel-berg-e-gunnar-vingren', badge: '116 anos', meta: '19 de novembro de 1910', topics: [] });
  expect(card.photo?.src).toBe('conteudo/imagens/gunnar-vingren.jpg');
  expect(card.photo?.credit).toContain('domínio público');
});

test('datas: o texto da imagem e dos cartões tem contraste com a cor de cada fato', () => {
  for (const a of ANNIVERSARIES) {
    const tone = toneOf(a);
    expect(contrast(CARD_CREAM, tone), `${a.id}: creme em ${tone}`).toBeGreaterThanOrEqual(4.5);
    expect(contrast(CARD_GOLD, tone), `${a.id}: dourado em ${tone}`).toBeGreaterThanOrEqual(4.5);
  }
});
