import { expect, test } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { ARTICLES, CLASSIC_SERMONS, RECOMMENDED_SERMONS } from '../../src/app/core/library';
import { titleCase } from '../../src/app/core/title-case';
import { TRAILS } from '../../src/app/core/trails';

test('regra dos títulos: inicial maiúscula, menos artigos, preposições e conjunções', () => {
  // Os seis tópicos do módulo do livro, como o autor do app pediu
  expect(titleCase('Teologia pode ser pública?')).toBe('Teologia Pode Ser Pública?');
  expect(titleCase('A lógica da fé e a lógica grega')).toBe('A Lógica da Fé e a Lógica Grega');
  expect(titleCase('igreja, academia e educação cristã')).toBe('Igreja, Academia e Educação Cristã');
  // Artigos, preposições e conjunções ficam em minúscula, menos no começo do título ou depois de “:” e “?”
  expect(titleCase('Os 400 anos entre os Testamentos')).toBe('Os 400 Anos entre os Testamentos');
  expect(titleCase('A Trindade: um só Deus')).toBe('A Trindade: Um Só Deus');
  expect(titleCase('Em que ano estamos? Depende de quem responde')).toBe('Em que Ano Estamos? Depende de Quem Responde');
  expect(titleCase('Da Vulgata à King James')).toBe('Da Vulgata à King James');
  expect(titleCase('Lutero E A Reforma')).toBe('Lutero e a Reforma');
  // Numeração, datas, abreviações, aspas, hífens e nomes com maiúscula no meio
  expect(titleCase('3. Os pastores na sociedade')).toBe('3. Os Pastores na Sociedade');
  expect(titleCase('II. Que salvação é essa')).toBe('II. Que Salvação É Essa');
  expect(titleCase('John Wycliffe (c. 1330–1384)')).toBe('John Wycliffe (c. 1330–1384)');
  expect(titleCase('Por volta de 430 a.C.: o último profeta')).toBe('Por Volta de 430 a.C.: O Último Profeta');
  expect(titleCase('Spener e os “desejos piedosos” (1675)')).toBe('Spener e os “Desejos Piedosos” (1675)');
  expect(titleCase('Pós-reforma e pastor-presidente')).toBe('Pós-Reforma e Pastor-Presidente');
  expect(titleCase('“Dobra-me!”')).toBe('“Dobra-me!”');
  expect(titleCase('Daniel 2 — a estátua dos quatro metais')).toBe('Daniel 2 — A Estátua dos Quatro Metais');
  expect(titleCase('O pensamento de McGrath e o IBUC')).toBe('O Pensamento de McGrath e o IBUC');
});

test('títulos de histórias, sermões, trilhas e tópicos seguem o padrão', () => {
  const problems: string[] = [];
  const check = (where: string, text: string) => {
    if (titleCase(text) !== text) problems.push(`${where}: “${text}” deveria ser “${titleCase(text)}”`);
  };
  for (const a of ARTICLES) {
    check(`história ${a.id}`, a.title);
    a.topics?.forEach((t) => check(`tópico de ${a.id}`, t));
  }
  CLASSIC_SERMONS.forEach((s) => check(`sermão ${s.id}`, s.title));
  RECOMMENDED_SERMONS.forEach((s) => check(`sermão de ${s.preacher}`, s.title));
  for (const t of TRAILS) {
    check(`trilha ${t.id}`, t.name);
    check(`nome curto da trilha ${t.id}`, t.short);
    t.branches.forEach((b) => check(`ramo da trilha ${t.id}`, b.title));
  }
  expect(problems).toEqual([]);
});

test('títulos de capítulos, subtítulos (## e ###) e cartões :::ficha dos textos seguem o padrão', () => {
  const problems: string[] = [];
  for (const dir of ['artigos', 'sermoes', 'ad-estados']) {
    for (const file of readdirSync(`public/conteudo/${dir}`).filter((f) => f.endsWith('.md'))) {
      for (const line of readFileSync(`public/conteudo/${dir}/${file}`, 'utf8').split('\n')) {
        const heading = /^#{2,3} (.+)$/.exec(line)?.[1];
        const ficha = /^:::ficha (.+)$/.exec(line)?.[1];
        // Os cartões “Lugar · data · fato” (:::ficha) são rótulos, não títulos
        const title = heading ?? (ficha?.includes(' · ') ? undefined : ficha);
        if (title && titleCase(title) !== title) problems.push(`${dir}/${file}: “${title}” deveria ser “${titleCase(title)}”`);
      }
    }
  }
  expect(problems).toEqual([]);
});
