import { NavigationService } from './core/navigation.service';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { CuriositiesService } from './core/curiosities.service';
import { DevotionalService } from './core/devotional.service';
import { WhatsNewService } from './core/whats-new.service';
import { EbdService } from './core/ebd.service';
import { PwaService } from './core/pwa.service';
import { SettingsService } from './core/settings.service';
import { UiService } from './core/ui.service';
import { findVersion } from './core/versions';
import { Sheets } from './shared/sheets';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, MatRippleModule, MatTooltipModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  host: {
    '(window:scroll)': 'onScroll()',
  },
})
export class App {
  // Primeiro de todos: precisa ver os dados antes de qualquer configuração ser gravada
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
  protected readonly isNotebook = computed(() => /^\/(anotacoes|sermoes|favoritos)/.test(this.url()));
  /** Todas as telas de estudo acendem a aba Estudo. */
  protected readonly isStudy = computed(() =>
    /^\/(estudo|fontes|ebd|ibuc|memorial|genealogia|tribos|atlas|mapas|profecias|artigo|historia|avivamento|dicionario|curiosidades|livros|livro\/)/.test(this.url()),
  );
  protected readonly version = computed(() => findVersion(this.settings.version()));
  protected readonly readLink = computed(() => {
    const last = this.settings.lastRead();
    return ['/ler', last?.bookId ?? 'GEN', last?.chapter ?? 1];
  });

  protected readonly nav = [
    { label: 'Início', icon: 'home', link: '/', exact: true },
    { label: 'Estudo', icon: 'local_library', link: '/estudo', exact: false },
    { label: 'Devocional', icon: 'self_improvement', link: '/devocional', exact: false },
    { label: 'Anotações', icon: 'edit_note', link: '/anotacoes', exact: false },
  ];

  constructor() {
    inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');

    // Lembretes (cada um no máximo uma vez por dia): EBD, devocional e curiosidade do dia
    const ebd = inject(EbdService);
    const devotional = inject(DevotionalService);
    const check = () => {
      ebd.check();
      devotional.check();
      this.curiosities.check();
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
