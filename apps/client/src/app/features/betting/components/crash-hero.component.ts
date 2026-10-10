import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { GAMES_LOBBY } from '../../../core/constants/betting/games-lobby.constant';
import { RocketComponent } from '../../../shared/components/rocket/rocket.component';

@Component({
  selector: 'app-crash-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [RouterLink, RocketComponent],
  templateUrl: './templates/crash-hero.component.html'
})
export class CrashHeroComponent {
  readonly crash = GAMES_LOBBY.CRASH;
}
