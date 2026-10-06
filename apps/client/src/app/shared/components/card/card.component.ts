import { Component, ChangeDetectionStrategy, input } from '@angular/core';

import { CARD } from '../../../core/constants/ui/card.constant';

@Component({
  selector: 'app-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.component.html'
})
export class CardComponent {
  readonly heading = input<string | null>(null);

  readonly styles = CARD;
}
