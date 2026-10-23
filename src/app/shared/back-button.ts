import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NavigationService } from '../core/navigation.service';

/** Botão “Voltar”: volta para a tela anterior; se o app foi aberto direto nesta página, vai para a página “pai”. */
@Component({
  selector: 'app-back',
  imports: [MatButtonModule, MatIconModule],
  template: `<button mat-icon-button type="button" [attr.aria-label]="label()" (click)="go()"><mat-icon>arrow_back</mat-icon></button>`,
  styles: `:host { display: inline-flex; }`,
})
export class BackButton {
  readonly fallback = input.required<string>();
  readonly queryParams = input<Record<string, string | null | undefined>>();
  readonly label = input('Voltar');
  private readonly nav = inject(NavigationService);

  protected go(): void {
    this.nav.back(this.fallback(), this.queryParams());
  }
}
