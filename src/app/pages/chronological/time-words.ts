import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { TIME_CAUTION, TIME_COMPARES, TIME_WORDS } from '../../core/time-words';
import { Sheets } from '../../shared/sheets';

/** “Os nomes do tempo”: cronos, kairós e as outras palavras que a Bíblia usa para tempo, em blocos, com os versículos onde aparecem. */
@Component({
  selector: 'app-time-words',
  imports: [MatIconModule, MatRippleModule],
  template: `
    <section class="words" aria-labelledby="tw-title">
      <h2 id="tw-title">Os Nomes do Tempo</h2>
      <p class="hint">
        A Bíblia não tem uma palavra só para tempo. O Novo Testamento, em grego, usa várias, e as mais conhecidas são <strong>cronos</strong>, <strong>kairós</strong>, <strong>aion</strong> e
        <strong>hora</strong>; o Antigo, em hebraico, tem <strong>et</strong>, <strong>zeman</strong>, <strong>moed</strong> e <strong>olam</strong>. Esta página ordena os capítulos por
        cronos, pela sucessão dos fatos; kairós é o tempo certo, o momento que o texto marca.
      </p>

      @for (group of groups(); track group.lang) {
        <h3 class="sub">{{ group.title }}</h3>
        <div class="grid">
          @for (w of group.words; track w.id) {
            <article class="card" [class.he]="w.lang === 'hebraico'">
              <header>
                <span class="script" [attr.lang]="w.lang === 'grego' ? 'el' : 'he'" [attr.dir]="w.lang === 'hebraico' ? 'rtl' : null">{{ w.script }}</span>
                <span class="meta"><strong>{{ w.translit }}</strong><small>{{ w.strong }}</small></span>
              </header>
              <p class="short">{{ w.short }}</p>
              <p class="text">{{ w.text }}</p>
              <ul class="verses">
                @for (v of w.verses; track v.ref) {
                  <li>
                    <button type="button" class="ref" matRipple (click)="open(v.ref)">{{ v.ref }}</button>
                    <span class="said">“{{ v.almeida }}”</span>
                    @if (v.note) { <small class="vnote">{{ v.note }}</small> }
                  </li>
                }
              </ul>
            </article>
          }
        </div>
      }

      <h3 class="sub">Lado a Lado</h3>
      <div class="compare">
        @for (c of compares; track c.id) {
          <article class="cmp">
            <h4>{{ c.title }}</h4>
            <p>{{ c.text }}</p>
            <div class="refs">
              @for (r of c.refs; track r) { <button type="button" class="ref" matRipple (click)="open(r)">{{ r }}</button> }
            </div>
          </article>
        }
      </div>

      <p class="caution"><mat-icon>info</mat-icon><span>{{ caution }}</span></p>
    </section>
  `,
  styles: `
    :host { display: block; scroll-margin-top: 72px; }
    .words { margin-top: 22px; padding: 16px 16px 14px; border-radius: 20px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); box-shadow: var(--shadow-soft); }
    h2 { margin: 0 0 2px; font: 600 20px/1.25 var(--heading-font); }
    .hint { margin: 0 0 4px; font: 400 14px/1.6 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .hint strong { color: var(--mat-sys-on-surface); font-weight: 600; }
    .sub { margin: 18px 0 8px; font: 600 16px var(--heading-font); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 232px), 1fr)); gap: 10px; }
    .card { display: flex; flex-direction: column; gap: 4px; padding: 14px 14px 12px; border-radius: 16px; background: var(--mat-sys-surface); border: 1px solid var(--mat-sys-outline-variant); border-top: 4px solid var(--accent-gold); }
    .card.he { border-top-color: var(--mat-sys-primary); }
    header { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
    .script { font: 400 34px/1.2 'Source Serif 4', 'Times New Roman', serif; color: var(--mat-sys-on-surface); }
    .card.he .script { font-family: 'Ezra SIL', 'SBL Hebrew', 'Times New Roman', serif; }
    .meta { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.3; }
    .meta strong { font: 600 15px Inter, sans-serif; color: var(--mat-sys-on-surface); }
    .meta small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .short { margin: 2px 0 0; font: 600 16px/1.3 var(--heading-font); color: var(--accent-gold); }
    .card.he .short { color: var(--mat-sys-primary); }
    .text { margin: 0; font: 400 14px/1.6 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .verses { list-style: none; margin: 8px 0 0; padding: 8px 0 0; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid var(--mat-sys-outline-variant); }
    .verses li { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 2px 8px; }
    .said { font: italic 400 14px/1.4 var(--reading-font); color: var(--mat-sys-on-surface); }
    .vnote { grid-column: 1 / -1; font: 400 13px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .ref {
      position: relative; overflow: hidden; display: inline-flex; align-items: center; min-height: 40px; padding: 0 12px; border-radius: 20px; cursor: pointer;
      border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container); color: var(--accent-gold); font: 600 13px Inter, sans-serif;
    }
    .compare { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 10px; }
    .cmp { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border-radius: 16px; background: var(--mat-sys-surface); border: 1px dashed var(--mat-sys-outline); }
    .cmp h4 { margin: 0; font: 600 15px/1.3 var(--heading-font); }
    .cmp p { margin: 0; flex: 1; font: 400 14px/1.55 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .refs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .caution { display: flex; gap: 8px; margin: 16px 0 0; padding: 12px 14px; border-radius: 14px; background: var(--mat-sys-surface-container); font: 400 14px/1.55 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .caution mat-icon { flex: none; color: var(--accent-gold); }
  `,
})
export class TimeWords {
  private readonly sheets = inject(Sheets);

  protected readonly compares = TIME_COMPARES;
  protected readonly caution = TIME_CAUTION;
  protected readonly groups = computed(() => [
    { lang: 'grego', title: 'No Grego do Novo Testamento', words: TIME_WORDS.filter((w) => w.lang === 'grego') },
    { lang: 'hebraico', title: 'No Hebraico do Antigo Testamento', words: TIME_WORDS.filter((w) => w.lang === 'hebraico') },
  ]);

  protected open(ref: string): void {
    this.sheets.passage(ref);
  }
}
