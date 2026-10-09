import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { SupportAvatarHelper } from '../helpers/support-avatar.helper';
import { SUPPORT_AVATAR } from '../constants/support-avatar.constant';

@Component({
  selector: 'app-support-avatar',
  standalone: true,
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../templates/support-avatar.component.html'
})
export class SupportAvatarComponent {
  readonly name = input<string | null>(null);
  readonly url = input<string | null>(null);
  readonly size = input<keyof typeof SUPPORT_AVATAR.SIZES>('md');
  readonly sizes = SUPPORT_AVATAR.SIZES;
  readonly showDot = input(false);
  readonly online = input(false);

  get initials (): string {
    return SupportAvatarHelper.initials({ name: this.name() });
  }
}
