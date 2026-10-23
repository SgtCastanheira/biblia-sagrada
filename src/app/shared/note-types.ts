/** Cor discreta para cada indicação de culto (as personalizadas recebem uma cor fixa pelo nome). */
const COLORS: Record<string, string> = {
  'Culto de Ensino': '#5f7d90',
  'Culto de Domingo': '#5f8068',
  'Culto de Oração': '#7d6e92',
  'Santa Ceia': '#9a5f5f',
  'Escola Bíblica': '#8c7445',
  Congresso: '#5a827e',
  Outro: '#76716a',
};
const EXTRA = ['#8a6a50', '#6b7a99', '#7f8a4f', '#9a6a85', '#4f7f8a'];

export function noteTypeColor(type: string): string {
  if (COLORS[type]) return COLORS[type];
  const hash = [...type].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  return EXTRA[hash % EXTRA.length];
}
