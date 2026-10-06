import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { ReadConversationDto } from '../dtos/input/read-conversation.dto';
import { SUPPORT } from '../constants/chat/support.constant';
import { SUPPORT_LOCK } from '../constants/chat/support-lock.constant';
import { SupportAccessHelper } from '../helpers/support-access.helper';
import { SupportConversationDto } from '../dtos/conversation/support-conversation.dto';
import { SupportConversationRepository } from '../repositories/support-conversation.repository';
import { SupportLockRepository } from '../repositories/support-lock.repository';

@Injectable()
export class SupportAccessProvider {
  constructor (
    private readonly conversationRepository: SupportConversationRepository,
    private readonly lockRepository: SupportLockRepository
  ) {}

  async require ({ conversationId, userId, role }: ReadConversationDto): Promise<SupportConversationDto> {
    const conversation = await this.requireMember({ conversationId, userId, role });
    const lock = await this.lockRepository.state({ conversationId, userId });
    if (lock && !lock.open) throw new ForbiddenException(SUPPORT_LOCK.LOCKED_MESSAGE);
    return conversation;
  }

  async requireMember ({ conversationId, userId, role }: ReadConversationDto): Promise<SupportConversationDto> {
    const conversation = await this.conversationRepository.findById({ id: conversationId });
    if (!conversation || !SupportAccessHelper.canAccess({ conversation, userId, role })) throw new NotFoundException(SUPPORT.NOT_FOUND_MESSAGE);
    return conversation;
  }
}
