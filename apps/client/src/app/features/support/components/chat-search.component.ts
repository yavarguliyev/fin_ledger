import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';

import { CHAT_SEARCH } from '../constants/chat-search.constant';
import { ChatSearchService } from '../services/chat-search.service';

@Component({
  selector: 'app-chat-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  providers: [ChatSearchService],
  templateUrl: '../templates/chat-search.component.html',
  host: { class: 'relative', '(document:keydown)': 'onKey($event)' }
})
export class ChatSearchComponent {
  readonly search = inject(ChatSearchService);
  readonly labels = CHAT_SEARCH;

  onKey (event: KeyboardEvent): void {
    if (event.key === CHAT_SEARCH.ESCAPE_KEY && this.search.open()) this.search.toggle();
  }
}
