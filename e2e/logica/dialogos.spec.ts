import { expect, test } from '@playwright/test';
import { parseBlocks } from '../../src/app/core/rich-text-parser';

// ":::dialogo": uma fala por linha, "Nome | fala [[ref]]"; a linha sem " | " é indicação de cena.
test('diálogo: separa quem fala, a fala e a referência de cada linha', () => {
  const [antes, dialogo, depois] = parseBlocks(
    [
      'Pilatos volta ao pretório.',
      '',
      ':::dialogo Dentro do Pretório',
      'Pilatos | És tu o rei dos judeus? [[Jo 18.33]]',
      'Jesus | Dizes isso de ti mesmo, ou foram outros que to disseram de mim? [[Jo 18.34]]',
      'Jesus não lhe deu resposta. [[Jo 19.9]]',
      'Pilatos | Que é a verdade? [[Jo 18.38]]',
      ':::',
      '',
      'Pilatos sai.',
    ].join('\n'),
  );
  expect(antes.type).toBe('p');
  expect(depois.type).toBe('p');
  expect(dialogo.type).toBe('dialog');
  expect(dialogo.place).toBe('Dentro do Pretório');
  expect(dialogo.turns?.map((t) => t.who)).toEqual(['Pilatos', 'Jesus', undefined, 'Pilatos']);
  // a fala não leva o nome nem a barra; a referência vira trecho tocável
  expect(dialogo.turns?.[0].text.map((i) => i.t)).toEqual(['text', 'ref']);
  expect(dialogo.turns?.[0].text[0].text).toBe('És tu o rei dos judeus? ');
  expect(dialogo.turns?.[0].text[1].href).toBe('Jo 18.33');
  // a indicação de cena não tem nome
  expect(dialogo.turns?.[2].text.map((i) => i.t)).toEqual(['text', 'ref']);
});

test('diálogo: o título é opcional e o bloco termina no ":::"', () => {
  const blocks = parseBlocks(':::dialogo\nJudas | Pequei, traindo o sangue inocente. [[Mt 27.4]]\n:::\n\nDepois.');
  expect(blocks.map((b) => b.type)).toEqual(['dialog', 'p']);
  expect(blocks[0].place).toBeUndefined();
  expect(blocks[0].turns).toHaveLength(1);
});

test('hora: uma linha sob o título vira bloco próprio, com referências', () => {
  const blocos = parseBlocks('### Jesus Diante de Anás\n\n:::hora Quinta para sexta · de noite · antes das 3h [[Mc 13.35]]\n\nTexto.');
  expect(blocos.map((b) => b.type)).toEqual(['h3', 'when', 'p']);
  expect(blocos[1].inlines?.map((i) => i.t)).toEqual(['text', 'ref']);
  expect(blocos[1].inlines?.[0].text).toBe('Quinta para sexta · de noite · antes das 3h ');
});
