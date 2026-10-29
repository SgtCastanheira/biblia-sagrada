import { NavigationService } from './core/navigation.service';
import { Component, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { CuriositiesService } from './core/curiosities.service';
import { DevotionalService } from './core/devotional.service';
import { ReminderService } from './core/reminders.service';
import { LibrasService } from './core/libras.service';
import { WhatsNewService } from './core/whats-new.service';
import { EbdService } from './core/ebd.service';
import { PwaService } from './core/pwa.service';
import { SettingsService } from './core/settings.service';
import { StorageService, storageFailures } from './core/storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UiService } from './core/ui.service';
import { findVersion } from './core/versions';
import { Sheets } from './shared/sheets';
import { ListenPlayer } from './shared/listen-player';

type NavTab = 'inicio' | 'biblia' | 'estudo' | 'ensino' | 'eu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, MatIconModule, MatButtonModule, MatRippleModule, MatTooltipModule, ListenPlayer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '(window:scroll)': 'onScroll()',
  },
})
export class App {
  private readonly whatsNew = inject(WhatsNewService);
  protected readonly settings = inject(SettingsService);
  protected readonly ui = inject(UiService);
  protected readonly curiosities = inject(CuriositiesService);
  protected readonly pwa = inject(PwaService);
  private readonly sheets = inject(Sheets);
  private readonly router = inject(Router);
  private readonly navigation = inject(NavigationService);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly isReader = computed(() => this.url().startsWith('/ler/'));
  /** Estudos e histórias: lidos como o capítulo da Bíblia, com as barras saindo da frente do texto. */
  protected readonly isArticle = computed(() => this.url().startsWith('/artigo/'));
  /** Aba do menu de cada tela: cada coisa mora em um só lugar. */
  protected readonly tab = computed<NavTab | null>(() => {
    const url = this.url();
    if (/^\/(ler\/|busca|livros)/.test(url)) return 'biblia';
    if (/^\/(ensino|ebd|ibuc|sermoes)/.test(url)) return 'ensino';
    if (/^\/(meu-espaco|devocional|anotacoes|favoritos|ajustes|novidades|creditos)/.test(url)) return 'eu';
    if (/^\/(estudo|fontes|harpa|memorial|genealogia|tribos|atlas|mapas|profecias|artigo|historia|epocas|avivamento|assembleia-de-deus|dicionario|curiosidades|quiz|livro\/)/.test(url)) return 'estudo';
    return /^\/($|\?|#)/.test(url) ? 'inicio' : null;
  });
  protected readonly version = computed(() => findVersion(this.settings.version()));
  protected readonly readLink = computed(() => {
    const last = this.settings.lastRead();
    return ['/ler', last?.bookId ?? 'GEN', last?.chapter ?? 1];
  });

  protected readonly nav: { tab: NavTab; label: string; icon: string; link: string }[] = [
    { tab: 'estudo', label: 'Estudo', icon: 'local_library', link: '/estudo' },
    { tab: 'ensino', label: 'Ensino', icon: 'school', link: '/ensino' },
    { tab: 'eu', label: 'Meu espaço', icon: 'person', link: '/meu-espaco' },
  ];

  constructor() {
    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
    // Libras (VLibras): só carrega se a pessoa ligou em Ajustes
    inject(LibrasService);
    // Cada tela nova começa com as barras à vista
    effect(() => {
      this.url();
      untracked(() => this.ui.barsHidden.set(false));
    });

    // Gravação que falhou (espaço cheio, armazenamento bloqueado): avisa uma vez por visita em vez de perder em silêncio.
    // O StorageService também pede ao navegador para não apagar os dados de quem já escreveu algo.
    inject(StorageService);
    const snackBar = inject(MatSnackBar);
    let warned = false;
    effect(() => {
      if (!storageFailures() || warned) return;
      warned = true;
      untracked(() =>
        snackBar
          .open('Não foi possível salvar neste aparelho. Faça um backup em Ajustes.', 'Ajustes', { duration: 10000 })
          .onAction()
          .subscribe(() => this.router.navigate(['/ajustes'])),
      );
    });

    // Lembretes (cada um no máximo uma vez por dia): EBD, devocional, curiosidade do dia e os três chamados do dia
    const ebd = inject(EbdService);
    const devotional = inject(DevotionalService);
    const reminders = inject(ReminderService);
    const check = () => {
      ebd.check();
      devotional.check();
      this.curiosities.check();
      void reminders.check();
    };
    // Depois de uma atualização, as novidades aparecem sozinhas; os lembretes esperam a próxima verificação
    const whatsNew = this.whatsNew;
    setTimeout(() => {
      if (!whatsNew.check()) check();
    }, 1500);
    setInterval(check, 60 * 1000);
  }

  protected async changeVersion(): Promise<void> {
    const id = await this.sheets.pickVersion({ title: 'Versão da Bíblia', current: this.settings.version() });
    if (id) this.settings.version.set(id);
  }

  protected onScroll(): void {
    this.ui.onScroll(window.scrollY);
  }

}
