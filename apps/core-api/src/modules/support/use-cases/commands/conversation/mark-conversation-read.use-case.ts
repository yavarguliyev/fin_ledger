import { Injectable, NotFoundException } from '@nestjs/common';

import { OK_RESPONSE } from '../../../constants/response/ok-response.constant';
import { OkResponseDto } from '../../../dtos/response/ok-response.dto';
import { ReadConversationDto } from '../../../dtos/input/read-conversation.dto';
import { SupportAccessHelper } from '../../../helpers/support-access.helper';
import { SUPPORT } from '../../../constants/chat/support.constant';
import { SupportConversationRepository } from '../../../repositories/support-conversation.repository';
import { SUPPORT_EVENTS } from '../../../constants/chat/support-events.constant';
import { SupportStreamProvider } from '../../../providers/support-stream.provider';

@Injectable()
export class MarkConversationReadUseCase {
  constructor (
    private readonly conversationRepository: SupportConversationRepository,
    private readonly stream: SupportStreamProvider
  ) {}

  async execute ({ conversationId, userId, role }: ReadConversationDto): Promise<OkResponseDto> {
    const conversation = await this.conversationRepository.findById({ id: conversationId });
    if (!conversation || !SupportAccessHelper.canAccess({ conversation, userId, role })) {
      throw new NotFoundException(SUPPORT.NOT_FOUND_MESSAGE);
    }

    await this.conversationRepository.markRead({ conversationId, userId });

    this.stream.broadcast({
      type: SUPPORT_EVENTS.CONVERSATION_READ,
      conversationId,
      customerUserId: conversation.customerUserId,
      assignedStaffId: conversation.assignedStaffId,
      readerUserId: userId
    });

    return OK_RESPONSE;
  }
}
