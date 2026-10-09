import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { CHAT_FILTER } from '../../../core/constants/support/chat-filter.constant';
import { ChatFilterService } from '../services/chat-filter.service';

@Component({
  selector: 'app-chat-filter-chips',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: '../templates/chat-filter-chips.component.html'
})
export class ChatFilterChipsComponent {
  readonly filters = inject(ChatFilterService);
  readonly labels = CHAT_FILTER;
}
