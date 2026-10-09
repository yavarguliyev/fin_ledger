import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';

import { DeleteScope } from '../../../core/types/support/delete-scope.type';
import { FocusTrapDirective } from '../../../shared/directives/focus-trap.directive';
import { MessageRulesHelper } from '../../../core/helpers/support/message-rules.helper';
import { MessageSelectionService } from '../services/message-selection.service';
import { SUPPORT_MESSAGE_RULES } from '../../../core/constants/support/support-message-rules.constant';
import { SupportChatStore } from '../../../core/services/support-chat.store';
import { SupportHistoryStore } from '../../../core/services/support-history.store';

@Component({
  selector: 'app-selection-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FocusTrapDirective],
  templateUrl: '../templates/selection-bar.component.html',
  host: { '(document:keydown.escape)': 'selection.asking() ? selection.dismiss() : selection.exit()' }
})
export class SelectionBarComponent {
  private readonly chat = inject(SupportChatStore);
  private readonly history = inject(SupportHistoryStore);

  readonly selection = inject(MessageSelectionService);
  readonly labels = this.selection.labels;
  readonly rules = SUPPORT_MESSAGE_RULES;
  readonly forEveryone = computed(() => this.selection.selected().every(message => MessageRulesHelper.canDeleteForEveryone({ message, userId: this.chat.myUserId() })));
  readonly title = computed(() => {
    const count = this.selection.count();
    return [this.labels.TITLE_PREFIX, count, count === 1 ? this.labels.TITLE_ONE : this.labels.TITLE_MANY].join(' ');
  });

  choose (scope: DeleteScope): void {
    this.history.deleteMany({ messages: this.selection.selected(), scope });
    this.selection.exit();
  }
}
