import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-rocket',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', 'aria-hidden': 'true' },
  templateUrl: './rocket.component.html'
})
export class RocketComponent {
  readonly tilt = input(40);
  readonly idPrefix = input('rocket');
}
