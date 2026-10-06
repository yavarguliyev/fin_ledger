import { Injectable } from '@nestjs/common';
import { RequestScope, SupportMessageKind, SupportMessageSource } from '@common/libs';

import { CallLogHelper } from '../../../helpers/call-log.helper';
import { CallEndingDto } from '../../../dtos/call/call-ending.dto';
import { EndCallDto } from '../../../dtos/input/end-call.dto';
import { OK_RESPONSE } from '../../../constants/response/ok-response.constant';
import { OkResponseDto } from '../../../dtos/response/ok-response.dto';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportCallProvider } from '../../../providers/support-call.provider';
import { CallSessionService } from '../../../services/call-session.service';
import { SupportConversationRepository } from '../../../repositories/support-conversation.repository';
import { SupportMapperHelper } from '../../../helpers/support-mapper.helper';
import { SupportMessageRepository } from '../../../repositories/support-message.repository';
import { SupportThreadProvider } from '../../../providers/support-thread.provider';

@Injectable()
export class EndCallUseCase {
  constructor (
    private readonly sessions: CallSessionService,
    private readonly calls: SupportCallProvider,
    private readonly conversationRepository: SupportConversationRepository,
    private readonly messageRepository: SupportMessageRepository,
    private readonly thread: SupportThreadProvider
  ) {}

  async execute ({ callId, reason, userId }: EndCallDto): Promise<OkResponseDto> {
    const call = await this.calls.requireParty({ callId, userId });

    await this.sessions.remove({ call });
    this.calls.signal({ type: SUPPORT_EVENTS.CALL_ENDED, call, fromUserId: userId, extra: { reason } });
    await RequestScope.runSystem(() => this.log({ call, reason }));

    return OK_RESPONSE;
  }

  private async log ({ call, reason }: CallEndingDto): Promise<void> {
    const conversation = await this.conversationRepository.findById({ id: call.conversationId });
    if (!conversation) return;

    const row = await this.messageRepository.add({
      conversationId: call.conversationId,
      senderUserId: call.callerId,
      kind: SupportMessageKind.SYSTEM,
      source: SupportMessageSource.SYSTEM,
      body: CallLogHelper.label({ call, reason })
    });

    if (!row) return;

    const messages = [SupportMapperHelper.toMessage({ row })];
    await this.thread.announce({ type: SUPPORT_EVENTS.MESSAGE_CREATED, conversation, senderUserId: call.callerId, role: call.callerRole, messages });
  }
}
