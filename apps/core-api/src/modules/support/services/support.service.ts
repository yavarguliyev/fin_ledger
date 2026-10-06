import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SupportConversationContract, SupportMessageContract } from '@common/libs';

import { HeartbeatDto } from '../dtos/presence/heartbeat.dto';
import { HeartbeatUseCase } from '../use-cases/commands/presence/heartbeat.use-case';
import { IssueStreamTicketDto } from '../dtos/input/issue-stream-ticket.dto';
import { IssueSupportStreamTicketUseCase } from '../use-cases/commands/stream/issue-support-stream-ticket.use-case';
import { LastSeenDto } from '../dtos/input/last-seen.dto';
import { LastSeenResponseDto } from '../dtos/response/last-seen-response.dto';
import { LastSeenUseCase } from '../use-cases/queries/presence/last-seen.use-case';
import { LeavePresenceUseCase } from '../use-cases/commands/presence/leave-presence.use-case';
import { ListConversationsDto } from '../dtos/input/list-conversations.dto';
import { ListConversationsUseCase } from '../use-cases/queries/conversation/list-conversations.use-case';
import { ListThreadDto } from '../dtos/input/list-thread.dto';
import { ListContactsUseCase } from '../use-cases/queries/presence/list-contacts.use-case';
import { ListMessagesUseCase } from '../use-cases/queries/message/list-messages.use-case';
import { SearchMessagesUseCase } from '../use-cases/queries/message/search-messages.use-case';
import { ReactMessageUseCase } from '../use-cases/commands/message/react-message.use-case';
import { ReactMessageDto } from '../dtos/input/react-message.dto';
import { ReactionDto } from '../dtos/message/reaction.dto';
import { SearchThreadDto } from '../dtos/input/search-thread.dto';
import { MessageHitResponseDto } from '../dtos/response/message-hit-response.dto';
import { ListPresenceDto } from '../dtos/input/list-presence.dto';
import { ListPresenceUseCase } from '../use-cases/queries/presence/list-presence.use-case';
import { MarkConversationReadUseCase } from '../use-cases/commands/conversation/mark-conversation-read.use-case';
import { AnnounceTypingUseCase } from '../use-cases/commands/conversation/announce-typing.use-case';
import { ReadConversationDto } from '../dtos/input/read-conversation.dto';
import { OkResponseDto } from '../dtos/response/ok-response.dto';
import { OpenConversationDto } from '../dtos/input/open-conversation.dto';
import { OpenConversationUseCase } from '../use-cases/commands/conversation/open-conversation.use-case';
import { PresenceEntryDto } from '../dtos/presence/presence-entry.dto';
import { SendMessageDto } from '../dtos/input/send-message.dto';
import { SendMessageUseCase } from '../use-cases/commands/message/send-message.use-case';
import { StreamSupportEventsUseCase } from '../use-cases/queries/stream/stream-support-events.use-case';
import { StreamTicketResponseDto } from '../dtos/response/stream-ticket-response.dto';
import { SupportStreamViewerDto } from '../dtos/stream/support-stream-viewer.dto';
import { UserRefDto } from '../dtos/input/user-ref.dto';
import { SendAttachmentsDto } from '../dtos/input/send-attachments.dto';
import { SendAttachmentsUseCase } from '../use-cases/commands/message/send-attachments.use-case';
import { EditMessageDto } from '../dtos/input/edit-message.dto';
import { EditMessageUseCase } from '../use-cases/commands/message/edit-message.use-case';
import { DeleteMessageDto } from '../dtos/input/delete-message.dto';
import { DeleteMessageUseCase } from '../use-cases/commands/message/delete-message.use-case';
import { CountPresenceUseCase } from '../use-cases/queries/presence/count-presence.use-case';
import { PresenceCountDto } from '../dtos/presence/presence-count.dto';

@Injectable()
export class SupportService {
  constructor (
    private readonly openConversationUseCase: OpenConversationUseCase,
    private readonly listConversationsUseCase: ListConversationsUseCase,
    private readonly listMessagesUseCase: ListMessagesUseCase,
    private readonly searchMessagesUseCase: SearchMessagesUseCase,
    private readonly reactMessageUseCase: ReactMessageUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly markReadUseCase: MarkConversationReadUseCase,
    private readonly announceTypingUseCase: AnnounceTypingUseCase,
    private readonly heartbeatUseCase: HeartbeatUseCase,
    private readonly listPresenceUseCase: ListPresenceUseCase,
    private readonly countPresenceUseCase: CountPresenceUseCase,
    private readonly leavePresenceUseCase: LeavePresenceUseCase,
    private readonly lastSeenUseCase: LastSeenUseCase,
    private readonly issueStreamTicketUseCase: IssueSupportStreamTicketUseCase,
    private readonly streamEventsUseCase: StreamSupportEventsUseCase,
    private readonly listContactsUseCase: ListContactsUseCase,
    private readonly sendAttachmentsUseCase: SendAttachmentsUseCase,
    private readonly editMessageUseCase: EditMessageUseCase,
    private readonly deleteMessageUseCase: DeleteMessageUseCase
  ) {}

  async openConversation (dto: OpenConversationDto): Promise<SupportConversationContract> {
    return this.openConversationUseCase.execute(dto);
  }

  async listConversations (dto: ListConversationsDto): Promise<SupportConversationContract[]> {
    return this.listConversationsUseCase.execute(dto);
  }

  async listMessages (dto: ListThreadDto): Promise<SupportMessageContract[]> {
    return this.listMessagesUseCase.execute(dto);
  }

  async searchMessages (dto: SearchThreadDto): Promise<MessageHitResponseDto[]> {
    return this.searchMessagesUseCase.execute(dto);
  }

  async react (dto: ReactMessageDto): Promise<ReactionDto[]> {
    return this.reactMessageUseCase.execute(dto);
  }

  async sendMessage (dto: SendMessageDto): Promise<SupportMessageContract> {
    return this.sendMessageUseCase.execute(dto);
  }

  async sendAttachments (dto: SendAttachmentsDto): Promise<SupportMessageContract[]> {
    return this.sendAttachmentsUseCase.execute(dto);
  }

  async editMessage (dto: EditMessageDto): Promise<SupportMessageContract> {
    return this.editMessageUseCase.execute(dto);
  }

  async deleteMessage (dto: DeleteMessageDto): Promise<OkResponseDto> {
    return this.deleteMessageUseCase.execute(dto);
  }

  async markRead (dto: ReadConversationDto): Promise<OkResponseDto> {
    return this.markReadUseCase.execute(dto);
  }

  async announceTyping (dto: ReadConversationDto): Promise<OkResponseDto> {
    return this.announceTypingUseCase.execute(dto);
  }

  async heartbeat (dto: HeartbeatDto): Promise<OkResponseDto> {
    return this.heartbeatUseCase.execute(dto);
  }

  async listPresence (dto: ListPresenceDto): Promise<PresenceEntryDto[]> {
    return this.listPresenceUseCase.execute(dto);
  }

  async countPresence (dto: ListPresenceDto): Promise<PresenceCountDto> {
    return this.countPresenceUseCase.execute(dto);
  }

  async listContacts (dto: ListPresenceDto): Promise<PresenceEntryDto[]> {
    return this.listContactsUseCase.execute(dto);
  }

  async leavePresence (dto: UserRefDto): Promise<OkResponseDto> {
    return this.leavePresenceUseCase.execute(dto);
  }

  async lastSeen (dto: LastSeenDto): Promise<LastSeenResponseDto> {
    return this.lastSeenUseCase.execute(dto);
  }

  async issueStreamTicket (dto: IssueStreamTicketDto): Promise<StreamTicketResponseDto> {
    return this.issueStreamTicketUseCase.execute(dto);
  }

  streamEvents (dto: SupportStreamViewerDto): Observable<MessageEvent> {
    return this.streamEventsUseCase.execute(dto);
  }
}
