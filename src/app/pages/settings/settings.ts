import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { BOOKS } from '../../core/books';
import { BackupService } from '../../core/backup.service';
import { NotifyService } from '../../core/notify.service';
import { ReminderService } from '../../core/reminders.service';
import { PwaService } from '../../core/pwa.service';
import { FavoritesService } from '../../core/favorites.service';
import { SettingsService } from '../../core/settings.service';
import { findVersion } from '../../core/versions';
import { ReadingSettings } from '../../shared/reading-settings';
import { Sheets } from '../../shared/sheets';

const TOTAL_CHAPTERS = BOOKS.reduce((sum, b) => sum + b.chapters, 0);

@Component({
  selector: 'app-settings',
  imports: [ReadingSettings, RouterLink, MatButtonModule, MatIconModule, MatRippleModule, MatSlideToggleModule],
  template: `
    <h1>Ajustes</h1>

    @if (!pwa.installed()) {
      <section class="card install">
        <img src="icons/icon-96x96.png" alt="" width="56" height="56" />
        <div>
          <strong>Instale o app no seu celular</strong>
          @if (pwa.canInstall()) {
            <p>Fica na tela inicial, abre em tela cheia e funciona sem internet nos capítulos já lidos.</p>
            <button mat-flat-button (click)="pwa.install()"><mat-icon>install_mobile</mat-icon> Instalar</button>
          } @else if (pwa.isIos) {
            <p>No Safari, toque em <mat-icon class="inline">ios_share</mat-icon> <strong>Compartilhar</strong> e depois em <strong>Adicionar à Tela de Início</strong>.</p>
          } @else {
            <p>No Chrome, abra o menu <strong>⋮</strong> e toque em <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.</p>
          }
        </div>
      </section>
    }

    <section class="card">
      <h2>Versões</h2>
      <button class="row" matRipple (click)="pickVersion()">
        <span class="badge">{{ version()?.abbrev }}</span>
        <span class="row-text"><strong>Versão principal</strong><small>{{ version()?.name }}</small></span>
        <mat-icon>chevron_right</mat-icon>
      </button>
      <button class="row" matRipple (click)="pickCompare()">
        <span class="badge tertiary"><mat-icon>compare_arrows</mat-icon></span>
        <span class="row-text"><strong>Comparar com</strong><small>{{ compare()?.name ?? 'Desativado' }}</small></span>
        @if (compare()) {
          <button mat-icon-button (click)="$event.stopPropagation(); settings.compareVersion.set(null)" aria-label="Desativar comparação">
            <mat-icon>close</mat-icon>
          </button>
        } @else {
          <mat-icon>chevron_right</mat-icon>
        }
      </button>
    </section>

    <section class="card">
      <h2>Notificações</h2>
      <a class="row" matRipple routerLink="/curiosidades">
        <span class="badge gold"><mat-icon>lightbulb</mat-icon></span>
        <span class="row-text"><strong>Você sabia?</strong><small>Uma curiosidade teológica por dia, com os versículos</small></span>
        <mat-icon>chevron_right</mat-icon>
      </a>
      <div class="row toggle-row">
        <span class="badge gold"><mat-icon>self_improvement</mat-icon></span>
        <span class="row-text">
          <strong>Lembretes do dia</strong>
          <small>Três chamados por dia para orar, ler e pensar em Deus, cada dia em horários diferentes@if (reminders.enabled()) {. Hoje: {{ todayTimes() }}}</small>
        </span>
        <mat-slide-toggle [checked]="reminders.enabled()" (change)="reminders.enabled.set($event.checked)" aria-label="Lembretes do dia" />
      </div>
      <div class="row toggle-row">
        <span class="badge"><mat-icon>notifications_active</mat-icon></span>
        <span class="row-text">
          <strong>Avisar no sistema</strong>
          <small>
            @switch (notify.permission()) {
              @case ('unsupported') { Este navegador não suporta notificações }
              @case ('denied') { Bloqueado no navegador — libere nas permissões do site }
              @default { Os lembretes do dia, a curiosidade e a EBD aparecem na tela do celular ou do computador. Com o app aberto, chegam na hora; fechado, o Android e o computador com o app instalado avisam quando o sistema permitir }
            }
          </small>
        </span>
        <mat-slide-toggle [checked]="notify.systemEnabled()" (change)="toggleNotifications($event.checked)"
                          [disabled]="notify.permission() === 'unsupported' || notify.permission() === 'denied'"
                          aria-label="Notificações do sistema" />
      </div>
    </section>

    <section class="card">
      <h2>Aparência</h2>
      <app-reading-settings />
    </section>

    <section class="card">
      <h2>Seus dados</h2>
      <p class="data-info">
        Favoritos, anotações, devocionais e pedidos de oração ficam <strong>só neste aparelho</strong>.
        Faça um backup de vez em quando — e antes de trocar de celular.
      </p>
      <p class="last-backup">
        <mat-icon>{{ backup.lastBackup() ? 'cloud_done' : 'cloud_off' }}</mat-icon>
        {{ backup.lastBackup() ? 'Último backup: ' + lastBackupLabel() : 'Nenhum backup feito ainda' }}
      </p>
      <div class="buttons">
        <button mat-flat-button (click)="backup.export()"><mat-icon>download</mat-icon> Fazer backup</button>
        <button mat-stroked-button (click)="fileInput.click()"><mat-icon>upload</mat-icon> Restaurar</button>
        <input #fileInput type="file" accept="application/json,.json" hidden (change)="restore($event)" />
      </div>
    </section>

    <section class="card">
      <h2>Seu progresso</h2>
      <div class="progress-info">
        <strong>{{ settings.totalRead() }}</strong> <span>de {{ total }} capítulos lidos</span>
      </div>
      <div class="bar"><span [style.width.%]="(settings.totalRead() / total) * 100"></span></div>
      <div class="buttons">
        <button mat-stroked-button (click)="resetProgress()"><mat-icon>restart_alt</mat-icon> Zerar progresso</button>
        <button mat-stroked-button (click)="clearFavorites()" [disabled]="!favorites.favorites().length">
          <mat-icon>bookmark_remove</mat-icon> Apagar favoritos
        </button>
      </div>
    </section>

    <section class="about">
      <span class="logo"><mat-icon>menu_book</mat-icon></span>
      <strong>Bíblia Sagrada</strong>
      <small>Sete versões em português embutidas no app, todas de domínio público ou licença livre.<br />Versões em outros idiomas via bible-api.com.</small>
      <a mat-stroked-button routerLink="/novidades" class="credits"><mat-icon>celebration</mat-icon> Novidades</a>
      <a mat-stroked-button routerLink="/creditos" class="credits"><mat-icon>verified</mat-icon> Créditos e licenças</a>
    </section>
  `,
  styles: `
    h1 { font: 600 32px var(--heading-font); letter-spacing: -.4px; margin: 8px 0 16px; }
    :host { display: grid; gap: 16px; max-width: 640px; margin: 0 auto; }
    h1 { margin-bottom: 0; }
    .card { padding: 4px 20px 20px; border-radius: 22px; box-shadow: var(--shadow-soft); background: var(--mat-sys-surface-container-low); border: 1px solid var(--mat-sys-outline-variant); }
    h2 { font: 600 13px Inter, sans-serif; text-transform: uppercase; letter-spacing: 1.4px; color: var(--accent-gold); margin: 18px 0 8px; }
    .row {
      display: flex; align-items: center; gap: 14px; width: calc(100% + 16px); margin: 0 -8px; padding: 10px 8px;
      border: 0; border-radius: 16px; background: none; color: inherit; text-align: left; cursor: pointer; position: relative; overflow: hidden;
    }
    .badge {
      flex: none; width: 44px; height: 44px; box-sizing: border-box; border-radius: 50%; display: grid; place-items: center;
      border: 1px solid var(--mat-sys-outline-variant); color: var(--mat-sys-primary); font: 600 13px Inter, sans-serif; letter-spacing: .4px;
    }
    .badge.tertiary, .badge.gold { color: var(--accent-gold); }
    .badge mat-icon { font-size: 21px; width: 21px; height: 21px; }
    a.row { text-decoration: none; }
    .toggle-row { cursor: default; }
    .row-text { flex: 1; display: flex; flex-direction: column; min-width: 0; }
    .row-text strong { font: 600 16px Inter, sans-serif; }
    .row-text small { font: var(--mat-sys-body-medium); color: var(--mat-sys-on-surface-variant); }
    app-reading-settings { margin-top: -12px; }
    .progress-info strong { font: 600 34px var(--heading-font); color: var(--mat-sys-primary); }
    .progress-info span { margin-left: 6px; color: var(--mat-sys-on-surface-variant); }
    .bar { height: 4px; border-radius: 2px; background: var(--mat-sys-surface-container-highest); margin: 10px 0 18px; overflow: hidden; }
    .bar span { display: block; height: 100%; min-width: 4px; border-radius: 2px; background: var(--mat-sys-primary); }
    .buttons { display: flex; flex-wrap: wrap; gap: 8px; }
    .install { display: flex; gap: 16px; align-items: flex-start; padding: 18px 20px; }
    .install img { flex: none; border-radius: 14px; }
    .install > div > strong { font: 600 17px var(--heading-font); }
    .install p { margin: 4px 0 12px; font: var(--mat-sys-body-medium); color: var(--mat-sys-on-surface-variant); }
    .install .inline { font-size: 16px; width: 16px; height: 16px; vertical-align: -3px; }
    .data-info { margin: 0 0 10px; font: var(--mat-sys-body-medium); color: var(--mat-sys-on-surface-variant); }
    .last-backup { display: flex; align-items: center; gap: 6px; margin: 0 0 14px; font: 500 13px Inter, sans-serif; }
    .last-backup mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--mat-sys-primary); }
    .about { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 16px 0 8px; text-align: center; }
    .about .logo { color: var(--mat-sys-primary); margin-bottom: 4px; } .about .logo mat-icon { font-size: 32px; width: 32px; height: 32px; } .about strong { font: 600 18px var(--heading-font); }
    .about .credits { margin-top: 10px; }
    .about small { font: 400 13px/1.5 Inter, sans-serif; color: var(--mat-sys-on-surface-variant); }
  `,
})
export class SettingsPage {
  protected readonly settings = inject(SettingsService);
  protected readonly favorites = inject(FavoritesService);
  protected readonly notify = inject(NotifyService);
  protected readonly reminders = inject(ReminderService);
  /** Os três horários de hoje ("08:17, 14:42 e 21:05"). */
  protected readonly todayTimes = computed(() => {
    const times = this.reminders.today().map((r) => r.at);
    return `${times.slice(0, -1).join(', ')} e ${times.at(-1)}`;
  });
  protected readonly backup = inject(BackupService);
  protected readonly pwa = inject(PwaService);
  private readonly sheets = inject(Sheets);
  private readonly snackBar = inject(MatSnackBar);
  protected readonly total = TOTAL_CHAPTERS;
  protected readonly version = computed(() => findVersion(this.settings.version()));
  protected readonly compare = computed(() => findVersion(this.settings.compareVersion() ?? ''));

  protected lastBackupLabel(): string {
    const date = this.backup.lastBackup();
    return date ? new Date(date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  }

  protected async restore(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const data = await this.backup.parse(file);
      if (confirm(`${this.backup.summary(data)}\n\nOs dados atuais deste aparelho serão substituídos. Continuar?`)) {
        this.backup.restore(data);
      }
    } catch (err) {
      this.snackBar.open((err as Error).message, 'OK', { duration: 4000 });
    }
  }

  protected async pickVersion(): Promise<void> {
    const id = await this.sheets.pickVersion({ title: 'Versão principal', current: this.settings.version() });
    if (id) this.settings.version.set(id);
  }

  protected async pickCompare(): Promise<void> {
    const id = await this.sheets.pickVersion({ title: 'Comparar com', current: this.settings.compareVersion() });
    if (id) this.settings.compareVersion.set(id);
  }

  protected async toggleNotifications(enabled: boolean): Promise<void> {
    if (!enabled) {
      this.notify.disableSystem();
      return;
    }
    const granted = await this.notify.enableSystem();
    if (granted) {
      this.notify.system('Notificações ativadas', 'Você receberá os lembretes do dia, a curiosidade e os avisos da EBD.', '/ajustes');
    } else {
      this.snackBar.open('Permissão de notificação não concedida', undefined, { duration: 3000 });
    }
  }

  protected resetProgress(): void {
    if (confirm('Zerar todo o progresso de leitura?')) {
      this.settings.resetProgress();
      this.snackBar.open('Progresso zerado', undefined, { duration: 2000 });
    }
  }

  protected clearFavorites(): void {
    if (confirm('Apagar todos os versículos favoritos?')) {
      this.favorites.favorites.set([]);
      this.snackBar.open('Favoritos apagados', undefined, { duration: 2000 });
    }
  }
}
