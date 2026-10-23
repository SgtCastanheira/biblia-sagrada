import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { GROUPS, MemorialGroup, Person, reignStart, TWO_KINGDOMS_EVENTS, VERDICTS } from '../../core/memorial';
import { inBibleOrder, positionOfRef } from '../../core/bible-order';
import { ERA_BANDS, yearOf } from '../../core/relations';
import { Sheets } from '../../shared/sheets';

const KING_GROUPS: MemorialGroup[] = ['reis-unido', 'reis-israel', 'reis-juda'];

/** Memorial da Fé: personagens por grupo. */
@Component({
  selector: 'app-memorial',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    <header class="page-head">
      <span class="overline">Memorial da Fé</span>
      <h1>{{ timeline() ? 'Linha do tempo' : twoKingdoms() ? 'Os dois reinos' : group().name }}</h1>
      <p>
        @if (timeline()) {
          Todos os personagens do Memorial na ordem da história, de Adão aos apóstolos.
        } @else if (twoKingdoms()) {
          Israel, ao norte, e Judá, ao sul, lado a lado: de 931 a.C., quando o reino se dividiu, até o exílio. Reis do mesmo tempo aparecem na mesma linha.
        } @else {
          {{ group().description }}
          @if (group().ref; as ref) {
            <button class="ref" (click)="openRef(ref)">{{ ref }}</button>
          }
        }
      </p>
    </header>

    <nav class="chips" aria-label="Grupos">
      <a [routerLink]="[]" [queryParams]="{ grupo: 'linha-do-tempo' }" replaceUrl [class.active]="timeline()"><mat-icon>timeline</mat-icon>Linha do tempo</a>
      <a routerLink="/genealogia"><mat-icon>account_tree</mat-icon>Genealogia de Jesus</a>
      @for (g of groups; track g.id) {
        <a [routerLink]="[]" [queryParams]="{ grupo: g.id }" replaceUrl [class.active]="!twoKingdoms() && !timeline() && g.id === group().id">
          <mat-icon>{{ g.icon }}</mat-icon>{{ g.name }}
        </a>
        @if (g.id === 'reis-juda') {
          <a [routerLink]="[]" [queryParams]="{ grupo: 'dois-reinos' }" replaceUrl [class.active]="twoKingdoms()"><mat-icon>compare_arrows</mat-icon>Os dois reinos</a>
        }
      }
    </nav>

    @if (loading()) {
      <div class="skeleton"><span></span><span></span><span class="short"></span></div>
    } @else if (timeline()) {
      @for (band of bands(); track band.name) {
        <h2 class="section-title">{{ band.name }}</h2>
        <ol class="tl">
          @for (p of band.people; track p.id) {
            <li>
              <a matRipple [routerLink]="['/memorial', p.id]">
                <span class="tl-year">{{ p.period }}</span>
                <span class="tl-name">{{ p.name }} <small>{{ p.title }}</small></span>
              </a>
            </li>
          }
        </ol>
      }
    } @else if (twoKingdoms()) {
      <!-- Israel à esquerda, Judá à direita, na ordem do tempo -->
      <a class="united card" matRipple [routerLink]="[]" [queryParams]="{ grupo: 'reis-unido' }" replaceUrl>
        <mat-icon>crown</mat-icon><span><small>Antes da divisão</small>Reino Unido: Saul, Davi e Salomão</span><mat-icon class="go">chevron_right</mat-icon>
      </a>
      <div class="realms-head" aria-hidden="true">
        <span>Israel<small>Reino do Norte · Samaria</small></span><i></i><span>Judá<small>Reino do Sul · Jerusalém</small></span>
      </div>
      <ol class="realms">
        @for (r of realmRows(); track $index) {
          @if (r.event; as e) {
            <li class="event" [class.end]="e.end">
              <button (click)="openRef(e.ref)"><strong>{{ e.label }}</strong> {{ e.text }} <span class="ref-label">{{ e.ref }}</span></button>
            </li>
          } @else {
            <li class="pair">
              @for (k of [r.israel, r.juda]; track $index; let right = $odd) {
                @if (k) {
                  <a class="card realm-king" [class.right]="right" matRipple [routerLink]="['/memorial', k.id]" [attr.aria-label]="k.name + ', rei de ' + (right ? 'Judá' : 'Israel')">
                    <span class="name">{{ k.name }}</span>
                    <span class="years">{{ k.reign?.years }}<span class="len"> · {{ k.reign?.length }}</span></span>
                    <span class="verdict" [class]="k.reign?.verdict">{{ verdicts[k.reign!.verdict] }}</span>
                  </a>
                } @else {
                  <span class="empty-slot" [class.right]="right"></span>
                }
              }
              <span class="axis-dot"></span>
            </li>
          }
        }
      </ol>
      <p class="note">Datas aproximadas, antes de Cristo (cronologia de E. R. Thiele). Reis do mesmo tempo aparecem na mesma linha; alguns reinados se sobrepõem porque pai e filho governaram juntos. A avaliação é a do próprio texto bíblico.</p>
    } @else if (isKings()) {
      <!-- Reis: em ordem, com anos de reinado e avaliação bíblica -->
      <ol class="kings">
        @for (p of people(); track p.id; let i = $index) {
          <li>
            <a class="card king" matRipple [routerLink]="['/memorial', p.id]">
              <span class="order">{{ i + 1 }}</span>
              <span class="texts">
                <span class="name">{{ p.name }}</span>
                <span class="years">{{ p.reign?.years }} · {{ p.reign?.length }}</span>
              </span>
              <span class="verdict" [class]="p.reign?.verdict">{{ verdicts[p.reign!.verdict] }}</span>
            </a>
          </li>
        }
      </ol>
      <p class="note">Datas aproximadas, antes de Cristo (cronologia de E. R. Thiele). Alguns reinados se sobrepõem porque pai e filho governaram juntos por um tempo. A avaliação é a do próprio texto bíblico: “fez o que era reto (ou mau) aos olhos do Senhor”.</p>
    } @else {
      <p class="order-note"><mat-icon>sort</mat-icon> {{ ['profetas-maiores', 'profetas-menores'].includes(group().id) ? 'Na ordem dos livros da Bíblia' : 'Na ordem da história bíblica' }}</p>
      <div class="grid">
        @for (p of people(); track p.id) {
          <a class="card row" matRipple [routerLink]="['/memorial', p.id]">
            <span class="badge initial">{{ p.name.charAt(0) }}</span>
            <span class="texts">
              <span class="name">{{ p.name }}</span>
              <span class="meta">{{ p.period }}</span>
              <span class="desc">{{ p.title }}</span>
            </span>
            <mat-icon class="go">chevron_right</mat-icon>
          </a>
        }
      </div>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .ref {
      display: inline; padding: 0; border: 0; background: none; cursor: pointer; font: inherit; font-weight: 600;
      color: var(--mat-sys-primary); text-decoration: underline; text-underline-offset: 3px;
    }
    .order-note { display: flex; align-items: center; gap: 6px; margin: 0 4px 10px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .order-note mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .genealogy { display: flex; align-items: center; gap: 12px; padding: 14px 16px; margin-bottom: 14px; border-radius: 18px; }
    .genealogy > mat-icon { color: var(--accent-gold); }
    .genealogy span { flex: 1; display: flex; flex-direction: column; font: 600 16px/1.3 var(--heading-font); }
    .genealogy small { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-gold); }
    .genealogy .go { color: var(--mat-sys-on-surface-variant); }
    .tl { list-style: none; margin: 0; padding: 0 0 0 14px; border-left: 2px solid color-mix(in srgb, var(--accent-gold) 40%, var(--mat-sys-outline-variant)); }
    .tl a {
      display: flex; flex-direction: column; padding: 8px 12px; margin: 2px 0; border-radius: 12px; text-decoration: none; color: inherit;
      position: relative; overflow: hidden;
    }
    .tl li { position: relative; }
    .tl li::before {
      content: ''; position: absolute; left: -20px; top: 17px; width: 10px; height: 10px; border-radius: 50%;
      background: var(--mat-sys-surface); border: 2px solid var(--accent-gold); box-sizing: border-box;
    }
    .tl-year { font: 600 13px Inter, sans-serif; color: var(--accent-gold); }
    .tl-name { font: 600 17px/1.3 var(--heading-font); }
    .tl-name small { font: 400 14px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .initial { font: 600 20px var(--heading-font); }
    .kings { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
    .king { display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 16px; }
    .order { font: 600 15px var(--heading-font); color: var(--mat-sys-on-surface-variant); text-align: center; }
    .texts { display: flex; flex-direction: column; min-width: 0; }
    .name { font: 600 17px/1.3 var(--heading-font); }
    .years { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .verdict {
      font: 600 13px Inter, sans-serif; padding: 4px 10px; border-radius: 12px; text-align: center; max-width: 128px;
      background: var(--mat-sys-surface-container-high); color: var(--mat-sys-on-surface-variant);
    }
    .verdict.bom { background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .verdict.mau { background: var(--mat-sys-error-container); color: var(--mat-sys-on-error-container); }
    .united { display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin-bottom: 16px; border-radius: 16px; }
    .united > mat-icon { color: var(--accent-gold); }
    .united span { flex: 1; display: flex; flex-direction: column; font: 600 16px/1.3 var(--heading-font); }
    .united small { font: 600 13px Inter, sans-serif; color: var(--accent-gold); }
    .united .go { color: var(--mat-sys-on-surface-variant); }
    .realms-head, .realms { --israel: #3f7d9e; --juda: #5d7a52; max-width: 920px; margin-left: auto; margin-right: auto; }
    .realms-head, .pair { display: grid; grid-template-columns: minmax(0, 1fr) 28px minmax(0, 1fr); }
    .realms-head { position: sticky; top: 64px; z-index: 1; padding: 8px 0; background: var(--mat-sys-surface); }
    .realms-head span { display: flex; flex-direction: column; font: 600 20px/1.2 var(--heading-font); }
    .realms-head span:first-child { text-align: right; align-items: flex-end; color: var(--israel); }
    .realms-head span:last-child { color: var(--juda); }
    .realms-head small { font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .realms {
      list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px;
      background: linear-gradient(var(--accent-gold), var(--accent-gold)) center / 2px 100% no-repeat;
    }
    .pair { position: relative; align-items: center; }
    .realm-king {
      grid-row: 1; grid-column: 1; justify-self: end; width: min(100%, 380px); box-sizing: border-box;
      display: flex; flex-direction: column; align-items: flex-end; gap: 4px; padding: 10px 12px; border-radius: 14px; text-align: right; min-width: 0;
      box-shadow: inset -4px 0 0 var(--israel), var(--shadow-soft);
    }
    .realm-king.right, .empty-slot.right { grid-column: 3; justify-self: start; align-items: flex-start; text-align: left; }
    .realm-king.right { box-shadow: inset 4px 0 0 var(--juda), var(--shadow-soft); }
    .empty-slot { grid-row: 1; grid-column: 1; }
    .axis-dot {
      grid-row: 1; grid-column: 2; justify-self: center; width: 12px; height: 12px; border-radius: 50%;
      background: var(--mat-sys-surface); border: 2px solid var(--accent-gold); box-sizing: border-box;
    }
    .realm-king .verdict { max-width: none; }
    .event button {
      position: relative; display: block; width: 100%; max-width: 788px; margin: 0 auto; padding: 10px 14px; border-radius: 14px; cursor: pointer; text-align: center;
      border: 1px solid color-mix(in srgb, var(--accent-gold) 50%, transparent); background: color-mix(in srgb, var(--accent-gold) 12%, var(--mat-sys-surface));
      color: var(--mat-sys-on-surface); font: 400 15px/1.45 var(--reading-font);
    }
    .event strong { font: 700 14px Inter, sans-serif; color: var(--accent-gold); margin-right: 4px; }
    .event.end button { background: color-mix(in srgb, var(--mat-sys-error) 8%, var(--mat-sys-surface)); border-color: color-mix(in srgb, var(--mat-sys-error) 35%, transparent); }
    .ref-label { font: 600 13px Inter, sans-serif; color: var(--mat-sys-primary); text-decoration: underline; text-underline-offset: 3px; }
    @media (max-width: 599px) {
      .realms-head span { font-size: 17px; }
      .realm-king { padding: 8px 10px; }
      .realm-king .name { font-size: 15px; }
      .len { display: none; }
    }
    .note { margin: 16px 4px 0; font: var(--mat-sys-body-small); font-size: 13px; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class MemorialPage {
  readonly grupo = input<string>();

  private readonly sheets = inject(Sheets);
  private readonly all = toSignal(inject(ContentService).memorial);

  protected readonly groups = GROUPS;
  protected readonly verdicts = VERDICTS;
  protected readonly loading = computed(() => !this.all());
  protected readonly group = computed(() => GROUPS.find((g) => g.id === this.grupo()) ?? GROUPS[0]);
  protected readonly timeline = computed(() => this.grupo() === 'linha-do-tempo');
  /** Todos os personagens, por época (cada um uma vez, na ordem do arquivo dentro da época). */
  protected readonly bands = computed(() => {
    const people = (this.all() ?? []).map((p, i) => ({ p, y: yearOf(p.period), i })).sort((a, b) => a.y - b.y || a.i - b.i);
    return ERA_BANDS.map((b) => ({ name: b.name, people: people.filter((x) => x.y >= b.from && x.y <= b.to).map((x) => x.p) })).filter((b) => b.people.length);
  });
  protected readonly isKings = computed(() => KING_GROUPS.includes(this.group().id));
  protected readonly twoKingdoms = computed(() => this.grupo() === 'dois-reinos');

  /**
   * Linhas da linha do tempo dos dois reinos: os reis em ordem de início do reinado; um rei de Israel e um
   * de Judá do mesmo tempo dividem a linha; os grandes fatos ocupam a linha inteira.
   */
  protected readonly realmRows = computed(() => {
    type Row = { israel?: Person; juda?: Person; event?: (typeof TWO_KINGDOMS_EVENTS)[number] };
    const all = this.all() ?? [];
    const kings = (['reis-israel', 'reis-juda'] as const).flatMap((g) =>
      all.filter((p) => p.groups.includes(g) && p.reign).map((p, i) => ({ key: reignStart(p.reign!.years), order: i, side: g === 'reis-israel' ? 'israel' as const : 'juda' as const, p })),
    );
    // Um fato vem antes dos reis que começam no mesmo ano
    const items = [
      ...kings.map((k) => ({ ...k, event: undefined })),
      ...TWO_KINGDOMS_EVENTS.map((e, i) => ({ key: e.year + 0.5, order: i, side: null, p: undefined, event: e })),
    ].sort((a, b) => b.key - a.key || a.order - b.order);
    const rows: Row[] = [];
    for (const item of items) {
      if (item.event) {
        rows.push({ event: item.event });
        continue;
      }
      const last = rows.at(-1);
      if (last && !last.event && !last[item.side!]) last[item.side!] = item.p;
      else rows.push({ [item.side!]: item.p });
    }
    return rows;
  });
  protected readonly people = computed(() => {
    const list = (this.all() ?? []).filter((p) => p.groups.includes(this.group().id));
    // Os profetas escritores seguem a ordem dos livros na Bíblia (Isaías → Daniel; Oseias → Malaquias)
    const byBook: MemorialGroup[] = ['profetas-maiores', 'profetas-menores'];
    return byBook.includes(this.group().id) ? inBibleOrder(list, (p) => positionOfRef(p.keyVerse)) : list;
  });

  protected openRef(ref: string): void {
    this.sheets.passage(ref);
  }
}
