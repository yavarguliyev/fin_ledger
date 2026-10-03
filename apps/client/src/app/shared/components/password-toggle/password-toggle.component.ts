import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';

import { PASSWORD_TOGGLE } from '../../../core/constants/ui/password-toggle.constant';

@Component({
  selector: 'app-password-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './password-toggle.component.html'
})
export class PasswordToggleComponent {
  readonly field = input.required<HTMLInputElement>();
  readonly visible = signal(false);
  readonly text = PASSWORD_TOGGLE;

  toggle (): void {
    this.visible.update(visible => !visible);
    this.field().type = this.visible() ? PASSWORD_TOGGLE.TEXT_TYPE : PASSWORD_TOGGLE.PASSWORD_TYPE;
  }
}
