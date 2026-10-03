import { Component, ChangeDetectionStrategy, OnDestroy, OnInit, inject } from '@angular/core';

import { ChatPeerService } from './services/chat-peer.service';
import { NewMessagesService } from './services/new-messages.service';
import { ChatActionsService } from './services/chat-actions.service';
import { MessageRevealService } from './services/message-reveal.service';
import { SupportReactionStore } from '../../core/services/support-reaction.store';
import { StalenessHelper } from './helpers/staleness.helper';
import { ContactListComponent } from './components/contact-list.component';
import { ConversationListComponent } from './components/conversation-list.component';
import { MessageComposerComponent } from './components/message-composer.component';
import { DeleteDialogComponent } from './components/delete-dialog.component';
import { MessageThreadComponent } from './components/message-thread.component';
import { PresencePanelComponent } from './components/presence-panel.component';
import { SUPPORT } from '../../core/constants/support/support.constant';
import { SUPPORT_MESSAGES } from '../../core/constants/support/support-messages.constant';
import { SUPPORT_VIEW } from './constants/support-view.constant';
import { SupportChatStore } from '../../core/services/support-chat.store';
import { SupportHistoryService } from '../../core/services/support-history.service';
import { ChatScrollDirective } from './directives/chat-scroll.directive';
import { FileDropDirective } from './directives/file-drop.directive';
import { ChatSearchComponent } from './components/chat-search.component';
import { SupportComposeStore } from '../../core/services/support-compose.store';
import { SupportCallStore } from '../../core/services/support-call.store';
import { SUPPORT_CALL } from '../../core/constants/support/support-call.constant';
import { SupportPresenceStore } from '../../core/services/support-presence.store';
import { OFFLINE_QUEUE } from '../../core/constants/support/offline-queue.constant';

@Component({
  selector: 'app-support',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ContactListComponent, DeleteDialogComponent, ConversationListComponent, MessageComposerComponent, MessageThreadComponent, PresencePanelComponent, ChatScrollDirective, FileDropDirective, ChatSearchComponent],
  providers: [ChatPeerService, NewMessagesService, ChatActionsService, MessageRevealService],
  templateUrl: './templates/support.component.html'
})
export class SupportComponent implements OnInit, OnDestroy {
  private lastRefreshAt = Date.now();
  private readonly onFocus = (): void => {
    if (StalenessHelper.isStale({ lastAt: this.lastRefreshAt, now: Date.now(), maxAgeMs: SUPPORT.FOCUS_STALE_MS })) this.refresh();
  };

  readonly chat = inject(SupportChatStore);
  readonly history = inject(SupportHistoryService);
  readonly presenceStore = inject(SupportPresenceStore);
  readonly offlineLabels = OFFLINE_QUEUE;
  readonly actions = inject(ChatActionsService);
  readonly reveal = inject(MessageRevealService);
  readonly reactions = inject(SupportReactionStore);
  readonly peer = inject(ChatPeerService);
  readonly newMessages = inject(NewMessagesService);
  readonly compose = inject(SupportComposeStore);
  readonly calls = inject(SupportCallStore);
  readonly callLabels = SUPPORT_CALL;
  readonly labels = SUPPORT_MESSAGES;
  readonly view = SUPPORT_VIEW;

  private timers: ReturnType<typeof setInterval>[] = [];

  get conversationCount (): string {
    const total = this.chat.conversations().length;
    return `${total} ${total === 1 ? this.view.CONVERSATION_LABEL : this.view.CONVERSATIONS_LABEL}`;
  }

  ngOnInit (): void {
    this.presenceStore.load();
    this.presenceStore.loadContacts();
    this.chat.loadConversations();

    this.timers = [
      setInterval(() => {
        this.refresh();
        this.resyncPresence();
      }, SUPPORT.SAFETY_RESYNC_MS)
    ];

    window.addEventListener('focus', this.onFocus);
  }

  ngOnDestroy (): void {
    this.timers.forEach(timer => clearInterval(timer));
    this.timers = [];
    window.removeEventListener('focus', this.onFocus);
    this.chat.close();
    this.compose.reset();
  }

  onPick (conversationId: string): void {
    this.compose.cancelEdit();
    this.chat.select({ conversationId });
    this.peer.track();
  }

  onPickContact (staffUserId: string): void {
    this.compose.cancelEdit();
    this.chat.openWith({ staffUserId });
  }

  private resyncPresence (): void {
    this.presenceStore.load();
    this.presenceStore.loadContacts();
  }

  private refresh (): void {
    this.lastRefreshAt = Date.now();
    this.chat.resync();
    this.chat.loadConversations();
    this.peer.track();
  }
}
