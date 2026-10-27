import { narrationVoice, warmUpVoices } from '../core/voice';
import { Component, computed, DestroyRef, effect, inject, input, output, signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { eraOfMap } from '../core/atlas';
import { BibleService } from '../core/bible.service';
import { BibleMap } from '../core/maps';
import { parseReferences } from '../core/reference-parser';
import { SettingsService } from '../core/settings.service';
import { BibleMapView } from './bible-map';

const MAX_VERSES = 3;
const NARRATION_KEY = 'biblia.maps.narration';

/** "Viver a jornada": percorre as etapas do mapa em tela cheia, com câmera animada, versículo e narração. */
@Component({
  selector: 'app-map-story',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatTooltipModule, BibleMapView],
  template: `
    @let m = map();
    @let s = m.steps[step()];
    <div class="story" role="dialog" aria-modal="true" [attr.aria-label]="'Jornada: ' + m.title">
      <header>
        <button mat-icon-button (click)="close()" aria-label="Fechar"><mat-icon>close</mat-icon></button>
        <span class="title">{{ m.title }}</span>
        <button mat-icon-button (click)="toggleNarration()" [matTooltip]="narrate() ? 'Desligar narração' : 'Ouvir narração'"
                [attr.aria-label]="narrate() ? 'Desligar narração' : 'Ouvir narração'" [class.on]="narrate()">
          <mat-icon>{{ narrate() ? 'volume_up' : 'volume_off' }}</mat-icon>
        </button>
      </header>

      <div class="progress" aria-hidden="true">
        @for (x of m.steps; track $index) {
          <span [class.done]="$index < step()" [class.current]="$index === step()"></span>
        }
      </div>

      <div class="map-area">
        <app-bible-map [map]="m" [storyStep]="step()" [era]="settings.mapLayers().era ? era() : null" [nearby]="settings.mapLayers().nearby" />
      </div>

      <article class="card" (touchstart)="touchStart($event)" (touchend)="touchEnd($event)">
        <div class="card-head">
          <span class="num">{{ step() + 1 }}</span>
          @if (s.flag) { <img class="flag" [src]="s.flag" alt="" width="34" height="24" /> }
          <span class="place">{{ placeName() }}</span>
          <span class="count">{{ step() + 1 }} de {{ m.steps.length }}</span>
        </div>
        <p class="text">{{ s.text }}</p>
        @if (s.link) {
          <a class="story-link" [routerLink]="s.link">Ler a história completa <mat-icon>arrow_forward</mat-icon></a>
        }

        @if (verses().loading) {
          <div class="skeleton"><span></span><span class="short"></span></div>
        } @else if (verses().text) {
          <blockquote class="reading-font">
            “{{ verses().text }}”
            <cite>{{ s.ref }}</cite>
          </blockquote>
        }

        <div class="controls">
          <button mat-icon-button (click)="previous()" [disabled]="step() === 0" aria-label="Etapa anterior">
            <mat-icon>skip_previous</mat-icon>
          </button>
          @if (finished()) {
            <button mat-flat-button class="play" (click)="restart()"><mat-icon>replay</mat-icon> Recomeçar</button>
          } @else {
            <button mat-flat-button class="play" (click)="togglePlay()">
              <mat-icon>{{ playing() ? 'pause' : 'play_arrow' }}</mat-icon> {{ playing() ? 'Pausar' : 'Reproduzir' }}
            </button>
          }
          <button mat-icon-button (click)="next()" [disabled]="step() === m.steps.length - 1" aria-label="Próxima etapa">
            <mat-icon>skip_next</mat-icon>
          </button>
          @if (readLink(); as link) {
            <a mat-icon-button [routerLink]="link.path" [fragment]="link.fragment" (click)="close()" aria-label="Ler no capítulo">
              <mat-icon>menu_book</mat-icon>
            </a>
          }
        </div>
      </article>
    </div>
  `,
  styles: `
    .story {
      position: fixed; inset: 0; z-index: 1000; display: flex; flex-direction: column;
      background: var(--map-sea); outline: none;
      padding-top: env(safe-area-inset-top);
      animation: open 300ms ease;
    }
    @keyframes open { from { opacity: 0; transform: scale(.98); } }
    header {
      display: flex; align-items: center; gap: 4px; padding: 4px 4px 0;
      background: color-mix(in srgb, var(--mat-sys-surface) 92%, transparent);
    }
    .title { flex: 1; min-width: 0; font: 600 17px var(--heading-font); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    header .on { color: var(--mat-sys-primary); }
    .progress {
      display: flex; gap: 3px; padding: 6px 12px 8px;
      background: color-mix(in srgb, var(--mat-sys-surface) 92%, transparent);
    }
    .progress span { flex: 1; height: 3px; border-radius: 2px; background: var(--mat-sys-outline-variant); transition: background-color 300ms; }
    .progress .done { background: var(--mat-sys-primary); }
    .progress .current { background: var(--accent-gold); }
    .map-area { flex: 1; min-height: 0; position: relative; }
    .map-area app-bible-map { position: absolute; inset: 0; }
    .card {
      padding: 16px 18px calc(12px + env(safe-area-inset-bottom));
      border-radius: 24px 24px 0 0; margin-top: -20px; position: relative;
      background: var(--mat-sys-surface); box-shadow: 0 -8px 24px rgb(0 0 0 / .08);
      max-height: 48vh; overflow-y: auto;
    }
    .card-head { display: flex; align-items: center; gap: 10px; }
    .num {
      width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; flex: none;
      background: var(--accent-gold); color: var(--map-badge-text); font: 700 14px Inter, sans-serif;
    }
    .place { flex: 1; font: 600 21px var(--heading-font); }
    .flag { width: 34px; height: auto; border-radius: 3px; box-shadow: 0 0 0 1px var(--mat-sys-outline-variant); }
    .count { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .text { margin: 10px 0 0; font: 400 16px/1.55 Inter, sans-serif; }
    .story-link { display: inline-flex; align-items: center; gap: 6px; min-height: 40px; margin-top: 4px; font: 600 15px Inter, sans-serif; color: var(--mat-sys-primary); text-decoration: none; }
    .story-link mat-icon { font-size: 18px; width: 18px; height: 18px; }
    blockquote {
      margin: 12px 0 0; padding: 10px 0 2px 14px; border-left: 3px solid var(--accent-gold);
      font-size: 16px; line-height: 1.6; color: var(--mat-sys-on-surface-variant);
    }
    cite { display: block; margin-top: 4px; font: 600 13px Inter, sans-serif; font-style: normal; color: var(--mat-sys-primary); }
    .skeleton { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
    .skeleton span { height: 14px; border-radius: 7px; background: var(--mat-sys-surface-container); animation: pulse 1.2s infinite; }
    .skeleton .short { width: 55%; }
    @keyframes pulse { 50% { opacity: .5; } }
    .controls { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 14px; }
    .play { min-width: 150px; height: 46px; }
    @media (min-width: 840px) {
      .card { position: absolute; left: 24px; bottom: 24px; width: 400px; border-radius: 24px; margin: 0; }
    }
  `,
  host: {
    '(document:keydown.arrowright)': 'playing.set(false); next()',
    '(document:keydown.arrowleft)': 'playing.set(false); previous()',
    '(document:keydown.escape)': 'close()',
    '(document:keydown.space)': '$event.preventDefault(); togglePlay()',
  },
})
export class MapStory {
  readonly map = input.required<BibleMap>();
  readonly startAt = input(0);
  readonly closed = output<void>();

  private readonly bible = inject(BibleService);
  protected readonly settings = inject(SettingsService);
  protected readonly era = computed(() => eraOfMap(this.map().id) ?? null);

  protected readonly step = signal(0);
  protected readonly playing = signal(true);
  protected readonly narrate = signal(this.loadNarration());
  protected readonly finished = computed(() => !this.playing() && this.step() === this.map().steps.length - 1 && this.ended());
  private readonly ended = signal(false);

  protected readonly placeName = computed(() => {
    const s = this.map().steps[this.step()];
    return this.map().places.find((p) => p.id === s.place)?.name ?? '';
  });

  protected readonly readLink = computed(() => {
    const ref = parseReferences(this.map().steps[this.step()].ref).refs[0];
    return ref ? { path: ['/ler', ref.bookId, ref.chapter], fragment: ref.from ? `v${ref.from}` : undefined } : null;
  });

  /** Texto dos versículos da etapa (até 3), na versão escolhida. */
  protected readonly verses = toSignal(
    toObservable(computed(() => ({ ref: this.map().steps[this.step()].ref, version: this.settings.version() }))).pipe(
      switchMap(({ ref, version }) => {
        const first = parseReferences(ref).refs[0];
        if (!first) return of({ loading: false, text: '' });
        return this.bible.getChapter(version, first.bookId, first.chapter).pipe(
          map((verses) => {
            const from = first.from ?? 1;
            const to = Math.min(first.to ?? first.from ?? from + MAX_VERSES - 1, from + MAX_VERSES - 1);
            const picked = verses.filter((v) => v.verse >= from && v.verse <= to).map((v) => v.text);
            const more = (first.to ?? from) > to || first.from === undefined;
            return { loading: false, text: picked.join(' ') + (more ? ' …' : '') };
          }),
          catchError(() => of({ loading: false, text: '' })),
          startWith({ loading: true, text: '' }),
        );
      }),
    ),
    { initialValue: { loading: true, text: '' } },
  );

  private timer: ReturnType<typeof setTimeout> | undefined;
  private touch: { x: number; y: number } | null = null;

  constructor() {
    warmUpVoices();
    const destroy = inject(DestroyRef);
    // Tela cheia: a página de trás não rola enquanto a jornada está aberta
    document.body.style.overflow = 'hidden';
    destroy.onDestroy(() => {
      document.body.style.overflow = '';
      clearTimeout(this.timer);
      speechSynthesis?.cancel();
    });

    effect(() => this.step.set(Math.min(this.startAt(), this.map().steps.length - 1)));

    // A cada etapa: narra (se ligado) e agenda a próxima (se reproduzindo)
    effect(() => {
      const step = this.step();
      const playing = this.playing();
      const narrate = this.narrate();
      const verses = this.verses();
      untracked(() => this.schedule(step, playing, narrate, verses));
    });
  }

  protected next(): void {
    if (this.step() < this.map().steps.length - 1) {
      this.ended.set(false);
      this.step.update((s) => s + 1);
      navigator.vibrate?.(8);
    }
  }

  protected previous(): void {
    if (this.step() > 0) {
      this.ended.set(false);
      this.step.update((s) => s - 1);
    }
  }

  protected togglePlay(): void {
    this.playing.update((p) => !p);
    if (!this.playing()) speechSynthesis?.cancel();
  }

  protected restart(): void {
    this.ended.set(false);
    this.step.set(0);
    this.playing.set(true);
  }

  protected toggleNarration(): void {
    this.narrate.update((n) => !n);
    try {
      localStorage.setItem(NARRATION_KEY, JSON.stringify(this.narrate()));
    } catch {
      // armazenamento indisponível
    }
    if (!this.narrate()) speechSynthesis?.cancel();
  }

  protected close(): void {
    speechSynthesis?.cancel();
    this.closed.emit();
  }

  protected touchStart(e: TouchEvent): void {
    this.touch = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }

  protected touchEnd(e: TouchEvent): void {
    if (!this.touch) return;
    const dx = e.changedTouches[0].clientX - this.touch.x;
    const dy = e.changedTouches[0].clientY - this.touch.y;
    this.touch = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      this.playing.set(false);
      if (dx < 0) this.next();
      else this.previous();
    }
  }

  private schedule(step: number, playing: boolean, narrate: boolean, verses: { loading: boolean; text: string }): void {
    clearTimeout(this.timer);
    if (verses.loading) return; // espera o versículo para narrar/cronometrar junto
    const s = this.map().steps[step];
    const last = step === this.map().steps.length - 1;
    const advance = () => {
      if (!this.playing() || this.step() !== step) return;
      if (last) {
        this.playing.set(false);
        this.ended.set(true);
      } else {
        this.next();
      }
    };

    speechSynthesis?.cancel();
    if (narrate && 'speechSynthesis' in window) {
      const text = `${this.placeName()}. ${s.text}${verses.text ? ` ${s.ref.replace(/(\d)\.(\d)/g, '$1, versículo $2')}: ${verses.text.replace(' …', '')}` : ''}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.voice = narrationVoice();
      utterance.rate = 0.98;
      if (playing) utterance.onend = () => (this.timer = setTimeout(advance, 1200));
      // Pequena pausa para a câmera chegar antes de começar a falar
      this.timer = setTimeout(() => speechSynthesis.speak(utterance), 900);
      return;
    }
    if (playing) {
      // Tempo de leitura: ~55 ms por caractere, entre 6 e 14 segundos
      const chars = s.text.length + verses.text.length;
      this.timer = setTimeout(advance, Math.min(14000, Math.max(6000, chars * 55)));
    }
  }

  private loadNarration(): boolean {
    try {
      return JSON.parse(localStorage.getItem(NARRATION_KEY) ?? 'false');
    } catch {
      return false;
    }
  }
}
