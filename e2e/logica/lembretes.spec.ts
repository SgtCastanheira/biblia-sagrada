import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { parseReferences } from '../../src/app/core/reference-parser';
import { dueReminder, READ, reminderTime, REMINDER_MESSAGES, REMINDER_WINDOWS, remindersFor } from '../../src/app/core/reminders';

const days = (n: number) => Array.from({ length: n }, (_, i) => {
  const d = new Date(2026, 9, 1 + i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});

test('lembretes: três por dia, um em cada faixa, sempre os mesmos para a mesma data', () => {
  for (const key of days(60)) {
    const list = remindersFor(key);
    expect(list.map((r) => r.slot)).toEqual([0, 1, 2]);
    list.forEach((r, i) => {
      expect(r.id).toBe(`${key}-${i}`);
      expect(r.at >= REMINDER_WINDOWS[i].from && r.at < REMINDER_WINDOWS[i].to, `${key} ${r.at}`).toBe(true);
    });
    expect(remindersFor(key)).toEqual(list);
  }
  // Os horários mudam de um dia para o outro
  const mornings = new Set(days(30).map((k) => remindersFor(k)[0].at));
  expect(mornings.size).toBeGreaterThan(20);
});

test('lembretes: a mensagem de cada faixa não se repete no dia seguinte e todas aparecem', () => {
  const list = days(40).map((k) => remindersFor(k));
  for (let slot = 0; slot < 3; slot++) {
    const titles = list.map((day) => day[slot].title);
    titles.slice(1).forEach((t, i) => expect(t, `faixa ${slot}, dia ${i + 1}`).not.toBe(titles[i]));
    expect(new Set(titles).size).toBe(REMINDER_MESSAGES[slot].length);
  }
});

test('lembretes: as frases pedidas estão lá, curtas para caber na notificação', () => {
  const all = REMINDER_MESSAGES.flat();
  const text = all.map((m) => `${m.title} ${m.body}`).join('\n');
  for (const phrase of [
    'Já orou hoje?', 'Vamos ler a Bíblia?', 'Vamos orar antes de dormir?', 'Vamos orar pela sua família?',
    'O que você aprendeu sobre o seu Deus hoje?', 'Você aprendeu algo novo sobre o seu Deus hoje?', 'E se Jesus voltar hoje, você sobe?',
    'Você quer ensinar seus filhos sobre o seu Deus, ou quer que o mundo ensine os seus filhos a não querer o seu Deus?',
  ]) expect(text, phrase).toContain(phrase);
  for (const m of all) {
    expect(m.title.length, m.title).toBeLessThanOrEqual(50);
    expect(m.body.length, m.body).toBeLessThanOrEqual(140);
    expect(m.url === READ || m.url.startsWith('/'), m.url).toBe(true);
  }
  // A leitura abre no capítulo em que a pessoa parou
  const reading = days(10).flatMap((k) => remindersFor(k, '/ler/ROM/8')).filter((r) => r.action === 'Ler' && r.url.startsWith('/ler'));
  expect(reading.length).toBeGreaterThan(0);
  reading.forEach((r) => expect(r.url).toBe('/ler/ROM/8'));
});

test('lembretes: toda citação entre aspas é o texto da Almeida do app', () => {
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  let quotes = 0;
  for (const m of REMINDER_MESSAGES.flat()) {
    for (const [, quote, ref] of m.body.matchAll(/“([^”]+)”[^(“]*\(([^)]+)\)/g)) {
      const r = parseReferences(ref).refs[0];
      expect(r, ref).toBeTruthy();
      const book = JSON.parse(readFileSync(`public/bible/almeida/${r.bookId}.json`, 'utf8')) as [number, string][][];
      const verses = norm(book[r.chapter - 1].filter(([n]) => n >= (r.from ?? 1) && n <= (r.to ?? r.from ?? 999)).map(([, t]) => t).join(' '));
      expect(verses, `“${quote}” (${ref})`).toContain(norm(quote));
      quotes++;
    }
  }
  expect(quotes).toBeGreaterThanOrEqual(8);
});

test('lembretes: o da vez é o último cujo horário já passou', () => {
  const list = remindersFor('2026-11-03');
  expect(dueReminder(list, '06:00')).toBeNull();
  expect(dueReminder(list, list[0].at)?.slot).toBe(0);
  expect(dueReminder(list, '11:59')?.slot).toBe(0);
  expect(dueReminder(list, list[1].at)?.slot).toBe(1);
  expect(dueReminder(list, '23:59')?.slot).toBe(2);
  const t = new Date(reminderTime('2026-11-03', '21:07'));
  expect([t.getFullYear(), t.getMonth(), t.getDate(), t.getHours(), t.getMinutes()]).toEqual([2026, 10, 3, 21, 7]);
});
