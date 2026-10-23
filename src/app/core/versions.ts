import { BibleVersion } from './models';

// Traduções em domínio público disponíveis em https://bible-api.com
export const VERSIONS: BibleVersion[] = [
  { id: 'almeida', abbrev: 'ALM', name: 'João Ferreira de Almeida', language: 'Português', flag: '🇧🇷' },
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
