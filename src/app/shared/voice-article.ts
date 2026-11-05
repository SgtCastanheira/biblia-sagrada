import { Component, computed, DestroyRef, effect, inject, input, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { map, startWith, switchMap } from 'rxjs';
import { ContentService } from '../core/content.service';
import {
  bibleVersionFor, GUEST_LANGUAGES, GUEST_STRINGS, GuestSermon, guestTextPath, LangCode, readingMinutes,
} from '../core/guest-sermons';
import { ListenService } from '../core/listen.service';
import { SettingsService } from '../core/settings.service';
import { findVersion } from '../core/versions';
import { voiceSermonCard } from '../core/voice-share-card';
import { storyItems } from './listen-dom';
import { NewsText } from './news-text';
import { ShareImageButton } from './share-image-button';

/**
 * O sermão de Novas Vozes da Palavra como página de jornal: título do jornal, manchete, linha de autoria, escolha de idioma,
 * "Ouvir" e o texto em colunas. É a mesma página que o público lê (/vozes/:id) e que o autor revisa (/revisao/:token).
 */
@Component({
  selector: 'app-voice-article',
  imports: [MatButtonModule, MatIconModule, NewsText, ShareImageButton],
  template: `
    <article class="paper" [attr.lang]="lang()">
      <header class="masthead">
        <p class="name">{{ s().masthead }}</p>
        <p class="dateline"><span>{{ s().edition }} {{ sermon().edition }}</span><span class="tag">{{ s().tagline }}</span></p>
      </header>

      <div class="head">
        <div class="title-row" [class.has-photo]="sermon().authorPhoto">
          <p class="kicker">{{ meta().kicker }}</p>
          <h1>{{ meta().title }}</h1>
          @if (sermon().authorPhoto) { <img class="author-photo" [src]="sermon().authorPhoto" alt="" width="132" height="132" /> }
        </div>
        <p class="deck">{{ meta().deck }}</p>
        <p class="byline">{{ s().by }} <strong>{{ sermon().author }}</strong>@if (minutes()) { <span class="sep" aria-hidden="true">·</span> {{ minutes() }} {{ s().minutes }} }</p>
      </div>

      <div class="tools">
        <div class="langs" role="group" [attr.aria-label]="s().language">
          @for (l of languages(); track l.code) {
            <button type="button" [class.on]="lang() === l.code" [attr.aria-pressed]="lang() === l.code" [attr.lang]="l.code" (click)="setLang(l.code)">
              <span aria-hidden="true">{{ l.flag }}</span> {{ l.native }}
            </button>
          }
        </div>
        <span class="actions">
          <button type="button" class="listen" (click)="toggleListen()" [disabled]="!listen.supported || !text()">
            <mat-icon>{{ listening() ? 'stop_circle' : 'headphones' }}</mat-icon>{{ listening() ? s().stop : s().listen }}
          </button>
          <app-share-image-button [card]="shareCard()" [label]="s().share.button" />
          <button mat-icon-button type="button" (click)="settings.changeFontSize(-1)" [attr.aria-label]="s().smaller"><mat-icon>text_decrease</mat-icon></button>
          <button mat-icon-button type="button" (click)="settings.changeFontSize(1)" [attr.aria-label]="s().larger"><mat-icon>text_increase</mat-icon></button>
        </span>
      </div>

      @if (s().translation) { <p class="translation"><mat-icon>translate</mat-icon><span>{{ s().translation }}</span></p> }

      <div class="body" [style.font-size.px]="settings.fontSize() - 2">
        @if (text() === undefined) {
          <div class="skeleton" aria-hidden="true"><span></span><span></span><span></span><span class="short"></span></div>
        } @else if (text(); as source) {
          <app-news-text [source]="source" [lang]="lang()" [version]="version()" />
        } @else {
          <p class="empty">Não foi possível abrir este texto agora.</p>
        }
      </div>

      <footer class="colophon" [attr.lang]="lang()">
        <p>{{ s().authorized }}</p>
        <p>{{ s().bibleText }}: {{ versionName() }}@if (versionRights()) { · {{ versionRights() }} }.</p>
        @if (sermon().sources.length) {
          <p class="src"><strong>{{ s().sources }}:</strong>
            @for (src of sermon().sources; track src.url) { <a [href]="src.url" target="_blank" rel="noopener noreferrer">{{ src.label }}</a>{{ $last ? '' : ' · ' }} }
          </p>
        }
      </footer>
    </article>
  `,
  styleUrl: './voice-article.scss',
})
export class VoiceArticle {
  readonly sermon = input.required<GuestSermon>();
  /** Idioma com que a página abre (o endereço pode pedir um: ?idioma=es). */
  readonly initialLang = input<string | undefined>();
  /** O texto em português (o original), quando carrega: a página de revisão calcula a versão dele para o autor aprovar. */
  readonly originalLoaded = output<string>();

  protected readonly settings = inject(SettingsService);
  protected readonly listen = inject(ListenService);
  private readonly content = inject(ContentService);

  protected readonly lang = signal<LangCode>('pt');
  protected readonly languages = computed(() => GUEST_LANGUAGES.filter((l) => this.sermon().languages.includes(l.code)));
  protected readonly s = computed(() => GUEST_STRINGS[this.lang()]);
  protected readonly meta = computed(() => this.sermon().meta[this.lang()]);
  protected readonly version = computed(() => bibleVersionFor(this.lang(), this.settings.version()));
  protected readonly versionName = computed(() => findVersion(this.version())?.name ?? this.version());
  protected readonly versionRights = computed(() => findVersion(this.version())?.copyright ?? '');
  protected readonly listening = computed(() => this.listen.state() !== 'idle');

  protected readonly text = toSignal(
    toObservable(computed(() => guestTextPath(this.sermon().id, this.lang()))).pipe(
      switchMap((path) => this.content.text(path).pipe(map((t) => t as string | null | undefined), startWith(undefined))),
    ),
  );
  /** A imagem de compartilhar (WhatsApp e Instagram), no idioma que está na tela. */
  protected readonly shareCard = computed(() => voiceSermonCard(this.sermon(), this.lang()));
  protected readonly minutes = computed(() => (this.text() ? readingMinutes(this.text()!) : 0));

  constructor() {
    effect(() => {
      const wanted = this.initialLang();
      if (wanted && this.sermon().languages.includes(wanted as LangCode)) this.lang.set(wanted as LangCode);
    });
    effect(() => {
      const original = this.lang() === 'pt' ? this.text() : null;
      if (original) this.originalLoaded.emit(original);
    });
    // Sair da página para a leitura em voz alta
    inject(DestroyRef).onDestroy(() => this.listen.stop());
  }

  protected setLang(code: LangCode): void {
    if (code === this.lang()) return;
    this.listen.stop();
    this.lang.set(code);
  }

  protected toggleListen(): void {
    if (this.listening()) {
      this.listen.stop();
      return;
    }
    const m = this.meta();
    const items = storyItems(`${m.title}. ${m.deck}`, { root: 'app-news-text' });
    this.listen.start(m.title, items, { lang: this.lang() });
  }
}
