import { Injectable, NotFoundException } from '@nestjs/common';

import { MessageHitResponseDto } from '../../../dtos/response/message-hit-response.dto';
import { SearchThreadDto } from '../../../dtos/input/search-thread.dto';
import { SupportAccessHelper } from '../../../helpers/support-access.helper';
import { SUPPORT } from '../../../constants/chat/support.constant';
import { SupportConversationRepository } from '../../../repositories/support-conversation.repository';
import { SupportMessageRepository } from '../../../repositories/support-message.repository';

@Injectable()
export class SearchMessagesUseCase {
  constructor (
    private readonly conversationRepository: SupportConversationRepository,
    private readonly messageRepository: SupportMessageRepository
  ) {}

  async execute ({ id, q, actorId, role }: SearchThreadDto): Promise<MessageHitResponseDto[]> {
    const conversation = await this.conversationRepository.findById({ id });
    if (!conversation || !SupportAccessHelper.canAccess({ conversation, userId: actorId, role })) {
      throw new NotFoundException(SUPPORT.NOT_FOUND_MESSAGE);
    }

    return this.messageRepository.search({ conversationId: id, actorId, term: q });
  }
}
