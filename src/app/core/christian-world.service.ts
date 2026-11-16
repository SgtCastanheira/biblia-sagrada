import { Injectable, signal } from '@angular/core';
import {
  NEWS_CACHE_URL, NEWS_SOURCES, PROXIES, fromRss2Json, fromWordPress, mergeNews, parseCache, safeUrl, toNewsItem,
  type NewsCache, type NewsItem, type NewsSource, type RawEntry,
} from './christian-world';

/** Quanto esperar cada serviço antes de passar para o próximo. */
const TIMEOUT_MS = 12_000;

/**
 * Mundo Cristão: busca as notícias ao vivo no navegador (a cada abertura e a cada 5 min, quem chama é a tela) e, se uma
 * fonte não responder, completa com o resumo diário salvo pelo GitHub Actions (data/noticias.json). Nada é inventado:
 * só aparece o que veio de um feed ou do arquivo de reserva.
 */
@Injectable({ providedIn: 'root' })
export class ChristianWorldService {
  readonly items = signal<NewsItem[]>([]);
  /** `loading`: primeira busca; `ready`: há notícias; `empty`: nenhuma fonte nem a reserva trouxe algo. */
  readonly state = signal<'idle' | 'loading' | 'ready' | 'empty'>('idle');
  /** `live`: lido agora das fontes; `cache`: só o resumo salvo (sem internet ou fontes fora do ar). */
  readonly origin = signal<'live' | 'cache' | null>(null);
  /** Momento da última leitura ao vivo, ou o do resumo salvo quando a origem é `cache`. */
  readonly updatedAt = signal<number | null>(null);
  /** Fontes que não responderam ao vivo (as notícias delas, se houver, vêm do resumo salvo). */
  readonly failed = signal<string[]>([]);
  readonly refreshing = signal(false);
  private running = false;

  async load(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.refreshing.set(true);
    if (!this.items().length) this.state.set('loading');
    try {
      const results = await Promise.all(
        NEWS_SOURCES.map((source) => this.readLive(source).then((list) => ({ source, list }), () => ({ source, list: null }))),
      );
      const answered = results.filter((r) => r.list !== null);
      const failed = results.filter((r) => r.list === null).map((r) => r.source.name);
      const live = mergeNews(answered.map((r) => r.list as NewsItem[]));

      let cache: NewsCache | null = null;
      if (failed.length || !live.length) cache = await this.readCache();

      if (answered.length && live.length) {
        // Ao vivo; as fontes que falharam entram pelo resumo salvo
        const extra = cache ? cache.itens.filter((i) => failed.includes(i.fonte)) : [];
        this.items.set(mergeNews([live, extra]));
        this.origin.set('live');
        this.updatedAt.set(Date.now());
        this.failed.set(failed);
        this.state.set('ready');
      } else if (cache?.itens.length) {
        this.items.set(mergeNews([cache.itens]));
        this.origin.set('cache');
        this.updatedAt.set(Date.parse(cache.geradoEm) || null);
        this.failed.set(failed);
        this.state.set('ready');
      } else if (!this.items().length) {
        this.state.set('empty');
      }
      // Sem nada de novo e com notícias já na tela: elas ficam
    } finally {
      this.running = false;
      this.refreshing.set(false);
    }
  }

  /** Lê uma fonte ao vivo. Rejeita se nenhum caminho funcionar (a lista vazia de um feed que respondeu é um resultado). */
  private async readLive(source: NewsSource): Promise<NewsItem[]> {
    const entries = source.kind === 'wp' ? fromWordPress(await this.getJson(source.url)) : await this.readFeed(source.url);
    return entries.map((e) => toNewsItem(e, source)).filter((i): i is NewsItem => !!i);
  }

  /** Feed RSS: tenta cada proxy, na ordem, até um responder. */
  private async readFeed(feed: string): Promise<RawEntry[]> {
    for (const proxy of PROXIES) {
      try {
        const url = proxy.url(feed);
        if (proxy.kind === 'json') {
          const json = await this.getJson(url);
          if ((json as { status?: string })?.status === 'ok') return fromRss2Json(json);
        } else {
          const entries = parseFeedXml(await this.getText(url));
          if (entries) return entries;
        }
      } catch {
        // Este serviço está fora do ar: tenta o próximo
      }
    }
    throw new Error(`Nenhum serviço leu ${feed}`);
  }

  private async readCache(): Promise<NewsCache | null> {
    try {
      const resposta = await fetch(NEWS_CACHE_URL, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      return resposta.ok ? parseCache(await resposta.json()) : null;
    } catch {
      return null;
    }
  }

  private async getText(url: string): Promise<string> {
    const resposta = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
    return resposta.text();
  }

  private async getJson(url: string): Promise<unknown> {
    return JSON.parse(await this.getText(url));
  }
}

/** XML de um feed RSS ou Atom → entradas; null se não for um feed. */
function parseFeedXml(xml: string): RawEntry[] | null {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  if (doc.querySelector('parsererror')) return null;
  const nodes = Array.from(doc.querySelectorAll('item, entry'));
  if (!nodes.length && !doc.querySelector('channel, feed')) return null;
  const text = (node: Element, ...names: string[]) => {
    for (const name of names) {
      const found = node.getElementsByTagName(name)[0];
      if (found?.textContent?.trim()) return found.textContent.trim();
    }
    return '';
  };
  return nodes.map((node) => {
    const atomLink = node.querySelector('link[href]')?.getAttribute('href');
    const enclosure = node.getElementsByTagName('media:content')[0] ?? node.getElementsByTagName('media:thumbnail')[0] ?? node.querySelector('enclosure[type^="image"]');
    return {
      title: text(node, 'title'),
      link: text(node, 'link') || atomLink || '',
      date: text(node, 'pubDate', 'published', 'updated', 'dc:date'),
      html: text(node, 'content:encoded', 'description', 'content', 'summary'),
      image: safeUrl(enclosure?.getAttribute('url')) ?? '',
      categories: Array.from(node.getElementsByTagName('category')).map((c) => c.textContent?.trim() ?? '').filter(Boolean),
    };
  });
}
