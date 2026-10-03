import { Component, ChangeDetectionStrategy, computed, input } from '@angular/core';

import { LOAD_STATE } from '../../../core/constants/ui/load-state.constant';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './skeleton.component.html'
})
export class SkeletonComponent {
  readonly rows = input<number>(LOAD_STATE.DEFAULT_ROWS);
  readonly lines = computed(() => Array.from({ length: this.rows() }, (_, index) => index));
}
