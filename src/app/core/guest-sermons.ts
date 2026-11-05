/**
 * Novas Vozes da Palavra: sermões de novos teólogos e estudiosos da Palavra, publicados com a autorização de cada autor,
 * no formato de jornal, em vários idiomas e para ouvir. O texto de cada um fica em public/conteudo/vozes/<id>.md
 * (português) e <id>.<idioma>.md (traduções). Código puro: os testes de lógica o importam direto.
 *
 * Fluxo de publicação: o sermão nasce com status 'revisao'. Nesse estado ele não aparece no menu nem na lista do app publicado
 * (só no `ng serve`); o autor o lê e aprova pelo link exclusivo /revisao/<reviewToken>. Quando o autor aprova, troca-se
 * o status para 'publicado' e o sermão entra no menu de Ensino.
 */
import { findVersion } from './versions';

export type LangCode = 'pt' | 'es' | 'en' | 'fr' | 'de' | 'ru';

export interface GuestLanguage {
  code: LangCode;
  /** Nome na própria língua. */
  native: string;
  flag: string;
  /** Campo `language` das versões da Bíblia em versions.ts (para usar a versão que a pessoa já escolheu, se for desta língua). */
  bibleLanguage: string;
  /** Versão da Bíblia dos versículos quando a escolhida em Ajustes é de outra língua. */
  bible: string;
}

export const GUEST_LANGUAGES: GuestLanguage[] = [
  { code: 'pt', native: 'Português', flag: '🇧🇷', bibleLanguage: 'Português', bible: 'almeida' },
  { code: 'es', native: 'Español', flag: '🇪🇸', bibleLanguage: 'Espanhol', bible: 'rv1909' },
  { code: 'en', native: 'English', flag: '🇺🇸', bibleLanguage: 'Inglês', bible: 'web' },
  { code: 'fr', native: 'Français', flag: '🇫🇷', bibleLanguage: 'Francês', bible: 'lsg' },
  { code: 'de', native: 'Deutsch', flag: '🇩🇪', bibleLanguage: 'Alemão', bible: 'luther1912' },
  { code: 'ru', native: 'Русский', flag: '🇷🇺', bibleLanguage: 'Russo', bible: 'synodal' },
];

export const findGuestLanguage = (code: string): GuestLanguage => GUEST_LANGUAGES.find((l) => l.code === code) ?? GUEST_LANGUAGES[0];

/** Os textos da tela do jornal em cada língua. */
export interface GuestStrings {
  masthead: string;
  tagline: string;
  by: string;
  minutes: string;
  listen: string;
  stop: string;
  language: string;
  smaller: string;
  larger: string;
  baseText: string;
  bibleText: string;
  edition: string;
  sources: string;
  authorized: string;
  /** Imagem de compartilhar: o nome do botão, o convite acima do link e a legenda da ilustração. */
  share: { button: string; cta: string; artLabel: string; artCredit: string };
  /** Aviso das traduções (vazio no original em português). */
  translation: string;
}

export const GUEST_STRINGS: Record<LangCode, GuestStrings> = {
  pt: {
    masthead: 'Novas Vozes da Palavra', tagline: 'Sermões de novos teólogos e estudiosos da Palavra', by: 'Por', minutes: 'min de leitura',
    listen: 'Ouvir', stop: 'Parar', language: 'Idioma', smaller: 'Diminuir letra', larger: 'Aumentar letra', baseText: 'Texto-base', bibleText: 'Texto bíblico', edition: 'Edição nº', sources: 'Fontes',
    authorized: 'Publicado com a autorização do autor.',
    share: { button: 'Compartilhar', cta: 'Leia o sermão', artLabel: 'Ilustração', artCredit: 'desenhada para o app' }, translation: '',
  },
  es: {
    masthead: 'Nuevas Voces de la Palabra', tagline: 'Sermones de nuevos teólogos y estudiosos de la Palabra', by: 'Por', minutes: 'min de lectura',
    listen: 'Escuchar', stop: 'Parar', language: 'Idioma', smaller: 'Reducir la letra', larger: 'Aumentar la letra', baseText: 'Texto base', bibleText: 'Texto bíblico', edition: 'Edición n.º', sources: 'Fuentes',
    authorized: 'Publicado con la autorización del autor.',
    share: { button: 'Compartir', cta: 'Lee el sermón', artLabel: 'Ilustración', artCredit: 'dibujada para la app' },
    translation: 'Traducción del texto original en portugués, hecha con apoyo de inteligencia artificial y sin revisión de un hablante nativo. Las citas bíblicas siguen la versión de la Biblia en este idioma.',
  },
  en: {
    masthead: 'New Voices of the Word', tagline: 'Sermons by new theologians and students of the Word', by: 'By', minutes: 'min read',
    listen: 'Listen', stop: 'Stop', language: 'Language', smaller: 'Smaller text', larger: 'Larger text', baseText: 'Text', bibleText: 'Bible text', edition: 'Issue no.', sources: 'Sources',
    authorized: 'Published with the author’s permission.',
    share: { button: 'Share', cta: 'Read the sermon', artLabel: 'Illustration', artCredit: 'drawn for the app' },
    translation: 'Translation of the original Portuguese text, made with the help of artificial intelligence and not reviewed by a native speaker. Bible quotations follow the Bible version in this language.',
  },
  fr: {
    masthead: 'Nouvelles Voix de la Parole', tagline: 'Sermons de nouveaux théologiens et étudiants de la Parole', by: 'Par', minutes: 'min de lecture',
    listen: 'Écouter', stop: 'Arrêter', language: 'Langue', smaller: 'Réduire le texte', larger: 'Agrandir le texte', baseText: 'Texte de base', bibleText: 'Texte biblique', edition: 'Édition n°', sources: 'Sources',
    authorized: 'Publié avec l’autorisation de l’auteur.',
    share: { button: 'Partager', cta: 'Lisez le sermon', artLabel: 'Illustration', artCredit: 'dessinée pour l’application' },
    translation: 'Traduction du texte original en portugais, réalisée avec l’aide de l’intelligence artificielle et non relue par un locuteur natif. Les citations bibliques suivent la version de la Bible dans cette langue.',
  },
  de: {
    masthead: 'Neue Stimmen des Wortes', tagline: 'Predigten neuer Theologen und Bibelforscher', by: 'Von', minutes: 'Min. Lesezeit',
    listen: 'Anhören', stop: 'Anhalten', language: 'Sprache', smaller: 'Schrift verkleinern', larger: 'Schrift vergrößern', baseText: 'Predigttext', bibleText: 'Bibeltext', edition: 'Ausgabe Nr.', sources: 'Quellen',
    authorized: 'Mit Erlaubnis des Autors veröffentlicht.',
    share: { button: 'Teilen', cta: 'Lies die Predigt', artLabel: 'Illustration', artCredit: 'für die App gezeichnet' },
    translation: 'Übersetzung des portugiesischen Originaltextes, mit Hilfe künstlicher Intelligenz erstellt und nicht von Muttersprachlern geprüft. Die Bibelzitate folgen der Bibelübersetzung in dieser Sprache.',
  },
  ru: {
    masthead: 'Новые голоса Слова', tagline: 'Проповеди новых богословов и исследователей Слова', by: 'Автор:', minutes: 'мин чтения',
    listen: 'Слушать', stop: 'Остановить', language: 'Язык', smaller: 'Уменьшить шрифт', larger: 'Увеличить шрифт', baseText: 'Основной текст', bibleText: 'Текст Библии', edition: 'Выпуск №', sources: 'Источники',
    authorized: 'Опубликовано с разрешения автора.',
    share: { button: 'Поделиться', cta: 'Читайте проповедь', artLabel: 'Иллюстрация', artCredit: 'нарисована для приложения' },
    translation: 'Перевод португальского оригинала, выполненный с помощью искусственного интеллекта и не проверенный носителем языка. Библейские цитаты приводятся по переводу Библии на этом языке.',
  },
};

/** O que o editor mexeu no texto do autor, para ele conferir antes de aprovar. */
export interface EditorChange {
  /** 'conferir' pede uma resposta do autor; 'retirado' saiu do texto; 'ajustado' mudou; 'acrescentado' entrou. */
  kind: 'conferir' | 'retirado' | 'ajustado' | 'acrescentado';
  title: string;
  /** O que estava no texto do autor (quando há um trecho). */
  original?: string;
  /** Como ficou. */
  now?: string;
  why: string;
}

export const CHANGE_KINDS: Record<EditorChange['kind'], { label: string; hint: string; icon: string }> = {
  conferir: { label: 'Para você conferir', hint: 'O editor não teve como confirmar. Diga se está certo.', icon: 'help' },
  retirado: { label: 'Retirado do texto', hint: 'Saiu da versão a publicar. Se tiver outra fonte, é só dizer.', icon: 'remove_circle' },
  ajustado: { label: 'Ajustado', hint: 'A ideia é a sua; mudou a forma ou a precisão.', icon: 'edit' },
  acrescentado: { label: 'Acrescentado', hint: 'Não está no seu texto. Pode pedir para tirar.', icon: 'add_circle' },
};

export interface SourceLink {
  label: string;
  url: string;
}

export interface GuestSermon {
  id: string;
  author: string;
  /** Texto bíblico do sermão (referência no leitor do app). */
  text: string;
  status: 'revisao' | 'publicado';
  /** Parte secreta do link de revisão do autor (/revisao/<reviewToken>): só quem recebeu o link entra. */
  reviewToken: string;
  /** Número da edição no jornal. */
  edition: number;
  languages: LangCode[];
  /** `hook` é a frase de efeito do próprio texto (a primeira frase em destaque), que vai em dourado na imagem de compartilhar. */
  meta: Record<LangCode, { title: string; deck: string; kicker: string; hook: string; /** O texto-base em poucas letras, em letras grandes na imagem de compartilhar (“Pv 30.15”). */ badge: string }>;
  /** Fontes do que o editor acrescentou (a biologia do quadro, a palavra hebraica). */
  sources: SourceLink[];
  changes: EditorChange[];
}

export const GUEST_SERMONS: GuestSermon[] = [
  {
    id: 'a-sanguessuga',
    author: 'Lucas Silva',
    text: 'Pv 30.15',
    status: 'revisao',
    reviewToken: '8f11d02bac34306e',
    edition: 1,
    languages: ['pt', 'es', 'en', 'fr', 'de', 'ru'],
    meta: {
      pt: { title: 'A Sanguessuga', deck: 'Uma criatura que nunca diz “basta” e o convite de Jesus para quem tem sede', kicker: 'Sermão · Provérbios 30.15', hook: 'A sanguessuga é semelhante ao pecado: nunca diz basta.', badge: 'Pv 30.15' },
      es: { title: 'La Sanguijuela', deck: 'Una criatura que nunca dice «basta» y la invitación de Jesús para quien tiene sed', kicker: 'Sermón · Proverbios 30:15', hook: 'La sanguijuela se parece al pecado: nunca dice basta.', badge: 'Pr 30:15' },
      en: { title: 'The Leech', deck: 'A creature that never says “enough,” and Jesus’ invitation to the thirsty', kicker: 'Sermon · Proverbs 30:15', hook: 'The leech is like sin: it never says enough.', badge: 'Prov 30:15' },
      fr: { title: 'La Sangsue', deck: 'Une créature qui ne dit jamais « assez », et l’invitation de Jésus à ceux qui ont soif', kicker: 'Sermon · Proverbes 30:15', hook: 'La sangsue ressemble au péché : elle ne dit jamais assez.', badge: 'Pr 30:15' },
      de: { title: 'Der Blutegel', deck: 'Ein Geschöpf, das nie „genug“ sagt, und Jesu Einladung an die Durstigen', kicker: 'Predigt · Sprüche 30,15', hook: 'Der Blutegel gleicht der Sünde: Er sagt nie „genug“.', badge: 'Spr 30,15' },
      ru: { title: 'Пиявка', deck: 'Существо, которое никогда не скажет «довольно», и приглашение Иисуса жаждущим', kicker: 'Проповедь · Притчи 30:15', hook: 'Пиявка похожа на грех: она никогда не скажет «довольно».', badge: 'Пр 30:15' },
    },
    sources: [
      { label: 'Hirudo medicinalis: classificação, mandíbulas, saliva e quanto sangue bebe (Wikipédia, em inglês)', url: 'https://en.wikipedia.org/wiki/Hirudo_medicinalis' },
      { label: 'A palavra hebraica de Provérbios 30.15 (léxico de Strong, nº 5936, no BibleHub)', url: 'https://biblehub.com/hebrew/5936.htm' },
    ],
    changes: [
      {
        kind: 'conferir',
        title: 'A ordem dos tópicos',
        original: 'Os números 11, 22, 33 e os “1” e “2” depois dos títulos entre colchetes.',
        now: 'Três partes: I. O que é uma sanguessuga? · II. A sanguessuga é semelhante ao pecado (com os tópicos dos desejos e da figura insaciável) · III. Jesus chama quem teve a visão sugada.',
        why: 'Os números do texto original não deixavam claro onde cada parte começa. Confira se a ordem é a que você pregou.',
      },
      {
        kind: 'conferir',
        title: '“O nome delas já fiz tudo”',
        original: 'O nome delas já fiz tudo: A mãe te suga e as filhas também.',
        now: 'O nome das filhas é o grito de quem nunca se satisfaz. A mãe te suga, e as filhas também.',
        why: 'Em Provérbios 30.15 as filhas se chamam “Dá, Dá”. Não ficou claro o que a primeira frase queria dizer. Se a ideia era outra, diga qual.',
      },
      {
        kind: 'retirado',
        title: 'Sebna e os filhos',
        original: 'Sebna o tesoureiro foi arrastado pra miséria: porque seus filhos o sugaram.',
        why: 'Isaías 22.15-25 mostra Sebna cavando para si uma sepultura em lugar alto (22.16) e sendo demitido do cargo (22.19); não diz que os filhos o sugaram. Quem leva a família “pendurada” é o sucessor, Eliaquim, e o prego acaba cedendo (22.23-25). Se você tem outra fonte para a frase, ela volta com essa fonte.',
      },
      {
        kind: 'ajustado',
        title: '“Toro selvagem sem entendimento”',
        original: 'Diante das revelações de Deus Agur se viu incapaz: como um toro selvagem sem entendimento.',
        now: 'Diante de Deus, vê-se incapaz: não aprendeu a sabedoria nem conhece o Santo (Pv 30.3).',
        why: 'Provérbios 30.2-3 diz que Agur é “mais estúpido do que ninguém” (Almeida) ou “o mais bruto dos homens” (Bíblia Livre), sem o entendimento de um homem. O texto não fala em touro. Se a imagem vem de outro lugar, diga.',
      },
      {
        kind: 'ajustado',
        title: '“Ela só vive se tiver alguém pra sugar”',
        original: 'Ela só vive se tiver alguém pra sugar.',
        now: 'Ela vive do sangue dos outros. Precisa de um hospedeiro.',
        why: 'A sanguessuga-medicinal pode ficar até cerca de um ano sem comer (Wikipédia, verbete Hirudo medicinalis). A ideia, que ela vive à custa de outro, ficou.',
      },
      {
        kind: 'ajustado',
        title: 'Ló e Sodoma',
        original: 'Ló foi atraído pela beleza de Sodoma.',
        now: 'Ló foi atraído pela planície bem regada e acabou armando as tendas até Sodoma (Gn 13.10-12).',
        why: 'O texto diz que Ló viu a planície do Jordão, “toda bem regada”, e só depois chegou a Sodoma.',
      },
      {
        kind: 'ajustado',
        title: '“O corpo cai no chão sem vida”',
        original: 'No final o corpo cai no chão sem vida.',
        now: 'A frase ficou como está, como imagem do pecado.',
        why: 'É uma figura de linguagem: a sanguessuga usada em tratamentos não costuma matar. O texto não afirma o contrário, e a figura é sua.',
      },
      {
        kind: 'ajustado',
        title: 'Mensagem de caráter profético',
        original: 'Agur carrega uma mensagem: de caráter profético.',
        now: 'A ideia ficou, com a observação de que algumas versões traduzem a palavra do original por “oráculo”.',
        why: 'A Almeida do app lê “Massá” como nome de lugar, e a Bíblia Portuguesa Mundial e a Almeida de 1911 traduzem por “oráculo” e “profecia”. Assim o leitor entende de onde vem a sua leitura.',
      },
      {
        kind: 'ajustado',
        title: 'Citações e abreviações',
        original: 'EF 4:18:19, IS: 59:2, SM 42:7, TA 1:14, PV 31:3 (“ao que destrói os reis”).',
        now: 'Ef 4.18-19, Is 59.2, Sl 42.7, Tg 1.14-15, Pv 31.3. As citações entre aspas seguem a Almeida do app, palavra por palavra.',
        why: 'As siglas ficaram no padrão do app (toque no versículo para ler). Tiago 1.14 passou a ir até o 15, que é onde a frase termina. Em Provérbios 31.3 a Almeida do app diz “às que destroem os reis”.',
      },
      {
        kind: 'ajustado',
        title: 'Forma, linguagem e concordância',
        original: 'Frases curtas, numeradas (1, 2, 3), com “pra”, “teu” e “sua” misturados.',
        now: 'Parágrafos e listas numeradas; “para”; “você” e “seu”; verbos e palavras no mesmo número (“pessoas entenebrecidas… se entregaram”). As suas frases foram mantidas, e o jeito direto de falar com quem ouve também (“te chama”, “te suga”).',
        why: 'Para ler como jornal sem perder a voz do sermão. A marca de fim (a fileira de cerquilhas) saiu. Em Provérbios 30.16, “a terra que nunca se farta de água” é o que o versículo diz (antes estava “a terra sem água”).',
      },
      {
        kind: 'acrescentado',
        title: 'Versículos que apoiam o que você disse',
        now: 'Pv 30.14 (gente de dentes como espadas), Pv 30.15-16 (outras coisas que nunca se fartam), Lv 17.11 (“a vida da carne está no sangue”), Pv 14.12 (os caminhos que parecem retos, que você citava sem referência), Jo 7.37 e Lc 15.14-20.',
        why: 'Cada um fica no ponto em que você já falava do assunto. Ninguém é obrigado a abrir: aparecem como referência tocável.',
      },
      {
        kind: 'acrescentado',
        title: 'Quadro “Fatos sobre a sanguessuga” e quatro ilustrações',
        now: 'Um quadro ao lado do primeiro ponto e desenhos da sanguessuga, da mãe com as filhas, do caminho do desejo (Tiago 1) e da fonte e das cisternas (Jeremias 2).',
        why: 'Para ajudar a entender. Os fatos têm fonte (no pé da página) e os desenhos são do app, sem direitos de terceiros. Pode pedir para tirar qualquer um.',
      },
      {
        kind: 'acrescentado',
        title: 'Imagem para compartilhar',
        now: 'Um botão “Compartilhar” gera uma imagem com a ilustração, o texto-base (Pv 30.15), a sua frase “A sanguessuga é semelhante ao pecado: nunca diz basta” e um QR code que abre o sermão (no mesmo idioma) para divulgar o jornal.',
        why: 'Para que quem ler possa mandar o sermão no WhatsApp e no Instagram. Só aparecem o título, o seu nome, o texto-base e a sua frase; o texto do sermão não vai na imagem.',
      },
      {
        kind: 'acrescentado',
        title: 'Traduções para espanhol, inglês, francês, alemão e russo',
        now: 'O sermão pode ser lido e ouvido nesses idiomas.',
        why: 'Foram feitas com apoio de inteligência artificial e não foram revisadas por quem fala cada língua; o próprio texto avisa isso. As citações da Bíblia vêm da versão embutida de cada idioma; por isso, em francês e em russo, o número do Salmo muda (Sl 42.8 e Sl 41.8).',
      },
    ],
  },
];

export const findGuestSermon = (id: string): GuestSermon | undefined => GUEST_SERMONS.find((s) => s.id === id);
export const guestSermonByToken = (token: string): GuestSermon | undefined => GUEST_SERMONS.find((s) => s.reviewToken === token);

/**
 * Quais sermões o app mostra: os publicados; os que ainda esperam a aprovação do autor só aparecem em desenvolvimento (`ng serve`),
 * para o dono do app ver o resultado.
 */
export const visibleGuestSermons = (dev: boolean): GuestSermon[] => GUEST_SERMONS.filter((s) => s.status === 'publicado' || dev);

/** Arquivo do texto de um sermão em uma língua (dentro de public/conteudo). */
export const guestTextPath = (id: string, lang: LangCode): string => (lang === 'pt' ? `vozes/${id}.md` : `vozes/${id}.${lang}.md`);

/** Caminho do link de revisão do autor. */
export const reviewPath = (s: Pick<GuestSermon, 'reviewToken'>): string => `revisao/${s.reviewToken}`;

/** Versão da Bíblia dos versículos: a que a pessoa escolheu, se for desta língua e completa; senão a padrão da língua. */
export function bibleVersionFor(lang: LangCode, selected: string): string {
  const language = findGuestLanguage(lang);
  const chosen = findVersion(selected);
  return chosen && chosen.language === language.bibleLanguage && !chosen.ntOnly && !chosen.partial ? chosen.id : language.bible;
}

/** Marca curta da versão do texto (FNV-1a de 32 bits em hexadecimal): muda quando uma letra muda, e o autor aprova uma versão. */
export function contentVersion(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

/** Minutos de leitura (cerca de 200 palavras por minuto), no mínimo 1. */
export const readingMinutes = (text: string): number => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 200));

export type Decision = 'aprovado' | 'ajustes';

/** A mensagem que o autor manda ao editor (WhatsApp ou cópia) com a decisão sobre uma versão do texto. */
export function approvalMessage(s: GuestSermon, d: { decision: Decision; version: string; name: string; note: string }): string {
  const note = d.note.trim();
  const lines = [
    d.decision === 'aprovado' ? '*Aprovação do sermão*' : '*Pedido de ajustes no sermão*',
    `Sermão: ${s.meta.pt.title}`,
    `Versão do texto: ${d.version}`,
    '',
    d.decision === 'aprovado'
      ? `Eu, ${d.name}, li o texto e autorizo a publicação no app Bíblia Sagrada, com o meu nome.`
      : `Eu, ${d.name}, li o texto e peço estes ajustes antes de publicar:`,
  ];
  if (note) lines.push(d.decision === 'ajustes' ? note : `Observação: ${note}`);
  return lines.join('\n');
}
