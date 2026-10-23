import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, combineLatest, map, Observable, of, shareReplay } from 'rxjs';
import { findBook } from './books';
import { ContentService, Quotation } from './content.service';
import { ParsedRef, parseReferences } from './reference-parser';

export const LINK_TYPES: Record<Quotation['type'] | 'relacionado', string> = {
  citacao: 'Citação direta',
  alusao: 'Alusão',
  tema: 'Relação de tema',
  relacionado: 'Texto relacionado',
};

export interface CrossLink {
  type: keyof typeof LINK_TYPES;
  /** Texto para o leitor de referências ("Hb 11.3"). */
  refs: string;
  /** Rótulo legível ("Hebreus 11:3"). */
  label: string;
  note?: string;
  /** No AT: o texto é citado no NT; no NT: a fonte no AT. */
  direction?: 'citado-em' | 'cita';
}

const covers = (ref: ParsedRef, bookId: string, chapter: number, verse: number) =>
  ref.bookId === bookId && ref.chapter === chapter && (ref.from === undefined || (verse >= ref.from && verse <= (ref.to ?? ref.from)));

/** "HEB.11.3-5" → { refs: "Hb 11.3-5", label: "Hebreus 11:3-5" } */
function fromCode(code: string): { refs: string; label: string } | null {
  const [bookId, chapter, verses] = code.split('.');
  const book = findBook(bookId);
  return book ? { refs: `${book.abbrev} ${chapter}.${verses}`, label: `${book.name} ${chapter}:${verses}` } : null;
}

const labelOf = (text: string) => parseReferences(text).refs.map((r) => r.label).join('; ');

/**
 * Referências cruzadas de um versículo: primeiro as citações e alusões curadas (com explicação),
 * depois os textos relacionados da base aberta da OpenBible.info (CC BY), por votos.
 */
@Injectable({ providedIn: 'root' })
export class CrossReferencesService {
  private readonly http = inject(HttpClient);
  private readonly content = inject(ContentService);
  private readonly books = new Map<string, Observable<Record<string, string[]>>>();

  /** Citações já interpretadas (uma vez só). */
  private readonly quotations = this.content.quotations.pipe(
    map((list) => list.map((q) => ({ ...q, ntRefs: parseReferences(q.nt).refs, otRefs: parseReferences(q.ot).refs }))),
    shareReplay(1),
  );

  forVerse(bookId: string, chapter: number, verse: number): Observable<CrossLink[]> {
    const curated$ = this.quotations.pipe(
      map((list) =>
        list.flatMap((q): CrossLink[] => {
          if (q.ntRefs.some((r) => covers(r, bookId, chapter, verse))) {
            return [{ type: q.type, refs: q.ot, label: labelOf(q.ot), note: q.note, direction: 'cita' }];
          }
          if (q.otRefs.some((r) => covers(r, bookId, chapter, verse))) {
            return [{ type: q.type, refs: q.nt, label: labelOf(q.nt), note: q.note, direction: 'citado-em' }];
          }
          return [];
        }),
      ),
    );
    const related$ = this.book(bookId).pipe(map((all) => all[`${chapter}:${verse}`] ?? []));
    return combineLatest([curated$, related$]).pipe(
      map(([curated, codes]) => {
        const seen = new Set(curated.flatMap((c) => parseReferences(c.refs).refs.map((r) => `${r.bookId}.${r.chapter}.${r.from}`)));
        const related = codes
          .map(fromCode)
          .filter((x): x is { refs: string; label: string } => !!x)
          .filter((x) => {
            const r = parseReferences(x.refs).refs[0];
            return r && !seen.has(`${r.bookId}.${r.chapter}.${r.from}`);
          })
          .map((x): CrossLink => ({ type: 'relacionado', ...x }));
        return [...curated, ...related];
      }),
    );
  }

  private book(bookId: string): Observable<Record<string, string[]>> {
    let source = this.books.get(bookId);
    if (!source) {
      source = this.http.get<Record<string, string[]>>(`bible/referencias/${bookId}.json`).pipe(
        catchError(() => {
          this.books.delete(bookId);
          return of({});
        }),
        shareReplay(1),
      );
      this.books.set(bookId, source);
    }
    return source;
  }
}
