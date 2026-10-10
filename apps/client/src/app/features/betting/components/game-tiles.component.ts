import { Component, ChangeDetectionStrategy } from '@angular/core';

import { GAME_TILES } from '../../../core/constants/betting/game-tiles.constant';

@Component({
  selector: 'app-game-tiles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  templateUrl: './templates/game-tiles.component.html'
})
export class GameTilesComponent {
  readonly tiles = GAME_TILES;
}
