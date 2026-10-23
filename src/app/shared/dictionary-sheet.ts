import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ContentService } from '../core/content.service';
import { KINDS, LANGS, refsCover } from '../core/dictionary';
import { parseReferences } from '../core/reference-parser';

/** Verbete do dicionário aberto ao tocar numa palavra marcada no texto. */
@Component({
  selector: 'app-dictionary-sheet',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="sheet-handle"></div>
    @if (entry(); as e) {
      <div class="content">
        <span class="kind">{{ kinds[e.kind] }}</span>
        <h2>{{ e.term }}</h2>
        @for (o of e.original ?? []; track o.word) {
          <div class="original">
            <span class="word" [attr.dir]="langs[o.lang].dir" [attr.lang]="o.lang === 'gr' ? 'el' : o.lang">{{ o.word }}</span>
            <span class="meta">
              <span class="lang">{{ langs[o.lang].name }}</span> · <em>{{ o.translit }}</em>
              @if (o.strong) { · <span class="strong">{{ o.strong }}</span> }
            </span>
            <span class="meaning">{{ o.meaning }}</span>
          </div>
        }
        @if (context(); as c) {
          @if (c.sense || c.inflection) {
            <div class="context">
              <span class="ctx-title"><mat-icon>my_location</mat-icon> Neste versículo</span>
              @if (c.inflection; as f) {
                <span class="ctx-form"><span [attr.dir]="langs[f.lang].dir">{{ f.word }}</span> · <em>{{ f.translit }}</em></span>
                <span class="ctx-parsing">{{ f.parsing }}</span>
                @if (f.note) { <span class="ctx-note">{{ f.note }}</span> }
              }
              @if (c.sense; as sn) {
                <span class="ctx-sense">Sentido: <strong>{{ sn.sense }}</strong>@if (sn.note) { — {{ sn.note }} }</span>
              }
            </div>
          }
        }
        <p class="definition">{{ e.definition }}</p>
        @if (e.senses?.length) {
          <p class="senses-title">Sentidos conforme o contexto</p>
          <ul class="senses">
            @for (sn of e.senses; track sn.sense) { <li>{{ sn.sense }} <small>({{ sn.refs.join('; ') }})</small></li> }
          </ul>
        }
        @if (refs().length) {
          <div class="refs">
            @for (r of refs(); track r.label) {
              <a class="chip" [routerLink]="['/ler', r.bookId, r.chapter]" [fragment]="r.from ? 'v' + r.from : undefined">{{ r.text }}</a>
            }
          </div>
        }
        <a mat-stroked-button class="more" [routerLink]="['/dicionario', e.id]"><mat-icon>menu_book</mat-icon> Abrir no dicionário</a>
      </div>
    } @else {
      <p class="content">Carregando…</p>
    }
  `,
  styles: `
    .content { padding: 0 20px 20px; max-height: 75vh; overflow-y: auto; }
    .kind { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: var(--accent-gold); }
    h2 { font: 600 26px/1.2 var(--heading-font); margin: 4px 0 12px; }
    .original {
      display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; margin-bottom: 10px; border-radius: 14px;
      background: var(--mat-sys-surface-container); border: 1px solid var(--mat-sys-outline-variant);
    }
    .word { font: 500 26px/1.3 'Times New Roman', 'Noto Serif Hebrew', 'Noto Serif', serif; }
    .meta { font: 400 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .lang { font-weight: 600; color: var(--mat-sys-primary); }
    .strong { font-weight: 600; }
    .meaning { font: 400 15px/1.5 var(--reading-font); }
    .context {
      display: flex; flex-direction: column; gap: 3px; margin: 10px 0 4px; padding: 12px 14px; border-radius: 14px;
      background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container);
    }
    .ctx-title { display: flex; align-items: center; gap: 6px; font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .8px; }
    .ctx-title mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .ctx-form { font: 500 20px 'Times New Roman', 'Noto Serif Hebrew', serif; }
    .ctx-form em { font: italic 400 15px var(--reading-font); }
    .ctx-parsing { font: 600 14px Inter, sans-serif; }
    .ctx-note, .ctx-sense { font: 400 15px/1.5 var(--reading-font); }
    .senses-title { margin: 8px 0 4px; font: 600 13px Inter, sans-serif; color: var(--accent-gold); text-transform: uppercase; letter-spacing: .8px; }
    .senses { margin: 0 0 14px; padding-left: 20px; font: 400 15px/1.55 var(--reading-font); }
    .senses small { font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .definition { font: 400 16px/1.65 var(--reading-font); margin: 12px 0 14px; }
    .refs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .chip {
      display: inline-flex; align-items: center; min-height: 40px; padding: 0 14px; border-radius: 20px; text-decoration: none;
      border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-primary); font: 600 13px Inter, sans-serif;
    }
    .more { width: 100%; height: 46px; }
  `,
})
export class DictionarySheet {
  private readonly data = inject<{ id: string; verse?: { bookId: string; chapter: number; verse: number } }>(MAT_BOTTOM_SHEET_DATA);
  private readonly id = this.data.id;
  private readonly all = toSignal(inject(ContentService).dictionary, { initialValue: [] });
  protected readonly kinds = KINDS;
  protected readonly langs = LANGS;
  protected readonly entry = computed(() => this.all().find((e) => e.id === this.id));
  /** O sentido e a forma usados no versículo em que a palavra foi tocada. */
  protected readonly context = computed(() => {
    const e = this.entry();
    const at = this.data.verse;
    if (!e || !at) return null;
    const parse = (r: string) => parseReferences(r).refs;
    return {
      sense: e.senses?.find((s) => refsCover(s.refs, parse, at)),
      inflection: e.inflections?.find((f) => refsCover([f.ref], parse, at)),
    };
  });

  protected readonly refs = computed(() =>
    (this.entry()?.refs ?? []).flatMap((text) => parseReferences(text).refs.slice(0, 1).map((r) => ({ ...r, text }))),
  );
}
