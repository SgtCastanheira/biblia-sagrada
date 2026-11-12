import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Sheets } from '../sheets';

/**
 * A placa de Pilatos (Jo 19.19-22) em três línguas, na ordem de João 19.20: hebraico, latim e grego.
 * O texto é escrito como texto (não como imagem), com a língua marcada em cada linha: as letras saem
 * certas, o leitor de tela lê e o texto cabe em qualquer largura.
 */
const GOSPELS = [
  { who: 'Mateus', text: 'ESTE É JESUS, O REI DOS JUDEUS', ref: 'Mt 27.37' },
  { who: 'Marcos', text: 'O REI DOS JUDEUS', ref: 'Mc 15.26' },
  { who: 'Lucas', text: 'ESTE É O REI DOS JUDEUS', ref: 'Lc 23.38' },
  { who: 'João', text: 'JESUS O NAZARENO, O REI DOS JUDEUS', ref: 'Jo 19.19' },
];

@Component({
  selector: 'app-passion-placa',
  imports: [MatIconModule],
  template: `
    <figure class="placa">
      <figcaption class="head"><mat-icon>menu_book</mat-icon> A placa de Pilatos</figcaption>
      <div class="board" role="img" aria-label="Placa de Pilatos escrita em hebraico, latim e grego: Jesus, o Nazareno, o Rei dos Judeus">
        <p class="line he" lang="he" dir="rtl" aria-hidden="true">ישוע הנצרי מלך היהודים</p>
        <p class="line la" lang="la" aria-hidden="true">IESVS NAZARENVS REX IVDAEORVM</p>
        <p class="line el" lang="el" aria-hidden="true">ΙΗΣΟΥΣ Ο ΝΑΖΩΡΑΙΟΣ Ο ΒΑΣΙΛΕΥΣ ΤΩΝ ΙΟΥΔΑΙΩΝ</p>
      </div>
      <ul class="languages">
        <li><strong>Hebraico</strong> a língua do lugar e dos peregrinos judeus</li>
        <li><strong>Latim</strong> a língua do império e do tribunal</li>
        <li><strong>Grego</strong> a língua comum de todo o Mediterrâneo</li>
      </ul>
      <p class="meaning">Em português: <strong>Jesus, o Nazareno, o Rei dos Judeus</strong>. A sigla <em>INRI</em> vem da linha em latim: <em>Iesus Nazarenus Rex Iudaeorum</em>.</p>
      <h4>Como cada Evangelho registra a placa</h4>
      <ul class="gospels">
        @for (g of gospels; track g.who) {
          <li>
            <span class="who">{{ g.who }}</span>
            <span class="text">{{ g.text }}</span>
            <button type="button" class="ref" (click)="open(g.ref)"><mat-icon>menu_book</mat-icon> {{ g.ref }}</button>
          </li>
        }
      </ul>
      <p class="credit">Reconstituição tipográfica. O hebraico é a forma moderna; o grego segue o texto de João e o latim, a Vulgata. A forma exata da placa, em aramaico ou hebraico do século I, não se conhece.</p>
    </figure>
  `,
  styleUrl: './passion-placa.scss',
})
export class PassionPlaca {
  private readonly sheets = inject(Sheets);
  protected readonly gospels = GOSPELS;

  protected open(ref: string): void {
    this.sheets.passage(ref);
  }
}
