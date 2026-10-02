import { Component, ChangeDetectionStrategy, computed, input, output } from '@angular/core';

import { DeleteScope } from '../../../core/types/support/delete-scope.type';
import { MessageRulesHelper } from '../../../core/helpers/support/message-rules.helper';
import { SUPPORT_MESSAGE_RULES } from '../../../core/constants/support/support-message-rules.constant';
import { SupportMessage } from '../../../core/types/support/support-message.type';

@Component({
  selector: 'app-delete-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../templates/delete-dialog.component.html'
})
export class DeleteDialogComponent {
  readonly message = input<SupportMessage | null>(null);
  readonly userId = input<string | null>(null);
  readonly chosen = output<DeleteScope>();
  readonly cancelled = output();
  readonly rules = SUPPORT_MESSAGE_RULES;

  readonly forEveryone = computed(() => {
    const message = this.message();
    return !!message && MessageRulesHelper.canDeleteForEveryone({ message, userId: this.userId() });
  });
}
