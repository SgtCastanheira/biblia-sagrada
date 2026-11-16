import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { REFRESH_MS, NEWS_SOURCES, agoLabel } from '../core/christian-world';
import { ChristianWorldService } from '../core/christian-world.service';

/**
 * Mundo Cristão, a seção de notícias do Jornal (embutida em /vozes, abaixo dos sermões): missões, igreja perseguida e países
 * onde o evangelho é proibido. Lê as fontes ao vivo a cada abertura e a cada 5 minutos enquanto a tela está aberta; se a busca
 * falhar, mostra o resumo diário salvo pelo GitHub Actions. Cada cartão leva à matéria original, na fonte.
 */
@Component({
  selector: 'app-world-news',
  imports: [MatIconModule],
  template: `
    <div class="status" role="status" aria-live="polite">
      @if (svc.state() === 'loading') {
        <span class="badge"><mat-icon aria-hidden="true">sync</mat-icon> Buscando as notícias…</span>
      } @else if (svc.updatedAt() !== null) {
        <span class="badge" [class.live]="svc.origin() === 'live'" [class.saved]="svc.origin() === 'cache'">
          <span class="dot" aria-hidden="true"></span>
          @if (svc.origin() === 'live') { Atualizado {{ ago() }} } @else { Sem conexão com as fontes · resumo salvo {{ ago() }} }
        </span>
      }
      <button type="button" class="refresh" (click)="svc.load()" [disabled]="svc.refreshing()">
        <mat-icon aria-hidden="true">refresh</mat-icon> {{ svc.refreshing() ? 'Atualizando…' : 'Atualizar' }}
      </button>
    </div>
    @if (svc.origin() === 'live' && svc.failed().length) {
      <p class="warn">{{ svc.failed().join(', ') }} não respondeu agora; as matérias dessa fonte, se houver, vêm do resumo salvo.</p>
    }

    @if (sources().length > 1) {
      <div class="chips" role="group" aria-label="Filtrar por fonte">
        <button type="button" class="chip" [class.on]="!source()" [attr.aria-pressed]="!source()" (click)="source.set('')">Todas</button>
        @for (name of sources(); track name) {
          <button type="button" class="chip" [class.on]="source() === name" [attr.aria-pressed]="source() === name" (click)="source.set(name)">{{ name }}</button>
        }
      </div>
    }

    @if (svc.state() === 'loading') {
      <div class="grid" aria-hidden="true">
        @for (n of skeleton; track n) {
          <div class="card skeleton"><span class="img"></span><span class="line w40"></span><span class="line"></span><span class="line w80"></span></div>
        }
      </div>
    } @else if (visible().length) {
      <ul class="grid">
        @for (item of visible(); track item.url) {
          <li class="card">
            @if (item.thumbnail && !broken().has(item.thumbnail)) {
              <img class="img" [src]="item.thumbnail" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" (error)="markBroken(item.thumbnail)" />
            } @else {
              <span class="img empty" aria-hidden="true"><mat-icon>public</mat-icon></span>
            }
            <div class="body">
              <p class="meta"><strong>{{ item.fonte }}</strong><span aria-hidden="true">·</span><time [attr.datetime]="item.data">{{ dateText(item.data) }}</time></p>
              <h3><a [href]="item.url" target="_blank" rel="noopener noreferrer">{{ item.titulo }}<span class="sr"> (abre o site da fonte em outra aba)</span></a></h3>
              @if (item.resumo) { <p class="summary">{{ item.resumo }}</p> }
              <span class="go" aria-hidden="true">Ler na fonte <mat-icon>open_in_new</mat-icon></span>
            </div>
          </li>
        }
      </ul>
    } @else {
      <div class="none">
        <mat-icon aria-hidden="true">newspaper</mat-icon>
        <p>Nenhuma notícia encontrada agora.</p>
        <button type="button" class="refresh" (click)="svc.load()" [disabled]="svc.refreshing()"><mat-icon aria-hidden="true">refresh</mat-icon> Tentar de novo</button>
      </div>
    }

    <section class="note" aria-labelledby="fontes-title">
      <h3 id="fontes-title">Fontes</h3>
      <ul class="sources">
        @for (s of sourceList; track s.name) {
          <li><a [href]="s.site" target="_blank" rel="noopener noreferrer">{{ s.name }}<span class="sr"> (abre o site em outra aba)</span></a></li>
        }
      </ul>
      <p>
        O app mostra só o título, um resumo curto e o link; o texto e as imagens são de cada site. Ao abrir esta tela, o app consulta
        esses sites pela internet (os feeds passam por um serviço que os lê por nós) e, se não conseguir, usa o resumo que é salvo uma vez por dia.
      </p>
    </section>
  `,
  styles: `
    :host { display: block; }
    .status { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 12px; margin: 0 0 10px; }
    .badge { display: inline-flex; align-items: center; gap: 8px; min-height: 32px; padding: 0 12px; border-radius: 16px; background: var(--mat-sys-surface-container); color: var(--mat-sys-on-surface-variant); font: 600 13px/1.3 Inter, sans-serif; }
    .badge mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .dot { width: 9px; height: 9px; flex: none; border-radius: 50%; background: var(--mat-sys-outline); }
    .live .dot { background: #2e9d5b; }
    .saved .dot { background: var(--accent-gold); }
    @media (prefers-reduced-motion: no-preference) { .live .dot { animation: beat 2.4s ease-in-out infinite; } }
    @keyframes beat { 50% { opacity: .35; } }
    .refresh, .chip { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; padding: 0 16px; border: 1px solid var(--mat-sys-outline-variant); border-radius: 22px; background: var(--mat-sys-surface); color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif; cursor: pointer; }
    .refresh mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .refresh:disabled { opacity: .6; cursor: default; }
    .refresh:focus-visible, .chip:focus-visible, .card a:focus-visible { outline: 2px solid var(--mat-sys-primary); outline-offset: 2px; }
    .warn { margin: 0 0 10px; font: 400 13px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 4px 0 16px; }
    .chip { color: var(--mat-sys-on-surface); }
    .chip.on { background: var(--mat-sys-primary); border-color: var(--mat-sys-primary); color: var(--mat-sys-on-primary); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr)); gap: 16px; margin: 0; padding: 0; list-style: none; }
    .card { position: relative; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--mat-sys-outline-variant); border-radius: 16px; background: var(--mat-sys-surface-container-low); box-shadow: var(--shadow-soft); transition: transform .2s ease, box-shadow .2s ease; }
    @media (hover: hover) and (prefers-reduced-motion: no-preference) { .card:not(.skeleton):hover { transform: translateY(-3px); box-shadow: 0 10px 26px rgb(0 0 0 / .16); } }
    .card:not(.skeleton):hover h3 a { text-decoration: underline; text-underline-offset: 4px; }
    .img { display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover; background: var(--mat-sys-surface-container-high); }
    .img.empty { display: grid; place-items: center; color: var(--mat-sys-on-surface-variant); }
    .img.empty mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .body { display: flex; flex-direction: column; gap: 8px; flex: 1; padding: 14px 16px 12px; }
    .meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 0; font: 500 13px/1.3 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .meta strong { color: var(--mat-sys-primary); font-weight: 700; }
    h3 { margin: 0; font: 700 18px/1.3 var(--heading-font); letter-spacing: -.1px; }
    h3 a { color: inherit; text-decoration: none; }
    /* O cartão inteiro é o link do título: um alvo grande, sem aninhar links */
    h3 a::after { content: ''; position: absolute; inset: 0; }
    .summary { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; margin: 0; font: 400 14px/1.55 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .go { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 4px; font: 700 14px Inter, sans-serif; color: var(--mat-sys-primary); }
    .go mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
    .skeleton { min-height: 260px; gap: 12px; padding-bottom: 16px; }
    .line { display: block; height: 14px; margin: 0 16px; border-radius: 7px; background: var(--mat-sys-surface-container-high); }
    .w40 { width: 40%; } .w80 { width: 80%; }
    @media (prefers-reduced-motion: no-preference) { .skeleton { animation: beat 1.6s ease-in-out infinite; } }
    .none { display: grid; justify-items: center; gap: 4px; padding: 36px 16px; border: 1px dashed var(--mat-sys-outline-variant); border-radius: 16px; text-align: center; color: var(--mat-sys-on-surface-variant); }
    .none mat-icon { font-size: 40px; width: 40px; height: 40px; }
    .none p { margin: 0 0 10px; font: 600 16px Inter, sans-serif; }
    .note { margin: 22px 4px 0; font: 400 13px/1.6 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .note h3 { margin: 0 0 4px; font: 700 13px Inter, sans-serif; letter-spacing: 1.2px; text-transform: uppercase; }
    .note p { margin: 4px 0 0; }
    .sources { display: flex; flex-wrap: wrap; gap: 0 6px; margin: 0; padding: 0; list-style: none; }
    .sources a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 10px; color: var(--mat-sys-primary); font: 600 14px Inter, sans-serif; text-decoration: underline; text-underline-offset: 3px; }
    .sources a:focus-visible { outline: 2px solid var(--mat-sys-primary); outline-offset: 2px; }
  `,
})
export class WorldNews {
  protected readonly svc = inject(ChristianWorldService);
  protected readonly sourceList = NEWS_SOURCES;
  protected readonly skeleton = [1, 2, 3, 4, 5, 6];
  protected readonly source = signal('');
  protected readonly broken = signal<ReadonlySet<string>>(new Set());
  /** Relógio da tela: faz o “há X min” andar sem esperar a próxima busca. */
  private readonly now = signal(Date.now());
  protected readonly ago = computed(() => agoLabel(this.svc.updatedAt() ?? this.now(), this.now()));
  protected readonly sources = computed(() => [...new Set(this.svc.items().map((i) => i.fonte))]);
  protected readonly visible = computed(() => {
    const only = this.source();
    return only ? this.svc.items().filter((i) => i.fonte === only) : this.svc.items();
  });

  constructor() {
    void this.svc.load();
    const tick = setInterval(() => this.now.set(Date.now()), 30_000);
    // A cada 5 minutos, com a tela aberta e à vista; ao voltar para a aba, atualiza se já passou o prazo
    const refresh = setInterval(() => { if (!document.hidden) void this.svc.load(); }, REFRESH_MS);
    const onVisible = () => {
      this.now.set(Date.now());
      const last = this.svc.updatedAt();
      if (!document.hidden && (last === null || Date.now() - last >= REFRESH_MS)) void this.svc.load();
    };
    document.addEventListener('visibilitychange', onVisible);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(tick);
      clearInterval(refresh);
      document.removeEventListener('visibilitychange', onVisible);
    });
  }

  protected markBroken(url: string): void {
    this.broken.update((set) => new Set(set).add(url));
  }

  protected dateText(iso: string): string {
    return new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
