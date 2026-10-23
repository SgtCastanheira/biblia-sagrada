import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { BibleService } from './bible.service';
import { BOOKS } from './books';
import { Testament } from './models';

export interface SearchHit {
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  /** Trechos do texto, marcando os que coincidem com a busca. */
  parts: { text: string; match: boolean }[];
}

interface IndexedVerse {
  bookId: string;
  testament: Testament;
  chapter: number;
  verse: number;
  text: string;
  plain: string;
}

const SEARCH_VERSION = 'almeida';

/** Remove acentos e põe em minúsculas, mantendo o mesmo comprimento do texto. */
const plain = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Busca por palavras no texto embutido da Almeida (funciona offline). */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly bible = inject(BibleService);
  private index: IndexedVerse[] | null = null;
  private loading: Promise<void> | null = null;

  readonly progress = signal(0);
  readonly ready = signal(false);

  load(): Promise<void> {
    this.loading ??= (async () => {
      if (!(await firstValueFrom(this.bible.hasLocal(SEARCH_VERSION)))) {
        throw new Error('A Bíblia embutida ainda não está disponível neste build.');
      }
      const verses: IndexedVerse[] = [];
      let loaded = 0;
      // Carrega os livros em pequenos lotes (os arquivos ficam em cache para uso offline)
      for (let i = 0; i < BOOKS.length; i += 8) {
        const batch = BOOKS.slice(i, i + 8);
        const books = await Promise.all(batch.map((b) => firstValueFrom(this.bible.getBook(SEARCH_VERSION, b.id))));
        books.forEach((chapters, j) => {
          const book = batch[j];
          chapters.forEach((list, c) =>
            list.forEach(([verse, text]) =>
              verses.push({ bookId: book.id, testament: book.testament, chapter: c + 1, verse, text, plain: plain(text.normalize('NFC')) }),
            ),
          );
        });
        loaded += batch.length;
        this.progress.set(Math.round((loaded / BOOKS.length) * 100));
      }
      this.index = verses;
      this.ready.set(true);
    })().catch((err) => {
      this.loading = null;
      throw err;
    });
    return this.loading;
  }

  /**
   * Busca todas as palavras (em qualquer ordem) ou uma frase exata entre aspas.
   * Ignora acentos e maiúsculas.
   */
  search(query: string, testament: Testament | null): { total: number; hits: SearchHit[] } {
    if (!this.index) return { total: 0, hits: [] };
    const q = plain(query.trim());
    const phrase = q.match(/^"(.+)"$/)?.[1];
    const terms = phrase ? [phrase] : q.split(/\s+/).filter((t) => t.length >= 2);
    if (!terms.length) return { total: 0, hits: [] };

    const hits: SearchHit[] = [];
    let total = 0;
    for (const v of this.index) {
      if (testament && v.testament !== testament) continue;
      if (!terms.every((t) => v.plain.includes(t))) continue;
      total++;
      if (hits.length < 300) hits.push({ ...v, parts: this.highlight(v, terms) });
    }
    return { total, hits };
  }

  private highlight(v: IndexedVerse, terms: string[]): SearchHit['parts'] {
    const marks = new Array<boolean>(v.text.length).fill(false);
    for (const term of terms) {
      let i = v.plain.indexOf(term);
      while (i >= 0) {
        for (let k = i; k < i + term.length; k++) marks[k] = true;
        i = v.plain.indexOf(term, i + term.length);
      }
    }
    const parts: SearchHit['parts'] = [];
    for (let i = 0; i < v.text.length; i++) {
      const last = parts.at(-1);
      if (last && last.match === marks[i]) last.text += v.text[i];
      else parts.push({ text: v.text[i], match: marks[i] });
    }
    return parts;
  }
}
