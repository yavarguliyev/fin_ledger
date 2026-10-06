import { Injectable, NotFoundException } from '@nestjs/common';

import { ReadConversationDto } from '../dtos/input/read-conversation.dto';
import { SUPPORT } from '../constants/chat/support.constant';
import { SupportAccessHelper } from '../helpers/support-access.helper';
import { SupportConversationDto } from '../dtos/conversation/support-conversation.dto';
import { SupportConversationRepository } from '../repositories/support-conversation.repository';

@Injectable()
export class SupportAccessProvider {
  constructor (private readonly conversationRepository: SupportConversationRepository) {}

  async require ({ conversationId, userId, role }: ReadConversationDto): Promise<SupportConversationDto> {
    const conversation = await this.conversationRepository.findById({ id: conversationId });
    if (!conversation || !SupportAccessHelper.canAccess({ conversation, userId, role })) throw new NotFoundException(SUPPORT.NOT_FOUND_MESSAGE);
    return conversation;
  }
}
