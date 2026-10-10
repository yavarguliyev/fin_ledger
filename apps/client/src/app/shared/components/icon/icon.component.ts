import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ICON, ICON_PATHS } from '../../../core/constants/ui/icon.constant';
import { IconName } from '../../../core/types/ui/icon-name.type';

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon.component.html',
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' }
})
export class IconComponent {
  readonly name = input.required<IconName>();

  readonly icon = ICON;
  readonly paths = computed(() => ICON_PATHS[this.name()]);
}
