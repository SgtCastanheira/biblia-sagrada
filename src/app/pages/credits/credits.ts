import { RouterLink } from '@angular/router';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CREDITS } from '../../core/credits';
import { BackButton } from '../../shared/back-button';

/** Sobre o app e os créditos das fontes usadas. */
@Component({
  selector: 'app-credits',
  imports: [BackButton, MatIconModule, RouterLink],
  template: `
    <div class="article">
      <div class="top"><app-back fallback="/ajustes" /></div>
      <span class="overline">Sobre</span>
      <h1 class="title">Créditos e licenças</h1>
      <p class="lead">Este app reúne textos e dados de várias fontes. Agradecemos a quem os disponibilizou — e respeitamos as licenças de cada um.</p>
      <p class="lead">As fontes dos textos de estudo (fontes antigas, arqueologia e obras de referência) estão em <a routerLink="/fontes">Fontes das informações</a>.</p>

      @for (g of credits; track g.group) {
        <h2 class="section-title">{{ g.group }}</h2>
        <div class="list">
          @for (c of g.items; track c.name) {
            <article class="card credit">
              <h3>{{ c.name }}</h3>
              <p>{{ c.use }}</p>
              <span class="license"><mat-icon>verified</mat-icon>{{ c.license }}</span>
              @if (c.url) { <a [href]="c.url" target="_blank" rel="noopener">{{ c.url.replace('https://', '') }}</a> }
            </article>
          }
        </div>
      }
    </div>
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .credit { display: flex; flex-direction: column; gap: 4px; padding: 14px 16px; border-radius: 16px; }
    .credit h3 { margin: 0; font: 600 16px var(--heading-font); }
    .credit p { margin: 0; font: 400 15px/1.5 var(--reading-font); color: var(--mat-sys-on-surface-variant); }
    .license { display: inline-flex; align-items: center; gap: 6px; font: 600 13px Inter, sans-serif; color: var(--accent-gold); }
    .license mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .credit a { align-self: flex-start; display: inline-flex; align-items: center; min-height: 32px; font: 500 14px Inter, sans-serif; color: var(--mat-sys-primary); }
  `,
})
export class CreditsPage {
  protected readonly credits = CREDITS;
}
