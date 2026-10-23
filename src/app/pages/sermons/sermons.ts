import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { SERMON_KINDS, SermonKind, SermonsService } from '../../core/sermons.service';
import { BackButton } from '../../shared/back-button';

@Component({
  selector: 'app-sermons',
  imports: [RouterLink, DatePipe, MatIconModule, MatRippleModule, BackButton],
  template: `
    <div class="top"><app-back fallback="/ensino" label="Voltar ao Ensino" /></div>
    <header class="page-head">
      <span class="overline">Ensino · Pregação</span>
      <h1>Meus sermões</h1>
    </header>

    <section class="create">
      <h2>Crie o seu próprio sermão</h2>
      <p>Escolha um modelo para começar. Cada parte traz orientações do que escrever.</p>
      <div class="kinds">
        @for (k of kinds; track k.id) {
          <button class="kind" matRipple (click)="create(k.id)">
            <mat-icon>{{ k.icon }}</mat-icon>
            <strong>{{ k.name }}</strong>
            <small>{{ k.description }}</small>
          </button>
        }
      </div>
    </section>

    @if (service.sorted().length) {
      <h2 class="list-title">Meus sermões</h2>
      <div class="list">
        @for (s of service.sorted(); track s.id) {
          <a class="sermon" matRipple [routerLink]="['/sermoes', s.id]">
            <span class="meta">
              <span class="status" [class.ready]="s.ready">{{ s.ready ? 'Pronto' : 'Rascunho' }}</span>
              <span>{{ kindName(s.kind) }} · {{ s.points.length }} tópico{{ s.points.length === 1 ? '' : 's' }} · ~{{ service.minutes(s) }} min</span>
            </span>
            <span class="title" [class.empty]="!s.title">{{ s.title || 'Sermão sem título' }}</span>
            @if (s.baseText) { <span class="base"><mat-icon>menu_book</mat-icon>{{ s.baseText }}</span> }
            <span class="date">{{ s.occasion }} · editado em {{ s.updatedAt | date: "d 'de' MMM" }}</span>
          </a>
        }
      </div>
    }
  `,
  styles: `
    :host { display: flex; flex-direction: column; gap: 14px; max-width: 720px; margin: 0 auto; }
    .page-head { margin-top: 8px; }
    .page-head h1 { margin: 4px 0 0; font: 600 32px var(--heading-font); letter-spacing: -.4px; }
    .overline { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.2px; color: var(--accent-gold); }
    .create {
      padding: 18px; border-radius: 22px; box-shadow: var(--shadow-soft);
      border: 1px solid color-mix(in srgb, var(--accent-gold) 40%, var(--mat-sys-outline-variant));
      background: var(--mat-sys-surface-container-low);
    }
    .create h2 { margin: 0; font: 600 22px var(--heading-font); }
    .create p { margin: 4px 0 14px; color: var(--mat-sys-on-surface-variant); }
    .kinds { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr)); gap: 10px; }
    .kind {
      display: flex; flex-direction: column; align-items: flex-start; gap: 4px; padding: 14px; text-align: left; cursor: pointer;
      border-radius: 16px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface); color: inherit;
      position: relative; overflow: hidden;
    }
    .kind mat-icon { color: var(--accent-gold); margin-bottom: 4px; }
    .kind strong { font: 600 16px var(--heading-font); }
    .kind small { font: 400 13px/1.4 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .list-title { margin: 12px 4px 0; font: 600 20px var(--heading-font); }
    .list { display: grid; gap: 10px; }
    .sermon {
      display: flex; flex-direction: column; gap: 4px; padding: 14px 16px; border-radius: 18px; text-decoration: none; color: inherit;
      border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); box-shadow: var(--shadow-soft);
      position: relative; overflow: hidden;
    }
    .meta { display: flex; align-items: center; gap: 8px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .status { padding: 2px 8px; border-radius: 8px; border: 1px solid var(--mat-sys-outline-variant); }
    .status.ready { border-color: transparent; background: var(--mat-sys-primary-container); color: var(--mat-sys-on-primary-container); }
    .title { font: 600 19px/1.3 var(--heading-font); }
    .title.empty { font-style: italic; font-weight: 400; color: var(--mat-sys-on-surface-variant); }
    .base { display: inline-flex; align-items: center; gap: 6px; font: 600 13px Inter, sans-serif; color: var(--mat-sys-primary); }
    .base mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .date { font: 400 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class SermonsPage {
  protected readonly service = inject(SermonsService);
  private readonly router = inject(Router);
  protected readonly kinds = SERMON_KINDS;
  protected kindName = (id: SermonKind) => SERMON_KINDS.find((k) => k.id === id)?.name ?? '';

  protected create(kind: SermonKind): void {
    const sermon = this.service.create(kind);
    this.router.navigate(['/sermoes', sermon.id]);
  }
}
