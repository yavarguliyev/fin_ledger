import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, inject, viewChild } from '@angular/core';

import { ChatPeerService } from './services/chat-peer.service';
import { ContactListComponent } from './components/contact-list.component';
import { ConversationListComponent } from './components/conversation-list.component';
import { MessageComposerComponent } from './components/message-composer.component';
import { DeleteDialogComponent } from './components/delete-dialog.component';
import { DeleteScope } from '../../core/types/support/delete-scope.type';
import { MessageThreadComponent } from './components/message-thread.component';
import { PresencePanelComponent } from './components/presence-panel.component';
import { SUPPORT } from '../../core/constants/support/support.constant';
import { SUPPORT_MESSAGES } from '../../core/constants/support/support-messages.constant';
import { SUPPORT_VIEW } from './constants/support-view.constant';
import { SupportChatStore } from '../../core/services/support-chat.store';
import { SupportComposeStore } from '../../core/services/support-compose.store';
import { SupportCallStore } from '../../core/services/support-call.store';
import { SUPPORT_CALL } from '../../core/constants/support/support-call.constant';
import { CallMedia } from '../../core/types/support/call-media.type';
import { RecordedClipDto } from '../../core/dtos/support/recorded-clip.dto';
import { ComposeSubmitDto } from '../../core/dtos/support/compose-submit.dto';
import { EditSaveDto } from '../../core/dtos/support/edit-save.dto';
import { SupportPresenceStore } from '../../core/services/support-presence.store';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [ContactListComponent, DeleteDialogComponent, ConversationListComponent, MessageComposerComponent, MessageThreadComponent, PresencePanelComponent],
  providers: [ChatPeerService],
  templateUrl: './templates/support.component.html'
})
export class SupportComponent implements OnInit, AfterViewChecked, OnDestroy {
  private readonly scroller = viewChild<ElementRef<HTMLDivElement>>('scroller');
  private readonly onFocus = (): void => this.refresh();

  readonly chat = inject(SupportChatStore);
  readonly presenceStore = inject(SupportPresenceStore);
  readonly peer = inject(ChatPeerService);
  readonly compose = inject(SupportComposeStore);
  readonly calls = inject(SupportCallStore);
  readonly callLabels = SUPPORT_CALL;
  readonly labels = SUPPORT_MESSAGES;
  readonly view = SUPPORT_VIEW;

  private timers: ReturnType<typeof setInterval>[] = [];
  private seen = -1;

  get conversationCount (): string {
    const total = this.chat.conversations().length;
    return `${total} ${total === 1 ? this.view.CONVERSATION_LABEL : this.view.CONVERSATIONS_LABEL}`;
  }

  ngOnInit (): void {
    this.presenceStore.load();
    this.presenceStore.loadContacts();
    this.chat.loadConversations();

    this.timers = [
      setInterval(() => this.presenceStore.load(), SUPPORT.HEARTBEAT_MS),
      setInterval(() => this.presenceStore.loadContacts(), SUPPORT.HEARTBEAT_MS),
      setInterval(() => this.refresh(), SUPPORT_VIEW.RESYNC_MS)
    ];

    window.addEventListener('focus', this.onFocus);
  }

  ngAfterViewChecked (): void {
    const count = this.chat.messages().length;
    if (count === this.seen) return;
    this.seen = count;
    const element = this.scroller()?.nativeElement;
    if (element) element.scrollTop = element.scrollHeight;
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

  onSend ({ body, files }: ComposeSubmitDto): void {
    const conversationId = this.chat.activeId();
    if (conversationId) this.compose.send({ conversationId, body, files });
  }

  onSave ({ body, file }: EditSaveDto): void {
    const conversationId = this.chat.activeId();
    if (conversationId) this.compose.saveEdit({ conversationId, body, file });
  }

  onRecorded (clip: RecordedClipDto): void {
    const conversationId = this.chat.activeId();
    if (conversationId) this.compose.sendRecording({ conversationId, ...clip });
  }

  onCall (media: CallMedia): void {
    const conversationId = this.chat.activeId();
    if (conversationId) void this.calls.place({ conversationId, media, peerName: this.peer.name() });
  }

  onDelete (scope: DeleteScope): void {
    const conversationId = this.chat.activeId();
    if (conversationId) this.compose.confirmDelete({ conversationId, scope });
  }

  private refresh (): void {
    this.chat.resync();
    this.chat.loadConversations();
    this.peer.track();
  }
}
