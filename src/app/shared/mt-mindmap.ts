import { Component, ElementRef, computed, effect, input, signal, untracked, viewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import type { MtBranch, MtImage, MtPlace } from '../core/mt-church-map-types';
import { MT_BRANCHES } from '../core/mt-church-map';
import { PhotoViewer, ViewedPhoto } from './photo-viewer';

const SMALL = new Set(['de', 'da', 'do', 'dos', 'das', 'e']);

/** Iniciais para quem ainda não tem foto: primeira e última palavra do nome, sem “de/da/do”. */
export function initialsOf(name: string): string {
  const words = name.split(/\s+/).filter((w) => w && !SMALL.has(w.toLowerCase()));
  const first = words[0]?.[0] ?? '?';
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return (first + last).toLocaleUpperCase('pt-BR');
}

/**
 * A igreja em Mato Grosso como um mapa mental: o estado no centro, as regiões em volta, as cidades dentro de cada região e,
 * ao tocar numa cidade, a história dela com foto, bandeira, linha do tempo e as pessoas. O que não foi aberto não carrega.
 */
@Component({
  selector: 'app-mt-mindmap',
  imports: [MatIconModule, PhotoViewer],
  template: `
    <section class="map" aria-labelledby="mapa-mental-titulo">
      <h2 id="mapa-mental-titulo" class="mm-title">Mapa Mental: Cidade por Cidade</h2>
      <p class="how">Toque num ramo para ver as cidades e, numa cidade, para abrir a história dela, com as pessoas, o lugar e o que a igreja deixou.</p>

      <div class="root">
        <img src="conteudo/bandeiras/mt.webp" alt="Bandeira de Mato Grosso" width="54" height="38" />
        <span class="rt"><strong>Mato Grosso</strong><small>da primeira pregação, em 1936, até hoje</small></span>
      </div>
      <span class="stem" aria-hidden="true"></span>

      <ul class="branches">
        @for (b of branches; track b.id) {
          <li>
            <button type="button" class="branch" [class.on]="openBranch() === b.id" [style.--c]="b.color" [attr.aria-expanded]="openBranch() === b.id" (click)="toggleBranch(b)">
              <mat-icon aria-hidden="true">{{ b.icon }}</mat-icon>
              <span class="bt"><strong>{{ b.name }}</strong><small>{{ b.places.length }} {{ b.places.length === 1 ? 'lugar' : 'lugares' }}</small></span>
            </button>
          </li>
        }
      </ul>

      @if (branch(); as b) {
        <span class="stem" aria-hidden="true"></span>
        <div class="tray" [style.--c]="b.color" role="group" [attr.aria-label]="'Lugares do ramo ' + b.name">
          <p class="hint">{{ b.hint }}</p>
          <ul class="places">
            @for (p of b.places; track p.id) {
              <li>
                <button type="button" class="place" [class.on]="selectedId() === p.id" [attr.aria-expanded]="selectedId() === p.id" (click)="pick(p)">
                  @if (p.flag; as f) {
                    <img class="flag" [src]="'conteudo/' + f.src" [alt]="f.alt" [attr.width]="36" [attr.height]="24" loading="lazy" decoding="async" />
                  } @else {
                    <mat-icon class="ico" aria-hidden="true">{{ p.icon || 'place' }}</mat-icon>
                  }
                  <span class="pt"><strong>{{ p.name }}</strong>@if (p.since) { <small>desde {{ p.since }}</small> }</span>
                </button>
              </li>
            }
          </ul>
        </div>
      }

      @if (place(); as p) {
        <article #story class="story" tabindex="-1" [style.--c]="branch()?.color" [attr.aria-label]="'História de ' + p.name">
          <header class="sh">
            @if (p.flag; as f) {
              <button type="button" class="flagbtn" (click)="view(f)" [attr.aria-label]="'Ampliar a bandeira de ' + p.name">
                <img [src]="'conteudo/' + f.src" [alt]="f.alt" [attr.width]="64" [attr.height]="44" decoding="async" />
              </button>
            }
            <div class="st"><h3>{{ p.name }}</h3>@if (p.since) { <span class="since">A igreja aparece nas fontes em {{ p.since }}</span> }</div>
            <button type="button" class="close" (click)="close()" aria-label="Fechar a história"><mat-icon>close</mat-icon></button>
          </header>

          @for (img of images(p); track img.src) {
            <figure class="shot">
              <button type="button" class="open" (click)="view(img)" [attr.aria-label]="'Ampliar a foto: ' + img.alt">
                <img [src]="'conteudo/' + img.src" [alt]="img.alt" [attr.width]="img.w" [attr.height]="img.h" loading="lazy" decoding="async" />
              </button>
              <figcaption>{{ img.caption }} <span class="cred">{{ img.credit }}</span></figcaption>
            </figure>
          }

          <section>
            <h4>O lugar</h4>
            <p>{{ p.place }}</p>
            <p class="src">{{ p.placeSource }}</p>
          </section>

          <section>
            <h4>A igreja chega</h4>
            @if (p.facts.length) {
              <ol class="facts">
                @for (f of p.facts; track f.year + f.text) { <li><b>{{ f.year }}</b><span>{{ f.text }}</span></li> }
              </ol>
            } @else {
              <p class="none">Os documentos que encontrei não contam como a igreja chegou aqui.</p>
            }
          </section>

          @if (p.people.length) {
            <section>
              <h4>Quem fez</h4>
              <ul class="people">
                @for (q of p.people; track q.name) {
                  <li>
                    @if (q.photo; as ph) {
                      <button type="button" class="face" (click)="view(ph)" [attr.aria-label]="'Ampliar a foto de ' + q.name"><img [src]="'conteudo/' + ph.src" [alt]="ph.alt" width="56" height="56" loading="lazy" decoding="async" /></button>
                    } @else {
                      <span class="face init" aria-hidden="true">{{ initials(q.name) }}</span>
                    }
                    <span class="pn"><strong>{{ q.name }}</strong><small>{{ q.role }}</small></span>
                  </li>
                }
              </ul>
            </section>
          }

          <section class="benefit">
            <h4>O que ficou para a cidade</h4>
            <p>{{ p.benefit }}</p>
          </section>

          <p class="missing"><mat-icon aria-hidden="true">help</mat-icon><span><b>Falta confirmar.</b> {{ p.missing }}</span></p>
          <p class="src">Fontes: {{ p.sources }}</p>
          @if (anchorOf(p)) {
            <button type="button" class="full" (click)="readMore(p)"><mat-icon aria-hidden="true">menu_book</mat-icon> Ler a história completa no texto</button>
          }
        </article>
      }

      <app-photo-viewer [photo]="viewed()" (closed)="viewed.set(null)" />
    </section>
  `,
  styles: `
    :host { display: block; margin: 0 0 26px; }
    .map { padding: 18px 14px 20px; border-radius: 24px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); }
    .mm-title { margin: 0 0 6px; font: 600 24px/1.2 var(--heading-font); }
    .how { margin: 0 0 16px; font: 400 15px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    small { font: 400 13px/1.35 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    strong { font-weight: 600; }
    ul, ol { list-style: none; margin: 0; padding: 0; }
    button { font-family: Inter, sans-serif; color: var(--mat-sys-on-surface); cursor: pointer; }
    button:focus-visible { outline: 3px solid var(--mat-sys-primary); outline-offset: 3px; }
    .stem { display: block; width: 2px; height: 18px; margin: 0 auto; background: var(--mat-sys-outline); }

    .root { display: flex; align-items: center; gap: 12px; width: fit-content; max-width: 100%; margin: 0 auto; padding: 12px 22px 12px 14px; border-radius: 999px; background: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    .root img { flex: none; border-radius: 5px; box-shadow: 0 0 0 1px rgba(255, 255, 255, .5); }
    .rt { display: grid; gap: 1px; } .rt strong { font: 600 18px/1.2 var(--heading-font); } .rt small { color: var(--mat-sys-on-primary); opacity: .92; }

    .branches { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .branch { display: flex; align-items: center; gap: 10px; width: 100%; min-height: 64px; padding: 10px 14px; text-align: left; border: 2px solid color-mix(in srgb, var(--c) 55%, var(--mat-sys-outline-variant));
      border-radius: 30px 10px 30px 10px; background: color-mix(in srgb, var(--c) 14%, var(--mat-sys-surface-container-low)); transition: background .2s, transform .2s; }
    .branch.on { background: color-mix(in srgb, var(--c) 30%, var(--mat-sys-surface-container-low)); border-color: var(--c); }
    .branch mat-icon { flex: none; color: var(--c); filter: saturate(1.2); }
    .bt { display: grid; gap: 1px; min-width: 0; } .bt strong { font-size: 15px; line-height: 1.25; }

    .tray { padding: 12px; border-radius: 20px; border: 2px solid var(--c); border-top-width: 6px; background: color-mix(in srgb, var(--c) 9%, var(--mat-sys-surface)); }
    .hint { margin: 0 0 10px; font: 400 14px/1.45 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .places { display: flex; flex-wrap: wrap; gap: 8px; }
    .place { display: flex; align-items: center; gap: 9px; min-height: 48px; max-width: 100%; padding: 6px 16px 6px 8px; text-align: left; border: 1px solid color-mix(in srgb, var(--c) 50%, var(--mat-sys-outline-variant)); border-radius: 999px; background: var(--mat-sys-surface-container-lowest, var(--mat-sys-surface)); }
    .place.on { background: color-mix(in srgb, var(--c) 28%, var(--mat-sys-surface)); border-color: var(--c); }
    .flag { flex: none; border-radius: 4px; object-fit: cover; box-shadow: 0 0 0 1px var(--mat-sys-outline-variant); }
    .ico { flex: none; color: var(--c); width: 30px; height: 24px; font-size: 24px; text-align: center; }
    .pt { display: grid; gap: 0; min-width: 0; } .pt strong { font-size: 15px; line-height: 1.25; }

    .story { margin-top: 16px; padding: 16px 14px 18px; border-radius: 20px; border: 2px solid var(--c); border-top-width: 6px; background: var(--mat-sys-surface); scroll-margin-top: 80px; display: grid; gap: 14px; }
    .story:focus { outline: none; }
    .sh { display: flex; align-items: center; gap: 12px; }
    .st { flex: 1; min-width: 0; display: grid; gap: 2px; } .st h3 { margin: 0; font: 600 24px/1.15 var(--heading-font); }
    .since { font: 500 13px/1.35 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .flagbtn, .open, .face { padding: 0; border: 0; background: none; border-radius: 8px; } .flagbtn img { display: block; border-radius: 6px; box-shadow: 0 0 0 1px var(--mat-sys-outline-variant); }
    .close { display: grid; place-items: center; flex: none; width: 44px; height: 44px; border: 0; border-radius: 50%; background: var(--mat-sys-surface-container); }
    h4 { margin: 0 0 6px; font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: .9px; color: var(--mat-sys-on-surface-variant); }
    section p { margin: 0 0 6px; font: 400 16px/1.6 var(--body-font, Inter, sans-serif); }
    .src { margin: 4px 0 0; font: 400 13px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .shot { margin: 0; display: grid; gap: 6px; } .open { display: block; width: 100%; } .shot img { display: block; width: 100%; height: auto; max-height: 340px; object-fit: cover; border-radius: 14px; }
    figcaption { font: 400 13px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); } .cred { display: block; opacity: .95; }
    .facts { display: grid; gap: 8px; border-left: 3px solid var(--c); padding-left: 12px; }
    .facts li { display: grid; gap: 2px; font: 400 16px/1.5 var(--body-font, Inter, sans-serif); } .facts b { font: 700 14px Inter, sans-serif; color: var(--mat-sys-on-surface); }
    .none { color: var(--mat-sys-on-surface-variant); font-style: italic; }
    .people { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
    .people li { display: flex; align-items: center; gap: 10px; }
    .face { flex: none; width: 56px; height: 56px; border-radius: 50%; overflow: hidden; } .face img { width: 56px; height: 56px; object-fit: cover; display: block; }
    .init { display: inline-grid; place-items: center; font: 700 17px Inter, sans-serif; color: var(--mat-sys-on-surface); background: color-mix(in srgb, var(--c) 26%, var(--mat-sys-surface-container)); border: 2px solid color-mix(in srgb, var(--c) 60%, transparent); }
    .pn { display: grid; gap: 1px; min-width: 0; } .pn strong { font-size: 15px; line-height: 1.25; }
    .benefit { padding: 12px 14px; border-radius: 14px; background: color-mix(in srgb, var(--c) 12%, var(--mat-sys-surface)); }
    .missing { display: flex; align-items: flex-start; gap: 8px; margin: 0; font: 400 14px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); } .missing mat-icon { flex: none; font-size: 20px; width: 20px; height: 20px; }
    .full { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 46px; padding: 8px 18px; border: 1px solid var(--mat-sys-primary); border-radius: 999px; background: none; font-weight: 600; font-size: 15px; color: var(--mat-sys-primary); }
    @media (min-width: 640px) {
      .map { padding: 24px 22px 26px; } .branches { grid-template-columns: repeat(3, 1fr); }
      .story { padding: 20px 22px 22px; } .shot img { max-height: 380px; }
    }
    @media (prefers-reduced-motion: reduce) { .branch { transition: none; } }
  `,
})
export class MtMindmap {
  /** Cidade que abre de cara (vem do endereço: ?cidade=sinop). */
  readonly initial = input<string | null | undefined>(null);
  /** Título de cada capítulo do texto → âncora dele na página (para “Ler a história completa”). */
  readonly chapters = input<Record<string, string>>({});

  protected readonly branches: readonly MtBranch[] = MT_BRANCHES;
  protected readonly openBranch = signal<string | null>(null);
  protected readonly selectedId = signal<string | null>(null);
  protected readonly viewed = signal<ViewedPhoto | null>(null);
  private readonly story = viewChild<ElementRef<HTMLElement>>('story');

  protected readonly branch = computed(() => this.branches.find((b) => b.id === this.openBranch()) ?? null);
  protected readonly place = computed<MtPlace | null>(() => this.branch()?.places.find((p) => p.id === this.selectedId()) ?? null);
  protected readonly initials = initialsOf;

  constructor() {
    effect(() => {
      const id = this.initial();
      if (!id) return;
      const found = this.branches.flatMap((b) => b.places.map((p) => ({ b, p }))).find((x) => x.p.id === id);
      if (found) untracked(() => { this.openBranch.set(found.b.id); this.selectedId.set(found.p.id); });
    });
  }

  protected toggleBranch(b: MtBranch): void {
    const same = this.openBranch() === b.id;
    this.openBranch.set(same ? null : b.id);
    if (!same) this.selectedId.set(null);
  }

  protected pick(p: MtPlace): void {
    const same = this.selectedId() === p.id;
    this.selectedId.set(same ? null : p.id);
    if (!same) setTimeout(() => this.bringStoryIntoView(), 60);
  }

  protected close(): void {
    this.selectedId.set(null);
  }

  protected images(p: MtPlace): MtImage[] {
    return [p.photo, p.epoch].filter((i): i is MtImage => !!i);
  }

  protected view(img: MtImage): void {
    this.viewed.set({ src: img.src, alt: img.alt, caption: `${img.caption} — ${img.credit}` });
  }

  protected anchorOf(p: MtPlace): string | null {
    return (p.chapter && this.chapters()[p.chapter]) || null;
  }

  protected readMore(p: MtPlace): void {
    const anchor = this.anchorOf(p);
    const el = anchor ? document.getElementById(anchor) : null;
    if (!el) return;
    const calm = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  }

  private bringStoryIntoView(): void {
    const el = this.story()?.nativeElement;
    if (!el) return;
    const calm = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  }
}
