import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

import { IconName } from '../../../core/types/ui/icon-name.type';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './empty-state.component.html'
})
export class EmptyStateComponent {
  readonly icon = input<IconName>();
  readonly title = input.required<string>();
  readonly message = input<string>('');
  readonly actionLabel = input<string>('');
  readonly action = output();
}
