import { ListenItem } from '../core/listen.service';

/** O que o "Ouvir" não lê numa história: cartões de personagens, fontes e atalhos. */
const STORY_SKIP = '.people, .read, .sources, .toc, .timeline, .chain, .facts, .era-map, app-send-chain';
/** O que o "Ouvir" não lê num jornal de Novas Vozes: a frase em destaque (repete o texto) e o aviso de versículo que não carregou. */
const NEWS_SKIP = '.pull, .missing';

/** O texto de um trecho do jornal como se fala: sem o algarismo romano dos títulos nem os números dos versículos, e com as referências por extenso. */
function spokenText(el: HTMLElement): string {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('.num, sup').forEach((n) => n.remove());
  clone.querySelectorAll<HTMLElement>('.ref[data-say]').forEach((n) => (n.textContent = n.dataset['say'] ?? n.textContent));
  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Os trechos de uma história que o botão "Ouvir" lê, na ordem da tela: títulos, parágrafos, citações e listas
 * do texto (sem cartões de personagens, fontes e atalhos). O mesmo conjunto que tools/gerar-audio.mjs grava.
 * Com `root`, lê outro texto da tela (o jornal de Novas Vozes, `app-news-text`), pelas mesmas regras de trechos.
 */
export function storyItems(intro: string, options: { root?: string } = {}): ListenItem[] {
  const news = !!options.root;
  const body = document.querySelector(options.root ?? 'app-rich-text');
  if (!body) return [];
  const wanted = [...body.querySelectorAll<HTMLElement>('h2, h3, p, blockquote, ul:not(.people) > li, ol:not(.timeline) > li')]
    .filter((el) => !el.closest(news ? NEWS_SKIP : STORY_SKIP));
  // Quem contém outro trecho da lista (uma citação com parágrafo dentro) fica de fora, para não ler duas vezes
  const leaves = wanted.filter((el) => !wanted.some((other) => other !== el && el.contains(other)));
  return [
    { text: intro },
    ...leaves.map((el) => ({ el, text: news ? spokenText(el) : (el.textContent ?? '').replace(/\s+/g, ' ').trim() })).filter((i) => i.text),
  ];
}
