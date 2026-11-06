import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { DictionaryEntry } from './dictionary';
import { HarpaData } from './harpa';
import { Person } from './memorial';
import { Prophecy } from './prophecy';

/** Citação ou alusão do Antigo Testamento no Novo (curada). */
export interface Quotation {
  nt: string;
  ot: string;
  type: 'citacao' | 'alusao' | 'tema';
  note: string;
}

/** Introdução e contexto histórico de um livro da Bíblia. */
export interface BookIntro {
  author: string;
  date: string;
  audience?: string;
  context: string;
  purpose: string;
  themes: string[];
  keyVerse: string;
}

/** Nota de estudo de um trecho do capítulo. */
export interface ChapterNote {
  /** Versículos: "1", "1-5". */
  v: string;
  title: string;
  text: string;
}

/**
 * Conteúdo de estudo (dicionário, contexto dos livros, memorial, artigos e sermões).
 * Fica em public/conteudo e é guardado pelo service worker: funciona offline.
 */
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);
  private readonly cache = new Map<string, Observable<unknown>>();

  readonly dictionary = this.json<DictionaryEntry[]>('dicionario.json', []);
  readonly bookIntros = this.json<Record<string, BookIntro>>('livros.json', {});
  readonly chapterNotes = this.json<Record<string, ChapterNote[]>>('notas.json', {});
  readonly memorial = this.json<Person[]>('memorial.json', []);
  readonly prophecies = this.json<Prophecy[]>('profecias.json', []);
  readonly quotations = this.json<Quotation[]>('citacoes.json', []);
  readonly harpa = this.json<HarpaData>('harpa.json', { hymns: [], people: {} });

  intro(bookId: string): Observable<BookIntro | null> {
    return this.bookIntros.pipe(map((all) => all[bookId] ?? null));
  }

  notes(bookId: string, chapter: number): Observable<ChapterNote[]> {
    return this.chapterNotes.pipe(map((all) => all[`${bookId} ${chapter}`] ?? []));
  }

  /** Texto (Markdown simples) de um artigo ou sermão. */
  text(path: string): Observable<string | null> {
    return this.load(path, () => this.http.get(`conteudo/${path}`, { responseType: 'text' }), null);
  }

  private json<T>(file: string, fallback: T): Observable<T> {
    return this.load(file, () => this.http.get<T>(`conteudo/${file}`), fallback);
  }

  private load<T>(key: string, request: () => Observable<T>, fallback: T): Observable<T> {
    let source = this.cache.get(key) as Observable<T> | undefined;
    if (!source) {
      source = request().pipe(
        catchError(() => {
          this.cache.delete(key);
          return of(fallback);
        }),
        shareReplay(1),
      );
      this.cache.set(key, source);
    }
    return source;
  }
}
