import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';

import { UiPrimitiveHelper } from '../../../core/helpers/ui/ui-primitive.helper';

@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.component.html'
})
export class BadgeComponent {
  readonly status = input.required<string>();
  readonly label = input<string | null>(null);

  readonly classes = computed(() => UiPrimitiveHelper.badge({ status: this.status() }));
}
