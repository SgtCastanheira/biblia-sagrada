import { Component, computed, DestroyRef, effect, inject, input, isDevMode } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { GUEST_STRINGS, guestSermonForRoute } from '../../core/guest-sermons';
import { VoicesNewsService } from '../../core/voices-news.service';
import { BackButton } from '../../shared/back-button';
import { VoiceArticle } from '../../shared/voice-article';

/** Leitura de um sermão de Novas Vozes da Palavra, em estilo de jornal (/vozes/:id; ?idioma=es abre em outro idioma). */
@Component({
  selector: 'app-voice-sermon',
  imports: [BackButton, RouterLink, VoiceArticle],
  template: `
    @if (sermon(); as s) {
      <div class="page">
        <div class="top"><app-back [fallback]="s.status === 'nao-listado' ? '/' : '/vozes'" /></div>
        <app-voice-article [sermon]="s" [initialLang]="idioma()" />
        @if (s.status !== 'nao-listado') {
          <p class="more"><a routerLink="/vozes">{{ masthead }}</a></p>
        }
      </div>
    } @else {
      <p class="empty">Sermão não encontrado.</p>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .page { max-width: 1000px; margin: 0 auto; }
    .more { margin: 18px 4px 0; text-align: center; font: 600 14px Inter, sans-serif; }
    .more a { color: var(--mat-sys-primary); }
    .empty { color: var(--mat-sys-on-surface-variant); }
  `,
})
export class VoiceSermonPage {
  readonly id = input.required<string>();
  /** ?idioma=es abre o sermão já em espanhol (a página mostra só os idiomas que o sermão tem). */
  readonly idioma = input<string | undefined>();
  protected readonly masthead = GUEST_STRINGS.pt.masthead;
  /** Um sermão que ainda espera a aprovação do autor só abre em desenvolvimento; o autor o lê pela página de revisão. */
  protected readonly sermon = computed(() => guestSermonForRoute(this.id(), isDevMode()));

  constructor() {
    const title = inject(Title);
    const meta = inject(Meta);
    const news = inject(VoicesNewsService);
    let robots: HTMLMetaElement | null = null;
    inject(DestroyRef).onDestroy(() => {
      if (robots) meta.removeTagElement(robots);
    });
    effect(() => {
      const s = this.sermon();
      if (s) {
        title.setTitle(`${s.meta.pt.title} · ${s.author} · ${GUEST_STRINGS.pt.masthead}`);
        // Abriu a matéria: o jornal deixa de piscar por causa dela
        news.markSeen(s.id);
      }
      if (s?.status === 'nao-listado') {
        robots ??= meta.addTag({ name: 'robots', content: 'noindex, nofollow' });
      } else if (robots) {
        meta.removeTagElement(robots);
        robots = null;
      }
    });
  }
}
