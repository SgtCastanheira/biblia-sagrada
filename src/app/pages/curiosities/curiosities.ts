import { CURIOSITIES_IN_ORDER } from '../../core/curiosities';
import { Component, computed, inject } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CuriositiesService } from '../../core/curiosities.service';

@Component({
  selector: 'app-curiosities',
  imports: [RouterLink, MatIconModule, MatRippleModule],
  template: `
    <header class="page-head">
      <span class="overline">Curiosidades teológicas</span>
      <h1>Você sabia?</h1>
      <p>Detalhes do texto bíblico que muita gente lê sem perceber — sempre com o versículo para conferir.</p>
    </header>

    <a class="today" matRipple [routerLink]="['/curiosidades', service.today().id]">
      <span class="today-label">
        <mat-icon>notifications</mat-icon> Curiosidade de hoje
        @if (service.unreadToday()) { <span class="new">Nova</span> }
      </span>
      <span class="today-question">{{ service.today().question }}</span>
      <span class="today-topic">{{ service.today().topic }} <mat-icon>arrow_forward</mat-icon></span>
    </a>

    <div class="progress-row">
      <span>{{ readCount() }} de {{ service.all.length }} lidas</span>
      <span class="bar"><span [style.width.%]="(readCount() / service.all.length) * 100"></span></span>
    </div>

    <div class="list">
      @for (c of others(); track c.id) {
        <a class="item" matRipple [routerLink]="['/curiosidades', c.id]" [class.read]="service.isRead(c.id)">
          <span class="icon"><mat-icon>{{ c.icon }}</mat-icon></span>
          <span class="text">
            <span class="topic">{{ c.topic }}</span>
            <span class="question">{{ c.question }}</span>
          </span>
          @if (!service.isRead(c.id)) { <span class="dot" aria-label="Não lida"></span> }
        </a>
      }
    </div>
  `,
  styles: `
    .page-head { margin: 8px 0 20px; }
    .overline { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.4px; color: var(--accent-gold); }
    h1 { font: 600 32px var(--heading-font); letter-spacing: -.4px; margin: 4px 0 6px; }
    .page-head p { margin: 0; color: var(--mat-sys-on-surface-variant); max-width: 520px; }

    .today {
      display: flex; flex-direction: column; gap: 10px; padding: 20px; border-radius: 22px; position: relative; overflow: hidden;
      text-decoration: none; color: inherit; box-shadow: var(--shadow-soft);
      background: var(--mat-sys-surface-container-low);
      border: 1px solid color-mix(in srgb, var(--accent-gold) 40%, var(--mat-sys-outline-variant));
    }
    .today-label { display: flex; align-items: center; gap: 6px; font: 600 13px Inter, sans-serif; color: var(--accent-gold); }
    .today-label mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .new {
      margin-left: auto; padding: 3px 10px; border-radius: 10px; font: 600 13px Inter, sans-serif;
      background: var(--mat-sys-primary); color: var(--mat-sys-on-primary);
    }
    .today-question { font: 600 22px/1.3 var(--heading-font); }
    .today-topic { display: flex; align-items: center; gap: 6px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-primary); }
    .today-topic mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .progress-row { display: flex; align-items: center; gap: 12px; margin: 22px 4px 10px; font: 500 13px Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
    .progress-row .bar { flex: 1; height: 3px; border-radius: 2px; background: var(--mat-sys-surface-container-highest); overflow: hidden; }
    .progress-row .bar span { display: block; height: 100%; background: var(--mat-sys-primary); }

    .list {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr));
      border-radius: 20px; overflow: hidden; border: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface-container-low); box-shadow: var(--shadow-soft);
    }
    .item {
      display: flex; align-items: center; gap: 14px; padding: 14px 16px; position: relative; overflow: hidden;
      text-decoration: none; color: inherit; border-bottom: 1px solid var(--mat-sys-outline-variant); margin-bottom: -1px;
    }
    .icon {
      flex: none; width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center;
      border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-primary);
    }
    .icon mat-icon { font-size: 21px; width: 21px; height: 21px; }
    .text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
    .topic { font: 500 13px Inter, sans-serif; letter-spacing: .4px; color: var(--mat-sys-on-surface-variant); }
    .question { font: 600 16px/1.35 var(--heading-font); }
    .item.read .question { font-weight: 400; color: var(--mat-sys-on-surface-variant); }
    .dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--mat-sys-primary); }
  `,
})
export class CuriositiesPage {
  protected readonly service = inject(CuriositiesService);
  protected readonly others = computed(() => CURIOSITIES_IN_ORDER.filter((c) => c.id !== this.service.today().id));
  protected readonly readCount = computed(() => this.service.readIds().length);
}
