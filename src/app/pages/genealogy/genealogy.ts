import { NgTemplateOutlet } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { GenNode, GENEALOGY, GENEALOGY_QUESTIONS } from '../../core/genealogy';
import { RichText } from '../../shared/rich-text';
import { Sheets } from '../../shared/sheets';
import { SourcesBox } from '../../shared/sources-box';

type Line = 'mt' | 'lk' | 'both';

/** A genealogia de Jesus, de Adão até a encarnação, com as duas linhas (Mateus e Lucas). */
@Component({
  selector: 'app-genealogy',
  imports: [NgTemplateOutlet, RouterLink, MatIconModule, MatRippleModule, RichText, SourcesBox],
  template: `
    <header class="page-head">
      <span class="overline">Memorial da Fé</span>
      <h1>A genealogia de Jesus</h1>
      <p>De Adão até a encarnação: os patriarcas, os reis de Judá, os profetas de cada tempo e as duas linhas de Mateus e Lucas. Toque num nome para abrir o personagem ou o texto bíblico.</p>
    </header>

    <nav class="toc" aria-label="Partes da genealogia">
      @for (s of sections; track s.id) {
        <a [href]="'#' + s.id" (click)="jump($event, s.id)">{{ s.title }}</a>
      }
    </nav>

    <ng-template #nodeTpl let-n let-i="i">
      <li class="node" [class.king]="n.king" [class.omitted]="n.omitted" [class.christ]="n.name.startsWith('JESUS')">
        <span class="dot"></span>
        <button class="name" matRipple (click)="open(n)" [disabled]="!n.person && !n.ref">
          {{ n.name }}@if (n.alt) {<small> ({{ n.alt }})</small>}
          @if (n.person) { <mat-icon>chevron_right</mat-icon> }
        </button>
        @if (n.omitted) { <span class="tag">não citado por Mateus</span> }
        @if (n.king && !n.omitted) { <span class="tag gold">rei</span> }
        @if (n.mother; as m) {
          <span class="mother">mãe:
            @if (m.person) { <a [routerLink]="['/memorial', m.person]">{{ m.name }}</a> } @else { {{ m.name }} }
          </span>
        }
        @if (n.note) { <span class="note">{{ n.note }}</span> }
        @if (n.contemporaries?.length) {
          <span class="contemporaries"><mat-icon>record_voice_over</mat-icon>
            @for (c of n.contemporaries; track c.name; let last = $last) {
              @if (c.person) { <a [routerLink]="['/memorial', c.person]">{{ c.name }}</a> } @else { {{ c.name }} }{{ last ? '' : ', ' }}
            }
          </span>
        }
      </li>
    </ng-template>

    @for (s of sections; track s.id) {
      <section class="part" [id]="s.id">
        <div class="part-head">
          <span class="overline">{{ s.period }}</span>
          <h2>{{ s.title }}</h2>
          <app-rich-text class="intro" [source]="s.text" />
          <button class="refs" (click)="openRef(s.refs)"><mat-icon>menu_book</mat-icon> {{ s.refs }}</button>
        </div>

        @if (s.nodes) {
          <ol class="trunk">
            @for (n of s.nodes; track $index) { <ng-container *ngTemplateOutlet="nodeTpl; context: { $implicit: n }" /> }
          </ol>
        }

        @if (s.mt && s.lk) {
          <div class="switch" role="tablist">
            <button role="tab" [class.on]="line() === 'mt'" (click)="line.set('mt')">Mateus <small>(por Salomão)</small></button>
            <button role="tab" [class.on]="line() === 'lk'" (click)="line.set('lk')">Lucas <small>(por Natã)</small></button>
            <button role="tab" class="wide-only" [class.on]="line() === 'both'" (click)="line.set('both')">Lado a lado</button>
          </div>
          <div class="lines" [class.both]="line() === 'both'">
            @if (line() !== 'lk') {
              <div class="line-col">
                <h3>Mateus 1 · {{ count(s.mt, true) }} gerações</h3>
                <ol class="trunk mt">
                  @for (n of s.mt; track $index) { <ng-container *ngTemplateOutlet="nodeTpl; context: { $implicit: n }" /> }
                </ol>
              </div>
            }
            @if (line() !== 'mt') {
              <div class="line-col">
                <h3>Lucas 3 · {{ count(s.lk, false) }} gerações</h3>
                <ol class="trunk lk">
                  @for (n of s.lk; track $index) { <ng-container *ngTemplateOutlet="nodeTpl; context: { $implicit: n }" /> }
                </ol>
              </div>
            }
          </div>
        }

        @if (s.branches; as b) {
          <aside class="branches">
            <h3><mat-icon>call_split</mat-icon> {{ b.title }}</h3>
            @for (it of b.items; track it.name) {
              <p>
                @if (it.person) { <a [routerLink]="['/memorial', it.person]"><strong>{{ it.name }}</strong></a> } @else { <strong>{{ it.name }}</strong> }
                — {{ it.note }}
                @if (it.ref) { <button class="inline-ref" (click)="openRef(it.ref)">{{ it.ref }}</button> }
              </p>
            }
          </aside>
        }
      </section>
    }

    <section class="questions">
      <h2>Perguntas sobre as genealogias</h2>
      @for (q of questions; track q.q) {
        <details>
          <summary>{{ q.q }}<mat-icon>expand_more</mat-icon></summary>
          <app-rich-text [source]="q.a" />
        </details>
      }
    </section>
    <app-sources topic="genealogia" />
  `,
  styleUrl: './genealogy.scss',
})
export class GenealogyPage {
  private readonly router = inject(Router);
  private readonly sheets = inject(Sheets);
  protected readonly sections = GENEALOGY;
  protected readonly questions = GENEALOGY_QUESTIONS;
  protected readonly line = signal<Line>(matchMedia('(min-width: 840px)').matches ? 'both' : 'mt');

  /** Gerações citadas (em Mateus, sem os reis omitidos). */
  protected count(nodes: GenNode[], matthew: boolean): number {
    return nodes.filter((n) => !(matthew && n.omitted)).length;
  }

  protected open(n: GenNode): void {
    if (n.person) this.router.navigate(['/memorial', n.person]);
    else if (n.ref) this.sheets.passage(n.ref);
  }

  protected openRef(ref: string): void {
    this.sheets.passage(ref);
  }

  protected jump(e: Event, id: string): void {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
