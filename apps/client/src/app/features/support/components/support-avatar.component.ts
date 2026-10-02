import { Component, ChangeDetectionStrategy, input } from '@angular/core';

import { SupportAvatarHelper } from '../helpers/support-avatar.helper';

@Component({
  selector: 'app-support-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../templates/support-avatar.component.html'
})
export class SupportAvatarComponent {
  readonly name = input<string | null>(null);
  readonly size = input<'sm' | 'md'>('md');
  readonly showDot = input(false);
  readonly online = input(false);

  get initials (): string {
    return SupportAvatarHelper.initials({ name: this.name() });
  }
}
