import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { FocusTrapDirective } from '../../../shared/directives/focus-trap.directive';
import { SUPPORT_PINS } from '../../../core/constants/support/support-pins.constant';
import { SupportPinsStore } from '../../../core/services/support-pins.store';

@Component({
  selector: 'app-pin-duration-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FocusTrapDirective],
  templateUrl: '../templates/pin-duration-dialog.component.html'
})
export class PinDurationDialogComponent {
  readonly pins = inject(SupportPinsStore);
  readonly labels = SUPPORT_PINS;
}
