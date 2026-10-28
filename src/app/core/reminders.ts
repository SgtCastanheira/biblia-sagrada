/**
 * Lembretes do dia: três chamados para orar, ler e pensar em Deus (de manhã, à tarde e à noite), cada dia num
 * horário sorteado dentro da faixa. O sorteio depende só da data: o app aberto, a notificação do service worker e
 * a lista dos Ajustes chegam sempre aos mesmos horários e às mesmas mensagens. Puro, sem Angular (testado em
 * logica/lembretes.spec.ts, que também confere as citações com a Almeida).
 */

export interface ReminderMessage {
  title: string;
  body: string;
  /** Texto do botão do aviso dentro do app. */
  action: string;
  /** Tela que abre ao tocar; `READ` vira o capítulo em que a pessoa parou. */
  url: string;
}

export interface Reminder extends ReminderMessage {
  /** Data e faixa ("2026-10-28-2"): o mesmo lembrete nunca aparece duas vezes. */
  id: string;
  slot: number;
  /** Horário do dia, "HH:MM". */
  at: string;
}

/** Marca da tela de leitura: troca-se pelo capítulo em que a pessoa parou. */
export const READ = 'READ';

/** Faixas do dia: manhã, tarde e noite (antes de dormir). */
export const REMINDER_WINDOWS: { name: string; from: string; to: string }[] = [
  { name: 'Manhã', from: '07:00', to: '10:30' },
  { name: 'Tarde', from: '12:00', to: '17:30' },
  { name: 'Noite', from: '20:30', to: '22:30' },
];

const PRAY = '/devocional/hoje';

/** Mensagens de cada faixa. Convite e confronto: perguntas que fazem a pessoa parar e pensar. */
export const REMINDER_MESSAGES: ReminderMessage[][] = [
  [
    { title: 'Já orou hoje?', body: 'Antes de abrir as notícias, abra o coração. “Pela manhã te apresento a minha oração” (Sl 5.3).', action: 'Orar', url: PRAY },
    { title: 'Vamos ler a Bíblia?', body: 'Um capítulo antes de o dia começar. “Nem só de pão viverá o homem” (Mt 4.4).', action: 'Ler', url: READ },
    { title: 'Deus já falou com você hoje?', body: 'Ele fala pela Palavra. Abra a Bíblia antes de abrir as redes sociais.', action: 'Ler', url: READ },
    { title: 'Quem vem primeiro no seu dia?', body: 'O celular, o trabalho ou Deus? “Buscai primeiro o seu reino e a sua justiça” (Mt 6.33).', action: 'Orar', url: PRAY },
    { title: 'Você acordou. Já agradeceu?', body: 'As misericórdias dele “renovam-se cada manhã” (Lm 3.23). Diga obrigado antes de qualquer coisa.', action: 'Orar', url: PRAY },
  ],
  [
    { title: 'O que você aprendeu sobre o seu Deus hoje?', body: 'Se a resposta for “nada”, ainda dá tempo: uma história de poucos minutos espera por você.', action: 'Ler', url: '/historia' },
    { title: 'Você aprendeu algo novo sobre o seu Deus hoje?', body: 'Uma curiosidade da Bíblia por dia muda o jeito de ler. A de hoje já está pronta.', action: 'Ver', url: '/curiosidades' },
    { title: 'Vamos orar pela sua família?', body: 'Diga o nome de cada um diante de Deus agora. Se você não orar por eles, quem vai orar?', action: 'Orar', url: PRAY },
    { title: 'Quem está ensinando os seus filhos?', body: 'Você quer ensinar seus filhos sobre o seu Deus, ou quer que o mundo ensine os seus filhos a não querer o seu Deus?', action: 'Ensinar', url: '/ensino' },
    { title: 'Quanto tempo você deu a Deus hoje?', body: 'Horas para o celular, o trabalho e as notícias. Ele merece pelo menos um capítulo.', action: 'Ler', url: READ },
    { title: 'Seus filhos sabem quem é o seu Deus?', body: '“E as ensinarás a teus filhos” (Dt 6.7). Uma história bíblica contada por você hoje vale mais que mil vídeos.', action: 'Ver', url: '/historia' },
  ],
  [
    { title: 'Vamos orar antes de dormir?', body: 'Agradeça, confesse e entregue o dia. “Em paz me deitarei e dormirei” (Sl 4.8).', action: 'Orar', url: PRAY },
    { title: 'E se Jesus voltar hoje, você sobe?', body: 'Ninguém sabe o dia nem a hora. “Vigiai, pois, porque não sabeis em que dia vem o vosso Senhor” (Mt 24.42).', action: 'Orar', url: PRAY },
    { title: 'Você orou pela sua família hoje?', body: 'Antes de dormir, coloque cada um nas mãos de Deus, pelo nome. “Eu e a minha casa serviremos ao Senhor” (Js 24.15).', action: 'Orar', url: PRAY },
    { title: 'Se a sua vida acabasse esta noite…', body: 'Você estaria pronto para encontrar Deus? “Que é a vossa vida? Sois um vapor” (Tg 4.14).', action: 'Orar', url: PRAY },
    { title: 'O que você deu a Deus hoje?', body: 'O dia foi do celular, da TV e do trabalho. Termine-o aos pés dele, em oração.', action: 'Orar', url: PRAY },
  ],
];

const minutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const hhmm = (total: number) => `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;

/** Número de 32 bits a partir de um texto (FNV-1a), para semear o sorteio. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Sorteio repetível (mulberry32): a mesma semente dá sempre o mesmo número entre 0 e 1. */
function seeded(seed: number): number {
  let t = (seed + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Passo que percorre toda a lista sem repetir a mensagem de um dia para o outro. */
function step(length: number): number {
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  for (let s = 2; s < length; s++) if (gcd(s, length) === 1) return s;
  return 1;
}

/** Dias desde 1970 da data "AAAA-MM-DD" (sem fuso). */
const dayOf = (dateKey: string) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
};

/** Os três lembretes de um dia, em ordem. `readUrl` é o capítulo em que a pessoa parou. */
export function remindersFor(dateKey: string, readUrl = '/ler/JHN/1'): Reminder[] {
  const day = dayOf(dateKey);
  return REMINDER_WINDOWS.map((w, slot) => {
    const span = minutes(w.to) - minutes(w.from);
    const at = hhmm(minutes(w.from) + Math.floor(seeded(hash(`${dateKey}#${slot}`)) * span));
    const pool = REMINDER_MESSAGES[slot];
    const message = pool[(day * step(pool.length) + slot) % pool.length];
    return { ...message, url: message.url === READ ? readUrl : message.url, id: `${dateKey}-${slot}`, slot, at };
  });
}

/** O lembrete da vez: o último cujo horário já passou (ou nenhum, antes do primeiro). */
export function dueReminder(list: Reminder[], now: string): Reminder | null {
  return [...list].reverse().find((r) => r.at <= now) ?? null;
}

/** Momento exato (hora local) de um lembrete, para a agenda do service worker. */
export function reminderTime(dateKey: string, at: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [h, min] = at.split(':').map(Number);
  return new Date(y, m - 1, d, h, min).getTime();
}
