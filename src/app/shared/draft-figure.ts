import { Component, input } from '@angular/core';

/** A prévia local substitui este componente; o build público não contém as figuras dos rascunhos. */
@Component({
  selector: 'app-draft-figure',
  template: '',
})
export class DraftFigure {
  readonly id = input.required<string>();
}
