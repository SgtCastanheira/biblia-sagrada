import { Component, inject } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CLASSIC_KINDS, CLASSIC_SERMONS, RECOMMENDED_SERMONS } from '../../core/library';
import { Sheets } from '../../shared/sheets';

/** Sermões que marcaram a história dos avivamentos. */
@Component({
  selector: 'app-revival',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    <header class="page-head">
      <span class="overline">Avivamentos</span>
      <h1>Sermões que marcaram a história</h1>
      <p>Mensagens de pregadores que Deus usou em grandes avivamentos, em ordem cronológica, para ler com calma.</p>
    </header>

    <a class="card history" matRipple [routerLink]="['/artigo', 'avivamentos-desde-atos']">
      <mat-icon>local_fire_department</mat-icon>
      <span><small>A história</small>Os avivamentos desde Atos: como começou cada um, o que mudou e o que foi pregado</span>
      <mat-icon class="go">chevron_right</mat-icon>
    </a>

    <div class="list">
      @for (s of sermons; track s.id) {
        <a class="card sermon" matRipple [routerLink]="['/avivamento', s.id]">
          <span class="year">{{ s.year }}</span>
          <span class="s-title">{{ s.title }}</span>
          <span class="preacher">{{ s.preacher }} <small>({{ s.lived }})</small></span>
          <span class="tags">
            <span class="tag">{{ s.movement }}</span>
            <span class="tag soft">{{ kinds[s.kind].label }}</span>
          </span>
        </a>
      }
    </div>

    <h2 class="section-title"><mat-icon>headphones</mat-icon>Pregações recomendadas</h2>
    <p class="intro">Indicações de pregações de hoje, na ordem da Bíblia. Como são protegidas por direitos autorais, o app traz o tema e o texto — toque em “Ouvir” para procurar o vídeo.</p>
    <div class="list">
      @for (r of recommended; track r.title) {
        <article class="card rec">
          <span class="year">{{ r.theme }}</span>
          <span class="s-title">{{ r.title }}</span>
          <span class="preacher">{{ r.preacher }}</span>
          <p>{{ r.note }}</p>
          <span class="rec-actions">
            @if (r.where; as w) { <button class="text" (click)="openRef(w.ref)"><mat-icon>menu_book</mat-icon>{{ w.label }}</button> }
            <a class="listen" [href]="youtube(r.search)" target="_blank" rel="noopener"><mat-icon>play_circle</mat-icon>Ouvir</a>
          </span>
        </article>
      }
    </div>

    <p class="source">
      Os textos de Wesley, Edwards, Whitefield, Spurgeon e Moody estão em domínio público e foram traduzidos e condensados para o app.
      Os sermões de pregadores recentes, como Billy Graham, são protegidos por direitos autorais: deles há um perfil com a mensagem central.
    </p>
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .history { display: flex; align-items: center; gap: 12px; margin: 0 0 14px; padding: 14px 16px; font: 600 16px/1.35 var(--heading-font); }
    .history > mat-icon:first-child { color: var(--accent-gold); }
    .history span { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .history small { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-gold); }
    .history .go { color: var(--mat-sys-on-surface-variant); }
    .sermon { display: flex; flex-direction: column; gap: 3px; padding: 16px 18px; border-left: 3px solid var(--accent-gold); }
    .year { font: 600 13px Inter, sans-serif; color: var(--accent-gold); letter-spacing: .4px; }
    .s-title { font: 600 20px/1.3 var(--heading-font); }
    .preacher { font: 500 15px Inter, sans-serif; color: var(--mat-sys-on-surface); }
    .preacher small { font-size: 13px; color: var(--mat-sys-on-surface-variant); font-weight: 400; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .tag {
      font: 600 13px Inter, sans-serif; padding: 3px 10px; border-radius: 10px;
      background: var(--mat-sys-secondary-container); color: var(--mat-sys-on-secondary-container);
    }
    .intro { margin: 0 4px 12px; color: var(--mat-sys-on-surface-variant); }
    .rec { display: flex; flex-direction: column; gap: 3px; padding: 16px 18px; }
    .rec p { margin: 4px 0 6px; font: 400 15px/1.55 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .rec-actions { display: flex; flex-wrap: wrap; gap: 8px; }
    .rec-actions .text, .rec-actions .listen {
      display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 14px; border-radius: 20px; cursor: pointer;
      text-decoration: none; font: 600 14px Inter, sans-serif;
    }
    .rec-actions .text { background: none; border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-primary); }
    .rec-actions .listen { background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    .rec-actions mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .tag.soft { background: none; border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-on-surface-variant); }
  `,
})
export class RevivalPage {
  protected readonly sermons = CLASSIC_SERMONS;
  protected readonly kinds = CLASSIC_KINDS;
  protected readonly recommended = RECOMMENDED_SERMONS;
  private readonly sheets = inject(Sheets);

  protected youtube(search: string): string {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(search)}`;
  }

  protected openRef(ref: string): void {
    this.sheets.passage(ref);
  }
}
