import { Module } from '@nestjs/common';
import { ClientIds, StorageModule } from '@common/libs';

import { ListConversationsUseCase } from './use-cases/queries/conversation/list-conversations.use-case';
import { ListMessagesUseCase } from './use-cases/queries/message/list-messages.use-case';
import { SearchMessagesUseCase } from './use-cases/queries/message/search-messages.use-case';
import { ReactMessageUseCase } from './use-cases/commands/message/react-message.use-case';
import { SupportReactionRepository } from './repositories/support-reaction.repository';
import { SupportReactionController } from './support-reaction.controller';
import { MarkConversationReadUseCase } from './use-cases/commands/conversation/mark-conversation-read.use-case';
import { AnnounceTypingUseCase } from './use-cases/commands/conversation/announce-typing.use-case';
import { OpenConversationUseCase } from './use-cases/commands/conversation/open-conversation.use-case';
import { SendMessageUseCase } from './use-cases/commands/message/send-message.use-case';
import { SharedModule } from '../../shared/shared.module';
import { SupportController } from './support.controller';
import { SupportMessageController } from './support-message.controller';
import { SupportCallController } from './support-call.controller';
import { SupportCallService } from './support-call.service';
import { SupportCallProvider } from './providers/support-call.provider';
import { SupportCallRepository } from './repositories/support-call.repository';
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
import { SupportService } from './support.service';
import { HeartbeatUseCase } from './use-cases/commands/presence/heartbeat.use-case';
import { ListPresenceUseCase } from './use-cases/queries/presence/list-presence.use-case';
import { LastSeenUseCase } from './use-cases/queries/presence/last-seen.use-case';
import { LeavePresenceUseCase } from './use-cases/commands/presence/leave-presence.use-case';
import { SweepPresenceUseCase } from './use-cases/commands/presence/sweep-presence.use-case';
import { CountPresenceUseCase } from './use-cases/queries/presence/count-presence.use-case';
import { PresenceRepository } from './repositories/presence.repository';
import { SupportStreamProvider } from './providers/support-stream.provider';
import { IssueSupportStreamTicketUseCase } from './use-cases/commands/stream/issue-support-stream-ticket.use-case';
import { StreamSupportEventsUseCase } from './use-cases/queries/stream/stream-support-events.use-case';
import { ListContactsUseCase } from './use-cases/queries/presence/list-contacts.use-case';
import { SupportContactRepository } from './repositories/support-contact.repository';
import { SupportLinkController } from './support-link.controller';
import { SupportLinkService } from './support-link.service';
import { SupportStarController } from './support-star.controller';
import { SupportStarService } from './support-star.service';
import { SupportStarRepository } from './repositories/support-star.repository';
import { SupportAccessProvider } from './providers/support-access.provider';
import { StarMessageUseCase } from './use-cases/commands/message/star-message.use-case';
import { ListStarredMessagesUseCase } from './use-cases/queries/message/list-starred-messages.use-case';
import { GetLinkPreviewUseCase } from './use-cases/queries/link/get-link-preview.use-case';
import { LinkPreviewRepository } from './repositories/link-preview.repository';

@Module({
  imports: [SharedModule, StorageModule.forRoot({ clientId: ClientIds.API_GATEWAY })],
  controllers: [SupportController, SupportMessageController, SupportCallController, SupportReactionController, SupportLinkController, SupportStarController],
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
    PresenceRepository,
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
    SupportCallRepository,
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
    LinkPreviewRepository
  ],
  exports: [SupportService, SupportConversationRepository, SupportMessageRepository, PresenceRepository, LeavePresenceUseCase]
})
export class SupportModule {}
