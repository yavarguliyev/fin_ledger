import { Module } from '@nestjs/common';
import { ClientIds, StorageModule } from '@common/libs';

import { ListConversationsUseCase } from './use-cases/queries/conversation/list-conversations.use-case';
import { ListMessagesUseCase } from './use-cases/queries/message/list-messages.use-case';
import { MarkConversationReadUseCase } from './use-cases/commands/conversation/mark-conversation-read.use-case';
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
import { PresenceRepository } from './repositories/presence.repository';
import { SupportStreamProvider } from './providers/support-stream.provider';
import { IssueSupportStreamTicketUseCase } from './use-cases/commands/stream/issue-support-stream-ticket.use-case';
import { StreamSupportEventsUseCase } from './use-cases/queries/stream/stream-support-events.use-case';
import { ListContactsUseCase } from './use-cases/queries/presence/list-contacts.use-case';
import { SupportContactRepository } from './repositories/support-contact.repository';

@Module({
  imports: [SharedModule, StorageModule.forRoot({ clientId: ClientIds.API_GATEWAY })],
  controllers: [SupportController, SupportMessageController, SupportCallController],
  providers: [
    SupportService,
    SupportConversationRepository,
    SupportMessageRepository,
    OpenConversationUseCase,
    ListConversationsUseCase,
    ListMessagesUseCase,
    SendMessageUseCase,
    MarkConversationReadUseCase,
    PresenceRepository,
    SupportStreamProvider,
    HeartbeatUseCase,
    ListPresenceUseCase,
    LeavePresenceUseCase,
    SweepPresenceUseCase,
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
    EndCallUseCase,
    GetCallConfigUseCase
  ],
  exports: [SupportService, SupportConversationRepository, SupportMessageRepository, PresenceRepository, LeavePresenceUseCase]
})
export class SupportModule {}
