import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { NotifyService } from '../core/notify.service';
import { REMINDER_WINDOWS } from '../core/reminders';
import { ReminderService } from '../core/reminders.service';

const DONE_KEY = 'biblia.lembretes.feitos';

/**
 * O chamado da vez na tela inicial (o mesmo que aparece como notificação): uma pergunta grande, que faz parar.
 * "Já fiz" esconde até o próximo; "Receber na tela" pede a permissão de notificação, para chegar com o app fechado.
 */
@Component({
  selector: 'app-reminder-card',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    @if (shown(); as r) {
      <section class="reminder" aria-labelledby="reminder-title">
        <span class="over"><mat-icon>schedule</mat-icon> {{ windows[r.slot].name }} · {{ r.at }}</span>
        <h2 id="reminder-title">{{ r.title }}</h2>
        <p>{{ r.body }}</p>
        <div class="actions">
          <a class="go" [routerLink]="r.url">{{ r.action }} <mat-icon>arrow_forward</mat-icon></a>
          <button type="button" class="done" (click)="markDone(r.id)"><mat-icon>check</mat-icon> Já fiz</button>
        </div>
        @if (canAsk()) {
          <button type="button" class="ask" (click)="enable()">
            <mat-icon>notifications_active</mat-icon> Receber estes lembretes na tela do celular
          </button>
        }
      </section>
    }
  `,
  styles: `
    :host { display: block; }
    .reminder {
      position: relative; overflow: hidden; margin: 0 0 16px; padding: 20px 20px 16px; border-radius: 22px; color: #fbf4e6;
      background: radial-gradient(110% 80% at 100% 0%, rgba(226, 194, 140, .3), transparent 60%), linear-gradient(165deg, #45321f, #21180f 75%);
      box-shadow: var(--shadow-soft);
    }
    .over { display: inline-flex; align-items: center; gap: 6px; font: 700 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.4px; color: #e2c28c; }
    .over mat-icon { font-size: 18px; width: 18px; height: 18px; }
    h2 { margin: 10px 0 8px; font: 600 26px/1.2 var(--heading-font); color: #fff8ec; text-wrap: balance; }
    p { margin: 0 0 16px; font: 400 16px/1.55 var(--reading-font); color: #eadfcb; }
    .actions { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
    .go, .done, .ask { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; border-radius: 22px; cursor: pointer; text-decoration: none; font: 600 15px Inter, sans-serif; }
    .go { padding: 0 20px; background: #e2c28c; color: #21180f; }
    .go mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .done { padding: 0 16px; border: 1px solid rgba(226, 194, 140, .5); background: transparent; color: #f1d9a8; }
    .done mat-icon, .ask mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .ask { margin-top: 12px; padding: 0 4px; border: 0; background: none; color: #f1d9a8; font-weight: 500; text-align: left; }
    .go:focus-visible, .done:focus-visible, .ask:focus-visible { outline: 2px solid #f1d9a8; outline-offset: 2px; }
  `,
})
export class ReminderCard {
  private readonly reminders = inject(ReminderService);
  private readonly notify = inject(NotifyService);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly windows = REMINDER_WINDOWS;
  private readonly done = signal<string[]>(this.load());

  protected readonly shown = computed(() => {
    const r = this.reminders.current();
    return r && !this.done().includes(r.id) ? r : null;
  });
  /** Ainda não pediu a permissão (ou ela foi dada, mas o aviso no sistema está desligado nos Ajustes). */
  protected readonly canAsk = computed(() => {
    const permission = this.notify.permission();
    return permission === 'default' || (permission === 'granted' && !this.notify.systemEnabled());
  });

  protected markDone(id: string): void {
    this.done.update((list) => [...list.slice(-20), id]);
    try {
      localStorage.setItem(DONE_KEY, JSON.stringify(this.done()));
    } catch {
      // armazenamento indisponível
    }
  }

  protected async enable(): Promise<void> {
    if (await this.notify.enableSystem()) {
      void this.notify.system('Lembretes na tela', 'Pronto: os chamados para orar e ler vão aparecer aqui, três vezes por dia.', '/ajustes', 'lembrete');
    } else {
      this.snackBar.open('Sem permissão de notificação: os lembretes continuam aparecendo dentro do app.', undefined, { duration: 4000 });
    }
  }

  private load(): string[] {
    try {
      return JSON.parse(localStorage.getItem(DONE_KEY) ?? '[]') as string[];
    } catch {
      return [];
    }
  }
}
