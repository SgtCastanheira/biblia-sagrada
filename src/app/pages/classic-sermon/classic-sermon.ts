import { BackButton } from '../../shared/back-button';
import { Component, computed, effect, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { map, startWith, switchMap } from 'rxjs';
import { ContentService } from '../../core/content.service';
import { CLASSIC_KINDS, CLASSIC_SERMONS, findArticle, findClassic } from '../../core/library';
import { SettingsService } from '../../core/settings.service';
import { PassageView } from '../../shared/passage-view';
import { RichText } from '../../shared/rich-text';

/** Leitura de um sermão histórico. */
@Component({
  selector: 'app-classic-sermon',
  imports: [BackButton, RouterLink, MatButtonModule, MatIconModule, MatRippleModule, RichText, PassageView],
  template: `
    @if (sermon(); as s) {
      <div class="article">
        <div class="top">
          <app-back fallback="/avivamento" />
          <span class="size">
            <button mat-icon-button (click)="settings.changeFontSize(-1)" aria-label="Diminuir letra"><mat-icon>text_decrease</mat-icon></button>
            <button mat-icon-button (click)="settings.changeFontSize(1)" aria-label="Aumentar letra"><mat-icon>text_increase</mat-icon></button>
          </span>
        </div>

        <span class="overline">{{ s.movement }} · {{ s.year }}</span>
        <h1 class="title">{{ s.title }}</h1>
        <p class="by">{{ s.preacher }}@if (s.originalTitle) { · <em>{{ s.originalTitle }}</em> }</p>
        <p class="place"><mat-icon>place</mat-icon>{{ s.place }}</p>

        <section class="about card">
          <h2>Quem foi {{ s.preacher }} <small>({{ s.lived }})</small></h2>
          <p>{{ s.bio }}</p>
          <h2>Por que esta mensagem ficou na história</h2>
          <p>{{ s.context }}</p>
        </section>

        @if (revival(); as r) {
          <a class="card revival" matRipple [routerLink]="['/artigo', r.id]">
            <mat-icon>local_fire_department</mat-icon>
            <span><small>O avivamento daquele tempo</small>{{ r.title }}</span>
            <mat-icon class="go">chevron_right</mat-icon>
          </a>
        }

        <h2 class="section-title">Texto bíblico</h2>
        <app-passage-view [refs]="s.text" />

        <h2 class="section-title">{{ s.kind === 'perfil' ? 'A mensagem' : 'O sermão' }}</h2>
        <div class="body" [style.font-size.px]="settings.fontSize() - 2">
          @if (body() === undefined) {
            <div class="skeleton"><span></span><span></span><span></span><span class="short"></span></div>
          } @else if (body(); as text) {
            <app-rich-text [source]="text" />
          } @else {
            <p class="empty">Não foi possível abrir este texto agora.</p>
          }
        </div>

        <p class="source">
          <strong>{{ kinds[s.kind].label }}.</strong> {{ kinds[s.kind].note }}
          @if (s.source; as src) { <br /><a [href]="src.url" target="_blank" rel="noopener">{{ src.label }}</a> }
        </p>

        @if (next(); as n) {
          <a class="card next" matRipple [routerLink]="['/avivamento', n.id]">
            <span><small>Próximo sermão</small>{{ n.title }} — {{ n.preacher }}</span>
            <mat-icon>arrow_forward</mat-icon>
          </a>
        }
      </div>
    } @else {
      <p class="empty">Sermão não encontrado.</p>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .revival { display: flex; align-items: center; gap: 12px; margin: 14px 0 0; padding: 14px 16px; font: 600 16px/1.35 var(--heading-font); }
    .revival > mat-icon:first-child { color: var(--accent-gold); }
    .revival span { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .revival small { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-gold); }
    .revival .go { color: var(--mat-sys-on-surface-variant); }
    .size { display: flex; }
    .by { margin: 0 0 4px; font: 600 17px Inter, sans-serif; color: var(--mat-sys-primary); }
    .by em { font-weight: 400; color: var(--mat-sys-on-surface-variant); }
    .place { display: flex; align-items: center; gap: 6px; margin: 0 0 18px; font: 400 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .place mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--accent-gold); }
    .about { padding: 6px 18px 4px; border-radius: 18px; }
    .about h2 { font: 600 16px var(--heading-font); margin: 14px 0 4px; }
    .about h2 small { font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .about p { margin: 0 0 12px; font: 400 15px/1.6 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .body app-rich-text { font-size: inherit; }
    .next { display: flex; align-items: center; gap: 12px; margin-top: 24px; padding: 16px 18px; font: 600 16px/1.35 var(--heading-font); }
    .next span { display: flex; flex-direction: column; flex: 1; }
    .next small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .next mat-icon { color: var(--mat-sys-primary); }
  `,
})
export class ClassicSermonPage {
  readonly id = input.required<string>();
  protected readonly settings = inject(SettingsService);
  private readonly content = inject(ContentService);
  protected readonly kinds = CLASSIC_KINDS;

  /** Estudo do avivamento em que o sermão foi pregado. */
  protected readonly revival = computed(() => {
    const id = findClassic(this.id())?.revival;
    return id ? findArticle(id) : undefined;
  });
  protected readonly sermon = computed(() => findClassic(this.id()));
  protected readonly next = computed(() => {
    const i = CLASSIC_SERMONS.findIndex((s) => s.id === this.id());
    return i >= 0 ? CLASSIC_SERMONS[(i + 1) % CLASSIC_SERMONS.length] : undefined;
  });

  protected readonly body = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => this.content.text(`sermoes/${id}.md`).pipe(map((t) => t as string | null | undefined), startWith(undefined))),
    ),
  );

  constructor() {
    const title = inject(Title);
    effect(() => {
      const s = this.sermon();
      if (s) title.setTitle(`${s.title} · ${s.preacher}`);
    });
  }
}
