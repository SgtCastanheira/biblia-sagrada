import { BibleVersion } from './models';

// Em português: a Almeida e as versões de licença livre do eBible.org, embutidas no app (tools/gerar-versoes.py).
// As demais são traduções em domínio público disponíveis em https://bible-api.com
export const VERSIONS: BibleVersion[] = [
  { id: 'almeida', abbrev: 'ALM', name: 'João Ferreira de Almeida', language: 'Português', flag: '🇧🇷' },
  { id: 'blivre', abbrev: 'BLIVRE', badge: 'BL', name: 'Bíblia Livre (Almeida atualizada)', language: 'Português', flag: '🇧🇷' },
  { id: 'nbv', abbrev: 'NBV', name: 'Nova Bíblia Viva (Biblica® Open)', language: 'Português', flag: '🇧🇷' },
  { id: 'bpm', abbrev: 'BPM', name: 'Bíblia Portuguesa Mundial', language: 'Português', flag: '🇧🇷' },
  { id: 'blt', abbrev: 'BLT', name: 'Bíblia Livre Para Todos', language: 'Português', flag: '🇧🇷', ntOnly: true },
  { id: 'nva', abbrev: 'NVA', name: 'Bíblia Nova Versão de Acesso Livre', language: 'Português', flag: '🇧🇷' },
  { id: 'alm1911', abbrev: 'ALM1911', badge: 'ALM', name: 'Almeida 1911 (ortografia original)', language: 'Português', flag: '🇧🇷' },
  { id: 'lsg', abbrev: 'LSG', name: 'Louis Segond (1910)', language: 'Francês', flag: '🇫🇷' },
  { id: 'kjv', abbrev: 'KJV', name: 'King James Version', language: 'Inglês', flag: '🇬🇧' },
  { id: 'asv', abbrev: 'ASV', name: 'American Standard Version (1901)', language: 'Inglês', flag: '🇺🇸' },
  { id: 'web', abbrev: 'WEB', name: 'World English Bible', language: 'Inglês', flag: '🇺🇸' },
  { id: 'bbe', abbrev: 'BBE', name: 'Bible in Basic English', language: 'Inglês', flag: '🇬🇧' },
  { id: 'darby', abbrev: 'DBY', name: 'Darby Bible', language: 'Inglês', flag: '🇬🇧' },
  { id: 'dra', abbrev: 'DRA', name: 'Douay-Rheims 1899', language: 'Inglês', flag: '🇺🇸' },
  { id: 'ylt', abbrev: 'YLT', name: "Young's Literal Translation", language: 'Inglês', flag: '🇬🇧', ntOnly: true },
  { id: 'oeb-us', abbrev: 'OEB', name: 'Open English Bible (US)', language: 'Inglês', flag: '🇺🇸' },
  { id: 'webbe', abbrev: 'WEBBE', name: 'World English Bible (Britânica)', language: 'Inglês', flag: '🇬🇧' },
  { id: 'clementine', abbrev: 'VUL', name: 'Vulgata Clementina', language: 'Latim', flag: '🇻🇦' },
  { id: 'rccv', abbrev: 'RCCV', name: 'Cornilescu Corrigida', language: 'Romeno', flag: '🇷🇴' },
  { id: 'synodal', abbrev: 'SYN', name: 'Tradução Sinodal', language: 'Russo', flag: '🇷🇺' },
  { id: 'bkr', abbrev: 'BKR', name: 'Bíblia de Kralice', language: 'Tcheco', flag: '🇨🇿' },
  { id: 'cuv', abbrev: 'CUV', name: 'Chinese Union Version', language: 'Chinês', flag: '🇨🇳' },
  { id: 'cherokee', abbrev: 'CHR', name: 'Novo Testamento Cherokee', language: 'Cherokee', flag: '🇺🇸', ntOnly: true },
];

export const VERSION_GROUPS = Object.entries(
  VERSIONS.reduce<Record<string, BibleVersion[]>>((acc, v) => {
    (acc[v.language] ??= []).push(v);
    return acc;
  }, {}),
).map(([language, versions]) => ({ language, versions }));

export const findVersion = (id: string): BibleVersion | undefined => VERSIONS.find((v) => v.id === id);

/**
 * Versões em português com direitos autorais (Sociedade Bíblica do Brasil, Biblica/Vida, Mundo Cristão):
 * o app não guarda o texto delas, só abre o mesmo versículo no site do YouVersion (bible.com).
 * Os números são os ids de cada versão no YouVersion.
 */
export const EXTERNAL_VERSIONS: { abbrev: string; name: string; youversion: number }[] = [
  { abbrev: 'ARA', name: 'Almeida Revista e Atualizada', youversion: 1608 },
  { abbrev: 'ARC', name: 'Almeida Revista e Corrigida', youversion: 212 },
  { abbrev: 'NVI', name: 'Nova Versão Internacional', youversion: 129 },
  { abbrev: 'NTLH', name: 'Nova Tradução na Linguagem de Hoje', youversion: 211 },
  { abbrev: 'NAA', name: 'Nova Almeida Atualizada', youversion: 1840 },
  { abbrev: 'NVT', name: 'Nova Versão Transformadora', youversion: 1930 },
];

export const externalVerseUrl = (v: (typeof EXTERNAL_VERSIONS)[number], bookId: string, chapter: number, verse?: number) =>
  `https://www.bible.com/bible/${v.youversion}/${bookId}.${chapter}${verse ? `.${verse}` : ''}.${v.abbrev}`;
