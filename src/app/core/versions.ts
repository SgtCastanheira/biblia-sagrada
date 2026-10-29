import { BibleVersion } from './models';

// Em português, espanhol e alemão: a Almeida e as versões de licença livre do eBible.org, embutidas no app (tools/gerar-versoes.py).
// Também as línguas indígenas do Brasil (Wycliffe, CC BY-NC-ND): o app as mostra sem mudar nada e com o aviso de direitos no fim do capítulo.
// As demais são traduções em domínio público disponíveis em https://bible-api.com
export const VERSIONS: BibleVersion[] = [
  { id: 'almeida', abbrev: 'ALM', name: 'João Ferreira de Almeida', language: 'Português', flag: '🇧🇷' },
  { id: 'blivre', abbrev: 'BLIVRE', badge: 'BL', name: 'Bíblia Livre (Almeida atualizada)', language: 'Português', flag: '🇧🇷', copyright: '© 2018 Diego Santos, Mario Sérgio e Marco Teles · licença CC BY 4.0' },
  { id: 'nbv', abbrev: 'NBV', name: 'Nova Bíblia Viva (Biblica® Open)', language: 'Português', flag: '🇧🇷', copyright: 'Biblica® Open Nova Bíblia Viva™ © 2007, 2010 Biblica, Inc. Usado com permissão · licença CC BY-SA 4.0' },
  { id: 'bpm', abbrev: 'BPM', name: 'Bíblia Portuguesa Mundial', language: 'Português', flag: '🇧🇷' },
  { id: 'blt', abbrev: 'BLT', name: 'Bíblia Livre Para Todos', language: 'Português', flag: '🇧🇷', ntOnly: true, copyright: '© 2022 Free Bible Ministry, Inc. · licença CC BY-SA 4.0' },
  { id: 'nva', abbrev: 'NVA', name: 'Bíblia Nova Versão de Acesso Livre', language: 'Português', flag: '🇧🇷', copyright: 'Bíblia Nova Versão de Acesso Livre (biblianva.com.br) · licença CC BY-SA 4.0' },
  { id: 'alm1911', abbrev: 'ALM1911', badge: 'ALM', name: 'Almeida 1911 (ortografia original)', language: 'Português', flag: '🇧🇷', copyright: 'texto em domínio público; módulo da CrossWire sob GPL' },
  { id: 'mbya', abbrev: 'MBYA', badge: 'MBY', name: 'Guarani Mbyá: Nhanderuete ayvu (Bíblia completa)', language: 'Línguas indígenas do Brasil', flag: '🇧🇷', copyright: '© 2004 Wycliffe Bible Translators, Inc. · licença CC BY-NC-ND (uso sem fins comerciais, sem alterar o texto)' },
  { id: 'guajajara', abbrev: 'GUAJ', badge: 'GJ', name: 'Guajajára: Tupàn ze’eg (Bíblia completa)', language: 'Línguas indígenas do Brasil', flag: '🇧🇷', copyright: '© 2007 Wycliffe Bible Translators, Inc. · licença CC BY-NC-ND (uso sem fins comerciais, sem alterar o texto)' },
  { id: 'kaiwa', abbrev: 'KAIWA', badge: 'KW', name: 'Kaiwá (Guarani Kaiowá): Nhandejáry Nhe’ẽ', language: 'Línguas indígenas do Brasil', flag: '🇧🇷', ntOnly: true, copyright: '© 2006 Wycliffe Bible Translators, Inc. · licença CC BY-NC-ND (uso sem fins comerciais, sem alterar o texto)' },
  { id: 'kayabi', abbrev: 'KAYABI', badge: 'KYB', name: 'Kayabí: Janeruwarete ’Ga Je’eg', language: 'Línguas indígenas do Brasil', flag: '🇧🇷', ntOnly: true, copyright: '© 2012 Wycliffe Bible Translators, Inc. · licença CC BY-NC-ND (uso sem fins comerciais, sem alterar o texto)' },
  { id: 'kaapor', abbrev: 'KAAPOR', badge: 'KAP', name: 'Kaapor: Tupã Je’ẽha', language: 'Línguas indígenas do Brasil', flag: '🇧🇷', ntOnly: true, copyright: '© 2012 Wycliffe Bible Translators, Inc. · licença CC BY-NC-ND (uso sem fins comerciais, sem alterar o texto)' },
  { id: 'munduruku', abbrev: 'MUND', badge: 'MUN', name: 'Mundurukú: Deus ekawẽntup', language: 'Línguas indígenas do Brasil', flag: '🇧🇷', ntOnly: true, copyright: '© 2010 Wycliffe Bible Translators, Inc. · licença CC BY-NC-ND (uso sem fins comerciais, sem alterar o texto)' },
  { id: 'satere', abbrev: 'SATERE', badge: 'SAT', name: 'Sateré-Mawé: Tupana Ehay', language: 'Línguas indígenas do Brasil', flag: '🇧🇷', ntOnly: true, copyright: '© 2011 Wycliffe Bible Translators, Inc. · licença CC BY-NC-ND (uso sem fins comerciais, sem alterar o texto)' },
  { id: 'ticuna', abbrev: 'TICUNA', badge: 'TIC', name: 'Ticuna: Tupanaarü Ore', language: 'Línguas indígenas do Brasil', flag: '🇧🇷', ntOnly: true, copyright: '© 2008 Wycliffe Bible Translators, Inc. · licença CC BY-NC-ND (uso sem fins comerciais, sem alterar o texto)' },
  { id: 'kaingang', abbrev: 'KAING', badge: 'KGG', name: 'Kaingang: Topẽ vĩ rá', language: 'Línguas indígenas do Brasil', flag: '🇧🇷', ntOnly: true, copyright: '© 2011 Wycliffe Bible Translators, Inc. · licença CC BY-NC-ND (uso sem fins comerciais, sem alterar o texto)' },
  { id: 'terena', abbrev: 'TERENA', badge: 'TER', name: 'Terêna: Emo’u Itukó’oviti', language: 'Línguas indígenas do Brasil', flag: '🇧🇷', ntOnly: true, copyright: '© 2012 Wycliffe Bible Translators, Inc. · licença CC BY-NC-ND (uso sem fins comerciais, sem alterar o texto)' },
  { id: 'xavante', abbrev: 'XAVANTE', badge: 'XAV', name: 'Xavánte: ’Re ĩhâimana u’âsi mono zadawa', language: 'Línguas indígenas do Brasil', flag: '🇧🇷', ntOnly: true, copyright: '© 2004 Wycliffe Bible Translators, Inc. · licença CC BY-NC-ND (uso sem fins comerciais, sem alterar o texto)' },
  { id: 'rv1909', abbrev: 'RV1909', name: 'Reina-Valera 1909', language: 'Espanhol', flag: '🇪🇸' },
  { id: 'vbl', abbrev: 'VBL', name: 'Versión Biblia Libre', language: 'Espanhol', flag: '🌎', copyright: '© 2018–2020 Jonathan Gallagher e Shelly Barrios de Avila · licença CC BY-SA 4.0' },
  { id: 'nbv-es', abbrev: 'NBV', badge: 'NBV·ES', name: 'Nueva Biblia Viva (Biblica® Open)', language: 'Espanhol', flag: '🌎', copyright: 'Biblica® Open Nueva Biblia Viva™ © 2006, 2008 Biblica, Inc. Usado com permissão · licença CC BY-SA 4.0' },
  { id: 'bes', abbrev: 'BES', name: 'Biblia en Español Sencillo', language: 'Espanhol', flag: '🌎' },
  { id: 'bll', abbrev: 'BLL', name: 'Biblia Libre Latinoamericano', language: 'Espanhol', flag: '🌎' },
  { id: 'hebraico', abbrev: 'HEB', name: 'Bíblia hebraica (Delitzsch)', language: 'Hebraico', flag: '🇮🇱', rtl: true },
  { id: 'luther1912', abbrev: 'LUT1912', badge: 'LUT', name: 'Lutherbibel 1912', language: 'Alemão', flag: '🇩🇪' },
  { id: 'elo', abbrev: 'ELB1905', badge: 'ELB', name: 'Elberfelder 1905', language: 'Alemão', flag: '🇩🇪' },
  { id: 'schlachter', abbrev: 'SCH1951', badge: 'SCH', name: 'Schlachter 1951', language: 'Alemão', flag: '🇩🇪', copyright: '© 1951 Genfer Bibelgesellschaft · licença CC BY 4.0' },
  { id: 'lsg', abbrev: 'LSG', name: 'Louis Segond (1910)', language: 'Francês', flag: '🇫🇷' },
  { id: 'kjv', abbrev: 'KJV', name: 'King James Version', language: 'Inglês', flag: '🇬🇧' },
  { id: 'asv', abbrev: 'ASV', name: 'American Standard Version (1901)', language: 'Inglês', flag: '🇺🇸' },
  { id: 'web', abbrev: 'WEB', name: 'World English Bible', language: 'Inglês', flag: '🇺🇸' },
  { id: 'bbe', abbrev: 'BBE', name: 'Bible in Basic English', language: 'Inglês', flag: '🇬🇧' },
  { id: 'darby', abbrev: 'DBY', name: 'Darby Bible', language: 'Inglês', flag: '🇬🇧' },
  { id: 'dra', abbrev: 'DRA', name: 'Douay-Rheims 1899', language: 'Inglês', flag: '🇺🇸' },
  { id: 'ylt', abbrev: 'YLT', name: "Young's Literal Translation", language: 'Inglês', flag: '🇬🇧', ntOnly: true },
  { id: 'oeb-us', abbrev: 'OEB', name: 'Open English Bible (US)', language: 'Inglês', flag: '🇺🇸', partial: 'O Antigo Testamento desta versão ainda está em tradução: só 17 livros estão prontos.' },
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
