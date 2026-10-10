import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';

import { SPARKLINE } from '../../../core/constants/ui/sparkline.constant';
import { SparklineHelper } from '../../../core/helpers/ui/sparkline.helper';

@Component({
  selector: 'app-sparkline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg class="block h-8 w-24 overflow-visible" [attr.viewBox]="viewBox" fill="none" aria-hidden="true">
      <polyline [attr.points]="points()" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  `
})
export class SparklineComponent {
  readonly values = input.required<number[]>();
  readonly viewBox = `0 0 ${SPARKLINE.WIDTH} ${SPARKLINE.HEIGHT}`;
  readonly points = computed(() => SparklineHelper.points({ values: this.values() }));
}
