import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

import { LOAD_STATE } from '../../../core/constants/ui/load-state.constant';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent],
  templateUrl: './error-state.component.html'
})
export class ErrorStateComponent {
  readonly title = input<string>(LOAD_STATE.ERROR_TITLE);
  readonly message = input<string>(LOAD_STATE.ERROR_MESSAGE);
  readonly retrying = input(false);
  readonly retry = output();
  readonly labels = LOAD_STATE;
}
