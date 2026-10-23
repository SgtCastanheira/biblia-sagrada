import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { RELEASES, Release, shareText } from '../../core/whats-new';
import { BackButton } from '../../shared/back-button';

/** Todas as novidades do app, com o botão para compartilhar a atualização. */
@Component({
  selector: 'app-whats-new',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatRippleModule, BackButton],
  template: `
    <div class="top"><app-back fallback="/ajustes" /></div>
    <header class="page-head">
      <span class="overline">O que mudou</span>
      <h1>Novidades</h1>
      <p>O que chegou em cada atualização do app. Compartilhe com a sua igreja.</p>
    </header>

    @for (r of releases; track r.id; let first = $first) {
      <section class="release" [class.latest]="first">
        <div class="head">
          <span><small>{{ first ? 'Atualização mais recente' : 'Atualização' }} · {{ r.date }}</small>{{ r.title }}</span>
          <button mat-stroked-button (click)="share(r)"><mat-icon>share</mat-icon> Compartilhar</button>
        </div>
        <div class="list">
          @for (i of r.items; track i.title) {
            <a class="card row" matRipple [routerLink]="i.link">
              <span class="badge"><mat-icon>{{ i.icon }}</mat-icon></span>
              <span class="texts">
                <span class="name">{{ i.title }}</span>
                <span class="desc">{{ i.text }}</span>
                @if (i.tip) { <span class="meta"><mat-icon>touch_app</mat-icon> {{ i.tip }}</span> }
              </span>
              <mat-icon class="go">chevron_right</mat-icon>
            </a>
          }
        </div>
      </section>
    }
  `,
  styleUrl: '../../shared/study.scss',
  styles: `
    .release { margin-bottom: 28px; }
    .head { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin: 0 4px 12px; }
    .head span { display: flex; flex-direction: column; font: 600 20px/1.3 var(--heading-font); }
    .head small { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1px; color: var(--accent-gold); }
    .meta { display: inline-flex; align-items: center; gap: 4px; }
    .meta mat-icon { font-size: 16px; width: 16px; height: 16px; }
  `,
})
export class WhatsNewPage {
  private readonly snackBar = inject(MatSnackBar);
  protected readonly releases = RELEASES;

  protected async share(release: Release): Promise<void> {
    const url = new URL(document.baseURI).href;
    const text = shareText(release, url);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Bíblia Sagrada — novidades', text });
        return;
      } catch {
        // cancelado: copia
      }
    }
    await navigator.clipboard.writeText(text);
    this.snackBar.open('Texto copiado — cole no WhatsApp', undefined, { duration: 2500 });
  }
}
