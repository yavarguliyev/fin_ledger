import { Injectable, inject } from '@angular/core';

import { CallMedia } from '../../../core/types/support/call-media.type';
import { ChatPeerService } from './chat-peer.service';
import { ComposeSubmitDto } from '../../../core/interfaces/support/compose-submit.interface';
import { DeleteScope } from '../../../core/types/support/delete-scope.type';
import { EditSaveDto } from '../../../core/interfaces/support/edit-save.interface';
import { OfflineQueueHelper } from '../../../core/helpers/support/offline-queue.helper';
import { PendingMessage } from '../../../core/interfaces/support/pending-message.interface';
import { RecordedClipDto } from '../../../core/interfaces/support/recorded-clip.interface';
import { SupportCallStore } from '../../../core/services/support-call.store';
import { SupportChatStore } from '../../../core/services/support-chat.store';
import { SupportComposeStore } from '../../../core/services/support-compose.store';
import { SupportOfflineQueueStore } from '../../../core/services/support-offline-queue.store';
import { SupportTypingStore } from '../../../core/services/support-typing.store';

@Injectable()
export class ChatActionsService {
  private readonly chat = inject(SupportChatStore);
  private readonly compose = inject(SupportComposeStore);
  private readonly calls = inject(SupportCallStore);
  private readonly typing = inject(SupportTypingStore);
  private readonly offlineQueue = inject(SupportOfflineQueueStore);
  private readonly peer = inject(ChatPeerService);

  pendingHere (): PendingMessage[] {
    return OfflineQueueHelper.pendingFor({ pending: this.offlineQueue.pending(), conversationId: this.chat.activeId() });
  }

  send ({ body, files }: ComposeSubmitDto): void {
    const conversationId = this.chat.activeId();
    if (conversationId) this.compose.send({ conversationId, body, files });
  }

  save ({ body, file }: EditSaveDto): void {
    const conversationId = this.chat.activeId();
    if (conversationId) this.compose.saveEdit({ conversationId, body, file });
  }

  typed (): void {
    const conversationId = this.chat.activeId();
    if (conversationId) this.typing.notify({ conversationId });
  }

  recorded (clip: RecordedClipDto): void {
    const conversationId = this.chat.activeId();
    if (conversationId) this.compose.sendRecording({ conversationId, ...clip });
  }

  call (media: CallMedia): void {
    const conversationId = this.chat.activeId();
    if (conversationId) void this.calls.place({ conversationId, media, peerName: this.peer.name() });
  }

  delete (scope: DeleteScope): void {
    const conversationId = this.chat.activeId();
    if (conversationId) this.compose.confirmDelete({ conversationId, scope });
  }
}
