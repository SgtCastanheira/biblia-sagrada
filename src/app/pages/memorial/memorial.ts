import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ContentService } from '../../core/content.service';
import { GROUPS, MemorialGroup, VERDICTS } from '../../core/memorial';
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
      <h1>{{ timeline() ? 'Linha do tempo' : group().name }}</h1>
      <p>
        @if (timeline()) {
          Todos os personagens do Memorial na ordem da história, de Adão aos apóstolos.
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
        <a [routerLink]="[]" [queryParams]="{ grupo: g.id }" replaceUrl [class.active]="g.id === group().id">
          <mat-icon>{{ g.icon }}</mat-icon>{{ g.name }}
        </a>
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
