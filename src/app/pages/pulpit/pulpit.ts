import { NavigationService } from '../../core/navigation.service';
import { Component, computed, DestroyRef, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { catchError, combineLatest, map, of, startWith, switchMap } from 'rxjs';
import { BibleService } from '../../core/bible.service';
import { parseReferences } from '../../core/reference-parser';
import { SettingsService } from '../../core/settings.service';
import { SermonsService } from '../../core/sermons.service';

interface Slide {
  label: string;
  title: string;
  refs: string;
  blocks: { label?: string; text: string }[];
}

const MAX_VERSES = 10;

/** Modo púlpito: o sermão em tela cheia, uma parte por vez, com cronômetro. */
@Component({
  selector: 'app-pulpit',
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="pulpit" [style.--size.px]="size()" (touchstart)="touchStart($event)" (touchend)="touchEnd($event)">
      <header>
        <button mat-icon-button (click)="close()" aria-label="Sair do modo púlpito"><mat-icon>close</mat-icon></button>
        <span class="timer" [class.over]="overTime()" aria-label="Tempo de pregação">
          <mat-icon>timer</mat-icon>{{ elapsed() }}
        </span>
        <span class="spacer"></span>
        <button mat-icon-button (click)="zoom(-2)" aria-label="Diminuir letra"><mat-icon>text_decrease</mat-icon></button>
        <button mat-icon-button (click)="zoom(2)" aria-label="Aumentar letra"><mat-icon>text_increase</mat-icon></button>
      </header>

      <div class="progress">
        @for (x of slides(); track $index) {
          <span [class.done]="$index < index()" [class.current]="$index === index()"></span>
        }
      </div>

      @if (slide(); as sl) {
        <main>
          <span class="label">{{ sl.label }}</span>
          <h1>{{ sl.title }}</h1>
          @if (sl.refs) {
            <blockquote>
              @if (verses().loading) {
                <span class="loading">Carregando {{ sl.refs }}…</span>
              } @else if (verses().text) {
                {{ verses().text }}
              }
              <cite>{{ sl.refs }}</cite>
            </blockquote>
          }
          @for (b of sl.blocks; track $index) {
            @if (b.text) {
              <section>
                @if (b.label) { <span class="block-label">{{ b.label }}</span> }
                <p>{{ b.text }}</p>
              </section>
            }
          }
        </main>
      }

      <footer>
        <button mat-icon-button (click)="go(-1)" [disabled]="index() === 0" aria-label="Parte anterior"><mat-icon>arrow_back</mat-icon></button>
        <span class="count">{{ index() + 1 }} / {{ slides().length }}</span>
        <button mat-icon-button (click)="go(1)" [disabled]="index() === slides().length - 1" aria-label="Próxima parte"><mat-icon>arrow_forward</mat-icon></button>
      </footer>
    </div>
  `,
  styles: `
    .pulpit {
      position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column;
      background: #141312; color: #ece8e2; padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
      --gold: #d4b583;
    }
    header, footer { display: flex; align-items: center; gap: 4px; padding: 4px 8px; color: #b9b2a8; }
    header button, footer button { color: #ece8e2; }
    .spacer { flex: 1; }
    .timer { display: inline-flex; align-items: center; gap: 6px; font: 600 18px Inter, sans-serif; font-variant-numeric: tabular-nums; }
    .timer mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .timer.over { color: #e6a06b; }
    .progress { display: flex; gap: 3px; padding: 0 16px 6px; }
    .progress span { flex: 1; height: 3px; border-radius: 2px; background: #3a3732; }
    .progress .done { background: #8fae9c; }
    .progress .current { background: var(--gold); }
    main { flex: 1; overflow-y: auto; padding: 20px 24px 40px; max-width: 900px; width: 100%; box-sizing: border-box; margin: 0 auto; }
    .label { font: 600 calc(var(--size) * 0.6) Inter, sans-serif; letter-spacing: .12em; text-transform: uppercase; color: var(--gold); }
    h1 { margin: 6px 0 18px; font: 600 calc(var(--size) * 1.45)/1.2 'Source Serif 4', serif; }
    blockquote {
      margin: 0 0 20px; padding: 4px 0 4px 18px; border-left: 3px solid var(--gold);
      font: italic 400 var(--size)/1.6 'Source Serif 4', serif; color: #d9d3c9;
    }
    .loading { color: #8f887e; }
    cite { display: block; margin-top: 8px; font: 600 calc(var(--size) * 0.65) Inter, sans-serif; font-style: normal; color: var(--gold); }
    section { margin-bottom: 18px; }
    .block-label { display: block; margin-bottom: 4px; font: 600 calc(var(--size) * 0.6) Inter, sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #8fae9c; }
    p { margin: 0; font: 400 var(--size)/1.6 Inter, sans-serif; white-space: pre-line; }
    footer { justify-content: center; gap: 24px; padding-bottom: 10px; }
    footer button { width: 56px; height: 56px; border: 1px solid #3a3732; border-radius: 50%; }
    .count { font: 600 16px Inter, sans-serif; font-variant-numeric: tabular-nums; }
  `,
  host: {
    '(document:keydown.arrowright)': 'go(1)',
    '(document:keydown.arrowleft)': 'go(-1)',
    '(document:keydown.pagedown)': 'go(1)',
    '(document:keydown.pageup)': 'go(-1)',
    '(document:keydown.escape)': 'close()',
  },
})
export class PulpitPage {
  readonly id = input.required<string>();

  private readonly service = inject(SermonsService);
  private readonly bible = inject(BibleService);
  private readonly settings = inject(SettingsService);
  private readonly navigation = inject(NavigationService);

  protected readonly index = signal(0);
  protected readonly size = signal(this.loadSize());
  private readonly start = Date.now();
  private readonly now = signal(Date.now());

  protected readonly sermon = computed(() => this.service.get(this.id()));

  protected readonly slides = computed<Slide[]>(() => {
    const s = this.sermon();
    if (!s) return [];
    return [
      { label: s.occasion, title: s.title || 'Sermão', refs: s.baseText, blocks: [{ label: 'Tema', text: s.theme }] },
      { label: 'Introdução', title: s.title || 'Introdução', refs: '', blocks: [{ text: s.introduction }] },
      ...s.points.map((p, i) => ({
        label: `Tópico ${i + 1} de ${s.points.length}`,
        title: p.title || `Tópico ${i + 1}`,
        refs: p.refs,
        blocks: [{ text: p.content }, { label: 'Ilustração', text: p.illustration }, { label: 'Aplicação', text: p.application }],
      })),
      { label: 'Conclusão', title: 'Conclusão', refs: '', blocks: [{ text: s.conclusion }, { label: 'Apelo', text: s.appeal }] },
    ];
  });

  protected readonly slide = computed(() => this.slides()[this.index()]);

  /** Texto dos versículos do slide atual, na versão escolhida. */
  protected readonly verses = toSignal(
    toObservable(computed(() => ({ refs: this.slide()?.refs ?? '', version: this.settings.version() }))).pipe(
      switchMap(({ refs, version }) => {
        const list = parseReferences(refs).refs;
        if (!list.length) return of({ loading: false, text: '' });
        return combineLatest(
          list.map((r) =>
            this.bible.getChapter(version, r.bookId, r.chapter).pipe(
              map((verses) => verses.filter((v) => r.from === undefined || (v.verse >= r.from && v.verse <= (r.to ?? r.from)))),
              catchError(() => of([])),
            ),
          ),
        ).pipe(
          map((groups) => {
            const all = groups.flat();
            const text = all.slice(0, MAX_VERSES).map((v) => `${v.verse} ${v.text}`).join(' ');
            return { loading: false, text: all.length > MAX_VERSES ? `${text} …` : text };
          }),
          startWith({ loading: true, text: '' }),
        );
      }),
    ),
    { initialValue: { loading: false, text: '' } },
  );

  protected readonly elapsed = computed(() => {
    const seconds = Math.floor((this.now() - this.start) / 1000);
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  });

  protected readonly overTime = computed(() => {
    const s = this.sermon();
    return !!s && (this.now() - this.start) / 60000 > this.service.minutes(s) + 5;
  });

  private touch: { x: number; y: number } | null = null;
  private wakeLock: { release(): Promise<void> } | null = null;

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    document.body.style.overflow = 'hidden';
    // Mantém a tela acesa durante a pregação (quando o navegador permite)
    (navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<{ release(): Promise<void> }> } }).wakeLock
      ?.request('screen')
      .then((lock) => (this.wakeLock = lock))
      .catch(() => undefined);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      document.body.style.overflow = '';
      this.wakeLock?.release().catch(() => undefined);
    });
  }

  protected go(step: 1 | -1): void {
    this.index.update((i) => Math.min(this.slides().length - 1, Math.max(0, i + step)));
  }

  protected zoom(delta: number): void {
    this.size.update((s) => Math.min(40, Math.max(16, s + delta)));
    try {
      localStorage.setItem('biblia.sermons.pulpitSize', JSON.stringify(this.size()));
    } catch {
      // armazenamento indisponível
    }
  }

  protected close(): void {
    // Volta no histórico: assim o “Voltar” do sermão não reabre o púlpito
    this.navigation.back(`/sermoes/${this.id()}`);
  }

  protected touchStart(e: TouchEvent): void {
    this.touch = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }

  protected touchEnd(e: TouchEvent): void {
    if (!this.touch) return;
    const dx = e.changedTouches[0].clientX - this.touch.x;
    const dy = e.changedTouches[0].clientY - this.touch.y;
    this.touch = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) this.go(dx < 0 ? 1 : -1);
  }

  private loadSize(): number {
    try {
      return JSON.parse(localStorage.getItem('biblia.sermons.pulpitSize') ?? '22');
    } catch {
      return 22;
    }
  }
}
