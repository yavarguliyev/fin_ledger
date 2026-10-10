import { Component, ChangeDetectionStrategy, computed, input, output } from '@angular/core';

import { GameEvent } from '../../../core/interfaces/betting/game-event.interface';
import { FIXTURE_CARD } from '../../../core/constants/betting/fixture-card.constant';

@Component({
  selector: 'app-fixture-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './templates/fixture-card.component.html'
})
export class FixtureCardComponent {
  readonly event = input.required<GameEvent>();
  readonly selected = input(false);
  readonly choose = output<GameEvent>();

  readonly view = FIXTURE_CARD;
  readonly live = computed(() => this.event().status === FIXTURE_CARD.LIVE_STATUS);
  readonly oddsClass = computed(() => (this.selected() ? FIXTURE_CARD.SELECTED : FIXTURE_CARD.IDLE));
}
