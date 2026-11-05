import { GUEST_STRINGS, type GuestSermon, type LangCode } from './guest-sermons';
import type { ShareCard } from './share-card';

/** Fica fora de share-card.ts de propósito: os textos do sermão só podem ir no pacote da página dele, não no pacote inicial do app. */
/** Novas Vozes da Palavra: a ilustração, o texto-base em letras grandes, a frase de efeito do sermão em dourado e o QR code que abre o sermão no mesmo idioma. Só títulos e a frase do autor: o texto do sermão não vai na imagem. */
export function voiceSermonCard(s: GuestSermon, lang: LangCode): ShareCard {
  const m = s.meta[lang];
  const t = GUEST_STRINGS[lang];
  return {
    path: lang === 'pt' ? `/vozes/${s.id}` : `/vozes/${s.id}?idioma=${lang}`,
    theme: t.masthead,
    badge: m.badge,
    title: m.title,
    meta: `${m.kicker.split(' · ')[0]} · ${t.by} ${s.author}`,
    hook: m.hook,
    topics: [],
    cta: t.share.cta,
    tone: '#22332a',
    photo: { src: 'conteudo/imagens/vozes-sanguessuga.jpg', credit: t.share.artCredit, label: t.share.artLabel, focusY: 0.5 },
  };
}
