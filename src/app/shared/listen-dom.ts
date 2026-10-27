import { ListenItem } from '../core/listen.service';

/**
 * Os trechos de uma história que o botão "Ouvir" lê, na ordem da tela: títulos, parágrafos, citações e listas
 * do texto (sem cartões de personagens, fontes e atalhos). O mesmo conjunto que tools/gerar-audio.mjs grava.
 */
export function storyItems(intro: string): ListenItem[] {
  const body = document.querySelector('app-rich-text');
  if (!body) return [];
  const wanted = [...body.querySelectorAll<HTMLElement>('h2, h3, p, blockquote, ul:not(.people) > li, ol:not(.timeline) > li')]
    .filter((el) => !el.closest('.people, .read, .sources, .toc, .timeline, .chain, .facts, .era-map, app-send-chain'));
  // Quem contém outro trecho da lista (uma citação com parágrafo dentro) fica de fora, para não ler duas vezes
  const leaves = wanted.filter((el) => !wanted.some((other) => other !== el && el.contains(other)));
  return [
    { text: intro },
    ...leaves.map((el) => ({ el, text: (el.textContent ?? '').replace(/\s+/g, ' ').trim() })).filter((i) => i.text),
  ];
}
