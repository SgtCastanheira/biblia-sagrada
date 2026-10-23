import { Location } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/**
 * Guarda se já houve navegação dentro do app, para o botão “Voltar” voltar de verdade para a tela
 * anterior (o caminho que a pessoa fez) — e só ir para a página “pai” quando o app foi aberto direto num link.
 */
@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private count = 0;

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.count++);
  }

  back(fallback: string, queryParams?: Record<string, string | null | undefined>): void {
    if (this.count > 1) this.location.back();
    else this.router.navigate([fallback], { queryParams: queryParams ?? undefined, replaceUrl: true });
  }
}
