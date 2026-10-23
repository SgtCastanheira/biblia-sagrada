/** Utilitários de data local (sem fuso UTC), no formato AAAA-MM-DD. */
export function toKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function fromKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toKey(new Date());
}

export function addDays(key: string, days: number): string {
  const date = fromKey(key);
  date.setDate(date.getDate() + days);
  return toKey(date);
}

export function dayNumber(): number {
  const d = new Date();
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

const longFormat = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
const shortMonth = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
const weekdayShort = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });

export const formatLong = (key: string) => longFormat.format(fromKey(key));
export const formatMonth = (key: string) => shortMonth.format(fromKey(key)).replace('.', '');
export const formatWeekday = (key: string) => weekdayShort.format(fromKey(key)).replace('.', '');
export const dayOfMonth = (key: string) => fromKey(key).getDate();
