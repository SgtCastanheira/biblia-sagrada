import { BackButton } from '../../shared/back-button';
import { Component, computed, effect, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { KINDS, LANGS } from '../../core/dictionary';
import { Sheets } from '../../shared/sheets';
import { SourcesBox } from '../../shared/sources-box';

/** Verbete completo do dicionário. */
@Component({
  selector: 'app-dictionary-entry',
  imports: [BackButton, RouterLink, MatButtonModule, MatIconModule, SourcesBox],
  template: `
    @if (entry(); as e) {
      <div class="article">
        <div class="top">
          <app-back fallback="/dicionario" />
        </div>
        <span class="overline">{{ kinds[e.kind] }}</span>
        <h1 class="title">{{ e.term }}</h1>

        @for (o of e.original ?? []; track o.word) {
          <div class="original card">
            <span class="word" [attr.dir]="langs[o.lang].dir">{{ o.word }}</span>
            <span class="translit">{{ o.translit }}</span>
            <span class="meta">{{ langs[o.lang].name }}@if (o.strong) { · Strong {{ o.strong }} }</span>
            <span class="meaning">{{ o.meaning }}</span>
          </div>
        }

        <p class="definition">{{ e.definition }}</p>

        @if (e.senses?.length) {
          <h2 class="section-title">Sentidos conforme o contexto</h2>
          <div class="senses">
            @for (sn of e.senses; track sn.sense; let i = $index) {
              <article class="card sense">
                <span class="n">{{ i + 1 }}</span>
                <div>
                  <h3>{{ sn.sense }}</h3>
                  @if (sn.note) { <p>{{ sn.note }}</p> }
                  <div class="mini-refs">
                    @for (r of sn.refs; track r) { <button (click)="openRef(r)">{{ r }}</button> }
                  </div>
                </div>
              </article>
            }
          </div>
        }

        @if (e.inflections?.length) {
          <h2 class="section-title">Formas no texto original</h2>
          <p class="hint">Como a palavra aparece em versículos conhecidos, com a análise gramatical. Veja o guia <a routerLink="/artigo/idiomas-da-biblia">Como ler as palavras originais</a>.</p>
          <div class="inflections">
            @for (f of e.inflections; track f.word + f.ref) {
              <article class="card inflection">
                <div class="inf-top">
                  <span class="inf-word" [attr.dir]="langs[f.lang].dir">{{ f.word }}</span>
                  <button class="inf-ref" (click)="openRef(f.ref)">{{ f.ref }}</button>
                </div>
                <span class="inf-translit">{{ f.translit }} · “{{ f.gloss }}”</span>
                <span class="inf-parsing">{{ f.parsing }}</span>
                @if (f.note) { <p>{{ f.note }}</p> }
              </article>
            }
          </div>
        }

        @if (e.refs?.length) {
          <h2 class="section-title">Na Bíblia</h2>
          <div class="refs">
            @for (r of e.refs; track r) {
              <button (click)="openRef(r)">{{ r }}</button>
            }
          </div>
        }

        @if (related().length) {
          <h2 class="section-title">Veja também</h2>
          <nav class="chips">
            @for (r of related(); track r.id) {
              <a [routerLink]="['/dicionario', r.id]">{{ r.term }}</a>
            }
          </nav>
        }

        @if (e.forms?.length) {
          <a mat-stroked-button class="search" [routerLink]="['/busca']" [queryParams]="{ q: e.forms![0] }">
            <mat-icon>search</mat-icon> Procurar “{{ e.forms![0] }}” na Bíblia
          </a>
        }

        <p class="source">Números de Strong: índice das palavras hebraicas e gregas da Bíblia, de James Strong (1890). Ajudam a achar a mesma palavra original em outros dicionários e concordâncias.</p>
      </div>
    } @else if (all()) {
      <p class="empty">Verbete não encontrado.</p>
    } @else {
      <div class="skeleton"><span></span><span></span><span class="short"></span></div>
    }
    <app-sources topic="dicionario" />
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .original { display: flex; flex-direction: column; gap: 2px; padding: 16px 18px; margin-bottom: 10px; border-radius: 18px; }
    .word { font: 500 34px/1.3 'Times New Roman', 'Noto Serif Hebrew', 'Noto Serif', serif; }
    .translit { font: italic 400 18px var(--reading-font); color: var(--mat-sys-primary); }
    .meta { font: 600 13px Inter, sans-serif; color: var(--accent-gold); letter-spacing: .3px; }
    .meaning { margin-top: 4px; font: 400 16px/1.55 var(--reading-font); }
    .definition { font: 400 17px/1.75 var(--reading-font); margin: 14px 0 6px; }
    .hint { margin: 0 0 10px; font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .hint a { color: var(--mat-sys-primary); }
    .senses, .inflections { display: flex; flex-direction: column; gap: 8px; }
    .sense { display: flex; gap: 12px; padding: 12px 14px; border-radius: 16px; }
    .sense .n {
      flex: none; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
      background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); font: 600 14px Inter, sans-serif;
    }
    .sense h3 { margin: 2px 0; font: 600 16px var(--heading-font); }
    .sense p, .inflection p { margin: 2px 0 4px; font: 400 15px/1.55 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .mini-refs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
    .mini-refs button, .inf-ref {
      min-height: 36px; padding: 0 12px; border-radius: 18px; cursor: pointer; background: none;
      border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-primary); font: 600 13px Inter, sans-serif;
    }
    .inflection { display: flex; flex-direction: column; gap: 2px; padding: 12px 14px; border-radius: 16px; }
    .inf-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .inf-word { font: 500 24px 'Times New Roman', 'Noto Serif Hebrew', serif; }
    .inf-translit { font: italic 400 15px var(--reading-font); color: var(--mat-sys-primary); }
    .inf-parsing { font: 600 13px Inter, sans-serif; color: var(--accent-gold); }
    .refs { display: flex; flex-wrap: wrap; gap: 8px; }
    .refs button {
      height: 40px; padding: 0 14px; border-radius: 20px; cursor: pointer; background: none;
      border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif;
    }
    .search { margin-top: 18px; width: 100%; height: 48px; }
  `,
})
export class DictionaryEntryPage {
  readonly id = input.required<string>();
  private readonly sheets = inject(Sheets);
  protected readonly all = toSignal(inject(ContentService).dictionary);
  protected readonly kinds = KINDS;
  protected readonly langs = LANGS;

  protected readonly entry = computed(() => this.all()?.find((e) => e.id === this.id()));
  protected readonly related = computed(() =>
    (this.entry()?.see ?? []).map((id) => this.all()?.find((e) => e.id === id)).filter((e) => !!e),
  );

  constructor() {
    const title = inject(Title);
    effect(() => {
      const e = this.entry();
      if (e) title.setTitle(`${e.term} · Dicionário bíblico`);
    });
  }

  protected openRef(ref: string): void {
    this.sheets.passage(ref);
  }
}
