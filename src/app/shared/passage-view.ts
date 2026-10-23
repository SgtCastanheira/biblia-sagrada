import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { catchError, combineLatest, debounceTime, map, of, startWith, switchMap } from 'rxjs';
import { BibleService } from '../core/bible.service';
import { parseReferences, ParsedRef } from '../core/reference-parser';
import { Verse } from '../core/models';
import { SettingsService } from '../core/settings.service';

const COLLAPSED_VERSES = 6;

interface LoadedPassage {
  ref: ParsedRef;
  verses: Verse[] | null;
}

/** Mostra o texto bíblico de uma ou mais referências digitadas ("Js 6.1-20; Hb 11.30"). */
@Component({
  selector: 'app-passage-view',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    @for (error of state().errors; track error) {
      <p class="error"><mat-icon>error_outline</mat-icon> Não reconheci “{{ error }}”. Use, por exemplo: Js 6.1-20</p>
    }
    @if (state().loading) {
      <div class="skeleton"><span></span><span></span><span class="short"></span></div>
    } @else {
      @for (p of state().items; track p.ref.label) {
        <figure class="passage">
          @if (p.verses?.length) {
            <blockquote class="reading-font">
              @for (v of visible(p); track v.verse) {
                <sup>{{ v.verse }}</sup>{{ v.text }}
              }
            </blockquote>
            @if (p.verses!.length > collapsedCount && !expanded().has(p.ref.label)) {
              <button class="more" (click)="expand(p.ref.label)">
                Mostrar mais {{ p.verses!.length - collapsedCount }} versículos <mat-icon>expand_more</mat-icon>
              </button>
            }
          } @else {
            <blockquote class="unavailable">Trecho não disponível nesta versão.</blockquote>
          }
          <figcaption>
            <span>{{ p.ref.label }}</span>
            <a mat-button [routerLink]="['/ler', p.ref.bookId, p.ref.chapter]" [fragment]="p.ref.from ? 'v' + p.ref.from : undefined">
              Abrir <mat-icon iconPositionEnd>arrow_forward</mat-icon>
            </a>
          </figcaption>
        </figure>
      }
    }
  `,
  styles: `
    :host { display: block; }
    .error { display: flex; align-items: center; gap: 6px; margin: 6px 0; font: var(--mat-sys-body-small); color: var(--mat-sys-error); }
    .error mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .passage {
      margin: 10px 0 0; padding: 16px 16px 4px; border-radius: 16px;
      background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant);
      border-left: 3px solid var(--accent-gold);
    }
    blockquote { margin: 0; font-size: 16px; line-height: 1.7; }
    .unavailable { color: var(--mat-sys-on-surface-variant); font: var(--mat-sys-body-medium); }
    sup { font: 600 .64em Inter, sans-serif; color: var(--accent-gold); margin: 0 3px 0 4px; }
    .more {
      display: inline-flex; align-items: center; gap: 2px; margin-top: 6px; padding: 0; border: 0; background: none; cursor: pointer;
      font: 500 13px Inter, sans-serif; color: var(--mat-sys-primary);
    }
    .more mat-icon { font-size: 18px; width: 18px; height: 18px; }
    figcaption { display: flex; align-items: center; justify-content: space-between; margin-right: -8px; }
    figcaption span { font: 600 13px Inter, sans-serif; color: var(--mat-sys-primary); }
    .skeleton { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }
    .skeleton span { height: 14px; border-radius: 7px; background: var(--mat-sys-surface-container); animation: pulse 1.2s ease-in-out infinite; }
    .skeleton .short { width: 60%; }
    @keyframes pulse { 50% { opacity: .5; } }
  `,
})
export class PassageView {
  readonly refs = input.required<string>();

  private readonly bible = inject(BibleService);
  private readonly settings = inject(SettingsService);
  protected readonly collapsedCount = COLLAPSED_VERSES;
  protected readonly expanded = signal(new Set<string>());
  // Só interpreta depois que a pessoa para de digitar
  protected readonly state = toSignal(
    toObservable(computed(() => ({ text: this.refs(), version: this.settings.version() }))).pipe(
      debounceTime(500),
      switchMap(({ text, version }) => {
        const { refs, errors } = parseReferences(text);
        if (!refs.length) return of({ loading: false, errors, items: [] as LoadedPassage[] });
        const requests = refs.map((ref) =>
          this.bible.getChapter(version, ref.bookId, ref.chapter).pipe(
            map((verses) =>
              ref.from === undefined ? verses : verses.filter((v) => v.verse >= ref.from! && v.verse <= (ref.to ?? ref.from!)),
            ),
            catchError(() => of(null)),
            map((verses): LoadedPassage => ({ ref, verses })),
          ),
        );
        return combineLatest(requests).pipe(
          map((items) => ({ loading: false, errors, items })),
          startWith({ loading: true, errors: [] as string[], items: [] as LoadedPassage[] }),
        );
      }),
    ),
    { initialValue: { loading: true, errors: [] as string[], items: [] as LoadedPassage[] } },
  );

  protected visible(p: LoadedPassage): Verse[] {
    const verses = p.verses ?? [];
    return this.expanded().has(p.ref.label) ? verses : verses.slice(0, COLLAPSED_VERSES);
  }

  protected expand(label: string): void {
    this.expanded.update((set) => new Set(set).add(label));
  }
}
