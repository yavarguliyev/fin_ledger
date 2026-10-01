import { Injectable, computed, inject } from '@angular/core';

import { LastSeenHelper } from '../helpers/last-seen.helper';
import { PresenceHelper } from '../../../core/helpers/support/presence.helper';
import { SUPPORT_VIEW } from '../constants/support-view.constant';
import { SupportChatStore } from '../../../core/services/support-chat.store';
import { SupportPresenceStore } from '../../../core/services/support-presence.store';

@Injectable()
export class ChatPeerService {
  private readonly chat = inject(SupportChatStore);
  private readonly presenceStore = inject(SupportPresenceStore);

  readonly peerId = computed(() => {
    const conversation = this.chat.activeConversation();
    if (!conversation) return null;
    return this.chat.isStaff() ? conversation.customerUserId : conversation.assignedStaffId;
  });

  readonly presence = computed(() => {
    const userId = this.peerId();
    return userId ? this.presenceStore.find({ userId }) : null;
  });

  readonly online = computed(() => PresenceHelper.isOnline({ presence: this.presence() }));

  readonly name = computed(() => {
    const conversation = this.chat.activeConversation();
    const named = this.chat.isStaff() ? conversation?.customerName : conversation?.assignedStaffName;
    return named ?? this.presence()?.displayName ?? SUPPORT_VIEW.FALLBACK_NAME;
  });

  readonly status = computed(() => (this.online() ? SUPPORT_VIEW.ONLINE_LABEL : LastSeenHelper.label({ iso: this.presence()?.lastSeenAt ?? null })));

  readonly activeStaffId = computed(() => this.chat.activeConversation()?.assignedStaffId ?? null);

  track (): void {
    const userId = this.peerId();
    if (userId && this.chat.isStaff() && !this.online()) this.presenceStore.track({ userId });
  }
}
