import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DEVOTIONAL_BLOCKS, DevotionalBlock, DevotionalService } from '../core/devotional.service';

/** Painel "Montar meu devocional": etapas e horário do lembrete. */
@Component({
  selector: 'app-devotional-config-sheet',
  imports: [MatIconModule, MatSlideToggleModule],
  template: `
    <div class="sheet-handle"></div>
    <h2 class="sheet-title">Montar meu devocional</h2>
    <p class="intro">Escolha as etapas do seu momento com Deus. A leitura bíblica está sempre presente.</p>

    <div class="blocks">
      <div class="block fixed">
        <span class="icon"><mat-icon>menu_book</mat-icon></span>
        <span class="text"><strong>Leitura bíblica</strong><small>Sempre incluída</small></span>
        <mat-icon class="lock">lock</mat-icon>
      </div>
      @for (block of blocks; track block.id) {
        <label class="block">
          <span class="icon"><mat-icon>{{ block.icon }}</mat-icon></span>
          <span class="text"><strong>{{ block.title }}</strong><small>{{ block.question }}</small></span>
          <mat-slide-toggle [checked]="isOn(block.id)" (change)="toggle(block.id, $event.checked)" [attr.aria-label]="block.title" />
        </label>
      }
    </div>

    <div class="reminder">
      <span class="icon"><mat-icon>alarm</mat-icon></span>
      <span class="text"><strong>Lembrete diário</strong><small>Avisa se o devocional do dia ainda não foi feito</small></span>
      <input type="time" [value]="service.config().reminder ?? ''" (change)="setTime($event)"
             [disabled]="!service.config().reminder" aria-label="Horário do lembrete" />
      <mat-slide-toggle [checked]="!!service.config().reminder" (change)="service.setReminder($event.checked ? '07:00' : null)"
                        aria-label="Ativar lembrete" />
    </div>
  `,
  styles: `
    .intro { margin: -4px 20px 12px; color: var(--mat-sys-on-surface-variant); font: var(--mat-sys-body-medium); }
    .blocks { margin: 0 12px; border-radius: 18px; border: 1px solid var(--mat-sys-outline-variant); overflow: hidden; background: var(--mat-sys-surface-container-low); }
    .block, .reminder { display: flex; align-items: center; gap: 12px; padding: 12px 14px; cursor: pointer; }
    .block + .block { border-top: 1px solid var(--mat-sys-outline-variant); }
    .block.fixed { cursor: default; }
    .icon { flex: none; width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-primary); }
    .icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .text { flex: 1; min-width: 0; display: flex; flex-direction: column; }
    .text strong { font: 600 15px Inter, sans-serif; }
    .text small { font: var(--mat-sys-body-small); color: var(--mat-sys-on-surface-variant); }
    .lock { color: var(--mat-sys-outline); font-size: 18px; width: 18px; height: 18px; margin-right: 12px; }
    .reminder { margin: 12px 12px 24px; border-radius: 18px; border: 1px solid var(--mat-sys-outline-variant); background: var(--mat-sys-surface-container-low); cursor: default; }
    .reminder .icon { color: var(--accent-gold); }
    input[type='time'] {
      height: 36px; padding: 0 8px; border-radius: 10px; border: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface); color: var(--mat-sys-on-surface); font: 500 14px Inter, sans-serif;
    }
    input[type='time']:disabled { opacity: .4; }
  `,
})
export class DevotionalConfigSheet {
  protected readonly service = inject(DevotionalService);
  protected readonly blocks = DEVOTIONAL_BLOCKS;

  protected isOn(id: DevotionalBlock): boolean {
    return this.service.config().blocks.includes(id);
  }

  protected toggle(id: DevotionalBlock, on: boolean): void {
    const blocks = this.service.config().blocks.filter((b) => b !== id);
    this.service.setBlocks(on ? [...blocks, id] : blocks);
  }

  protected setTime(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) this.service.setReminder(value);
  }
}
