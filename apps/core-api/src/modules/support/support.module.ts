import { Module } from '@nestjs/common';
import { ClientIds, StorageModule } from '@common/libs';

import { ListConversationsUseCase } from './use-cases/queries/conversation/list-conversations.use-case';
import { ListMessagesUseCase } from './use-cases/queries/message/list-messages.use-case';
import { SearchMessagesUseCase } from './use-cases/queries/message/search-messages.use-case';
import { ReactMessageUseCase } from './use-cases/commands/message/react-message.use-case';
import { SupportReactionRepository } from './repositories/support-reaction.repository';
import { SupportReactionController } from './controllers/support-reaction.controller';
import { MarkConversationReadUseCase } from './use-cases/commands/conversation/mark-conversation-read.use-case';
import { AnnounceTypingUseCase } from './use-cases/commands/conversation/announce-typing.use-case';
import { OpenConversationUseCase } from './use-cases/commands/conversation/open-conversation.use-case';
import { SendMessageUseCase } from './use-cases/commands/message/send-message.use-case';
import { SharedModule } from '../../shared/shared.module';
import { SupportController } from './controllers/support.controller';
import { SupportMessageController } from './controllers/support-message.controller';
import { SupportCallController } from './controllers/support-call.controller';
import { SupportCallService } from './services/support-call.service';
import { SupportCallProvider } from './providers/support-call.provider';
import { CallSessionService } from './services/call-session.service';
import { StartCallUseCase } from './use-cases/commands/call/start-call.use-case';
import { AnswerCallUseCase } from './use-cases/commands/call/answer-call.use-case';
import { RelayCallCandidateUseCase } from './use-cases/commands/call/relay-call-candidate.use-case';
import { RelayCallRenegotiationUseCase } from './use-cases/commands/call/relay-call-renegotiation.use-case';
import { EndCallUseCase } from './use-cases/commands/call/end-call.use-case';
import { GetCallConfigUseCase } from './use-cases/queries/call/get-call-config.use-case';
import { SupportAttachmentProvider } from './providers/support-attachment.provider';
import { SupportThreadProvider } from './providers/support-thread.provider';
import { SendAttachmentsUseCase } from './use-cases/commands/message/send-attachments.use-case';
import { EditMessageUseCase } from './use-cases/commands/message/edit-message.use-case';
import { DeleteMessageUseCase } from './use-cases/commands/message/delete-message.use-case';
import { SupportConversationRepository } from './repositories/support-conversation.repository';
import { SupportMessageRepository } from './repositories/support-message.repository';
import { SupportService } from './services/support.service';
import { HeartbeatUseCase } from './use-cases/commands/presence/heartbeat.use-case';
import { ListPresenceUseCase } from './use-cases/queries/presence/list-presence.use-case';
import { LastSeenUseCase } from './use-cases/queries/presence/last-seen.use-case';
import { LeavePresenceUseCase } from './use-cases/commands/presence/leave-presence.use-case';
import { SweepPresenceUseCase } from './use-cases/commands/presence/sweep-presence.use-case';
import { CountPresenceUseCase } from './use-cases/queries/presence/count-presence.use-case';
import { PresenceService } from './services/presence.service';
import { SupportStreamProvider } from './providers/support-stream.provider';
import { IssueSupportStreamTicketUseCase } from './use-cases/commands/stream/issue-support-stream-ticket.use-case';
import { StreamSupportEventsUseCase } from './use-cases/queries/stream/stream-support-events.use-case';
import { ListContactsUseCase } from './use-cases/queries/presence/list-contacts.use-case';
import { SupportContactRepository } from './repositories/support-contact.repository';
import { SupportLinkController } from './controllers/support-link.controller';
import { SupportLinkService } from './services/support-link.service';
import { SupportStarController } from './controllers/support-star.controller';
import { SupportStarService } from './services/support-star.service';
import { SupportStarRepository } from './repositories/support-star.repository';
import { SupportAccessProvider } from './providers/support-access.provider';
import { PresenceStatusProvider } from './providers/presence-status.provider';
import { StarMessageUseCase } from './use-cases/commands/message/star-message.use-case';
import { ListStarredMessagesUseCase } from './use-cases/queries/message/list-starred-messages.use-case';
import { GetLinkPreviewUseCase } from './use-cases/queries/link/get-link-preview.use-case';
import { SupportPanelController } from './controllers/support-panel.controller';
import { SupportPanelService } from './services/support-panel.service';
import { SupportPanelRepository } from './repositories/support-panel.repository';
import { GetContactCardUseCase } from './use-cases/queries/panel/get-contact-card.use-case';
import { ListConversationFilesUseCase } from './use-cases/queries/panel/list-conversation-files.use-case';
import { ListConversationLinksUseCase } from './use-cases/queries/panel/list-conversation-links.use-case';
import { GetConversationStorageUseCase } from './use-cases/queries/panel/get-conversation-storage.use-case';
import { DeleteOwnFilesUseCase } from './use-cases/commands/panel/delete-own-files.use-case';
import { ListAllStarredUseCase } from './use-cases/queries/message/list-all-starred.use-case';
import { SupportPrivacyController } from './controllers/support-privacy.controller';
import { SupportPrivacyService } from './services/support-privacy.service';
import { ChangePrivacyUseCase } from './use-cases/commands/conversation/change-privacy.use-case';
import { GetDownloadUrlUseCase } from './use-cases/queries/message/get-download-url.use-case';
import { SupportLockController } from './controllers/support-lock.controller';
import { SupportLockService } from './services/support-lock.service';
import { SupportLockRepository } from './repositories/support-lock.repository';
import { LockConversationUseCase } from './use-cases/commands/conversation/lock-conversation.use-case';
import { OpenLockWindowUseCase } from './use-cases/commands/conversation/open-lock-window.use-case';
import { RemoveLockUseCase } from './use-cases/commands/conversation/remove-lock.use-case';
import { GetLockStateUseCase } from './use-cases/queries/conversation/get-lock-state.use-case';

@Module({
  imports: [SharedModule, StorageModule.forRoot({ clientId: ClientIds.API_GATEWAY })],
  controllers: [SupportController, SupportMessageController, SupportCallController, SupportReactionController, SupportLinkController, SupportStarController, SupportPanelController, SupportPrivacyController, SupportLockController],
  providers: [
    SupportService,
    SupportConversationRepository,
    SupportMessageRepository,
    OpenConversationUseCase,
    ListConversationsUseCase,
    ListMessagesUseCase,
    SearchMessagesUseCase,
    ReactMessageUseCase,
    SupportReactionRepository,
    SendMessageUseCase,
    MarkConversationReadUseCase,
    AnnounceTypingUseCase,
    PresenceService,
    PresenceStatusProvider,
    SupportStreamProvider,
    HeartbeatUseCase,
    ListPresenceUseCase,
    LeavePresenceUseCase,
    SweepPresenceUseCase,
    CountPresenceUseCase,
    LastSeenUseCase,
    IssueSupportStreamTicketUseCase,
    StreamSupportEventsUseCase,
    ListContactsUseCase,
    SupportContactRepository,
    SupportAttachmentProvider,
    SupportThreadProvider,
    SendAttachmentsUseCase,
    EditMessageUseCase,
    DeleteMessageUseCase,
    SupportCallService,
    SupportCallProvider,
    CallSessionService,
    StartCallUseCase,
    AnswerCallUseCase,
    RelayCallCandidateUseCase,
    RelayCallRenegotiationUseCase,
    EndCallUseCase,
    GetCallConfigUseCase,
    SupportLinkService,
    SupportStarService,
    SupportStarRepository,
    SupportAccessProvider,
    StarMessageUseCase,
    ListStarredMessagesUseCase,
    GetLinkPreviewUseCase,
    SupportPanelService,
    SupportPanelRepository,
    GetContactCardUseCase,
    ListConversationFilesUseCase,
    ListConversationLinksUseCase,
    GetConversationStorageUseCase,
    DeleteOwnFilesUseCase,
    ListAllStarredUseCase,
    SupportPrivacyService,
    ChangePrivacyUseCase,
    GetDownloadUrlUseCase,
    SupportLockService,
    SupportLockRepository,
    LockConversationUseCase,
    OpenLockWindowUseCase,
    RemoveLockUseCase,
    GetLockStateUseCase
  ],
  exports: [SupportService, SupportLockService, SupportAccessProvider, DeleteMessageUseCase, SupportThreadProvider, SupportStreamProvider, SupportAttachmentProvider, SupportConversationRepository, SupportMessageRepository, PresenceService, LeavePresenceUseCase]
})
export class SupportModule {}
