import { Component, inject, isDevMode, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { GUEST_KINDS, GUEST_LANGUAGES, GUEST_STRINGS, GuestKind, GuestSermon, reviewPath, visibleGuestSermons } from '../../core/guest-sermons';
import { pageUrl } from '../../core/share-card';
import { VoicesNewsService } from '../../core/voices-news.service';

/**
 * Primeira página do jornal Novas Vozes da Palavra (a aba “Jornal” do menu): as manchetes dos sermões e das pregações das
 * novas gerações, em duas seções separadas. O que a pessoa ainda não abriu leva o selo “Novo”.
 */
@Component({
  selector: 'app-voices',
  imports: [RouterLink, MatIconModule],
  template: `
    <header class="masthead">
      <p class="name">{{ s.masthead }}</p>
      <p class="dateline"><span>{{ s.edition }} {{ edition }}</span><span class="tag">{{ s.tagline }}</span></p>
    </header>

    <h1 class="section">Nesta edição</h1>
    @for (g of groups; track g.kind) {
    <h2 class="kind">{{ g.title }}</h2>
    @for (sm of g.items; track sm.id) {
      <a class="story" [routerLink]="['/vozes', sm.id]">
        <span class="kicker">{{ sm.meta.pt.kicker }}@if (news.isUnread(sm.id)) { <span class="new">Novo</span> }</span>
        <span class="headline">{{ sm.meta.pt.title }}</span>
        <span class="deck">{{ sm.meta.pt.deck }}</span>
        <span class="by">{{ s.by }} <strong>{{ sm.author }}</strong></span>
        <span class="langs" aria-label="Idiomas">
          @for (l of languagesOf(sm.languages); track l.code) { <span><span aria-hidden="true">{{ l.flag }}</span> {{ l.native }}</span> }
        </span>
        <span class="go">{{ g.read }} <mat-icon>arrow_forward</mat-icon></span>
      </a>
      @if (dev && sm.status !== 'publicado') {
        <section class="review">
          <h2><mat-icon>lock</mat-icon> Em revisão: só aparece para você</h2>
          <p>Este sermão ainda espera a aprovação do autor e não aparece no app publicado. Envie a {{ sm.author }} o link exclusivo abaixo; só quem tem o endereço consegue abrir.</p>
          <p class="link"><code>{{ reviewUrl(sm) }}</code></p>
          <button type="button" (click)="copy(sm)"><mat-icon>content_copy</mat-icon> {{ copied() === sm.id ? 'Link copiado' : 'Copiar o link do autor' }}</button>
        </section>
      }
    }
    } @empty {
      <p class="empty">Ainda não há matérias nesta edição.</p>
    }

    <p class="note">Sermões e pregações das novas gerações, publicados com a autorização de cada autor, cada um em sua seção. Cada texto pode ser lido em vários idiomas e ouvido em voz alta.</p>
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .masthead { margin-top: 10px; text-align: center; border-top: 4px double var(--mat-sys-on-surface); }
    .name { margin: 0; padding: 14px 0 10px; font: 800 clamp(30px, 7vw, 60px) / 1.05 var(--heading-font); letter-spacing: .04em; text-transform: uppercase; }
    .dateline { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 6px 16px; margin: 0; padding: 7px 0; border-top: 1px solid var(--mat-sys-on-surface); border-bottom: 3px double var(--mat-sys-on-surface); font: 600 13px/1.4 Inter, sans-serif; letter-spacing: 1.2px; text-transform: uppercase; color: var(--mat-sys-on-surface-variant); }
    .section { margin: 26px 0 12px; font: 700 13px Inter, sans-serif; letter-spacing: 2.4px; text-transform: uppercase; color: var(--accent-gold); }
    .kind { margin: 22px 0 10px; padding-bottom: 6px; border-bottom: 3px double var(--mat-sys-on-surface); font: 800 clamp(24px, 4.4vw, 34px) / 1.1 var(--heading-font); }
    .new { margin-left: 10px; padding: 2px 9px; border-radius: 10px; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); font: 800 13px Inter, sans-serif; letter-spacing: 1px; }
    .story { display: flex; flex-direction: column; gap: 8px; padding: 22px 22px 18px; border: 1px solid var(--mat-sys-outline-variant); border-top: 3px solid var(--mat-sys-on-surface); border-radius: 4px; background: color-mix(in srgb, var(--accent-gold) 4%, var(--mat-sys-surface)); color: inherit; text-decoration: none; box-shadow: var(--shadow-soft); }
    .story:hover .headline { text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 5px; }
    .story:focus-visible { outline: 2px solid var(--mat-sys-primary); outline-offset: 3px; }
    .kicker { font: 700 13px Inter, sans-serif; letter-spacing: 2.2px; text-transform: uppercase; color: var(--accent-gold); }
    .headline { font: 800 clamp(34px, 7vw, 56px) / 1.05 var(--heading-font); letter-spacing: -.02em; }
    .deck { max-width: 34em; font: italic 400 clamp(18px, 2.6vw, 22px) / 1.4 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .by { font: 500 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .by strong { color: var(--mat-sys-on-surface); }
    .langs { display: flex; flex-wrap: wrap; gap: 4px 14px; font: 500 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .go { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; margin-top: 4px; min-height: 44px; font: 700 15px Inter, sans-serif; color: var(--mat-sys-primary); }
    .go mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .review { margin-top: 14px; padding: 14px 16px; border: 1px dashed var(--accent-gold); border-radius: 12px; background: var(--mat-sys-surface-container-low); }
    .review h2 { display: flex; align-items: center; gap: 8px; margin: 0 0 6px; font: 700 16px var(--heading-font); }
    .review h2 mat-icon { color: var(--accent-gold); }
    .review p { margin: 0 0 8px; font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .review .link code { display: block; padding: 8px 10px; border-radius: 8px; background: var(--mat-sys-surface-container); font: 500 13px/1.4 ui-monospace, monospace; color: var(--mat-sys-on-surface); overflow-wrap: anywhere; }
    .review button { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px; border: 1px solid var(--mat-sys-primary); border-radius: 22px; background: none; color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif; cursor: pointer; }
    .review button mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .note { margin: 22px 4px 0; font: 400 13px/1.55 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .empty { color: var(--mat-sys-on-surface-variant); }
  `,
})
export class VoicesPage {
  protected readonly s = GUEST_STRINGS.pt;
  /** Só em desenvolvimento (`ng serve`) aparecem os sermões que ainda esperam a aprovação do autor. */
  protected readonly dev = isDevMode();
  protected readonly news = inject(VoicesNewsService);
  protected readonly edition = Math.max(1, ...visibleGuestSermons(this.dev).map((x) => x.edition));
  /** As duas seções do jornal, separadas, sem as que estão vazias. */
  protected readonly groups = (['sermao', 'pregacao'] as GuestKind[])
    .map((kind) => ({ kind, ...GUEST_KINDS[kind], items: visibleGuestSermons(this.dev).filter((x) => x.kind === kind) }))
    .filter((g) => g.items.length);
  protected readonly copied = signal('');

  protected languagesOf(codes: string[]) {
    return GUEST_LANGUAGES.filter((l) => codes.includes(l.code));
  }

  protected reviewUrl(s: GuestSermon): string {
    return pageUrl(reviewPath(s));
  }

  protected async copy(s: GuestSermon): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.reviewUrl(s));
      this.copied.set(s.id);
    } catch {
      // Sem permissão para copiar: o endereço continua à vista para copiar à mão
    }
  }
}
