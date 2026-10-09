import { Component, ChangeDetectionStrategy, OnDestroy, OnInit, computed, effect, inject, untracked } from '@angular/core';

import { ChatPeerService } from './services/chat-peer.service';
import { NewMessagesService } from './services/new-messages.service';
import { ChatActionsService } from './services/chat-actions.service';
import { MessageRevealService } from './services/message-reveal.service';
import { SupportReactionStore } from '../../core/services/support-reaction.store';
import { SupportUploadStore } from '../../core/services/support-upload.store';
import { PendingUploadComponent } from './components/pending-upload.component';
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
import { InfoPanelComponent } from './components/info-panel.component';
import { StarredListComponent } from './components/starred-list.component';
import { SupportPanelStore } from '../../core/services/support-panel.store';
import { SupportStarStore } from '../../core/services/support-star.store';
import { SupportPrivacyStore } from '../../core/services/support-privacy.store';
import { SupportLockStore } from '../../core/services/support-lock.store';
import { ChatSearchService } from './services/chat-search.service';
import { ChatNavigationService } from './services/chat-navigation.service';
import { INFO_PANEL } from './constants/info-panel.constant';
import { STARRED_LIST } from './constants/starred-list.constant';

import { CHAT_THEME } from './constants/chat-theme.constant';
import { ChatFilterService } from './services/chat-filter.service';
import { ChatFilterChipsComponent } from './components/chat-filter-chips.component';
import { ChatListHelper } from '../../core/helpers/support/chat-list.helper';
import { MessageSelectionService } from './services/message-selection.service';
import { SelectionBarComponent } from './components/selection-bar.component';
import { PinnedBannerComponent } from './components/pinned-banner.component';
import { PinDurationDialogComponent } from './components/pin-duration-dialog.component';
import { ProfilePhotoService } from './services/profile-photo.service';
import { ProfilePhotoViewerComponent } from './components/profile-photo-viewer.component';
import { PROFILE_PHOTO } from './constants/profile-photo.constant';
import { SupportAvatarComponent } from './components/support-avatar.component';
import { MediaViewerComponent } from './components/media-viewer.component';

@Component({
  selector: 'app-support',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ContactListComponent, DeleteDialogComponent, ConversationListComponent, MessageComposerComponent, MessageThreadComponent, PresencePanelComponent, ChatScrollDirective, FileDropDirective, ChatSearchComponent, PendingUploadComponent, InfoPanelComponent, StarredListComponent, MediaViewerComponent, ChatFilterChipsComponent, SelectionBarComponent, PinnedBannerComponent, PinDurationDialogComponent, ProfilePhotoViewerComponent, SupportAvatarComponent],
  providers: [ChatPeerService, NewMessagesService, ChatActionsService, MessageRevealService, ChatNavigationService, ChatSearchService],
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
  readonly uploads = inject(SupportUploadStore);
  readonly peer = inject(ChatPeerService);
  readonly newMessages = inject(NewMessagesService);
  readonly compose = inject(SupportComposeStore);
  readonly calls = inject(SupportCallStore);
  readonly callLabels = SUPPORT_CALL;
  readonly labels = SUPPORT_MESSAGES;
  readonly view = SUPPORT_VIEW;
  readonly panel = inject(SupportPanelStore);
  readonly stars = inject(SupportStarStore);
  readonly privacy = inject(SupportPrivacyStore);
  readonly locks = inject(SupportLockStore);
  readonly nav = inject(ChatNavigationService);
  readonly panelLabels = INFO_PANEL;
  readonly starredLabels = STARRED_LIST;
  readonly themes = CHAT_THEME;
  readonly filters = inject(ChatFilterService);
  readonly selection = inject(MessageSelectionService);
  readonly photos = inject(ProfilePhotoService);
  readonly photoLabels = PROFILE_PHOTO;
  readonly listed = computed(() => ChatListHelper.arrange({ conversations: this.locks.visible(), filter: this.filters.filter() }));

  constructor () {
    effect(() => {
      this.chat.activeId();
      untracked(() => {
        this.panel.hide();
        this.stars.load();
      });
    });
  }

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
